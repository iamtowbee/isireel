use anyhow::Result;
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::models::*;
use crate::openai::OpenAIClient;

pub struct TrainingManager {
    client: Arc<OpenAIClient>,
    active_jobs: Arc<RwLock<Vec<TrainingJob>>>,
}

impl TrainingManager {
    pub fn new(api_key: String) -> Result<Self> {
        let client = Arc::new(OpenAIClient::new(api_key)?);
        Ok(Self {
            client,
            active_jobs: Arc::new(RwLock::new(Vec::new())),
        })
    }

    pub async fn start_training(
        &self,
        file_path: &str,
        model: &str,
        hyperparameters: Hyperparameters,
    ) -> Result<TrainingJob> {
        // Upload training file
        let file_id = self.client.upload_training_file(file_path).await?;

        // Create fine-tuning job
        let job = self
            .client
            .create_fine_tuning_job(&file_id, model, &hyperparameters)
            .await?;

        // Add to active jobs
        let mut jobs = self.active_jobs.write().await;
        jobs.push(job.clone());

        Ok(job)
    }

    pub async fn get_job_status(&self, job_id: &str) -> Result<TrainingJob> {
        let job = self.client.get_fine_tuning_job(job_id).await?;

        // Update active jobs
        let mut jobs = self.active_jobs.write().await;
        if let Some(index) = jobs.iter().position(|j| j.id == job_id) {
            jobs[index] = job.clone();
        }

        Ok(job)
    }

    pub async fn list_all_jobs(&self) -> Result<Vec<TrainingJob>> {
        let jobs = self.client.list_fine_tuning_jobs().await?;

        // Update active jobs
        let mut active = self.active_jobs.write().await;
        *active = jobs.clone();

        Ok(jobs)
    }

    pub async fn cancel_job(&self, job_id: &str) -> Result<TrainingJob> {
        let job = self.client.cancel_fine_tuning_job(job_id).await?;

        // Update active jobs
        let mut jobs = self.active_jobs.write().await;
        if let Some(index) = jobs.iter().position(|j| j.id == job_id) {
            jobs[index] = job.clone();
        }

        Ok(job)
    }

    pub async fn get_active_jobs(&self) -> Vec<TrainingJob> {
        self.active_jobs.read().await.clone()
    }

    pub async fn test_model(&self, model: &str, prompt: &str) -> Result<String> {
        let request = CompletionRequest {
            model: model.to_string(),
            messages: vec![Message {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
            temperature: Some(0.7),
            max_tokens: Some(500),
        };

        let response = self.client.create_completion(&request).await?;

        if let Some(choice) = response.choices.first() {
            Ok(choice.message.content.clone())
        } else {
            Err(anyhow::anyhow!("No response from model"))
        }
    }

    pub fn validate_training_data(&self, file_path: &str) -> Result<bool> {
        let content = std::fs::read_to_string(file_path)?;

        for (line_num, line) in content.lines().enumerate() {
            if line.trim().is_empty() {
                continue;
            }

            let parsed: serde_json::Result<serde_json::Value> = serde_json::from_str(line);
            if parsed.is_err() {
                return Err(anyhow::anyhow!(
                    "Invalid JSON at line {}: {}",
                    line_num + 1,
                    line
                ));
            }

            let data = parsed.unwrap();
            if !data.get("messages").is_some() {
                return Err(anyhow::anyhow!(
                    "Missing 'messages' field at line {}",
                    line_num + 1
                ));
            }
        }

        Ok(true)
    }
}
