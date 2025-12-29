"""
Train the neural network on LLM-generated data.
"""
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import json
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tqdm import tqdm
import os

from network import create_model


class TextDataset(Dataset):
    """Dataset for text classification/regression tasks."""

    def __init__(self, texts, labels, vocab=None, max_length=100):
        self.texts = texts
        self.labels = labels
        self.max_length = max_length

        # Build vocabulary if not provided
        if vocab is None:
            self.vocab = self._build_vocab(texts)
        else:
            self.vocab = vocab

    def _build_vocab(self, texts):
        """Build vocabulary from texts."""
        vocab = {"<PAD>": 0, "<UNK>": 1}
        for text in texts:
            for word in text.lower().split():
                if word not in vocab:
                    vocab[word] = len(vocab)
        return vocab

    def _text_to_indices(self, text):
        """Convert text to indices."""
        indices = []
        for word in text.lower().split():
            indices.append(self.vocab.get(word, self.vocab["<UNK>"]))

        # Pad or truncate
        if len(indices) < self.max_length:
            indices += [self.vocab["<PAD>"]] * (self.max_length - len(indices))
        else:
            indices = indices[:self.max_length]

        return indices

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = self.texts[idx]
        label = self.labels[idx]

        # Convert text to tensor
        indices = self._text_to_indices(text)
        text_tensor = torch.tensor(indices, dtype=torch.long)

        # Convert to one-hot encoding (input features)
        one_hot = torch.zeros(self.max_length, len(self.vocab))
        for i, idx_val in enumerate(indices):
            one_hot[i, idx_val] = 1

        # Flatten for feedforward network
        features = one_hot.flatten()

        return features, torch.tensor(label, dtype=torch.long)


class Trainer:
    """Training pipeline for neural networks."""

    def __init__(self, model, device='cpu'):
        self.model = model.to(device)
        self.device = device

    def train_epoch(self, dataloader, criterion, optimizer):
        """Train for one epoch."""
        self.model.train()
        total_loss = 0
        correct = 0
        total = 0

        for inputs, labels in tqdm(dataloader, desc="Training"):
            inputs, labels = inputs.to(self.device), labels.to(self.device)

            # Forward pass
            optimizer.zero_grad()
            outputs = self.model(inputs)
            loss = criterion(outputs, labels)

            # Backward pass
            loss.backward()
            optimizer.step()

            # Statistics
            total_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

        avg_loss = total_loss / len(dataloader)
        accuracy = 100 * correct / total
        return avg_loss, accuracy

    def evaluate(self, dataloader, criterion):
        """Evaluate the model."""
        self.model.eval()
        total_loss = 0
        correct = 0
        total = 0

        with torch.no_grad():
            for inputs, labels in tqdm(dataloader, desc="Evaluating"):
                inputs, labels = inputs.to(self.device), labels.to(self.device)

                outputs = self.model(inputs)
                loss = criterion(outputs, labels)

                total_loss += loss.item()
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()

        avg_loss = total_loss / len(dataloader)
        accuracy = 100 * correct / total
        return avg_loss, accuracy

    def train(
        self,
        train_loader,
        val_loader,
        num_epochs=10,
        learning_rate=0.001,
        save_path="model.pth"
    ):
        """Full training loop."""
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(self.model.parameters(), lr=learning_rate)
        scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, 'min', patience=2)

        best_val_loss = float('inf')

        print(f"\nTraining on {self.device}")
        print(f"Total parameters: {sum(p.numel() for p in self.model.parameters()):,}\n")

        for epoch in range(num_epochs):
            print(f"Epoch {epoch + 1}/{num_epochs}")
            print("-" * 50)

            # Train
            train_loss, train_acc = self.train_epoch(train_loader, criterion, optimizer)
            print(f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}%")

            # Validate
            val_loss, val_acc = self.evaluate(val_loader, criterion)
            print(f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%")

            # Learning rate scheduling
            scheduler.step(val_loss)

            # Save best model
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                torch.save({
                    'epoch': epoch,
                    'model_state_dict': self.model.state_dict(),
                    'optimizer_state_dict': optimizer.state_dict(),
                    'val_loss': val_loss,
                    'val_acc': val_acc,
                }, save_path)
                print(f"✓ Model saved to {save_path}")

            print()

        print(f"Training complete! Best val loss: {best_val_loss:.4f}")
        return best_val_loss


def load_llm_generated_data(filepath):
    """Load data generated by LLM."""
    with open(filepath, 'r') as f:
        data = json.load(f)
    return data


def train_classification_model(data_file="sentiment_data.json"):
    """Train a classification model on LLM-generated data."""

    # Load data
    print(f"Loading data from {data_file}...")
    data = load_llm_generated_data(data_file)

    texts = [item['text'] for item in data]
    labels = [item['label'] for item in data]

    # Encode labels
    label_encoder = LabelEncoder()
    encoded_labels = label_encoder.fit_transform(labels)

    print(f"Loaded {len(texts)} examples")
    print(f"Classes: {label_encoder.classes_}")

    # Split data
    X_train, X_val, y_train, y_val = train_test_split(
        texts, encoded_labels, test_size=0.2, random_state=42
    )

    # Create datasets
    train_dataset = TextDataset(X_train, y_train)
    val_dataset = TextDataset(X_val, y_val, vocab=train_dataset.vocab)

    # Save vocabulary and label encoder
    import pickle
    with open('vocab.pkl', 'wb') as f:
        pickle.dump(train_dataset.vocab, f)
    with open('label_encoder.pkl', 'wb') as f:
        pickle.dump(label_encoder, f)

    # Create dataloaders
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)

    # Create model
    input_size = len(train_dataset.vocab) * 100  # vocab_size * max_length
    output_size = len(label_encoder.classes_)

    print(f"\nModel architecture:")
    print(f"Input size: {input_size}")
    print(f"Output size: {output_size}")

    model = create_model(
        'feedforward',
        input_size=input_size,
        hidden_sizes=[512, 256, 128],
        output_size=output_size,
        dropout=0.3
    )

    # Train
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    trainer = Trainer(model, device=device)

    trainer.train(
        train_loader,
        val_loader,
        num_epochs=20,
        learning_rate=0.001,
        save_path='trained_model.pth'
    )


if __name__ == "__main__":
    # Check if data exists
    if not os.path.exists("sentiment_data.json"):
        print("No training data found!")
        print("Run: python data_generator.py")
        print("Or specify your own data file")
        exit(1)

    train_classification_model("sentiment_data.json")
