# AI Training Terminal App for iOS

A powerful mobile terminal application for training and fine-tuning AI models using OpenAI's API. Built with Rust for high-performance backend processing and React Native for a native iOS terminal experience.

**Two UI Options:**
1. **React Native Terminal** (Recommended) - Full-featured terminal with GUI and job management tabs
2. **Kivy UI** - Python-based alternative interface

## Features

- **Terminal Interface**: Full-featured command-line terminal on your iPhone with command history
- **GUI Mode**: User-friendly graphical interface for those who prefer buttons over CLI
- **Jobs Management**: Dedicated screen to monitor all training jobs with pull-to-refresh
- **Custom Model Training**: Fine-tune OpenAI models (GPT-3.5-turbo, GPT-4, etc.) directly from your iPhone
- **Training Data Management**: Upload and validate training data in JSONL format
- **Real-time Monitoring**: Track training job status and progress
- **Model Testing**: Test your fine-tuned models with interactive prompts
- **Rust-Powered Backend**: High-performance API integration using Rust with FFI
- **Native iOS Experience**: Built with React Native for smooth, native performance

## Architecture

### React Native Terminal (Recommended)

- **Rust Backend** (`src/` directory)
  - OpenAI API client with async/await support
  - Training job management and monitoring
  - Data validation and preprocessing
  - C API with FFI bindings for React Native
  - Zero-cost abstractions with optimal performance

- **React Native Frontend** (`app/` directory)
  - **Terminal Screen**: Full CLI with command execution and history navigation
  - **GUI Screen**: Visual interface with forms, file pickers, and buttons
  - **Jobs Screen**: Training job list with real-time status updates
  - Native iOS modules (Objective-C) bridging to Rust via C FFI
  - Bottom tab navigation for easy switching between modes

### Kivy Alternative (src/kivy/)

- Python-based UI using Kivy framework
- PyO3 bindings for Python-Rust interoperability
- Suitable for those familiar with Python mobile development
- All the same core features via Python interface

## Prerequisites

### Required Tools

1. **Rust** (1.70 or later)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Node.js** (18 or later) - for React Native
   ```bash
   # macOS
   brew install node
   ```

3. **Xcode** (14 or later)
   - Install from Mac App Store
   - Install Xcode Command Line Tools:
     ```bash
     xcode-select --install
     ```

4. **CocoaPods** (for iOS dependencies)
   ```bash
   sudo gem install cocoapods
   ```

5. **React Native CLI**
   ```bash
   npm install -g react-native-cli
   ```

#### Optional (for Kivy UI)

- **Python** (3.9 or later)
  ```bash
  brew install python@3.11
  ```

- **Buildozer**
  ```bash
  pip3 install buildozer
  ```

### OpenAI API Key

You'll need an OpenAI API key with access to fine-tuning:
1. Sign up at https://platform.openai.com
2. Generate an API key from the API keys section
3. Ensure your account has fine-tuning access and credits

## Installation

### Option 1: React Native Terminal (Recommended)

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd isireel
```

#### 2. Install Dependencies

```bash
# Install Node.js dependencies
make rn-install

# Or manually:
npm install
```

#### 3. Build Rust Library for iOS

```bash
# Automated build (recommended)
./build_rn_ios.sh

# Or use make:
make rn-build-ios
```

This will:
- Build Rust library for iOS devices (ARM64)
- Build Rust library for iOS simulators (x86_64 + ARM64)
- Create a universal XCFramework
- Install CocoaPods dependencies

#### 4. Run the App

```bash
# Open in Xcode
open ios/AITrainerTerminal.xcworkspace

# Or run directly
make rn-ios
# Or: npm run ios
```

### Option 2: Kivy UI

#### 1. Clone and Configure

```bash
git clone <repository-url>
cd isireel
cp .env.example .env
# Edit .env and add your OpenAI API key
nano .env
```

#### 2. Install Python Dependencies

```bash
make python-deps
# Or: pip3 install -r requirements.txt
```

#### 3. Build for iOS

```bash
# Automated build
./build_ios.sh

# Or use make:
make ios-build
```

#### 4. Deploy

Open the generated Xcode project in `bin/` and deploy to your iPhone.

## Usage

### React Native Terminal Mode

The app opens with three tabs at the bottom:

#### 1. Terminal Tab

A full-featured command-line interface. Available commands:

```bash
# Initialize with API key
init sk-proj-...

# Start training
train /path/to/data.jsonl gpt-3.5-turbo 3

