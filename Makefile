# Monorepo Makefile - Unified commands for all projects

.PHONY: help install clean build test run-server run-ai-train run-ai-chat dev-web

# Default target
help:
	@echo "📦 isireel Monorepo Commands"
	@echo ""
	@echo "Installation:"
	@echo "  make install          - Install all project dependencies"
	@echo "  make install-server   - Install server (Python) dependencies"
	@echo "  make install-ai       - Install AI (Python) dependencies"
	@echo "  make install-web      - Install web (Node) dependencies"
	@echo ""
	@echo "Running Projects:"
	@echo "  make run-server       - Run iOS log viewer (by.sh)"
	@echo "  make run-ai-train     - Run AI training"
	@echo "  make run-ai-chat      - Run AI chat interface"
	@echo "  make dev-web          - Run web PWA dev server"
	@echo ""
	@echo "Building:"
	@echo "  make build            - Build all projects"
	@echo "  make build-web        - Build web PWA"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean            - Clean all build artifacts"
	@echo "  make test             - Run all tests"
	@echo "  make lint             - Lint all projects"

# Installation targets
install: install-server install-ai install-web
	@echo "✅ All dependencies installed"

install-server:
	@echo "📦 Installing server dependencies..."
	cd server && pip install -r requirements.txt

install-ai:
	@echo "📦 Installing AI dependencies..."
	cd ai && pip install -r requirements.txt

install-web:
	@echo "📦 Installing web dependencies..."
	cd web && npm install

# Run targets
run-server:
	@echo "🚀 Starting iOS Log Viewer..."
	cd server && ./by.sh

run-ai-train:
	@echo "🤖 Starting AI training..."
	cd ai && python train.py

run-ai-chat:
	@echo "💬 Starting AI chat interface..."
	cd ai && python chat.py

dev-web:
	@echo "🌐 Starting web dev server..."
	cd web && npm run dev

# Build targets
build: build-web
	@echo "✅ All projects built"

build-web:
	@echo "🔨 Building web PWA..."
	cd web && npm run build

# Maintenance targets
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf node_modules
	rm -rf web/node_modules web/dist
	rm -rf server/__pycache__ server/.pytest_cache
	rm -rf ai/__pycache__ ai/.pytest_cache ai/checkpoints
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	@echo "✅ Clean complete"

test:
	@echo "🧪 Running tests..."
	@echo "Tests not configured yet"

lint:
	@echo "🔍 Linting code..."
	@echo "Linting not configured yet"

# Development helpers
.PHONY: status
status:
	@echo "📊 Monorepo Status"
	@echo ""
	@echo "Projects:"
	@echo "  - ai/         : AI/ML Training System"
	@echo "  - server/     : iOS Log Viewer (Python)"
	@echo "  - web/        : Web PWA (to be built)"
	@echo ""
	@echo "Git Status:"
	@git status --short

.PHONY: info
info:
	@echo "ℹ️  Project Information"
	@echo ""
	@echo "AI Project:"
	@ls -1 ai/*.py 2>/dev/null || echo "  No Python files"
	@echo ""
	@echo "Server Project:"
	@ls -1 server/*.py server/*.sh 2>/dev/null || echo "  No files"
	@echo ""
	@echo "Web Project:"
	@ls -1 web/*.html web/*.js 2>/dev/null || echo "  No web files yet"
