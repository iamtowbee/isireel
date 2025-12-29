.PHONY: help install rust-build rust-release python-deps ios-build rn-install rn-ios rn-build-ios clean clean-all

help:
	@echo "AI Training App - Build Commands"
	@echo "================================="
	@echo "🚀 Quick Start:"
	@echo "  make install         - ONE-CLICK INSTALL (does everything!)"
	@echo ""
	@echo "React Native Commands:"
	@echo "  make rn-install      - Install Node.js dependencies"
	@echo "  make rn-build-ios    - Build Rust library and setup iOS"
	@echo "  make rn-ios          - Run React Native app on iOS"
	@echo ""
	@echo "Kivy Commands:"
	@echo "  make rust-build      - Build Rust library in debug mode"
	@echo "  make rust-release    - Build Rust library in release mode"
	@echo "  make python-deps     - Install Python dependencies"
	@echo "  make ios-build       - Build iOS app with buildozer"
	@echo "  make run             - Run Kivy app locally (for testing)"
	@echo ""
	@echo "General:"
	@echo "  make clean           - Clean build artifacts"
	@echo "  make clean-all       - Clean everything including node_modules"

# ONE-CLICK INSTALLATION
install:
	@./install.sh

rust-build:
	@echo "Building Rust library (debug)..."
	cargo build

rust-release:
	@echo "Building Rust library (release)..."
	cargo build --release
	@echo "Copying library to Python path..."
	cp target/release/libai_trainer.dylib src/kivy/ai_trainer.so || \
	cp target/release/libai_trainer.so src/kivy/ai_trainer.so

python-deps:
	@echo "Installing Python dependencies..."
	pip install -r requirements.txt

ios-build: rust-release
	@echo "Building iOS app..."
	buildozer -v ios debug

clean:
	@echo "Cleaning build artifacts..."
	cargo clean
	rm -rf .buildozer
	rm -rf bin
	rm -rf target
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

run: rust-release python-deps
	@echo "Running Kivy app locally..."
	cd src/kivy && python main.py

# React Native commands
rn-install:
	@echo "Installing Node.js dependencies..."
	npm install

rn-build-ios:
	@echo "Building for React Native iOS..."
	./build_rn_ios.sh

rn-ios: rn-install
	@echo "Running React Native app on iOS..."
	npm run ios

clean-all: clean
	@echo "Removing node_modules and pods..."
	rm -rf node_modules
	rm -rf ios/Pods
	rm -rf ios/AITrainer.xcframework