# Check job status
status job_abc123

# List all jobs
list

# Cancel a job
cancel job_abc123

# Test a model
test ft:gpt-3.5-turbo:org:id:... "Hello, how are you?"

# Validate training data
validate /path/to/data.jsonl

# Clear terminal
clear

# Show help
help
```

**Terminal Features:**
- Command history navigation (↑/↓ buttons)
- Auto-scrolling output
- Color-coded success/error messages
- Monospace font for better readability

#### 2. GUI Tab

Visual interface with forms and buttons:

1. **Initialize Section**
   - Enter your OpenAI API key
   - Tap "Initialize" button

2. **Start Training Section**
   - Tap "Select Training Data" to choose a file
   - Enter model name (e.g., `gpt-3.5-turbo`)
   - Set number of epochs
   - Tap "Start Training"

3. **Test Model Section**
   - Enter your fine-tuned model ID
   - Type a test prompt
   - Tap "Test Model"
   - View the response below

#### 3. Jobs Tab

Monitor all your training jobs:
- Pull down to refresh
- See job ID, model, status, and creation date
- Tap "Check Status" for updated information
- Tap "Cancel" to stop running jobs
- Color-coded status badges:
  - 🟢 Green: Succeeded
  - 🔵 Blue: Running
  - 🟡 Yellow: Queued
  - 🔴 Red: Failed
  - ⚫ Gray: Cancelled

### Training Data Format

Create a JSONL file (JSON Lines) with one training example per line:

```json
{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "Hello!"}, {"role": "assistant", "content": "Hi! How can I help you?"}]}
{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "What's 2+2?"}, {"role": "assistant", "content": "2+2 equals 4."}]}
```

A sample file (`sample_training_data.jsonl`) is included in the repository.

## Project Structure

```
isireel/
├── Cargo.toml              # Rust project configuration
├── Makefile                # Build automation
├── package.json            # Node.js dependencies
├── App.tsx                 # React Native main app
├── index.js                # React Native entry point
├── babel.config.js         # Babel configuration
├── metro.config.js         # Metro bundler config
├── tsconfig.json           # TypeScript configuration
├── build_rn_ios.sh         # React Native iOS build script
├── build_ios.sh            # Kivy iOS build script
├── requirements.txt        # Python dependencies
├── .env.example            # Environment variables template
├── README.md               # This file
│
├── src/                    # Rust source code
│   ├── lib.rs              # Library entry (PyO3 + C API)
│   ├── c_api.rs            # C FFI for React Native
│   ├── models.rs           # Data models and types
│   ├── openai.rs           # OpenAI API client
│   └── trainer.rs          # Training management logic
│
├── app/                    # React Native application
│   ├── components/
│   │   └── Terminal.tsx    # Terminal component
│   ├── screens/
│   │   ├── TerminalScreen.tsx  # Terminal tab
│   │   ├── GUIScreen.tsx       # GUI tab
│   │   └── JobsScreen.tsx      # Jobs tab
│   ├── services/
│   │   └── AITrainerService.ts # Native module wrapper
│   └── types/
│       └── index.ts        # TypeScript types
│
├── ios/                    # iOS native code
│   ├── AITrainerBridge.h   # Objective-C header
│   ├── AITrainerBridge.m   # Objective-C implementation
│   ├── ai_trainer.h        # Rust C API header
│   └── Podfile             # CocoaPods dependencies
│
└── src/kivy/               # Kivy alternative UI
    └── main.py             # Kivy app
```

## Terminal Commands Reference

| Command | Syntax | Description |
|---------|--------|-------------|
| `init` | `init <api_key>` | Initialize AI trainer with OpenAI API key |
| `train` | `train <file> <model> [epochs]` | Start a fine-tuning job |
| `status` | `status <job_id>` | Get training job status |
| `list` | `list` | List all training jobs |
| `cancel` | `cancel <job_id>` | Cancel a training job |
| `test` | `test <model> <prompt>` | Test a fine-tuned model |
| `validate` | `validate <file>` | Validate training data file |
| `clear` | `clear` | Clear terminal output |
| `help` | `help` | Show help message |

## API Reference

### Rust C API

The Rust library exposes a C API for React Native integration:

```c
// Initialize trainer
int rust_init_trainer(const char *api_key);

// Start training (returns JSON)
char *rust_start_training(const char *file_path, const char *model,
                          int epochs, int batch_size, double learning_rate);

// Get job status (returns JSON)
char *rust_get_job_status(const char *job_id);

