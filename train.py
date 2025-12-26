"""
Train/fine-tune a language model from scratch or using transfer learning.
"""
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
    DataCollatorForLanguageModeling
)
from datasets import load_dataset
import os


def train_model(
    model_name="gpt2",  # Start with small model like gpt2, or use "meta-llama/Llama-2-7b-hf"
    dataset_name="wikitext",
    dataset_config="wikitext-2-raw-v1",
    output_dir="./trained_model",
    num_epochs=3,
    batch_size=4,
):
    """
    Train or fine-tune a language model.

    Args:
        model_name: HuggingFace model to use as base
        dataset_name: Dataset to train on
        dataset_config: Specific dataset configuration
        output_dir: Where to save the trained model
        num_epochs: Number of training epochs
        batch_size: Training batch size
    """
    print(f"Loading model: {model_name}")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name)

    # Set padding token if not set
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
        model.config.pad_token_id = model.config.eos_token_id

    print(f"Loading dataset: {dataset_name}")
    dataset = load_dataset(dataset_name, dataset_config)

    # Tokenize dataset
    def tokenize_function(examples):
        return tokenizer(examples["text"], truncation=True, max_length=512)

    tokenized_datasets = dataset.map(
        tokenize_function,
        batched=True,
        remove_columns=dataset["train"].column_names
    )

    # Data collator for language modeling
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False  # Causal language modeling (not masked)
    )

    # Training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=num_epochs,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        warmup_steps=500,
        weight_decay=0.01,
        logging_dir="./logs",
        logging_steps=100,
        save_steps=1000,
        eval_steps=500,
        evaluation_strategy="steps",
        save_total_limit=2,
        fp16=torch.cuda.is_available(),  # Use mixed precision if GPU available
    )

    # Initialize trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_datasets["train"],
        eval_dataset=tokenized_datasets["validation"],
        data_collator=data_collator,
    )

    print("Starting training...")
    trainer.train()

    print(f"Saving model to {output_dir}")
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)

    return output_dir


if __name__ == "__main__":
    # Train the model
    model_path = train_model(
        model_name="gpt2",  # Change to larger model if you have GPU
        num_epochs=1,  # Start with 1 epoch for testing
        batch_size=2,  # Small batch size for CPU
    )

    print(f"\nTraining complete! Model saved to: {model_path}")
    print("Run chat.py to interact with your trained model")
