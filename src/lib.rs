mod models;
mod openai;
mod trainer;

use pyo3::prelude::*;
use pyo3::exceptions::PyException;
use std::sync::Arc;
use tokio::runtime::Runtime;

use trainer::TrainingManager;
use models::{Hyperparameters, JobStatus};

#[pyclass]
struct AITrainer {
    manager: Arc<TrainingManager>,
    runtime: Arc<Runtime>,
}

#[pymethods]
impl AITrainer {
    #[new]
    fn new(api_key: String) -> PyResult<Self> {
        let runtime = Runtime::new()
            .map_err(|e| PyException::new_err(format!("Failed to create runtime: {}", e)))?;

        let manager = runtime
            .block_on(async {
                TrainingManager::new(api_key)
            })
            .map_err(|e| PyException::new_err(format!("Failed to create trainer: {}", e)))?;

        Ok(Self {
            manager: Arc::new(manager),
            runtime: Arc::new(runtime),
        })
    }

    fn start_training(
        &self,
        file_path: String,
        model: String,
        n_epochs: u32,
        batch_size: Option<u32>,
        learning_rate: Option<f64>,
    ) -> PyResult<String> {
        let hyperparameters = Hyperparameters {
            n_epochs,
            batch_size,
            learning_rate_multiplier: learning_rate,
        };

        let manager = self.manager.clone();
        let job = self.runtime.block_on(async move {
            manager
                .start_training(&file_path, &model, hyperparameters)
                .await
        })
        .map_err(|e| PyException::new_err(format!("Training failed: {}", e)))?;

        serde_json::to_string(&job)
            .map_err(|e| PyException::new_err(format!("Serialization error: {}", e)))
    }

    fn get_job_status(&self, job_id: String) -> PyResult<String> {
        let manager = self.manager.clone();
        let job = self.runtime.block_on(async move {
            manager.get_job_status(&job_id).await
        })
        .map_err(|e| PyException::new_err(format!("Failed to get job status: {}", e)))?;

        serde_json::to_string(&job)
            .map_err(|e| PyException::new_err(format!("Serialization error: {}", e)))
    }

    fn list_jobs(&self) -> PyResult<String> {
        let manager = self.manager.clone();
        let jobs = self.runtime.block_on(async move {
            manager.list_all_jobs().await
        })
        .map_err(|e| PyException::new_err(format!("Failed to list jobs: {}", e)))?;

        serde_json::to_string(&jobs)
            .map_err(|e| PyException::new_err(format!("Serialization error: {}", e)))
    }

    fn cancel_job(&self, job_id: String) -> PyResult<String> {
        let manager = self.manager.clone();
        let job = self.runtime.block_on(async move {
            manager.cancel_job(&job_id).await
        })
        .map_err(|e| PyException::new_err(format!("Failed to cancel job: {}", e)))?;

        serde_json::to_string(&job)
            .map_err(|e| PyException::new_err(format!("Serialization error: {}", e)))
    }

    fn test_model(&self, model: String, prompt: String) -> PyResult<String> {
        let manager = self.manager.clone();
        let response = self.runtime.block_on(async move {
            manager.test_model(&model, &prompt).await
        })
        .map_err(|e| PyException::new_err(format!("Model test failed: {}", e)))?;

        Ok(response)
    }

    fn validate_training_data(&self, file_path: String) -> PyResult<bool> {
        self.manager
            .validate_training_data(&file_path)
            .map_err(|e| PyException::new_err(format!("Validation failed: {}", e)))
    }
}

#[pymodule]
fn ai_trainer(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<AITrainer>()?;
    Ok(())
}
