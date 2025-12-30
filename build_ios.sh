#!/bin/bash

set -e

echo "=================================="
echo "AI Trainer iOS Build Script"
echo "=================================="

# Check for required tools
command -v cargo >/dev/null 2>&1 || { echo "Error: Rust/Cargo not found. Install from https://rustup.rs"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Error: Python 3 not found"; exit 1; }

echo ""
echo "Step 1: Installing Python dependencies..."
pip3 install -r requirements.txt
pip3 install buildozer
pip3 install maturin

echo ""
echo "Step 2: Building Rust library for iOS..."
# Add iOS targets
rustup target add aarch64-apple-ios
rustup target add x86_64-apple-ios

# Build for iOS device (ARM64)
echo "Building for iOS device (ARM64)..."
cargo build --release --target aarch64-apple-ios

# Build for iOS simulator (x86_64)
echo "Building for iOS simulator (x86_64)..."
cargo build --release --target x86_64-apple-ios

echo ""
echo "Step 3: Creating universal library..."
mkdir -p target/universal/release
lipo -create \
    target/aarch64-apple-ios/release/libai_trainer.a \
    target/x86_64-apple-ios/release/libai_trainer.a \
    -output target/universal/release/libai_trainer.a

echo ""
echo "Step 4: Building iOS app with Buildozer..."
buildozer -v ios debug

echo ""
echo "=================================="
echo "Build complete!"
echo "=================================="
echo "The iOS app is ready in the bin/ directory"
echo ""
echo "To install on device:"
echo "1. Open bin/*.xcodeproj in Xcode"
echo "2. Connect your iOS device"
echo "3. Build and run from Xcode"
