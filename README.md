# isireel
A reel of objects for controlling eye speed at internet rates.

## AI Model Training & Chat

Train your own AI language model from scratch or fine-tune existing models.

### Quick Start

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Train a model:**
```bash
python train.py
```

This will:
- Download GPT-2 (small) as the base model
- Fine-tune it on WikiText dataset
- Save the trained model to `./trained_model/`

3. **Chat with your AI:**
```bash
python chat.py
```

### Customization

**train.py** - Modify these parameters:
- `model_name`: Change to larger models like "meta-llama/Llama-2-7b-hf" or "mistralai/Mistral-7B-v0.1"
- `dataset_name`: Use your own dataset or different HuggingFace datasets
- `num_epochs`: More epochs = better learning (but slower)
- `batch_size`: Increase if you have more GPU memory

**chat.py** - Your AI assistant interface:
- Change `model_path` to use different models
- Adjust `temperature` for more creative (higher) or focused (lower) responses

### Training Your Own Data

Create a text file or dataset and modify `train.py` to load it:

```python
from datasets import Dataset

# Your custom data
texts = ["Your training text here...", "More examples..."]
dataset = Dataset.from_dict({"text": texts})
```

### Hardware Requirements

- **CPU**: Works but slow (for testing only)
- **GPU**: Recommended (NVIDIA with CUDA)
- **RAM**: 8GB+ for small models, 16GB+ for larger models

### Next Steps

- Add more training data for better responses
- Use larger base models for more capability
- Implement RAG (Retrieval Augmented Generation) for knowledge
- Add memory/conversation history
- Deploy as a web service
