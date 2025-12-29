# isireel - Android Log Viewer 📱

A beautiful terminal UI application for viewing Android system logs (logcat-style) with real-time network support.

Perfect for monitoring logs from Android servers, Dalvik runtime, and system-level logging.

## Features ✨

- 🎨 **Color-coded log levels** (VERBOSE, DEBUG, INFO, WARN, ERROR, FATAL)
- 🔍 **Real-time filtering** by tag or message
- 🌐 **Network support** (UDP/TCP) for remote log streaming
- ⚡ **Fast and responsive** terminal UI with keyboard shortcuts
- 💾 **Save logs to file** for later analysis
- 🎯 **Level filtering** (toggle verbose, debug, errors-only)
- 📊 **Live statistics** showing log counts by level

## Installation 🚀

### Prerequisites
- Python 3.7+
- pip

### Install Dependencies

```bash
pip install -r requirements.txt
```

## Usage 📖

### 1. Standalone Log Viewer (Demo Mode)

Run the log viewer with auto-generated demo logs:

```bash
python log_viewer.py
```

### 2. Network Log Viewer

For receiving logs from a remote server:

```bash
# UDP mode (default)
python log_viewer_network.py --host localhost --port 5555 --protocol udp

# TCP mode
python log_viewer_network.py --host 0.0.0.0 --port 5555 --protocol tcp
```

### 3. Log Server

Run a log server to receive logs from your Android device/server:

```bash
# Start UDP server
python log_server.py server --host 0.0.0.0 --port 5555 --protocol udp

# Start TCP server
python log_server.py server --host 0.0.0.0 --port 5555 --protocol tcp
```

### 4. Send Logs (Testing)

Send demo logs to test the system:

```bash
# Send 20 demo logs via UDP
python log_server.py client --host localhost --port 5555 --demo --count 20

# Send a single log message
python log_server.py client --host localhost --port 5555 --level E --tag MyApp --message "Test error message"
```

### 5. Send Logs from Command Line

Using netcat (nc):

```bash
# UDP
echo "I/MyTag: Test message" | nc -u localhost 5555

# TCP
echo "E/ErrorTag: Something went wrong" | nc localhost 5555
```

## Log Format 📝

The viewer supports multiple Android logcat formats:

### Full Format
```
MM-DD HH:MM:SS.mmm  PID  TID LEVEL TAG: MESSAGE
12-29 13:45:23.123  1234 5678 I ActivityManager: Starting activity
```

### Simple Format
```
LEVEL/TAG: MESSAGE
I/MyApp: Application started
E/Network: Connection timeout
```

## Log Levels 🎨

| Level | Code | Color | Description |
|-------|------|-------|-------------|
| VERBOSE | V | Dim Cyan | Detailed debug info |
| DEBUG | D | Blue | Debug information |
| INFO | I | Green | Informational messages |
| WARN | W | Yellow | Warning messages |
| ERROR | E | Red | Error messages |
| FATAL | F | Bold Red | Fatal errors |

## Keyboard Shortcuts ⌨️

| Key | Action |
|-----|--------|
| `q` | Quit application |
| `c` | Clear all logs |
| `f` | Focus filter input |
| `v` | Toggle verbose logs |
| `d` | Toggle debug logs |
| `e` | Toggle errors-only mode |
| `Ctrl+S` | Save logs to file |

## Integration with Android 🤖

### ADB Logcat Integration

Stream Android device logs directly to the viewer:

```bash
# Start the log server
python log_server.py server --host 0.0.0.0 --port 5555 --protocol tcp &

# Start the viewer
python log_viewer_network.py --host localhost --port 5555 --protocol tcp &

# Stream logcat to the server
adb logcat | while read line; do echo "$line" | nc localhost 5555; done
```

### Dalvik/ART Logging

For system-level Dalvik/ART logs:

```bash
adb logcat -v time dalvikvm:I *:S | while read line; do echo "$line" | nc -u localhost 5555; done
```

### Filter Specific Tags

```bash
# Only show ActivityManager logs
adb logcat ActivityManager:I *:S | while read line; do echo "$line" | nc localhost 5555; done
```

## Project Structure 📁

```
isireel/
├── log_viewer.py              # Standalone viewer with demo logs
├── log_viewer_network.py      # Network-enabled viewer
├── log_server.py              # Server/client for log transmission
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## Examples 💡

### Example 1: Monitor Android App

```bash
# Terminal 1: Start viewer
python log_viewer_network.py --port 5555

# Terminal 2: Stream specific app logs
adb logcat -v time com.myapp:D *:S | while read line; do echo "$line" | nc -u localhost 5555; done
```

### Example 2: Monitor System Errors

```bash
# Terminal 1: Start viewer in errors-only mode
python log_viewer_network.py --port 5555
# Then press 'e' in the viewer to enable errors-only mode

# Terminal 2: Stream all error logs
adb logcat *:E | while read line; do echo "$line" | nc -u localhost 5555; done
```

### Example 3: Save and Analyze Logs

1. Start the viewer
2. Let it collect logs
3. Press `Ctrl+S` to save to file
4. Analyze saved logs with grep, awk, etc.

## Tips & Tricks 🎯

1. **Performance**: UDP is faster but may drop packets. TCP is more reliable for critical logs.
2. **Filtering**: Use the filter input (press `f`) to search for specific tags or messages
3. **Buffer Size**: The viewer keeps the last 10,000 logs in memory
4. **Color Coding**: Errors and fatals are highlighted in red for quick identification
5. **Auto-scroll**: The viewer automatically scrolls to show the latest logs

## Troubleshooting 🔧

### Port Already in Use
```bash
# Find process using port 5555
lsof -i :5555

# Kill it if needed
kill -9 <PID>
```

### No Logs Appearing
1. Check firewall settings
2. Verify the host/port configuration
3. Ensure the log format matches expected formats
4. Check if the server is running

### Performance Issues
- Reduce the number of visible logs (currently showing last 200)
- Filter out verbose/debug logs
- Use UDP instead of TCP for high-volume logs

## Contributing 🤝

Feel free to submit issues and enhancement requests!

## License 📄

MIT License - see LICENSE file for details

## Credits 👏

Built with:
- [Textual](https://github.com/Textualize/textual) - Modern TUI framework
- [Rich](https://github.com/Textualize/rich) - Beautiful terminal output

---

**Made with ❤️ for Android developers and system administrators**
