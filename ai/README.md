# AI/ML Training System

Build custom AI models from scratch using LLM-generated training data.

## Features

- **Custom Neural Networks**: Build feedforward, RNN, and CNN architectures from scratch
- **LLM-Powered Data Generation**: Use Claude or GPT to create synthetic training data
- **Full Training Pipeline**: Complete training, validation, and checkpointing
- **Interactive Inference**: Chat interface for model predictions

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Generate training data using LLM
python data_generator.py

# Train your model
python train.py --data data.json --epochs 10

# Chat with your model
python chat.py --model model.pt
```

## Files

- `network.py` - Neural network architectures (feedforward, RNN, CNN)
- `data_generator.py` - LLM-powered synthetic data generation
- `train.py` - Training pipeline with validation and checkpointing
- `chat.py` - Interactive inference interface

## Example: Classification Task

```bash
# Generate classification data
python data_generator.py --task classification --examples 1000

# Train a classifier
python train.py --data data.json --architecture feedforward

# Test predictions
python chat.py --model checkpoints/best_model.pt
```

## Requirements

- PyTorch >= 2.0.0
- Anthropic API key (for Claude) or OpenAI API key (for GPT)
- Python 3.8+