// List all jobs (returns JSON)
char *rust_list_jobs(void);

// Cancel job (returns JSON)
char *rust_cancel_job(const char *job_id);

// Test model (returns response string)
char *rust_test_model(const char *model, const char *prompt);

// Validate training data
int rust_validate_data(const char *file_path);

// Free Rust-allocated string
void rust_free_string(char *s);
```

### TypeScript Service

```typescript
import AITrainerService from './app/services/AITrainerService';

// Initialize
await AITrainerService.initialize('sk-...');

// Start training
const job = await AITrainerService.startTraining(
  '/path/to/data.jsonl',
  'gpt-3.5-turbo',
  3
);

// Get status
const job = await AITrainerService.getJobStatus('job_id');

// List jobs
const jobs = await AITrainerService.listJobs();

// Cancel job
const job = await AITrainerService.cancelJob('job_id');

// Test model
const response = await AITrainerService.testModel(
  'ft:gpt-3.5-turbo:...',
  'Hello!'
);

// Validate data
const isValid = await AITrainerService.validateData('/path/to/data.jsonl');
```

## Build System

### Make Commands

```bash
# React Native
make rn-install      # Install Node.js dependencies
make rn-build-ios    # Build Rust and setup iOS
make rn-ios          # Run on iOS

# Kivy
make python-deps     # Install Python dependencies
make rust-build      # Build Rust (debug)
make rust-release    # Build Rust (release)
make ios-build       # Build iOS with buildozer
make run             # Run Kivy locally

# General
make clean           # Clean build artifacts
make clean-all       # Clean everything
make help            # Show all commands
```

## Troubleshooting

### React Native Build Errors

**Error: "Cannot find 'libai_trainer.a'"**
- Run `./build_rn_ios.sh` to build the Rust library
- Ensure XCFramework is created in `ios/AITrainer.xcframework`

**Error: "No such module 'AITrainer'"**
- Run `cd ios && pod install && cd ..`
- Clean build folder in Xcode (⇧⌘K)

**Error: "Undefined symbols for architecture arm64"**
- Rebuild Rust library for iOS: `cargo build --release --target aarch64-apple-ios`
- Recreate XCFramework with `./build_rn_ios.sh`

### Runtime Errors

**"AI Trainer not initialized"**
- Initialize from Terminal: `init sk-...`
- Or use GUI tab to enter API key and tap "Initialize"

**"Failed to select file" (on device)**
- Ensure file is in the app's accessible directories
- Use absolute paths or document picker

**Terminal not responding**
- Check if API key is set correctly
- Verify network connection
- Check OpenAI API status

### iOS Simulator vs Device

- **Simulator**: Uses x86_64 or ARM64 simulator build
- **Device**: Uses ARM64 device build
- The XCFramework includes both, automatically selected by Xcode

## Performance Notes

- **Rust Backend**: Zero-cost abstractions, minimal overhead
- **File Uploads**: Large files may take time on slower connections
- **Training**: Runs on OpenAI's servers, not on device
- **Battery**: Minimal impact from job monitoring
- **Network**: All API calls use HTTPS with connection pooling

## Security

- API keys stored in memory only (not persisted by default)
- All communication over HTTPS
- Training data sent directly to OpenAI
- No intermediate servers
- Use `.env` for development (gitignored)

## iOS Capabilities Required

The app requires these iOS capabilities:
- Network access (for OpenAI API)
- File access (for training data)
- No special permissions needed

Works on:
- iOS 13.0 and later
- iPhone and iPad
- Simulators and physical devices

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both simulator and device
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [Rust](https://www.rust-lang.org/)
- UI powered by [React Native](https://reactnative.dev/)
- Alternative UI with [Kivy](https://kivy.org/)
- Rust-Native bridge via C FFI
- Python integration via [PyO3](https://pyo3.rs/)
- AI services by [OpenAI](https://openai.com/)

## Support

- GitHub Issues for bugs and feature requests
- OpenAI docs: https://platform.openai.com/docs
- React Native docs: https://reactnative.dev/docs
- Rust FFI guide: https://doc.rust-lang.org/nomicon/ffi.html

---

**Note**: This app requires an active OpenAI account with API access and sufficient credits for fine-tuning operations. Fine-tuning costs vary based on model and training data amount. Check OpenAI's pricing for current rates.

**Terminal Note**: While iOS doesn't allow arbitrary shell command execution, this app provides a terminal-like interface specifically for AI training operations, offering the convenience of CLI with the power of native iOS performance.
