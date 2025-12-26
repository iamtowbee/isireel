"""
Chat interface for your trained AI model.
"""
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


class AIAssistant:
    def __init__(self, model_path="./trained_model"):
        """Load the trained model."""
        print(f"Loading model from {model_path}...")
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForCausalLM.from_pretrained(model_path)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)
        print(f"Model loaded on {self.device}")

    def generate_response(self, prompt, max_length=200, temperature=0.7):
        """Generate a response to the prompt."""
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)

        with torch.no_grad():
            outputs = self.model.generate(
                inputs.input_ids,
                max_length=max_length,
                temperature=temperature,
                do_sample=True,
                top_p=0.9,
                top_k=50,
                pad_token_id=self.tokenizer.eos_token_id
            )

        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return response

    def chat(self):
        """Start an interactive chat session."""
        print("\n=== AI Assistant Chat ===")
        print("Type 'quit' or 'exit' to end the conversation\n")

        while True:
            user_input = input("You: ").strip()

            if user_input.lower() in ['quit', 'exit']:
                print("Goodbye!")
                break

            if not user_input:
                continue

            response = self.generate_response(user_input)
            print(f"\nAI: {response}\n")


if __name__ == "__main__":
    # You can specify a different model path or use a pre-trained model
    # For example: model_path = "gpt2" to use base GPT-2
    assistant = AIAssistant(model_path="gpt2")  # Change to "./trained_model" after training
    assistant.chat()
