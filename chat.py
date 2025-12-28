"""
Use your trained AI model for inference/predictions.
"""
import torch
import pickle
import json
from network import create_model


class AIModel:
    """Inference interface for your trained model."""

    def __init__(self, model_path="trained_model.pth", vocab_path="vocab.pkl", label_path="label_encoder.pkl"):
        """Load trained model and preprocessing objects."""

        print("Loading model...")

        # Load vocabulary
        with open(vocab_path, 'rb') as f:
            self.vocab = pickle.load(f)

        # Load label encoder
        with open(label_path, 'rb') as f:
            self.label_encoder = pickle.load(f)

        # Load model checkpoint
        checkpoint = torch.load(model_path, map_location='cpu')

        # Recreate model architecture
        input_size = len(self.vocab) * 100  # Must match training
        output_size = len(self.label_encoder.classes_)

        self.model = create_model(
            'feedforward',
            input_size=input_size,
            hidden_sizes=[512, 256, 128],
            output_size=output_size,
            dropout=0.3
        )

        # Load weights
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.eval()

        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model.to(self.device)

        print(f"Model loaded on {self.device}")
        print(f"Classes: {list(self.label_encoder.classes_)}")

    def _text_to_tensor(self, text, max_length=100):
        """Convert text to model input tensor."""
        indices = []
        for word in text.lower().split():
            indices.append(self.vocab.get(word, self.vocab.get("<UNK>", 1)))

        # Pad or truncate
        if len(indices) < max_length:
            indices += [self.vocab.get("<PAD>", 0)] * (max_length - len(indices))
        else:
            indices = indices[:max_length]

        # Convert to one-hot
        one_hot = torch.zeros(max_length, len(self.vocab))
        for i, idx in enumerate(indices):
            one_hot[i, idx] = 1

        # Flatten
        features = one_hot.flatten().unsqueeze(0)  # Add batch dimension
        return features.to(self.device)

    def predict(self, text):
        """Make a prediction for input text."""
        with torch.no_grad():
            input_tensor = self._text_to_tensor(text)
            output = self.model(input_tensor)

            # Get probabilities
            probabilities = torch.softmax(output, dim=1)
            predicted_class = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][predicted_class].item()

            # Decode label
            label = self.label_encoder.inverse_transform([predicted_class])[0]

            return {
                'label': label,
                'confidence': confidence,
                'probabilities': {
                    self.label_encoder.classes_[i]: probabilities[0][i].item()
                    for i in range(len(self.label_encoder.classes_))
                }
            }

    def predict_batch(self, texts):
        """Make predictions for multiple texts."""
        return [self.predict(text) for text in texts]


def interactive_mode():
    """Run interactive prediction mode."""
    try:
        model = AIModel()
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("\nPlease train a model first:")
        print("1. python data_generator.py")
        print("2. python train.py")
        return

    print("\n" + "="*50)
    print("AI Model - Interactive Mode")
    print("="*50)
    print("Type 'quit' to exit\n")

    while True:
        text = input("Enter text: ").strip()

        if text.lower() in ['quit', 'exit', 'q']:
            print("Goodbye!")
            break

        if not text:
            continue

        result = model.predict(text)

        print(f"\nPrediction: {result['label']}")
        print(f"Confidence: {result['confidence']:.2%}")
        print("\nAll probabilities:")
        for label, prob in result['probabilities'].items():
            print(f"  {label}: {prob:.2%}")
        print()


if __name__ == "__main__":
    interactive_mode()
