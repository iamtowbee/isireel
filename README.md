# isireel - Monorepo

A unified monorepo containing AI/ML training tools and iOS development utilities.

## 🏗️ Monorepo Structure

```
isireel/
├── ai/                    # AI/ML Training System
├── server/                # iOS Log Viewer (Python)
├── web/                   # Web PWA Log Viewer
├── docs/                  # Documentation
├── package.json           # Root workspace config
├── pyproject.toml         # Python workspace config
├── Makefile              # Unified commands
└── README.md             # This file
```

## 🚀 Quick Start

### Using Make (Recommended)

```bash
# See all available commands
make help

# Install all dependencies
make install

# Run specific projects
make run-server        # iOS Log Viewer
make run-ai-train      # AI Training
make dev-web          # Web PWA dev server
```

### Using npm scripts

```bash
# Install everything
npm run install:all

# Run individual projects
npm run server:run
npm run ai:train
npm run web:dev
```

## 📦 Projects

### 🤖 [AI/ML Training System](./ai/)
Build custom AI models from scratch using LLM-generated training data.

**Quick start:**
```bash
make install-ai
make run-ai-train
```

### 📱 [by.sh - iOS Log Viewer](./server/)
Terminal UI for viewing iOS logs on iPhone (Python/Textual).

**Quick start:**
```bash
make install-server
make run-server
```

### 🌐 [Web Log Viewer PWA](./web/)
Progressive Web App for viewing logs in Safari (Coming Soon).

**Quick start:**
```bash
make install-web
make dev-web
```

## 🛠️ Development

### Install Dependencies

```bash
# All projects
make install

# Individual projects
make install-server
make install-ai
make install-web
```

### Run Projects

```bash
# Server (iOS Log Viewer)
make run-server

# AI Training
make run-ai-train

# AI Chat
make run-ai-chat

# Web Dev Server
make dev-web
```

### Build

```bash
# Build all
make build

# Build web only
make build-web
```

### Clean

```bash
# Remove all build artifacts, node_modules, __pycache__, etc.
make clean
```

## 📋 Workspace Management

### Python Projects (Poetry)

Both `ai/` and `server/` share dependencies via `pyproject.toml`:

```bash
# Install with Poetry
poetry install

# Add a dependency
poetry add <package>

# Run in Poetry environment
poetry run python ai/train.py
```

### JavaScript Project (npm workspaces)

The `web/` project is managed as an npm workspace:

```bash
# Install from root
npm install

# Run web scripts
npm run web:dev
npm run web:build
```

## 🏃 Common Workflows

### Starting the iOS Log Viewer

```bash
# Option 1: Using Make
make run-server

# Option 2: Using npm
npm run server:run

# Option 3: Direct
cd server && ./by.sh
```

### Training an AI Model

```bash
# Option 1: Using Make
make run-ai-train

# Option 2: Using npm
npm run ai:train

# Option 3: Direct
cd ai && python train.py
```

### Developing the Web PWA

```bash
# Option 1: Using Make
make dev-web

# Option 2: Using npm
npm run web:dev

# Option 3: Direct
cd web && npm run dev
```

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md)
- [AI/ML System Docs](./ai/README.md)
- [Server Docs](./server/README.md)
- [Web PWA Docs](./web/README.md)

## 🧹 Maintenance

```bash
# Clean all build artifacts
make clean

# Check project status
make status

# See project info
make info

# Run tests (when configured)
make test

# Lint code (when configured)
make lint
```

## 🔧 Requirements

- **Python**: 3.8+ (for AI and server projects)
- **Node.js**: 18+ (for web project)
- **Make**: For unified commands (optional)
- **Poetry**: For Python dependency management (optional)

## 📝 Adding New Projects

To add a new project to the monorepo:

1. Create directory: `mkdir new-project`
2. Add to `package.json` workspaces (if JS/TS)
3. Add to `pyproject.toml` dependencies (if Python)
4. Add Makefile targets
5. Create `new-project/README.md`
6. Update this README

## 🤝 Contributing

1. Each project has its own README with specific guidelines
2. Use `make` commands for consistency
3. Keep dependencies in workspace configs
4. Document new features in project READMEs

## 📄 License

MIT License - see LICENSE file for details

---

**Made with ❤️ for AI enthusiasts and iOS developers**
