#!/usr/bin/env python3
"""
iOS Log Viewer - Terminal UI Application
Displays logs with Android-style log levels (V/D/I/W/E/F) for iOS apps
"""

import asyncio
import socket
from datetime import datetime
from enum import Enum
from typing import Optional, List
from dataclasses import dataclass

from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, DataTable, Input, Static
from textual.containers import Container, Vertical
from textual.binding import Binding
from rich.text import Text


class LogLevel(Enum):
    """Log levels using Android-style codes (V/D/I/W/E/F)"""
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

    def __str__(self) -> str:
        time_str = self.timestamp.strftime("%m-%d %H:%M:%S.%f")[:-3]
        pid_tid = f"{self.pid:5d}:{self.tid:5d}" if self.pid and self.tid else "     :     "
        return f"{time_str} {pid_tid} {self.level.code} {self.tag:20s} {self.message}"

    def to_rich_text(self) -> Text:
        """Convert log entry to Rich Text with colors"""
        time_str = self.timestamp.strftime("%m-%d %H:%M:%S.%f")[:-3]
        pid_tid = f"{self.pid:5d}:{self.tid:5d}" if self.pid and self.tid else "     :     "

        text = Text()
        text.append(time_str, style="dim white")
        text.append(" ")
        text.append(pid_tid, style="dim white")
        text.append(" ")
        text.append(self.level.code, style=self.level.color)
        text.append(" ")
        text.append(f"{self.tag:20s}", style="cyan")
        text.append(" ")
        text.append(self.message, style=self.level.color if self.level in [LogLevel.ERROR, LogLevel.FATAL] else "white")

        return text


class LogParser:
    """Parses log messages with Android-style log levels"""

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
        Parse a log line:
        Format: MM-DD HH:MM:SS.mmm  PID  TID LEVEL TAG: MESSAGE
        or simple: LEVEL/TAG: MESSAGE
        """
        line = line.strip()
        if not line:
            return None

        try:
            # Try full format: 12-29 13:45:23.123  1234  5678 I MyTag: Message
            if len(line) > 30 and line[5] == '-' and line[14] == ':':
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
                    level_str, rest = line.split(sep, 1)
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
    """Terminal UI application for viewing iOS logs"""

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
    """

    BINDINGS = [
        Binding("q", "quit", "Quit"),
        Binding("c", "clear", "Clear logs"),
        Binding("f", "focus_filter", "Filter"),
        Binding("v", "toggle_verbose", "Toggle Verbose"),
        Binding("d", "toggle_debug", "Toggle Debug"),
        Binding("e", "toggle_errors_only", "Errors Only"),
    ]

    def __init__(self):
        super().__init__()
        self.logs: List[LogEntry] = []
        self.filtered_logs: List[LogEntry] = []
        self.filter_text = ""
        self.show_verbose = True
        self.show_debug = True
        self.errors_only = False
        self.server_host = "localhost"
        self.server_port = 5555

    def compose(self) -> ComposeResult:
        """Create the UI layout"""
        yield Header(show_clock=True)

        with Vertical():
            with Container(id="filter-container"):
                yield Input(placeholder="Filter logs (tag or message)...", id="filter-input")

            yield Static("Logs: 0 | Filtered: 0 | Levels: V D I W E F", id="stats")

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

        # Start demo logs
        self.set_interval(2.0, self.add_demo_log)

        # Update stats
        self.set_interval(1.0, self.update_stats)

    def add_demo_log(self) -> None:
        """Add demo log entries for testing"""
        import random

        levels = list(LogLevel)
        tags = ["Network", "System", "Database", "UI", "AppDelegate", "ViewController"]
        messages = [
            "Starting activity",
            "Service connected",
            "Network state changed",
            "GC freed 1234K",
            "Process started",
            "Frame rendered in 16ms",
            "Permission granted",
            "Configuration changed",
            "Battery level: 85%",
            "Low memory warning",
        ]

        level = random.choice(levels)
        tag = random.choice(tags)
        message = random.choice(messages)

        log_entry = LogEntry(
            timestamp=datetime.now(),
            level=level,
            tag=tag,
            pid=random.randint(1000, 9999),
            tid=random.randint(1000, 9999),
            message=message
        )

        self.add_log(log_entry)

    def add_log(self, log_entry: LogEntry) -> None:
        """Add a log entry to the viewer"""
        self.logs.append(log_entry)

        # Keep only last 1000 logs
        if len(self.logs) > 1000:
            self.logs = self.logs[-1000:]

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
        for log in self.filtered_logs[-100:]:  # Show last 100 filtered logs
            time_str = log.timestamp.strftime("%m-%d %H:%M:%S.%f")[:-3]
            pid_tid = f"{log.pid:5d}:{log.tid:5d}" if log.pid and log.tid else "     :     "

            level_text = Text(log.level.code, style=log.level.color)
            tag_text = Text(log.tag[:20], style="cyan")
            msg_style = log.level.color if log.level in [LogLevel.ERROR, LogLevel.FATAL] else "white"
            msg_text = Text(log.message, style=msg_style)

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
        stats.update(f"Logs: {len(self.logs)} | Filtered: {len(self.filtered_logs)} | {level_str}")

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


def main():
    """Run the log viewer application"""
    app = LogViewerApp()
    app.run()


if __name__ == "__main__":
    main()
