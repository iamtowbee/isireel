# AI Training App for iOS

A powerful mobile application for training and fine-tuning AI models using OpenAI's API. Built with Rust for high-performance backend processing and Kivy for a smooth iOS user interface.

## Features

- **Custom Model Training**: Fine-tune OpenAI models (GPT-3.5-turbo, GPT-4, etc.) directly from your iPhone
- **Training Data Management**: Upload and validate training data in JSONL format
- **Real-time Monitoring**: Track training job status and progress
- **Model Testing**: Test your fine-tuned models with interactive prompts
- **Rust-Powered Backend**: High-performance API integration using Rust
- **Beautiful iOS UI**: Native-feeling interface built with Kivy

## Architecture

This app combines the best of two worlds:

- **Rust Backend** (`src/` directory)
  - OpenAI API client with async/await support
  - Training job management and monitoring
  - Data validation and preprocessing
  - PyO3 bindings for Python interoperability

- **Kivy iOS Frontend** (`src/kivy/` directory)
  - Home screen with navigation
  - Training configuration screen
  - Jobs monitoring screen
  - Model testing interface
  - Settings management

## Prerequisites

### Required Tools

1. **Rust** (1.70 or later)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Python** (3.9 or later)
   ```bash
   # macOS
   brew install python@3.11
   ```

3. **Xcode** (for iOS deployment)
   - Install from Mac App Store
   - Install Xcode Command Line Tools:
     ```bash
     xcode-select --install
     ```

4. **Buildozer** (for iOS packaging)
   ```bash
   pip3 install buildozer
   ```

### OpenAI API Key

You'll need an OpenAI API key with access to fine-tuning:
1. Sign up at https://platform.openai.com
2. Generate an API key from the API keys section
3. Ensure your account has fine-tuning access and credits

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd isireel
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
nano .env
```

### 3. Install Dependencies

```bash
# Install Python dependencies
make python-deps

# Or manually:
pip3 install -r requirements.txt
```

### 4. Build Rust Library

```bash
# For development (debug build)
make rust-build

# For production (optimized release build)
make rust-release
```

## Building for iOS

### Option 1: Using the Build Script (Recommended)

```bash
./build_ios.sh
```

This script will:
1. Install all Python dependencies
2. Build the Rust library for iOS (ARM64 + x86_64)
3. Create a universal library
4. Package the app using Buildozer

### Option 2: Using Make

```bash
make ios-build
```

### Option 3: Manual Build

```bash
# Add iOS targets
rustup target add aarch64-apple-ios x86_64-apple-ios

# Build Rust for iOS
cargo build --release --target aarch64-apple-ios
cargo build --release --target x86_64-apple-ios

# Create universal library
lipo -create \
    target/aarch64-apple-ios/release/libai_trainer.a \
    target/x86_64-apple-ios/release/libai_trainer.a \
    -output target/universal/release/libai_trainer.a

