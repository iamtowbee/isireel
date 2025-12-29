use anyhow::{anyhow, Result};
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde_json::json;

use crate::models::*;

pub struct OpenAIClient {
    api_key: String,
    base_url: String,
    client: reqwest::Client,
}

impl OpenAIClient {
    pub fn new(api_key: String) -> Result<Self> {
        let mut headers = HeaderMap::new();
        headers.insert(
            AUTHORIZATION,
            HeaderValue::from_str(&format!("Bearer {}", api_key))?,
        );
        headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

        let client = reqwest::Client::builder()
            .default_headers(headers)
            .build()?;

        Ok(Self {
            api_key,
            base_url: "https://api.openai.com/v1".to_string(),
            client,
        })
    }

    pub async fn upload_training_file(&self, file_path: &str) -> Result<String> {
        let file_content = std::fs::read_to_string(file_path)?;

        let form = reqwest::multipart::Form::new()
            .text("purpose", "fine-tune")
            .part(
                "file",
                reqwest::multipart::Part::text(file_content)
                    .file_name("training_data.jsonl")
                    .mime_str("application/json")?,
            );

        let response = self
            .client
            .post(&format!("{}/files", self.base_url))
            .multipart(form)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow!("Failed to upload file: {}", error_text));
        }

        let response_json: serde_json::Value = response.json().await?;
        let file_id = response_json["id"]
            .as_str()
            .ok_or_else(|| anyhow!("No file ID in response"))?
            .to_string();

        Ok(file_id)
    }

    pub async fn create_fine_tuning_job(
        &self,
        training_file: &str,
        model: &str,
        hyperparameters: &Hyperparameters,
    ) -> Result<TrainingJob> {
        let mut body = json!({
            "training_file": training_file,
            "model": model,
        });

        if let Some(obj) = body.as_object_mut() {
            obj.insert(
                "hyperparameters".to_string(),
                serde_json::to_value(hyperparameters)?,
            );
        }

        let response = self
            .client
            .post(&format!("{}/fine_tuning/jobs", self.base_url))
            .json(&body)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow!("Failed to create fine-tuning job: {}", error_text));
        }

        let job: TrainingJob = response.json().await?;
        Ok(job)
    }

    pub async fn get_fine_tuning_job(&self, job_id: &str) -> Result<TrainingJob> {
        let response = self
            .client
            .get(&format!("{}/fine_tuning/jobs/{}", self.base_url, job_id))
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow!("Failed to get fine-tuning job: {}", error_text));
        }

        let job: TrainingJob = response.json().await?;
        Ok(job)
    }

    pub async fn list_fine_tuning_jobs(&self) -> Result<Vec<TrainingJob>> {
        let response = self
            .client
            .get(&format!("{}/fine_tuning/jobs", self.base_url))
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow!("Failed to list fine-tuning jobs: {}", error_text));
        }

        let response_json: serde_json::Value = response.json().await?;
        let jobs: Vec<TrainingJob> = serde_json::from_value(
            response_json["data"].clone()
        )?;

        Ok(jobs)
    }

    pub async fn cancel_fine_tuning_job(&self, job_id: &str) -> Result<TrainingJob> {
        let response = self
            .client
            .post(&format!("{}/fine_tuning/jobs/{}/cancel", self.base_url, job_id))
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow!("Failed to cancel fine-tuning job: {}", error_text));
        }

        let job: TrainingJob = response.json().await?;
        Ok(job)
    }

    pub async fn create_completion(&self, request: &CompletionRequest) -> Result<CompletionResponse> {
        let response = self
            .client
            .post(&format!("{}/chat/completions", self.base_url))
            .json(&request)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow!("Failed to create completion: {}", error_text));
        }

        let completion: CompletionResponse = response.json().await?;
        Ok(completion)
    }
}
