"""
Generate training data using LLMs (Claude, GPT, etc.)
"""
import os
import json
from typing import List, Dict, Optional
import anthropic
import openai
from tqdm import tqdm


class LLMDataGenerator:
    """Generate synthetic training data using LLM APIs."""

    def __init__(self, provider="anthropic", api_key=None):
        """
        Initialize LLM client.

        Args:
            provider: 'anthropic' for Claude or 'openai' for GPT
            api_key: API key (or set ANTHROPIC_API_KEY/OPENAI_API_KEY env var)
        """
        self.provider = provider

        if provider == "anthropic":
            self.client = anthropic.Anthropic(api_key=api_key or os.environ.get("ANTHROPIC_API_KEY"))
        elif provider == "openai":
            openai.api_key = api_key or os.environ.get("OPENAI_API_KEY")
            self.client = openai
        else:
            raise ValueError(f"Unknown provider: {provider}")

    def generate_text(self, prompt: str, max_tokens: int = 1000) -> str:
        """Generate text using the LLM."""
        if self.provider == "anthropic":
            message = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": prompt}]
            )
            return message.content[0].text

        elif self.provider == "openai":
            response = self.client.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens
            )
            return response.choices[0].message.content

    def generate_dataset(
        self,
        task_description: str,
        num_examples: int = 100,
        output_file: str = "training_data.json"
    ) -> List[Dict]:
        """
        Generate a complete dataset for training.

        Args:
            task_description: Description of the task/data you need
            num_examples: Number of training examples to generate
            output_file: Where to save the generated data

        Returns:
            List of training examples
        """
        dataset = []

        prompt_template = f"""Generate a single training example for this task:
{task_description}

Return ONLY a JSON object with 'input' and 'output' fields.
Example format: {{"input": "...", "output": "..."}}

Be diverse and creative in your examples."""

        print(f"Generating {num_examples} examples using {self.provider}...")

        for i in tqdm(range(num_examples)):
            try:
                response = self.generate_text(prompt_template)

                # Extract JSON from response
                response = response.strip()
                if response.startswith("```json"):
                    response = response[7:]
                if response.startswith("```"):
                    response = response[3:]
                if response.endswith("```"):
                    response = response[:-3]
                response = response.strip()

                example = json.loads(response)
                dataset.append(example)

            except Exception as e:
                print(f"\nError generating example {i}: {e}")
                continue

        # Save dataset
        with open(output_file, 'w') as f:
            json.dump(dataset, f, indent=2)

        print(f"\nGenerated {len(dataset)} examples saved to {output_file}")
        return dataset

    def generate_classification_data(
        self,
        categories: List[str],
        examples_per_category: int = 50,
        domain: str = "general",
        output_file: str = "classification_data.json"
    ) -> List[Dict]:
        """
        Generate classification training data.

        Args:
            categories: List of class labels
            examples_per_category: How many examples per class
            domain: Domain/context for the data
            output_file: Where to save

        Returns:
            List of labeled examples
        """
        dataset = []

        for category in categories:
            prompt = f"""Generate {examples_per_category} diverse examples for the category "{category}" in the domain of {domain}.

Return a JSON array of strings, where each string is a unique example.
Be creative and diverse. Return ONLY the JSON array, nothing else."""

            print(f"Generating examples for category: {category}")

            try:
                response = self.generate_text(prompt, max_tokens=2000)

                # Clean response
                response = response.strip()
                if response.startswith("```json"):
                    response = response[7:]
                if response.startswith("```"):
                    response = response[3:]
                if response.endswith("```"):
                    response = response[:-3]
                response = response.strip()

                examples = json.loads(response)

                for example in examples:
                    dataset.append({
                        "text": example,
                        "label": category
                    })

            except Exception as e:
                print(f"Error generating for {category}: {e}")
                continue

        # Save dataset
        with open(output_file, 'w') as f:
            json.dump(dataset, f, indent=2)

        print(f"\nGenerated {len(dataset)} labeled examples saved to {output_file}")
        return dataset


if __name__ == "__main__":
    # Example usage
    print("LLM Data Generator")
    print("==================\n")

    # Check for API keys
    if not os.environ.get("ANTHROPIC_API_KEY") and not os.environ.get("OPENAI_API_KEY"):
        print("ERROR: Please set ANTHROPIC_API_KEY or OPENAI_API_KEY environment variable")
        print("\nExample:")
        print("export ANTHROPIC_API_KEY='your-key-here'")
        exit(1)

    # Choose provider
    provider = "anthropic" if os.environ.get("ANTHROPIC_API_KEY") else "openai"
    generator = LLMDataGenerator(provider=provider)

    # Example 1: Generate general dataset
    print("Example 1: Generate question-answering data")
    generator.generate_dataset(
        task_description="Question-answering pairs about science topics",
        num_examples=10,
        output_file="qa_data.json"
    )

    print("\n" + "="*50 + "\n")

    # Example 2: Generate classification data
    print("Example 2: Generate sentiment classification data")
    generator.generate_classification_data(
        categories=["positive", "negative", "neutral"],
        examples_per_category=10,
        domain="product reviews",
        output_file="sentiment_data.json"
    )
