# 🚀 Quick Start - One-Click Installation

Get the AI Training Terminal app running on your iPhone in **one command**!

## Prerequisites

Make sure you have these installed:

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required tools
brew install node rust
sudo gem install cocoapods

# Install Xcode from Mac App Store
# Then install command line tools:
xcode-select --install
```

## One-Click Install

```bash
# Clone and enter directory
git clone <repository-url>
cd isireel

# ONE COMMAND TO RULE THEM ALL 🎯
make install
```

That's it! The installer will:
- ✅ Check all prerequisites
- ✅ Install Node.js dependencies
- ✅ Add iOS build targets
- ✅ Build Rust library for iPhone
- ✅ Build Rust library for Simulator
- ✅ Create XCFramework
- ✅ Install CocoaPods dependencies

## Run on Your iPhone

After installation completes:

```bash
# Option 1: Open in Xcode (Recommended)
open ios/AITrainerTerminal.xcworkspace

# Then connect your iPhone and click Run (⌘R)
```

Or:

```bash
# Option 2: Run directly (if iPhone connected)
npm run ios
```

## What You Get

The app opens with three tabs:

### 1. 💻 Terminal Tab
Full CLI on your iPhone:
```bash
$ init sk-proj-...
$ train data.jsonl gpt-3.5-turbo 3
$ status job_abc123
$ list
```

### 2. 🎨 GUI Tab
Visual interface with buttons and forms

### 3. 📊 Jobs Tab
Monitor all your training jobs

## Troubleshooting

If installation fails:

1. **Missing Node.js**: `brew install node`
2. **Missing Rust**: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
3. **Missing CocoaPods**: `sudo gem install cocoapods`
4. **Missing Xcode**: Install from Mac App Store

Then run `make install` again!

## Next Steps

1. Get your OpenAI API key from https://platform.openai.com
2. Open the app on your iPhone
3. Go to Terminal tab and type: `init sk-proj-...`
4. Start training: `train sample_training_data.jsonl gpt-3.5-turbo 3`

See the full [README.md](README.md) for detailed documentation.

---

**Pro tip**: Type `make help` to see all available commands!
