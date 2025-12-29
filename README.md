# isireel
A reel of objects for controlling eye speed at internet rates.

## Build Your Own AI from Scratch

Train neural networks from scratch using LLM-generated training data. No pre-trained models - build and train your own AI.

### What This Does

1. **Generate Training Data** - Use LLMs (Claude/GPT) to create synthetic datasets
2. **Build Neural Networks** - From-scratch architectures (feedforward, RNN, CNN)
3. **Train Your Model** - Complete training pipeline with validation
4. **Use Your AI** - Inference interface for predictions

### Quick Start

#### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 2. Set Up API Key

You need an LLM API key to generate training data:

```bash
# For Claude (recommended)
export ANTHROPIC_API_KEY='your-key-here'

# OR for OpenAI
export OPENAI_API_KEY='your-key-here'
```

#### 3. Generate Training Data

```bash
python data_generator.py
```

This will:
- Use LLM to generate synthetic training examples
- Create `sentiment_data.json` with labeled examples
- Ready for training

#### 4. Train Your Model

```bash
python train.py
```

This will:
- Build a neural network from scratch
- Train on LLM-generated data
- Save trained model to `trained_model.pth`
- Track accuracy and loss

#### 5. Use Your AI

```bash
python chat.py
```

Interactive mode - test your trained model!

### Project Structure

```
isireel/
├── network.py          # Neural network architectures (from scratch)
├── data_generator.py   # LLM-based data generation
├── train.py            # Training pipeline
├── chat.py             # Inference interface
└── requirements.txt    # Dependencies
```

### Customization

#### Change Neural Network Architecture

Edit `network.py` or modify in `train.py`:

```python
model = create_model(
    'feedforward',
    input_size=input_size,
    hidden_sizes=[512, 256, 128],  # Customize layer sizes
    output_size=output_size,
    dropout=0.3  # Adjust dropout
)
```

Available architectures:
- `feedforward` - Standard neural network
- `recurrent` - LSTM/RNN for sequences
- `convolutional` - CNN for images

#### Generate Custom Data

Modify `data_generator.py`:

```python
# Custom classification task
generator.generate_classification_data(
    categories=["spam", "not_spam"],
    examples_per_category=100,
    domain="email messages"
)

# Custom general task
generator.generate_dataset(
    task_description="Medical diagnosis based on symptoms",
    num_examples=500
)
```

#### Training Parameters

In `train.py`:

```python
trainer.train(
    train_loader,
    val_loader,
    num_epochs=20,      # More epochs = better learning
    learning_rate=0.001, # Adjust learning speed
    save_path='my_model.pth'
)
```

### How It Works

#### 1. Data Generation
- LLM creates synthetic training examples
- Diverse, high-quality data
- No manual labeling needed

#### 2. Neural Network
- Built from PyTorch primitives
- Custom architectures
- Full control over layers

#### 3. Training
- Backpropagation from scratch
- Adam optimizer
- Validation tracking

#### 4. Inference
- Load trained model
- Make predictions
- Get confidence scores

### Advanced Usage

#### Use Different LLM Providers

```python
# Use Claude
generator = LLMDataGenerator(provider="anthropic")

# Use GPT
generator = LLMDataGenerator(provider="openai")
```

#### Train on Your Own Data

```python
# Load custom data
with open('my_data.json', 'r') as f:
    data = json.load(f)

train_classification_model("my_data.json")
```

#### Export Model for Production

```python
# Save for PyTorch
torch.save(model.state_dict(), 'model_weights.pth')

# Convert to ONNX
torch.onnx.export(model, dummy_input, "model.onnx")

# Use TorchScript
scripted_model = torch.jit.script(model)
scripted_model.save("model_scripted.pt")
```

### Example Workflow

```bash
# 1. Generate sentiment analysis data
python data_generator.py

# 2. Train model
python train.py

# 3. Test predictions
python chat.py
>>> This product is amazing!
Prediction: positive
Confidence: 94.32%
```

### Hardware Requirements

- **CPU**: Works (slower training)
- **GPU**: Recommended (NVIDIA with CUDA)
- **RAM**: 4GB+ for small models

### Mobile Deployment

Deploy your AI to mobile devices with **zero network requests**:

```bash
# Minify your model
python mobile_optimizer.py

# Use in your app (100% offline)
from mobile_inference import MobileAI
model = MobileAI("model_mobile.ptl")
result = model.predict("input text")
```

**See [MOBILE_DEPLOYMENT.md](MOBILE_DEPLOYMENT.md) for complete guide.**

**Compression results:**
- Original: 15 MB → Compressed: 3 MB (5x smaller)
- Inference: < 20ms on mobile CPU
- Works offline - no API calls needed

### Next Steps

- Generate more training data for better accuracy
- Experiment with different architectures
- Add more categories/classes
- **Deploy to mobile** - See MOBILE_DEPLOYMENT.md
- Fine-tune hyperparameters
- Implement ensemble models

### Troubleshooting

**No API key found:**
```bash
export ANTHROPIC_API_KEY='your-key'
```

**Training data not found:**
```bash
python data_generator.py  # Generate data first
```

**Out of memory:**
- Reduce `batch_size` in train.py
- Use smaller `hidden_sizes`
- Switch to CPU training

### License

MIT
