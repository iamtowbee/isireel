# isireel - Monorepo

A collection of tools for AI/ML and iOS development.

## Projects

### 🤖 [AI/ML Training System](./ai/)
Build custom AI models from scratch using LLM-generated training data.

- Custom neural networks (feedforward, RNN, CNN)
- LLM-powered synthetic data generation
- Full training pipeline with validation
- Interactive inference interface

**Quick start:**
```bash
cd ai
pip install -r requirements.txt
python data_generator.py
python train.py --data data.json
```

### 📱 [by.sh - iOS Log Viewer](./server/)
Terminal UI for viewing iOS logs on iPhone (Python/Textual).

- Runs on iPhone in a-Shell or iSH
- Color-coded log levels (V/D/I/W/E/F)
- Real-time filtering and search
- Network support (UDP/TCP)

**Quick start:**
```bash
cd server
pip install -r requirements.txt
./by.sh
```

### 🌐 [Web Log Viewer PWA](./web/)
Progressive Web App for viewing logs in Safari (Coming Soon).

- No app installation needed
- Add to home screen
- Works offline
- Terminal-style UI

## Repository Structure

```
isireel/
├── ai/                    # AI/ML training system
│   ├── network.py
│   ├── data_generator.py
│   ├── train.py
│   ├── chat.py
│   └── README.md
├── server/                # Python terminal log viewer
│   ├── by.sh
│   ├── log_viewer.py
│   ├── log_server.py
│   └── README.md
├── web/                   # Web PWA (coming soon)
│   └── README.md
├── docs/                  # Documentation
└── README.md             # This file
```

## Getting Started

Each project has its own README with detailed instructions:

- [AI/ML System Documentation](./ai/README.md)
- [iOS Log Viewer Documentation](./server/README.md)
- [Web PWA Documentation](./web/README.md)

## Contributing

Feel free to submit issues and PRs for any of the projects!

## License

MIT License - see LICENSE file for details
