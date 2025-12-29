#!/bin/bash
# by.sh - iOS Terminal Log Viewer
# Run this on your iPhone using a-Shell, iSH, or similar iOS terminal apps

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📱 by.sh - iOS Terminal Log Viewer${NC}"
echo -e "${BLUE}Running on iPhone${NC}"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo -e "${RED}❌ Python is not installed${NC}"
        echo ""
        echo "Please install Python using:"
        echo "  - a-Shell: Already includes Python"
        echo "  - iSH: apk add python3"
        echo "  - Pythonista: Already includes Python"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo -e "${GREEN}✅ Python found: $($PYTHON_CMD --version)${NC}"

# Check if dependencies are installed
if ! $PYTHON_CMD -c "import textual" 2>/dev/null; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    pip install textual rich 2>/dev/null || pip3 install textual rich
fi

echo ""
echo -e "${BLUE}🎯 What would you like to do?${NC}"
echo ""
echo "1) Run log viewer (demo mode)"
echo "2) Run network log viewer"
echo "3) Run log server"
echo "4) Send test logs"
echo "5) Exit"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}🎨 Starting log viewer...${NC}"
        echo -e "${YELLOW}Press 'q' to quit${NC}"
        sleep 1
        $PYTHON_CMD log_viewer.py
        ;;
    2)
        echo ""
        read -p "Host (localhost): " host
        host=${host:-localhost}
        read -p "Port (5555): " port
        port=${port:-5555}
        read -p "Protocol (udp/tcp): " protocol
        protocol=${protocol:-udp}
        echo ""
        echo -e "${GREEN}🌐 Starting network viewer...${NC}"
        echo -e "${YELLOW}Press 'q' to quit${NC}"
        sleep 1
        $PYTHON_CMD log_viewer_network.py --host "$host" --port "$port" --protocol "$protocol"
        ;;
    3)
        echo ""
        read -p "Host (0.0.0.0): " host
        host=${host:-0.0.0.0}
        read -p "Port (5555): " port
        port=${port:-5555}
        read -p "Protocol (udp/tcp): " protocol
        protocol=${protocol:-udp}
        echo ""
        echo -e "${GREEN}📡 Starting log server...${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
        sleep 1
        $PYTHON_CMD log_server.py server --host "$host" --port "$port" --protocol "$protocol"
        ;;
    4)
        echo ""
        read -p "Host (localhost): " host
        host=${host:-localhost}
        read -p "Port (5555): " port
        port=${port:-5555}
        read -p "Number of logs (10): " count
        count=${count:-10}
        echo ""
        echo -e "${GREEN}📤 Sending $count test logs...${NC}"
        $PYTHON_CMD log_server.py client --host "$host" --port "$port" --demo --count "$count"
        ;;
    5)
        echo -e "${BLUE}👋 Goodbye!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac
