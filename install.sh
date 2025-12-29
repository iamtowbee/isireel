#!/bin/bash

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         AI Training Terminal - One-Click Installer         ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check for required tools
echo "🔍 Checking prerequisites..."
echo ""

MISSING_TOOLS=()

if ! command -v node >/dev/null 2>&1; then
    MISSING_TOOLS+=("Node.js (brew install node)")
fi

if ! command -v cargo >/dev/null 2>&1; then
    MISSING_TOOLS+=("Rust (curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh)")
fi

if ! command -v pod >/dev/null 2>&1; then
    MISSING_TOOLS+=("CocoaPods (sudo gem install cocoapods)")
fi

if ! command -v xcodebuild >/dev/null 2>&1; then
    MISSING_TOOLS+=("Xcode (install from Mac App Store)")
fi

if [ ${#MISSING_TOOLS[@]} -ne 0 ]; then
    echo "❌ Missing required tools:"
    echo ""
    for tool in "${MISSING_TOOLS[@]}"; do
        echo "   • $tool"
    done
    echo ""
    echo "Please install the missing tools and run this script again."
    exit 1
fi

echo "✅ All prerequisites found!"
echo ""

# Step 1: Install Node.js dependencies
echo "📦 Step 1/4: Installing Node.js dependencies..."
npm install
echo "✅ Node.js dependencies installed!"
echo ""

# Step 2: Add iOS targets
echo "🎯 Step 2/4: Adding iOS build targets..."
rustup target add aarch64-apple-ios 2>/dev/null || echo "   (already installed)"
rustup target add x86_64-apple-ios 2>/dev/null || echo "   (already installed)"
rustup target add aarch64-apple-ios-sim 2>/dev/null || echo "   (already installed)"
echo "✅ iOS targets ready!"
echo ""

# Step 3: Build Rust library for iOS
echo "🦀 Step 3/4: Building Rust library for iOS..."
echo "   → Building for iPhone (ARM64)..."
cargo build --release --target aarch64-apple-ios

echo "   → Building for Simulator (x86_64)..."
cargo build --release --target x86_64-apple-ios

echo "   → Building for Simulator (ARM64)..."
cargo build --release --target aarch64-apple-ios-sim

echo "   → Creating universal simulator library..."
mkdir -p target/universal-sim/release
lipo -create \
    target/x86_64-apple-ios/release/libai_trainer.a \
    target/aarch64-apple-ios-sim/release/libai_trainer.a \
    -output target/universal-sim/release/libai_trainer.a

echo "   → Creating XCFramework..."
rm -rf ios/AITrainer.xcframework

xcodebuild -create-xcframework \
    -library target/aarch64-apple-ios/release/libai_trainer.a \
    -headers ios \
    -library target/universal-sim/release/libai_trainer.a \
    -headers ios \
    -output ios/AITrainer.xcframework

echo "✅ Rust library built and packaged!"
echo ""

# Step 4: Install CocoaPods
echo "☕ Step 4/4: Installing CocoaPods dependencies..."
cd ios
pod install
cd ..
echo "✅ CocoaPods installed!"
echo ""

# All done!
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║                  🎉 Installation Complete! 🎉              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📱 Next steps to run on your iPhone:"
echo ""
echo "   Option 1 (Recommended): Open in Xcode"
echo "   ────────────────────────────────────────"
echo "   $ open ios/AITrainerTerminal.xcworkspace"
echo ""
echo "   Then:"
echo "   1. Connect your iPhone via USB"
echo "   2. Select your iPhone as the target device"
echo "   3. Click the Play button (⌘R) to build and install"
echo ""
echo "   Option 2: Run directly (if device connected)"
echo "   ───────────────────────────────────────────────"
echo "   $ npm run ios"
echo ""
echo "   Option 3: Test in Simulator first"
echo "   ──────────────────────────────────────"
echo "   $ npm run ios"
echo "   (Will automatically open in simulator)"
echo ""
echo "💡 Tip: Type 'make help' to see all available commands"
echo ""
