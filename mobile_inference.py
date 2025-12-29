"""
On-device inference for mobile-optimized models.
Load and run compressed models without network requests.
"""
import torch
import pickle
import json
from pathlib import Path


class MobileAI:
    """Lightweight inference for mobile deployment."""

    def __init__(self, model_path, vocab_path=None, label_path=None):
        """
        Load a mobile-optimized model for on-device inference.

        Args:
            model_path: Path to .ptl (mobile) or .pth file
            vocab_path: Path to vocabulary pickle
            label_path: Path to label encoder pickle
        """
        self.model_path = model_path
        self.device = 'cpu'  # Mobile typically uses CPU

        # Load vocabulary if provided
        if vocab_path and Path(vocab_path).exists():
            with open(vocab_path, 'rb') as f:
                self.vocab = pickle.load(f)
        else:
            self.vocab = None

        # Load label encoder if provided
        if label_path and Path(label_path).exists():
            with open(label_path, 'rb') as f:
                self.label_encoder = pickle.load(f)
        else:
            self.label_encoder = None

        # Load model
        self._load_model()

    def _load_model(self):
        """Load the optimized model."""
        if self.model_path.endswith('.ptl'):
            # PyTorch Mobile format
            self.model = torch.jit.load(self.model_path)
            self.model_type = 'mobile'
        elif self.model_path.endswith('.pth'):
            # Standard PyTorch format
            checkpoint = torch.load(self.model_path, map_location=self.device)
            # This assumes model architecture is known
            # In production, you'd need to recreate the model
            self.model = checkpoint  # or load into created model
            self.model_type = 'standard'
        else:
            raise ValueError(f"Unsupported model format: {self.model_path}")

        self.model.eval()
        print(f"✓ Loaded {self.model_type} model from {self.model_path}")

    def preprocess_text(self, text, max_length=100):
        """Convert text to model input tensor."""
        if self.vocab is None:
            raise ValueError("No vocabulary loaded")

        # Tokenize
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

        # Flatten and add batch dimension
        features = one_hot.flatten().unsqueeze(0)
        return features

    def predict(self, input_data):
        """
        Make prediction on input data.

        Args:
            input_data: Text string or preprocessed tensor

        Returns:
            Dictionary with prediction results
        """
        # Preprocess if needed
        if isinstance(input_data, str):
            input_tensor = self.preprocess_text(input_data)
        else:
            input_tensor = input_data

        # Run inference
        with torch.no_grad():
            output = self.model(input_tensor)

        # Get probabilities
        probabilities = torch.softmax(output, dim=1)
        predicted_class = torch.argmax(probabilities, dim=1).item()
        confidence = probabilities[0][predicted_class].item()

        result = {
            'class': predicted_class,
            'confidence': confidence,
            'raw_output': output.numpy().tolist()
        }

        # Decode label if encoder available
        if self.label_encoder is not None:
            result['label'] = self.label_encoder.inverse_transform([predicted_class])[0]
            result['all_probabilities'] = {
                self.label_encoder.classes_[i]: probabilities[0][i].item()
                for i in range(len(self.label_encoder.classes_))
            }

        return result

    def predict_batch(self, inputs):
        """Process multiple inputs efficiently."""
        return [self.predict(inp) for inp in inputs]

    def get_model_info(self):
        """Get information about the loaded model."""
        import os

        size = os.path.getsize(self.model_path) / (1024 * 1024)

        info = {
            'path': self.model_path,
            'type': self.model_type,
            'size_mb': round(size, 2),
            'has_vocab': self.vocab is not None,
            'has_labels': self.label_encoder is not None
        }

        if self.label_encoder is not None:
            info['classes'] = list(self.label_encoder.classes_)

        return info


class EmbeddedModel:
    """
    Fully embedded model with weights baked in.
    No external file dependencies - pure Python.
    """

    def __init__(self, weights_dict, vocab_dict, label_list):
        """
        Initialize with embedded data.

        Args:
            weights_dict: Dictionary of layer weights
            vocab_dict: Vocabulary mapping
            label_list: List of labels
        """
        self.weights = weights_dict
        self.vocab = vocab_dict
        self.labels = label_list

    def predict(self, text):
        """Make prediction using embedded weights."""
        # This is a simplified example
        # In practice, you'd implement the forward pass manually
        pass

    @staticmethod
    def create_from_model(model, vocab, labels, output_file="embedded_model.py"):
        """
        Convert a trained model to a standalone Python file.
        Creates a single .py file with all weights embedded.
        """
        # Extract weights
        weights = {}
        for name, param in model.named_parameters():
            weights[name] = param.detach().cpu().numpy().tolist()

        # Generate Python code
        code = f'''"""
Embedded AI Model - No dependencies, fully standalone.
Generated automatically from trained model.
"""

class EmbeddedAI:
    def __init__(self):
        self.weights = {weights}
        self.vocab = {vocab}
        self.labels = {labels}

    def predict(self, text):
        # Implement forward pass here
        # This is model-specific
        pass

if __name__ == "__main__":
    model = EmbeddedAI()
    result = model.predict("example input")
    print(result)
'''

        with open(output_file, 'w') as f:
            f.write(code)

        print(f"✓ Embedded model saved to {output_file}")
        return output_file


def benchmark_model(model_path, num_runs=100):
    """
    Benchmark inference speed for mobile deployment.

    Args:
        model_path: Path to model file
        num_runs: Number of inference runs
    """
    import time

    print(f"Benchmarking {model_path}...")

    mobile_ai = MobileAI(model_path)

    # Create sample input
    if mobile_ai.vocab:
        sample_input = mobile_ai.preprocess_text("sample text for benchmarking")
    else:
        sample_input = torch.randn(1, 100)

    # Warmup
    for _ in range(10):
        mobile_ai.predict(sample_input)

    # Benchmark
    start = time.time()
    for _ in range(num_runs):
        mobile_ai.predict(sample_input)
    end = time.time()

    avg_time = (end - start) / num_runs * 1000  # Convert to ms

    print(f"✓ Benchmark complete")
    print(f"  Average inference time: {avg_time:.2f} ms")
    print(f"  Throughput: {1000/avg_time:.0f} inferences/second")

    return avg_time


if __name__ == "__main__":
    print("Mobile Inference Demo")
    print("="*60)

    # Example usage
    print("\nTo use this in your mobile app:")
    print("""
# 1. Load the mobile model
from mobile_inference import MobileAI

model = MobileAI(
    model_path="model_mobile.ptl",
    vocab_path="vocab.pkl",
    label_path="label_encoder.pkl"
)

# 2. Make predictions (100% offline)
result = model.predict("This is amazing!")
print(result['label'], result['confidence'])

# 3. Get model info
info = model.get_model_info()
print(f"Model size: {info['size_mb']} MB")
""")
