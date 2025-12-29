#!/bin/bash
# Quick Start Script for iOS Log Viewer

echo "🚀 iOS Log Viewer - Quick Start"
echo "===================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7 or higher."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Check if pip is installed
if ! command -v pip3 &> /dev/null && ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip."
    exit 1
fi

echo "✅ pip found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt || pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "🎯 What would you like to do?"
echo ""
echo "1) Run standalone log viewer (demo mode)"
echo "2) Run network log viewer"
echo "3) Run log server"
echo "4) Send demo logs"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🎨 Starting standalone log viewer with demo logs..."
        echo "Press 'q' to quit"
        sleep 2
        python3 log_viewer.py
        ;;
    2)
        echo ""
        read -p "Enter host (default: localhost): " host
        host=${host:-localhost}
        read -p "Enter port (default: 5555): " port
        port=${port:-5555}
        read -p "Enter protocol (udp/tcp, default: udp): " protocol
        protocol=${protocol:-udp}
        echo ""
        echo "🌐 Starting network log viewer..."
        echo "Host: $host | Port: $port | Protocol: $protocol"
        echo "Press 'q' to quit"
        sleep 2
        python3 log_viewer_network.py --host "$host" --port "$port" --protocol "$protocol"
        ;;
    3)
        echo ""
        read -p "Enter host (default: 0.0.0.0): " host
        host=${host:-0.0.0.0}
        read -p "Enter port (default: 5555): " port
        port=${port:-5555}
        read -p "Enter protocol (udp/tcp, default: udp): " protocol
        protocol=${protocol:-udp}
        echo ""
        echo "📡 Starting log server..."
        echo "Host: $host | Port: $port | Protocol: $protocol"
        echo "Press Ctrl+C to stop"
        sleep 2
        python3 log_server.py server --host "$host" --port "$port" --protocol "$protocol"
        ;;
    4)
        echo ""
        read -p "Enter host (default: localhost): " host
        host=${host:-localhost}
        read -p "Enter port (default: 5555): " port
        port=${port:-5555}
        read -p "Number of logs to send (default: 10): " count
        count=${count:-10}
        echo ""
        echo "📤 Sending $count demo logs to $host:$port..."
        python3 log_server.py client --host "$host" --port "$port" --demo --count "$count"
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
