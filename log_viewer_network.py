#!/usr/bin/env python3
"""
Android-style Log Viewer with Network Support
Displays logs from UDP/TCP server in real-time
"""

import asyncio
import socket
from datetime import datetime
from enum import Enum
from typing import Optional, List
from dataclasses import dataclass

from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, DataTable, Input, Static, Button
from textual.containers import Container, Vertical, Horizontal
from textual.binding import Binding
from rich.text import Text


class LogLevel(Enum):
    """Android log levels matching logcat"""
    VERBOSE = ("V", "verbose", "dim cyan")
    DEBUG = ("D", "debug", "blue")
    INFO = ("I", "info", "green")
    WARN = ("W", "warn", "yellow")
    ERROR = ("E", "error", "red")
    FATAL = ("F", "fatal", "bold red")

    def __init__(self, code: str, name: str, color: str):
        self.code = code
        self.level_name = name
        self.color = color


@dataclass
class LogEntry:
    """Represents a single log entry"""
    timestamp: datetime
    level: LogLevel
    tag: str
    pid: Optional[int]
    tid: Optional[int]
    message: str


class LogParser:
    """Parses Android logcat-style log messages"""

    @staticmethod
    def parse_level(level_str: str) -> LogLevel:
        """Parse log level from string"""
        level_map = {
            "V": LogLevel.VERBOSE,
            "D": LogLevel.DEBUG,
            "I": LogLevel.INFO,
            "W": LogLevel.WARN,
            "E": LogLevel.ERROR,
            "F": LogLevel.FATAL,
        }
        return level_map.get(level_str.upper(), LogLevel.INFO)

    @staticmethod
    def parse_line(line: str) -> Optional[LogEntry]:
        """
        Parse a logcat-style line:
        Format: MM-DD HH:MM:SS.mmm  PID  TID LEVEL TAG: MESSAGE
        or simple: LEVEL/TAG: MESSAGE
        """
        line = line.strip()
        if not line:
            return None

        try:
            # Try full format: 12-29 13:45:23.123  1234  5678 I MyTag: Message
            if len(line) > 30 and '-' in line[:6] and ':' in line[10:20]:
                time_str = line[:18]
                rest = line[18:].strip()
                parts = rest.split(None, 3)

                if len(parts) >= 4:
                    pid = int(parts[0])
                    tid = int(parts[1])
                    level_tag = parts[2]
                    message_part = parts[3]

                    level = LogParser.parse_level(level_tag[0])

                    if ':' in message_part:
                        tag, message = message_part.split(':', 1)
                        tag = tag.strip()
                        message = message.strip()
                    else:
                        tag = "unknown"
                        message = message_part

                    timestamp = datetime.strptime(time_str, "%m-%d %H:%M:%S.%f")
                    timestamp = timestamp.replace(year=datetime.now().year)

                    return LogEntry(timestamp, level, tag, pid, tid, message)

            # Try simple format: I/MyTag: Message or I MyTag: Message
            for sep in ['/', ' ']:
                if sep in line[:10]:
                    parts = line.split(sep, 1)
                    if len(parts) == 2:
                        level_str, rest = parts
                        level = LogParser.parse_level(level_str.strip())

                        if ':' in rest:
                            tag, message = rest.split(':', 1)
                            tag = tag.strip()
                            message = message.strip()
                        else:
                            tag = "unknown"
                            message = rest.strip()

                        return LogEntry(datetime.now(), level, tag, None, None, message)

        except (ValueError, IndexError):
            pass

        # Fallback: treat as info message
        return LogEntry(datetime.now(), LogLevel.INFO, "unknown", None, None, line)


class LogViewerApp(App):
    """Terminal UI application for viewing Android logs"""

    CSS = """
    Screen {
        background: $surface;
    }

    #log-container {
        height: 1fr;
        border: solid $primary;
    }

    #filter-container {
        height: auto;
        padding: 1;
        background: $panel;
    }

    #connection-container {
        height: auto;
        padding: 1;
        background: $panel;
    }

    #filter-input {
        width: 100%;
    }

    #stats {
        height: 3;
        background: $panel;
        padding: 1;
    }

    DataTable {
        height: 100%;
    }

    Button {
        margin: 0 1;
    }

    .connection-input {
        width: 1fr;
        margin: 0 1;
    }
    """

    BINDINGS = [
        Binding("q", "quit", "Quit"),
        Binding("c", "clear", "Clear logs"),
        Binding("f", "focus_filter", "Filter"),
        Binding("v", "toggle_verbose", "Toggle Verbose"),
        Binding("d", "toggle_debug", "Toggle Debug"),
        Binding("e", "toggle_errors_only", "Errors Only"),
        Binding("ctrl+s", "save_logs", "Save Logs"),
    ]

    def __init__(self, host: str = "localhost", port: int = 5555, protocol: str = "udp"):
        super().__init__()
        self.logs: List[LogEntry] = []
        self.filtered_logs: List[LogEntry] = []
        self.filter_text = ""
        self.show_verbose = True
        self.show_debug = True
        self.errors_only = False
        self.server_host = host
        self.server_port = port
        self.protocol = protocol
        self.connected = False
        self.receiver_task = None

    def compose(self) -> ComposeResult:
        """Create the UI layout"""
        yield Header(show_clock=True)

        with Vertical():
            with Horizontal(id="connection-container"):
                yield Input(
                    value=self.server_host,
                    placeholder="Host",
                    id="host-input",
                    classes="connection-input"
                )
                yield Input(
                    value=str(self.server_port),
                    placeholder="Port",
                    id="port-input",
                    classes="connection-input"
                )
                yield Button("Connect", id="connect-btn", variant="primary")
                yield Button("Disconnect", id="disconnect-btn", variant="error")

            with Container(id="filter-container"):
                yield Input(placeholder="Filter logs (tag or message)...", id="filter-input")

            yield Static("Logs: 0 | Filtered: 0 | Status: Disconnected", id="stats")

            with Container(id="log-container"):
                yield DataTable(id="log-table", zebra_stripes=True, cursor_type="row")

        yield Footer()

    def on_mount(self) -> None:
        """Initialize the app when mounted"""
        table = self.query_one("#log-table", DataTable)
        table.add_column("Timestamp", width=18)
        table.add_column("PID:TID", width=12)
        table.add_column("L", width=3)
        table.add_column("Tag", width=20)
        table.add_column("Message", width=None)
        table.focus()

        # Update stats
        self.set_interval(1.0, self.update_stats)

        # Auto-connect
        self.connect_to_server()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Handle button clicks"""
        if event.button.id == "connect-btn":
            self.connect_to_server()
        elif event.button.id == "disconnect-btn":
            self.disconnect_from_server()

    def connect_to_server(self) -> None:
        """Connect to the log server"""
        if self.connected:
            return

        try:
            host_input = self.query_one("#host-input", Input)
            port_input = self.query_one("#port-input", Input)

            self.server_host = host_input.value
            self.server_port = int(port_input.value)

            if self.protocol == "udp":
                self.receiver_task = asyncio.create_task(self.receive_udp_logs())
            else:
                self.receiver_task = asyncio.create_task(self.receive_tcp_logs())

            self.connected = True
            self.add_log(LogEntry(
                datetime.now(),
                LogLevel.INFO,
                "System",
                None,
                None,
                f"Connected to {self.server_host}:{self.server_port} via {self.protocol.upper()}"
            ))

        except Exception as e:
            self.add_log(LogEntry(
                datetime.now(),
                LogLevel.ERROR,
                "System",
                None,
                None,
                f"Connection failed: {str(e)}"
            ))

    def disconnect_from_server(self) -> None:
        """Disconnect from the log server"""
        if self.receiver_task:
            self.receiver_task.cancel()
            self.receiver_task = None

        self.connected = False
        self.add_log(LogEntry(
            datetime.now(),
            LogLevel.INFO,
            "System",
            None,
            None,
            "Disconnected from server"
        ))

    async def receive_udp_logs(self) -> None:
        """Receive logs via UDP"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            sock.bind((self.server_host, self.server_port))
            sock.setblocking(False)

            while True:
                try:
                    data, addr = await asyncio.get_event_loop().sock_recvfrom(sock, 4096)
                    message = data.decode('utf-8', errors='ignore').strip()

                    if message:
                        log_entry = LogParser.parse_line(message)
                        if log_entry:
                            self.add_log(log_entry)

                except Exception as e:
                    await asyncio.sleep(0.1)

        except asyncio.CancelledError:
            sock.close()
        except Exception as e:
            self.add_log(LogEntry(
                datetime.now(),
                LogLevel.ERROR,
                "System",
                None,
                None,
                f"UDP receive error: {str(e)}"
            ))

    async def receive_tcp_logs(self) -> None:
        """Receive logs via TCP"""
        try:
            reader, writer = await asyncio.open_connection(self.server_host, self.server_port)

            while True:
                data = await reader.read(4096)
                if not data:
                    break

                message = data.decode('utf-8', errors='ignore').strip()
                for line in message.split('\n'):
                    if line:
                        log_entry = LogParser.parse_line(line)
                        if log_entry:
                            self.add_log(log_entry)

        except asyncio.CancelledError:
            if 'writer' in locals():
                writer.close()
                await writer.wait_closed()
        except Exception as e:
            self.add_log(LogEntry(
                datetime.now(),
                LogLevel.ERROR,
                "System",
                None,
                None,
                f"TCP receive error: {str(e)}"
            ))

    def add_log(self, log_entry: LogEntry) -> None:
        """Add a log entry to the viewer"""
        self.logs.append(log_entry)

        # Keep only last 10000 logs
        if len(self.logs) > 10000:
            self.logs = self.logs[-10000:]

        self.refresh_logs()

    def refresh_logs(self) -> None:
        """Refresh the log table with current filters"""
        table = self.query_one("#log-table", DataTable)

        # Apply filters
        self.filtered_logs = []
        for log in self.logs:
            # Level filters
            if self.errors_only and log.level not in [LogLevel.ERROR, LogLevel.FATAL]:
                continue
            if not self.show_verbose and log.level == LogLevel.VERBOSE:
                continue
            if not self.show_debug and log.level == LogLevel.DEBUG:
                continue

            # Text filter
            if self.filter_text:
                if self.filter_text.lower() not in log.tag.lower() and \
                   self.filter_text.lower() not in log.message.lower():
                    continue

            self.filtered_logs.append(log)

        # Update table
        table.clear()
        for log in self.filtered_logs[-200:]:  # Show last 200 filtered logs
            time_str = log.timestamp.strftime("%m-%d %H:%M:%S.%f")[:-3]
            pid_tid = f"{log.pid:5d}:{log.tid:5d}" if log.pid and log.tid else "     :     "

            level_text = Text(log.level.code, style=log.level.color)
            tag_text = Text(log.tag[:20], style="cyan")
            msg_style = log.level.color if log.level in [LogLevel.ERROR, LogLevel.FATAL] else "white"
            msg_text = Text(log.message[:100], style=msg_style)

            table.add_row(time_str, pid_tid, level_text, tag_text, msg_text)

        # Auto-scroll to bottom
        if len(table.rows) > 0:
            table.scroll_end(animate=False)

    def update_stats(self) -> None:
        """Update statistics display"""
        stats = self.query_one("#stats", Static)
        level_counts = {level: 0 for level in LogLevel}
        for log in self.logs:
            level_counts[log.level] += 1

        level_str = " ".join([f"{level.code}:{count}" for level, count in level_counts.items()])
        status = "Connected" if self.connected else "Disconnected"
        stats.update(f"Logs: {len(self.logs)} | Filtered: {len(self.filtered_logs)} | Status: {status} | {level_str}")

    def on_input_changed(self, event: Input.Changed) -> None:
        """Handle filter input changes"""
        if event.input.id == "filter-input":
            self.filter_text = event.value
            self.refresh_logs()

    def action_clear(self) -> None:
        """Clear all logs"""
        self.logs.clear()
        self.filtered_logs.clear()
        self.refresh_logs()

    def action_focus_filter(self) -> None:
        """Focus the filter input"""
        self.query_one("#filter-input", Input).focus()

    def action_toggle_verbose(self) -> None:
        """Toggle verbose logs"""
        self.show_verbose = not self.show_verbose
        self.refresh_logs()

    def action_toggle_debug(self) -> None:
        """Toggle debug logs"""
        self.show_debug = not self.show_debug
        self.refresh_logs()

    def action_toggle_errors_only(self) -> None:
        """Toggle errors only mode"""
        self.errors_only = not self.errors_only
        self.refresh_logs()

    def action_save_logs(self) -> None:
        """Save logs to file"""
        filename = f"logs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        try:
            with open(filename, 'w') as f:
                for log in self.filtered_logs:
                    time_str = log.timestamp.strftime("%m-%d %H:%M:%S.%f")[:-3]
                    pid_tid = f"{log.pid:5d}:{log.tid:5d}" if log.pid and log.tid else "     :     "
                    f.write(f"{time_str} {pid_tid} {log.level.code} {log.tag:20s} {log.message}\n")

            self.add_log(LogEntry(
                datetime.now(),
                LogLevel.INFO,
                "System",
                None,
                None,
                f"Saved {len(self.filtered_logs)} logs to {filename}"
            ))
        except Exception as e:
            self.add_log(LogEntry(
                datetime.now(),
                LogLevel.ERROR,
                "System",
                None,
                None,
                f"Failed to save logs: {str(e)}"
            ))


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Android-style Log Viewer with Network Support")
    parser.add_argument("--host", default="localhost", help="Server host (default: localhost)")
    parser.add_argument("--port", type=int, default=5555, help="Server port (default: 5555)")
    parser.add_argument("--protocol", choices=["udp", "tcp"], default="udp", help="Protocol (default: udp)")

    args = parser.parse_args()

    app = LogViewerApp(args.host, args.port, args.protocol)
    app.run()


if __name__ == "__main__":
    main()
