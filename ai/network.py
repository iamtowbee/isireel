"""
Neural Network built from scratch using PyTorch primitives.
No pre-trained models - pure neural network architecture.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F


class CustomNeuralNetwork(nn.Module):
    """
    A neural network built from scratch.
    Customize layers, activation functions, and architecture.
    """

    def __init__(self, input_size, hidden_sizes, output_size, dropout=0.3):
        """
        Args:
            input_size: Number of input features
            hidden_sizes: List of hidden layer sizes [128, 64, 32]
            output_size: Number of output classes/values
            dropout: Dropout probability for regularization
        """
        super(CustomNeuralNetwork, self).__init__()

        self.input_size = input_size
        self.output_size = output_size

        # Build layers dynamically
        layers = []
        prev_size = input_size

        for hidden_size in hidden_sizes:
            layers.append(nn.Linear(prev_size, hidden_size))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(dropout))
            layers.append(nn.BatchNorm1d(hidden_size))
            prev_size = hidden_size

        # Output layer
        layers.append(nn.Linear(prev_size, output_size))

        self.network = nn.Sequential(*layers)

        # Initialize weights
        self._initialize_weights()

    def _initialize_weights(self):
        """Initialize network weights using Xavier/He initialization."""
        for module in self.modules():
            if isinstance(module, nn.Linear):
                nn.init.kaiming_normal_(module.weight, mode='fan_out', nonlinearity='relu')
                if module.bias is not None:
                    nn.init.constant_(module.bias, 0)

    def forward(self, x):
        """Forward pass through the network."""
        return self.network(x)


class RecurrentNetwork(nn.Module):
    """
    Recurrent Neural Network for sequence data.
    Built from scratch using LSTM/GRU cells.
    """

    def __init__(self, input_size, hidden_size, output_size, num_layers=2, dropout=0.3):
        super(RecurrentNetwork, self).__init__()

        self.hidden_size = hidden_size
        self.num_layers = num_layers

        # LSTM layers
        self.lstm = nn.LSTM(
            input_size,
            hidden_size,
            num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )

        # Output layer
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        # Initialize hidden state
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)

        # Forward propagate LSTM
        out, _ = self.lstm(x, (h0, c0))

        # Decode the hidden state of the last time step
        out = self.fc(out[:, -1, :])
        return out


class ConvolutionalNetwork(nn.Module):
    """
    Convolutional Neural Network for image/spatial data.
    Built from scratch with conv layers.
    """

    def __init__(self, input_channels, num_classes, image_size=28):
        super(ConvolutionalNetwork, self).__init__()

        # Convolutional layers
        self.conv1 = nn.Conv2d(input_channels, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)

        # Pooling
        self.pool = nn.MaxPool2d(2, 2)

        # Calculate flattened size
        conv_output_size = (image_size // 8) * (image_size // 8) * 128

        # Fully connected layers
        self.fc1 = nn.Linear(conv_output_size, 256)
        self.fc2 = nn.Linear(256, num_classes)

        self.dropout = nn.Dropout(0.5)

    def forward(self, x):
        # Conv layers with activation and pooling
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = self.pool(F.relu(self.conv3(x)))

        # Flatten
        x = x.view(x.size(0), -1)

        # FC layers
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)

        return x


def create_model(model_type, **kwargs):
    """
    Factory function to create different model types.

    Args:
        model_type: 'feedforward', 'recurrent', or 'convolutional'
        **kwargs: Model-specific parameters

    Returns:
        PyTorch model
    """
    if model_type == 'feedforward':
        return CustomNeuralNetwork(
            kwargs.get('input_size', 100),
            kwargs.get('hidden_sizes', [128, 64, 32]),
            kwargs.get('output_size', 10),
            kwargs.get('dropout', 0.3)
        )
    elif model_type == 'recurrent':
        return RecurrentNetwork(
            kwargs.get('input_size', 100),
            kwargs.get('hidden_size', 128),
            kwargs.get('output_size', 10),
            kwargs.get('num_layers', 2),
            kwargs.get('dropout', 0.3)
        )
    elif model_type == 'convolutional':
        return ConvolutionalNetwork(
            kwargs.get('input_channels', 1),
            kwargs.get('num_classes', 10),
            kwargs.get('image_size', 28)
        )
    else:
        raise ValueError(f"Unknown model type: {model_type}")


if __name__ == "__main__":
    # Test the models
    print("Testing Feedforward Network:")
    ff_model = create_model('feedforward', input_size=100, output_size=5)
    test_input = torch.randn(32, 100)  # batch_size=32, input_size=100
    output = ff_model(test_input)
    print(f"Input shape: {test_input.shape}, Output shape: {output.shape}")

    print("\nTesting Recurrent Network:")
    rnn_model = create_model('recurrent', input_size=50, output_size=3)
    test_sequence = torch.randn(32, 10, 50)  # batch_size=32, seq_len=10, features=50
    output = rnn_model(test_sequence)
    print(f"Input shape: {test_sequence.shape}, Output shape: {output.shape}")

    print("\nTesting Convolutional Network:")
    cnn_model = create_model('convolutional', input_channels=3, num_classes=10)
    test_image = torch.randn(32, 3, 28, 28)  # batch_size=32, channels=3, height=28, width=28
    output = cnn_model(test_image)
    print(f"Input shape: {test_image.shape}, Output shape: {output.shape}")
