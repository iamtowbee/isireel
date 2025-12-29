/* Auto-generated Rust C API Header */

#ifndef AI_TRAINER_H
#define AI_TRAINER_H

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Initialize the AI trainer with an API key
 * Returns 0 on success, -1 on error
 */
int rust_init_trainer(const char *api_key);

/**
 * Start a training job
 * Returns JSON string with job details, or NULL on error
 * Caller must free the returned string using rust_free_string()
 */
char *rust_start_training(
    const char *file_path,
    const char *model,
    int epochs,
    int batch_size,  // -1 for None
    double learning_rate  // -1.0 for None
);

/**
 * Get the status of a training job
 * Returns JSON string with job details, or NULL on error
 * Caller must free the returned string using rust_free_string()
 */
char *rust_get_job_status(const char *job_id);

/**
 * List all training jobs
 * Returns JSON string with array of jobs, or NULL on error
 * Caller must free the returned string using rust_free_string()
 */
char *rust_list_jobs(void);

/**
 * Cancel a training job
 * Returns JSON string with job details, or NULL on error
 * Caller must free the returned string using rust_free_string()
 */
char *rust_cancel_job(const char *job_id);

/**
 * Test a model with a prompt
 * Returns the model's response string, or NULL on error
 * Caller must free the returned string using rust_free_string()
 */
char *rust_test_model(const char *model, const char *prompt);

/**
 * Validate training data file
 * Returns 0 if valid, 1 if invalid, -1 on error
 */
int rust_validate_data(const char *file_path);

/**
 * Free a string allocated by Rust
 */
void rust_free_string(char *s);

#ifdef __cplusplus
}
#endif

#endif /* AI_TRAINER_H */
