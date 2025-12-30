use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use std::sync::Mutex;
use once_cell::sync::Lazy;

use crate::trainer::TrainingManager;
use crate::models::Hyperparameters;

static TRAINER: Lazy<Mutex<Option<TrainingManager>>> = Lazy::new(|| Mutex::new(None));
static RUNTIME: Lazy<tokio::runtime::Runtime> = Lazy::new(|| {
    tokio::runtime::Runtime::new().expect("Failed to create Tokio runtime")
});

#[no_mangle]
pub extern "C" fn rust_init_trainer(api_key: *const c_char) -> i32 {
    if api_key.is_null() {
        return -1;
    }

    let api_key_str = unsafe {
        match CStr::from_ptr(api_key).to_str() {
            Ok(s) => s.to_string(),
            Err(_) => return -1,
        }
    };

    let trainer = match TrainingManager::new(api_key_str) {
        Ok(t) => t,
        Err(_) => return -1,
    };

    let mut global_trainer = TRAINER.lock().unwrap();
    *global_trainer = Some(trainer);

    0
}

#[no_mangle]
pub extern "C" fn rust_start_training(
    file_path: *const c_char,
    model: *const c_char,
    epochs: i32,
    batch_size: i32,
    learning_rate: f64,
) -> *mut c_char {
    if file_path.is_null() || model.is_null() {
        return std::ptr::null_mut();
    }

    let file_path_str = unsafe {
        match CStr::from_ptr(file_path).to_str() {
            Ok(s) => s,
            Err(_) => return std::ptr::null_mut(),
        }
    };

    let model_str = unsafe {
        match CStr::from_ptr(model).to_str() {
            Ok(s) => s,
            Err(_) => return std::ptr::null_mut(),
        }
    };

    let hyperparameters = Hyperparameters {
        n_epochs: epochs as u32,
        batch_size: if batch_size >= 0 { Some(batch_size as u32) } else { None },
        learning_rate_multiplier: if learning_rate >= 0.0 { Some(learning_rate) } else { None },
    };

    let trainer = TRAINER.lock().unwrap();
    let trainer = match trainer.as_ref() {
        Some(t) => t,
        None => return std::ptr::null_mut(),
    };

    let result = RUNTIME.block_on(async {
        trainer.start_training(file_path_str, model_str, hyperparameters).await
    });

    match result {
        Ok(job) => {
            let json = serde_json::to_string(&job).unwrap_or_default();
            CString::new(json).unwrap().into_raw()
        }
        Err(_) => std::ptr::null_mut(),
    }
}

#[no_mangle]
pub extern "C" fn rust_get_job_status(job_id: *const c_char) -> *mut c_char {
    if job_id.is_null() {
        return std::ptr::null_mut();
    }

    let job_id_str = unsafe {
        match CStr::from_ptr(job_id).to_str() {
            Ok(s) => s,
            Err(_) => return std::ptr::null_mut(),
        }
    };

    let trainer = TRAINER.lock().unwrap();
    let trainer = match trainer.as_ref() {
        Some(t) => t,
        None => return std::ptr::null_mut(),
    };

    let result = RUNTIME.block_on(async {
        trainer.get_job_status(job_id_str).await
    });

    match result {
        Ok(job) => {
            let json = serde_json::to_string(&job).unwrap_or_default();
            CString::new(json).unwrap().into_raw()
        }
        Err(_) => std::ptr::null_mut(),
    }
}

#[no_mangle]
pub extern "C" fn rust_list_jobs() -> *mut c_char {
    let trainer = TRAINER.lock().unwrap();
    let trainer = match trainer.as_ref() {
        Some(t) => t,
        None => return std::ptr::null_mut(),
    };

    let result = RUNTIME.block_on(async {
        trainer.list_all_jobs().await
    });

    match result {
        Ok(jobs) => {
            let json = serde_json::to_string(&jobs).unwrap_or_default();
            CString::new(json).unwrap().into_raw()
        }
        Err(_) => std::ptr::null_mut(),
    }
}

#[no_mangle]
pub extern "C" fn rust_cancel_job(job_id: *const c_char) -> *mut c_char {
    if job_id.is_null() {
        return std::ptr::null_mut();
    }

    let job_id_str = unsafe {
        match CStr::from_ptr(job_id).to_str() {
            Ok(s) => s,
            Err(_) => return std::ptr::null_mut(),
        }
    };

    let trainer = TRAINER.lock().unwrap();
    let trainer = match trainer.as_ref() {
        Some(t) => t,
        None => return std::ptr::null_mut(),
    };

    let result = RUNTIME.block_on(async {
        trainer.cancel_job(job_id_str).await
    });

    match result {
        Ok(job) => {
            let json = serde_json::to_string(&job).unwrap_or_default();
            CString::new(json).unwrap().into_raw()
        }
        Err(_) => std::ptr::null_mut(),
    }
}

#[no_mangle]
pub extern "C" fn rust_test_model(model: *const c_char, prompt: *const c_char) -> *mut c_char {
    if model.is_null() || prompt.is_null() {
        return std::ptr::null_mut();
    }

    let model_str = unsafe {
        match CStr::from_ptr(model).to_str() {
            Ok(s) => s,
            Err(_) => return std::ptr::null_mut(),
        }
    };

    let prompt_str = unsafe {
        match CStr::from_ptr(prompt).to_str() {
            Ok(s) => s,
            Err(_) => return std::ptr::null_mut(),
        }
    };

    let trainer = TRAINER.lock().unwrap();
    let trainer = match trainer.as_ref() {
        Some(t) => t,
        None => return std::ptr::null_mut(),
    };

    let result = RUNTIME.block_on(async {
        trainer.test_model(model_str, prompt_str).await
    });

    match result {
        Ok(response) => {
            CString::new(response).unwrap().into_raw()
        }
        Err(_) => std::ptr::null_mut(),
    }
}

#[no_mangle]
pub extern "C" fn rust_validate_data(file_path: *const c_char) -> i32 {
    if file_path.is_null() {
        return -1;
    }

    let file_path_str = unsafe {
        match CStr::from_ptr(file_path).to_str() {
            Ok(s) => s,
            Err(_) => return -1,
        }
    };

    let trainer = TRAINER.lock().unwrap();
    let trainer = match trainer.as_ref() {
        Some(t) => t,
        None => return -1,
    };

    match trainer.validate_training_data(file_path_str) {
        Ok(true) => 0,
        Ok(false) => 1,
        Err(_) => -1,
    }
}

#[no_mangle]
pub extern "C" fn rust_free_string(s: *mut c_char) {
    if !s.is_null() {
        unsafe {
            let _ = CString::from_raw(s);
        }
    }
}
