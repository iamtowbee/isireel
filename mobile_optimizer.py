"""
Minify and optimize AI models for mobile deployment.
Techniques: Quantization, Pruning, Distillation, Mobile Export
"""
import torch
import torch.nn as nn
import torch.quantization
from torch.ao.pruning import l1_unstructured
import os
from pathlib import Path


class ModelMinifier:
    """Compress and optimize models for mobile deployment."""

    def __init__(self, model, model_name="model"):
        self.model = model
        self.model_name = model_name
        self.original_size = self._get_model_size(model)

    def _get_model_size(self, model, path=None):
        """Get model size in MB."""
        if path:
            return os.path.getsize(path) / (1024 * 1024)

        # Save temporarily to measure
        temp_path = f"temp_{self.model_name}.pth"
        torch.save(model.state_dict(), temp_path)
        size = os.path.getsize(temp_path) / (1024 * 1024)
        os.remove(temp_path)
        return size

    def quantize_dynamic(self, save_path=None):
        """
        Dynamic quantization - converts weights to int8.
        Good for: Models with many linear/LSTM layers
        Compression: ~4x smaller, faster inference
        """
        print("Applying dynamic quantization...")

        quantized_model = torch.quantization.quantize_dynamic(
            self.model,
            {nn.Linear, nn.LSTM, nn.GRU},  # Layers to quantize
            dtype=torch.qint8
        )

        if save_path is None:
            save_path = f"{self.model_name}_quantized_dynamic.pth"

        torch.save(quantized_model.state_dict(), save_path)

        new_size = self._get_model_size(None, save_path)
        compression_ratio = self.original_size / new_size

        print(f"✓ Dynamic quantization complete")
        print(f"  Original: {self.original_size:.2f} MB")
        print(f"  Quantized: {new_size:.2f} MB")
        print(f"  Compression: {compression_ratio:.2f}x smaller")

        return quantized_model, save_path

    def quantize_static(self, calibration_data, save_path=None):
        """
        Static quantization - calibrates with sample data.
        Good for: Maximum compression and speed
        Compression: ~4x smaller, fastest inference

        Args:
            calibration_data: Sample input data for calibration
        """
        print("Applying static quantization...")

        # Prepare model for quantization
        self.model.eval()
        self.model.qconfig = torch.quantization.get_default_qconfig('fbgemm')

        # Fuse modules if applicable (Conv+ReLU, etc.)
        # model_fused = torch.quantization.fuse_modules(self.model, [['conv', 'relu']])

        # Prepare for quantization
        model_prepared = torch.quantization.prepare(self.model)

        # Calibrate with sample data
        print("  Calibrating with sample data...")
        with torch.no_grad():
            if isinstance(calibration_data, list):
                for data in calibration_data[:100]:  # Use subset for speed
                    model_prepared(data)
            else:
                model_prepared(calibration_data)

        # Convert to quantized model
        quantized_model = torch.quantization.convert(model_prepared)

        if save_path is None:
            save_path = f"{self.model_name}_quantized_static.pth"

        torch.save(quantized_model.state_dict(), save_path)

        new_size = self._get_model_size(None, save_path)
        compression_ratio = self.original_size / new_size

        print(f"✓ Static quantization complete")
        print(f"  Original: {self.original_size:.2f} MB")
        print(f"  Quantized: {new_size:.2f} MB")
        print(f"  Compression: {compression_ratio:.2f}x smaller")

        return quantized_model, save_path

    def prune_model(self, amount=0.3, save_path=None):
        """
        Prune model weights (set smallest weights to zero).
        Good for: Reducing model size and computation

        Args:
            amount: Percentage of weights to prune (0.3 = 30%)
        """
        print(f"Pruning {amount*100:.0f}% of model weights...")

        # Apply L1 unstructured pruning to all linear layers
        for name, module in self.model.named_modules():
            if isinstance(module, nn.Linear):
                l1_unstructured(module, name='weight', amount=amount)

        # Make pruning permanent
        for name, module in self.model.named_modules():
            if isinstance(module, nn.Linear):
                torch.nn.utils.prune.remove(module, 'weight')

        if save_path is None:
            save_path = f"{self.model_name}_pruned_{int(amount*100)}.pth"

        torch.save(self.model.state_dict(), save_path)

        new_size = self._get_model_size(None, save_path)

        print(f"✓ Pruning complete")
        print(f"  Original: {self.original_size:.2f} MB")
        print(f"  Pruned: {new_size:.2f} MB")

        return self.model, save_path

    def export_mobile(self, example_input, save_path=None):
        """
        Export to PyTorch Mobile format (.ptl).
        Optimized for on-device inference.

        Args:
            example_input: Sample input tensor (for tracing)
        """
        print("Exporting to PyTorch Mobile...")

        self.model.eval()

        # Trace the model
        traced_model = torch.jit.trace(self.model, example_input)

        # Optimize for mobile
        optimized_model = torch.jit.optimize_for_inference(traced_model)

        if save_path is None:
            save_path = f"{self.model_name}_mobile.ptl"

        # Save for mobile
        optimized_model._save_for_lite_interpreter(save_path)

        new_size = os.path.getsize(save_path) / (1024 * 1024)

        print(f"✓ Mobile export complete")
        print(f"  File: {save_path}")
        print(f"  Size: {new_size:.2f} MB")

        return save_path

    def export_onnx(self, example_input, save_path=None):
        """
        Export to ONNX format (cross-platform).
        Works with: TensorFlow Lite, Core ML, etc.

        Args:
            example_input: Sample input tensor
        """
        print("Exporting to ONNX...")

        self.model.eval()

        if save_path is None:
            save_path = f"{self.model_name}.onnx"

        torch.onnx.export(
            self.model,
            example_input,
            save_path,
            export_params=True,
            opset_version=11,
            do_constant_folding=True,
            input_names=['input'],
            output_names=['output'],
            dynamic_axes={
                'input': {0: 'batch_size'},
                'output': {0: 'batch_size'}
            }
        )

        new_size = os.path.getsize(save_path) / (1024 * 1024)

        print(f"✓ ONNX export complete")
        print(f"  File: {save_path}")
        print(f"  Size: {new_size:.2f} MB")

        return save_path

    def compress_full_pipeline(self, example_input, calibration_data=None):
        """
        Apply all compression techniques for maximum size reduction.

        Returns dict with all compressed model paths and stats.
        """
        print("="*60)
        print("FULL COMPRESSION PIPELINE")
        print("="*60)
        print(f"Original model size: {self.original_size:.2f} MB\n")

        results = {}

        # 1. Pruning
        print("\n[1/4] Pruning...")
        _, pruned_path = self.prune_model(amount=0.3)
        results['pruned'] = {
            'path': pruned_path,
            'size': self._get_model_size(None, pruned_path)
        }

        # 2. Dynamic Quantization
        print("\n[2/4] Dynamic Quantization...")
        _, quant_dynamic_path = self.quantize_dynamic()
        results['quantized_dynamic'] = {
            'path': quant_dynamic_path,
            'size': self._get_model_size(None, quant_dynamic_path)
        }

        # 3. PyTorch Mobile
        print("\n[3/4] PyTorch Mobile Export...")
        mobile_path = self.export_mobile(example_input)
        results['mobile'] = {
            'path': mobile_path,
            'size': os.path.getsize(mobile_path) / (1024 * 1024)
        }

        # 4. ONNX
        print("\n[4/4] ONNX Export...")
        onnx_path = self.export_onnx(example_input)
        results['onnx'] = {
            'path': onnx_path,
            'size': os.path.getsize(onnx_path) / (1024 * 1024)
        }

        # Summary
        print("\n" + "="*60)
        print("COMPRESSION SUMMARY")
        print("="*60)
        print(f"Original model: {self.original_size:.2f} MB")
        print()

        for format_name, info in results.items():
            compression = self.original_size / info['size']
            print(f"{format_name:20s}: {info['size']:6.2f} MB  ({compression:.1f}x smaller)")
            print(f"  → {info['path']}")

        # Find best compression
        best = min(results.items(), key=lambda x: x[1]['size'])
        print(f"\n🏆 Best compression: {best[0]} at {best[1]['size']:.2f} MB")

        return results