# Build with Buildozer
buildozer -v ios debug
```

## Deployment to iPhone

After building, you'll find the Xcode project in the `bin/` directory:

1. Open `bin/*.xcodeproj` in Xcode
2. Connect your iPhone via USB
3. Select your device as the build target
4. Click Run (⌘R) to build and install

## Running Locally (for Development)

You can test the app on your Mac before deploying to iOS:

```bash
make run
```

Or manually:

```bash
cd src/kivy
python main.py
```

## Usage

### 1. Initial Setup

1. Launch the app on your iPhone
2. Tap "Settings"
3. Enter your OpenAI API key
4. Tap "Save"

### 2. Preparing Training Data

Create a JSONL file with your training data. Each line should be a JSON object with a "messages" array:

```json
{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "Hello!"}, {"role": "assistant", "content": "Hi! How can I help you?"}]}
{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "What's the weather?"}, {"role": "assistant", "content": "I don't have access to real-time weather data."}]}
```

### 3. Starting a Training Job

1. Tap "Start New Training" from the home screen
2. Tap "Select Training Data" and choose your JSONL file
3. Configure training parameters:
   - **Base Model**: Choose a model (e.g., `gpt-3.5-turbo`)
   - **Epochs**: Number of training epochs (default: 3)
   - **Batch Size**: Optional batch size
   - **Learning Rate**: Optional learning rate multiplier
4. Tap "Start Training"
5. Note the Job ID displayed

### 4. Monitoring Training Jobs

1. Tap "View Training Jobs" from the home screen
2. See all your training jobs with their current status
3. Tap "Check Status" to update a specific job
4. Tap "Cancel" to stop a running job
5. Tap "Refresh" to reload all jobs

### 5. Testing Your Fine-Tuned Model

1. Tap "Test Model" from the home screen
2. Enter your fine-tuned model ID (e.g., `ft:gpt-3.5-turbo:org:name:id`)
3. Enter a test prompt
4. Tap "Test Model" to get a response
5. View the model's response in the output area

## Project Structure

```
isireel/
├── Cargo.toml              # Rust project configuration
├── Makefile                # Build automation
├── buildozer.spec          # iOS build configuration
├── build_ios.sh            # iOS build script
├── requirements.txt        # Python dependencies
├── .env.example            # Environment variables template
├── README.md               # This file
│
├── src/                    # Rust source code
│   ├── lib.rs              # PyO3 bindings and Python interface
│   ├── models.rs           # Data models and types
│   ├── openai.rs           # OpenAI API client
│   └── trainer.rs          # Training management logic
│
└── src/kivy/               # Kivy iOS application
    └── main.py             # Main app with all screens
```

## Rust Modules

### models.rs
Defines data structures for:
- `TrainingJob`: Training job information
- `JobStatus`: Job status enum
- `Hyperparameters`: Training configuration
- `CompletionRequest/Response`: Model testing

### openai.rs
OpenAI API client with methods for:
- `upload_training_file()`: Upload training data
- `create_fine_tuning_job()`: Start training
- `get_fine_tuning_job()`: Check job status
- `list_fine_tuning_jobs()`: List all jobs
- `cancel_fine_tuning_job()`: Cancel a job
- `create_completion()`: Test model inference

### trainer.rs
Training manager with:
- `start_training()`: Complete training workflow
- `get_job_status()`: Monitor job progress
- `test_model()`: Test fine-tuned models
- `validate_training_data()`: Validate JSONL format

### lib.rs
Python bindings using PyO3:
- `AITrainer` class exposed to Python
- All methods wrapped with error handling
- Async runtime integration

## API Reference

### Python (Kivy) Interface

```python
from ai_trainer import AITrainer

# Initialize trainer
trainer = AITrainer("your-api-key")

# Start training
job_json = trainer.start_training(
    file_path="training.jsonl",
    model="gpt-3.5-turbo",
    n_epochs=3,
    batch_size=None,
    learning_rate=None
)

# Check status
status_json = trainer.get_job_status("job-id")

# List all jobs
jobs_json = trainer.list_jobs()

# Cancel job
cancelled_json = trainer.cancel_job("job-id")

# Test model
response = trainer.test_model("ft:gpt-3.5-turbo:...", "Hello!")

# Validate data
is_valid = trainer.validate_training_data("training.jsonl")
```

## Troubleshooting

### Build Errors

**Error: "cargo not found"**
- Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

**Error: "buildozer not found"**
- Install Buildozer: `pip3 install buildozer`

**Error: "No such file or directory: 'xcodebuild'"**
- Install Xcode from the Mac App Store
- Run `xcode-select --install`

### Runtime Errors

**"AI Trainer module not available"**
- Build the Rust library: `make rust-release`
- Ensure the `.so` file is in the `src/kivy/` directory

**"API key not set"**
- Go to Settings in the app
- Enter your OpenAI API key
- Tap Save

**"Invalid training data format"**
- Ensure your file is in JSONL format
- Each line must be valid JSON
- Each object must have a "messages" array

## Performance Considerations

- Training data is uploaded from your device to OpenAI's servers
- Large files may take time to upload on slower connections
- Training jobs run on OpenAI's infrastructure, not on your device
- The Rust backend provides minimal overhead for API calls
- Job monitoring can be done as frequently as needed without significant battery impact

## Security Notes

- API keys are stored locally on your device only
- Never share your API key or commit it to version control
- Use `.env` file for development (already in `.gitignore`)
- The app communicates directly with OpenAI's API over HTTPS
- Training data is sent to OpenAI for processing

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check OpenAI's documentation: https://platform.openai.com/docs
- Review Kivy documentation: https://kivy.org/doc/

## Acknowledgments

- Built with [Rust](https://www.rust-lang.org/)
- UI powered by [Kivy](https://kivy.org/)
- Python-Rust integration via [PyO3](https://pyo3.rs/)
- AI services by [OpenAI](https://openai.com/)

---

**Note**: This app requires an active OpenAI account with API access and sufficient credits for fine-tuning operations. Fine-tuning costs vary based on the model and amount of training data. Check OpenAI's pricing page for current rates.
