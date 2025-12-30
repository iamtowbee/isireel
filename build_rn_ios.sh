#!/bin/bash

set -e

echo "======================================"
echo "React Native iOS Build Script"
echo "======================================"

echo ""
echo "Step 1: Installing Node dependencies..."
npm install

echo ""
echo "Step 2: Building Rust library for iOS..."

# Add iOS targets
rustup target add aarch64-apple-ios x86_64-apple-ios aarch64-apple-ios-sim

# Build for iOS device (ARM64)
echo "Building for iOS device (ARM64)..."
cargo build --release --target aarch64-apple-ios

# Build for iOS simulator (x86_64 and ARM64)
echo "Building for iOS simulator..."
cargo build --release --target x86_64-apple-ios
cargo build --release --target aarch64-apple-ios-sim

echo ""
echo "Step 3: Creating universal library for simulator..."
mkdir -p target/universal-sim/release
lipo -create \
    target/x86_64-apple-ios/release/libai_trainer.a \
    target/aarch64-apple-ios-sim/release/libai_trainer.a \
    -output target/universal-sim/release/libai_trainer.a

echo ""
echo "Step 4: Creating XCFramework..."
rm -rf ios/AITrainer.xcframework

xcodebuild -create-xcframework \
    -library target/aarch64-apple-ios/release/libai_trainer.a \
    -headers ios \
    -library target/universal-sim/release/libai_trainer.a \
    -headers ios \
    -output ios/AITrainer.xcframework

echo ""
echo "Step 5: Installing CocoaPods..."
cd ios
pod install
cd ..

echo ""
echo "======================================"
echo "Build complete!"
echo "======================================"
echo ""
echo "To run the app:"
echo "1. Open ios/AITrainerTerminal.xcworkspace in Xcode"
echo "2. Select your device or simulator"
echo "3. Click Run (⌘R)"
echo ""
echo "Or use: npm run ios"
