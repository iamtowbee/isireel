# Mobile Deployment Guide

Deploy your AI model to mobile devices with **zero network requests**. Complete offline inference.

## Quick Start

### Step 1: Train Your Model

```bash
python data_generator.py
python train.py
```

### Step 2: Minify for Mobile

```bash
python mobile_optimizer.py
```

This will create multiple compressed versions:
- **Quantized models** (~4x smaller)
- **Pruned models** (~30% smaller)
- **PyTorch Mobile** (.ptl format)
- **ONNX** (cross-platform)

### Step 3: Deploy to Your App

```python
from mobile_inference import MobileAI

# Load model (works 100% offline)
model = MobileAI("model_mobile.ptl")

# Make predictions
result = model.predict("input text")
print(result['label'], result['confidence'])
```

## Compression Techniques

### 1. Quantization (Recommended)

**What it does:** Converts 32-bit weights to 8-bit integers

**Benefits:**
- 4x smaller file size
- 2-3x faster inference
- Minimal accuracy loss (<1%)

**Usage:**
```python
from mobile_optimizer import ModelMinifier
from network import create_model

model = create_model('feedforward', input_size=1000, output_size=3)
minifier = ModelMinifier(model)

# Dynamic quantization (easiest)
quantized_model, path = minifier.quantize_dynamic()
# Output: model_quantized_dynamic.pth (4x smaller)
```

**File sizes:**
- Original: 10 MB → Quantized: 2.5 MB

### 2. Pruning

**What it does:** Removes small/unimportant weights

**Benefits:**
- 20-50% smaller
- Faster inference
- Customizable pruning amount

**Usage:**
```python
# Prune 30% of weights
pruned_model, path = minifier.prune_model(amount=0.3)
```

**Trade-off:** May reduce accuracy by 1-3%

### 3. PyTorch Mobile Export

**What it does:** Optimizes model specifically for mobile CPUs

**Benefits:**
- Mobile-optimized operators
- Smaller runtime footprint
- Better battery life

**Usage:**
```python
import torch

# Create example input
example = torch.randn(1, 1000)

# Export to mobile
mobile_path = minifier.export_mobile(example)
# Output: model_mobile.ptl
```

### 4. Full Pipeline (Maximum Compression)

```python
results = minifier.compress_full_pipeline(
    example_input=torch.randn(1, 1000)
)

# Outputs all formats:
# - Pruned
# - Quantized
# - Mobile (.ptl)
# - ONNX
```

**Example results:**
```
Original model: 15.2 MB

pruned              :   10.6 MB  (1.4x smaller)
quantized_dynamic   :    3.8 MB  (4.0x smaller)
mobile              :    3.2 MB  (4.8x smaller)
onnx                :    2.9 MB  (5.2x smaller)

🏆 Best compression: onnx at 2.9 MB
```

## Platform-Specific Export

### iOS (Core ML)

```bash
# Convert ONNX to Core ML
pip install coremltools

python -c "
import coremltools as ct
from coremltools.converters.onnx import convert

model = convert(model='model.onnx')
model.save('model.mlmodel')
"
```

### Android (TensorFlow Lite)

```python
from mobile_optimizer import convert_onnx_to_tflite

# Convert to TFLite
tflite_path = convert_onnx_to_tflite('model.onnx')
# Output: model.tflite
```

### React Native / Flutter

Use PyTorch Mobile (.ptl) or ONNX Runtime:

```bash
# Install ONNX Runtime
npm install onnxruntime-react-native
# or
flutter pub add onnxruntime
```

## Mobile Integration Examples

### Python/Kivy Mobile App

```python
from mobile_inference import MobileAI

class MyApp(App):
    def build(self):
        # Load model once at startup
        self.ai = MobileAI("model_mobile.ptl",
                          "vocab.pkl",
                          "label_encoder.pkl")
        return MyLayout()

    def on_text_input(self, text):
        # Predict offline - no network needed
        result = self.ai.predict(text)
        self.show_result(result['label'], result['confidence'])
```

### Android (Java/Kotlin)

```java
// Using PyTorch Mobile
import org.pytorch.Module;
import org.pytorch.Tensor;

Module model = Module.load(assetFilePath("model_mobile.ptl"));
Tensor input = Tensor.fromBlob(inputArray, shape);
Tensor output = model.forward(IValue.from(input)).toTensor();
```

### iOS (Swift)

```swift
// Using Core ML
import CoreML

let model = try! MyAIModel(configuration: MLModelConfiguration())
let prediction = try! model.prediction(input: inputData)
print(prediction.label)
```

### React Native

```javascript
import { InferenceSession } from 'onnxruntime-react-native';

// Load model
const session = await InferenceSession.create('model.onnx');

// Run inference
const results = await session.run({
  input: inputTensor
});
```

## Optimization Checklist

- [ ] **Train model** - Use `train.py`
- [ ] **Test accuracy** - Verify model works well
- [ ] **Quantize** - Apply quantization for 4x compression
- [ ] **Export mobile format** - Create .ptl or .tflite
- [ ] **Bundle with app** - Include in assets/resources
- [ ] **Test on device** - Verify inference speed
- [ ] **Benchmark** - Measure actual performance

## Performance Targets

**Good mobile model:**
- Size: < 5 MB
- Inference: < 50ms on mid-range phone
- Accuracy: > 90% of original

**Excellent mobile model:**
- Size: < 2 MB
- Inference: < 20ms
- Accuracy: > 95% of original

## Benchmark Your Model

```python
from mobile_inference import benchmark_model

# Test inference speed
avg_time = benchmark_model("model_mobile.ptl", num_runs=100)
# Output: Average inference time: 12.34 ms
```

## File Size Comparison

**Typical compression results:**

| Format | Size | Speed | Compatibility |
|--------|------|-------|---------------|
| Original .pth | 15 MB | Baseline | PyTorch only |
| Quantized .pth | 4 MB | 2x faster | PyTorch only |
| Mobile .ptl | 3 MB | 3x faster | iOS/Android (PyTorch) |
| ONNX | 3 MB | 2-3x faster | All platforms |
| TFLite | 2.5 MB | 3x faster | Android/iOS/Web |
| Core ML | 2.8 MB | 4x faster | iOS only |

## Troubleshooting

### Model too large (> 10 MB)

1. Apply quantization first
2. Prune more aggressively (50%+)
3. Reduce model size (fewer layers/neurons)
4. Use knowledge distillation

### Slow inference (> 100ms)

1. Use quantized model
2. Reduce input size
3. Use smaller architecture
4. Enable hardware acceleration

### Accuracy drop after compression

1. Use lower pruning amount
2. Try static quantization with calibration
3. Fine-tune quantized model
4. Use quantization-aware training

## Advanced: Embedded Model

For **ultra-small** deployments, embed weights directly in code:

```python
from mobile_inference import EmbeddedModel

# Create standalone .py file with weights
EmbeddedModel.create_from_model(
    model=your_model,
    vocab=vocab_dict,
    labels=label_list,
    output_file="standalone_ai.py"
)

# Now you have a single .py file that needs zero dependencies
```

## Next Steps

1. **Optimize further** - Try different quantization methods
2. **A/B test** - Compare formats on your target device
3. **Monitor usage** - Track battery/memory impact
4. **Update models** - Over-the-air model updates

## Resources

- [PyTorch Mobile Docs](https://pytorch.org/mobile/)
- [TensorFlow Lite Guide](https://www.tensorflow.org/lite)
- [ONNX Runtime](https://onnxruntime.ai/)
- [Core ML Tools](https://coremltools.readme.io/)
