# Architecture

## Monorepo Structure

This repository contains multiple independent projects organized in a monorepo structure.

## Projects

### AI/ML Training System (`ai/`)

**Purpose**: Build custom AI models using LLM-generated training data

**Tech Stack**:
- PyTorch for neural networks
- Anthropic/OpenAI APIs for data generation
- Python 3.8+

**Architecture**:
```
User → data_generator.py → LLM API → Synthetic Data
         ↓
    train.py → network.py → Trained Model
         ↓
    chat.py → Inference → Predictions
```

### iOS Log Viewer - Python (`server/`)

**Purpose**: Terminal UI for viewing iOS logs on iPhone

**Tech Stack**:
- Python 3.7+
- Textual (TUI framework)
- Rich (terminal rendering)

**Architecture**:
```
iOS App → UDP/TCP → log_server.py
                        ↓
                   log_viewer.py (Textual UI)
                        ↓
                   iPhone Terminal (a-Shell/iSH)
```

### Web Log Viewer - PWA (`web/`)

**Purpose**: Browser-based log viewer for Safari on iPhone

**Tech Stack** (Planned):
- HTML5/CSS3/JavaScript
- WebSocket
- Service Worker (PWA)

**Architecture** (Planned):
```
iOS App → WebSocket Server → WebSocket
                                ↓
                         Browser (Safari)
                                ↓
                         PWA on Home Screen
```

## Design Principles

1. **Separation of Concerns**: Each project is independent
2. **Language Diversity**: Use the best tool for each job
3. **Mobile-First**: Optimized for iPhone usage
4. **Offline-Capable**: Works without constant connectivity
5. **Developer-Friendly**: Clear documentation and simple setup

## Future Projects

Potential additions to this monorepo:
- Swift iOS native app
- Rust-based log server for performance
- Desktop Electron app
- VS Code extension
