#!/usr/bin/env python3
"""
Log Server - Receives iOS logs over UDP/TCP
Can be used to send logs to the log viewer
"""

import socket
import argparse
import sys
from datetime import datetime


class LogServer:
    """Simple UDP/TCP server for receiving log messages"""

    def __init__(self, host: str = "0.0.0.0", port: int = 5555, protocol: str = "udp"):
        self.host = host
        self.port = port
        self.protocol = protocol.lower()
        self.socket = None

    def start(self):
        """Start the log server"""
        if self.protocol == "udp":
            self._start_udp()
        else:
            self._start_tcp()

    def _start_udp(self):
        """Start UDP server"""
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.socket.bind((self.host, self.port))

        print(f"📡 UDP Log Server listening on {self.host}:{self.port}")
        print(f"Send logs using: echo 'I/MyTag: Test message' | nc -u {self.host} {self.port}")
        print("Press Ctrl+C to stop\n")

        try:
            while True:
                data, addr = self.socket.recvfrom(4096)
                message = data.decode('utf-8', errors='ignore').strip()

                if message:
                    timestamp = datetime.now().strftime("%m-%d %H:%M:%S.%f")[:-3]
                    print(f"[{timestamp}] {addr[0]}:{addr[1]} → {message}")

        except KeyboardInterrupt:
            print("\n\n🛑 Server stopped")
        finally:
            self.socket.close()

    def _start_tcp(self):
        """Start TCP server"""
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind((self.host, self.port))
        self.socket.listen(5)

        print(f"📡 TCP Log Server listening on {self.host}:{self.port}")
        print(f"Send logs using: echo 'I/MyTag: Test message' | nc {self.host} {self.port}")
        print("Press Ctrl+C to stop\n")

        try:
            while True:
                conn, addr = self.socket.accept()
                print(f"✅ Connection from {addr[0]}:{addr[1]}")

                try:
                    while True:
                        data = conn.recv(4096)
                        if not data:
                            break

                        message = data.decode('utf-8', errors='ignore').strip()
                        if message:
                            timestamp = datetime.now().strftime("%m-%d %H:%M:%S.%f")[:-3]
                            print(f"[{timestamp}] {message}")

                except Exception as e:
                    print(f"❌ Error: {e}")
                finally:
                    conn.close()
                    print(f"❌ Connection closed from {addr[0]}:{addr[1]}")

        except KeyboardInterrupt:
            print("\n\n🛑 Server stopped")
        finally:
            self.socket.close()


class LogClient:
    """Simple client for sending test logs"""

    def __init__(self, host: str = "localhost", port: int = 5555, protocol: str = "udp"):
        self.host = host
        self.port = port
        self.protocol = protocol.lower()

    def send_log(self, level: str, tag: str, message: str, pid: int = None, tid: int = None):
        """Send a single log message"""
        timestamp = datetime.now().strftime("%m-%d %H:%M:%S.%f")[:-3]

        if pid and tid:
            log_line = f"{timestamp} {pid:5d} {tid:5d} {level} {tag}: {message}"
        else:
            log_line = f"{level}/{tag}: {message}"

        if self.protocol == "udp":
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.sendto(log_line.encode('utf-8'), (self.host, self.port))
            sock.close()
        else:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((self.host, self.port))
            sock.sendall(log_line.encode('utf-8') + b'\n')
            sock.close()

        print(f"✅ Sent: {log_line}")

    def send_demo_logs(self, count: int = 10):
        """Send demo log messages"""
        import random
        import time

        levels = ["V", "D", "I", "W", "E", "F"]
        tags = ["Network", "System", "Database", "UI", "AppDelegate"]
        messages = [
            "Starting activity",
            "Service connected",
            "Network state changed",
            "GC freed 1234K",
            "Process started",
            "Permission granted",
            "Configuration changed",
            "Battery level: 85%",
        ]

        for i in range(count):
            level = random.choice(levels)
            tag = random.choice(tags)
            message = random.choice(messages)
            pid = random.randint(1000, 9999)
            tid = random.randint(1000, 9999)

            self.send_log(level, tag, message, pid, tid)
            time.sleep(0.5)


def main():
    parser = argparse.ArgumentParser(description="iOS Log Server/Client with Android-style log levels")
    parser.add_argument("mode", choices=["server", "client"], help="Run as server or client")
    parser.add_argument("--host", default="localhost", help="Server host (default: localhost)")
    parser.add_argument("--port", type=int, default=5555, help="Server port (default: 5555)")
    parser.add_argument("--protocol", choices=["udp", "tcp"], default="udp", help="Protocol (default: udp)")

    # Client-specific args
    parser.add_argument("--level", default="I", help="Log level (V/D/I/W/E/F)")
    parser.add_argument("--tag", default="TestTag", help="Log tag")
    parser.add_argument("--message", help="Log message")
    parser.add_argument("--demo", action="store_true", help="Send demo logs")
    parser.add_argument("--count", type=int, default=10, help="Number of demo logs to send")

    args = parser.parse_args()

    if args.mode == "server":
        server = LogServer(args.host, args.port, args.protocol)
        server.start()
    else:
        client = LogClient(args.host, args.port, args.protocol)

        if args.demo:
            print(f"📤 Sending {args.count} demo logs to {args.host}:{args.port} via {args.protocol.upper()}")
            client.send_demo_logs(args.count)
        elif args.message:
            client.send_log(args.level, args.tag, args.message)
        else:
            print("❌ Error: Please specify --message or use --demo")
            sys.exit(1)


if __name__ == "__main__":
    main()
