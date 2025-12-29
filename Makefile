.PHONY: help rust-build rust-release python-deps ios-build clean

help:
	@echo "AI Training App - Build Commands"
	@echo "================================="
	@echo "make rust-build      - Build Rust library in debug mode"
	@echo "make rust-release    - Build Rust library in release mode"
	@echo "make python-deps     - Install Python dependencies"
	@echo "make ios-build       - Build iOS app with buildozer"
	@echo "make clean           - Clean build artifacts"
	@echo "make run             - Run app locally (for testing)"

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
	@echo "Running app locally..."
	cd src/kivy && python main.py