def convert_onnx_to_tflite(onnx_path, tflite_path=None):
    """
    Convert ONNX to TensorFlow Lite (for mobile deployment).
    Requires: onnx-tf, tensorflow
    """
    try:
        import onnx
        from onnx_tf.backend import prepare
        import tensorflow as tf

        print(f"Converting {onnx_path} to TensorFlow Lite...")

        # Load ONNX model
        onnx_model = onnx.load(onnx_path)
        tf_rep = prepare(onnx_model)

        # Export to TensorFlow SavedModel
        tf_model_path = onnx_path.replace('.onnx', '_tf')
        tf_rep.export_graph(tf_model_path)

        # Convert to TFLite
        converter = tf.lite.TFLiteConverter.from_saved_model(tf_model_path)
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        tflite_model = converter.convert()

        if tflite_path is None:
            tflite_path = onnx_path.replace('.onnx', '.tflite')

        with open(tflite_path, 'wb') as f:
            f.write(tflite_model)

        size = os.path.getsize(tflite_path) / (1024 * 1024)
        print(f"✓ TFLite conversion complete: {tflite_path} ({size:.2f} MB)")

        return tflite_path

    except ImportError as e:
        print(f"Error: Missing dependencies for TFLite conversion")
        print(f"Install: pip install onnx onnx-tf tensorflow")
        return None


if __name__ == "__main__":
    from network import create_model

    print("Model Minification Demo")
    print("="*60)

    # Create a sample model
    print("Creating sample model...")
    model = create_model(
        'feedforward',
        input_size=1000,
        hidden_sizes=[512, 256, 128],
        output_size=10
    )

    # Create sample input
    example_input = torch.randn(1, 1000)

    # Initialize minifier
    minifier = ModelMinifier(model, "demo_model")

    # Run full compression pipeline
    results = minifier.compress_full_pipeline(
        example_input=example_input
    )

    print("\n" + "="*60)
    print("All compressed models are ready for mobile deployment!")
    print("="*60)
