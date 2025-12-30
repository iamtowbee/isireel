"""
Advanced IPA analysis with class dumping and disassembly.
Requires additional tools: class-dump, Hopper/Ghidra (optional)
"""
import subprocess
import os
from pathlib import Path
import json


class AdvancedIPAAnalyzer:
    """Advanced decompilation with class extraction and disassembly."""

    def __init__(self, binary_path: str, output_dir: str = "advanced_analysis"):
        self.binary_path = Path(binary_path)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)

    def dump_classes(self):
        """Extract Objective-C class headers using class-dump."""
        print("\n[Advanced] Dumping Objective-C classes...")

        try:
            headers_dir = self.output_dir / "headers"
            headers_dir.mkdir(exist_ok=True)

            # Try class-dump
            result = subprocess.run(
                ['class-dump', str(self.binary_path)],
                capture_output=True,
                text=True,
                timeout=60
            )

            if result.returncode == 0:
                headers_file = headers_dir / "all_headers.h"
                with open(headers_file, 'w') as f:
                    f.write(result.stdout)

                print(f"✓ Class headers dumped to: {headers_file}")

                # Count classes
                class_count = result.stdout.count('@interface')
                print(f"✓ Found {class_count} classes")

                return result.stdout
            else:
                print("✗ class-dump failed")
                return None

        except FileNotFoundError:
            print("✗ class-dump not found")
            print("  Install: brew install class-dump")
            return None
        except Exception as e:
            print(f"✗ Error: {e}")
            return None

    def disassemble_binary(self):
        """Disassemble binary using otool."""
        print("\n[Advanced] Disassembling binary...")

        try:
            disasm_file = self.output_dir / "disassembly.asm"

            # Use otool for disassembly
            result = subprocess.run(
                ['otool', '-tV', str(self.binary_path)],
                capture_output=True,
                text=True,
                timeout=120
            )

            with open(disasm_file, 'w') as f:
                f.write(result.stdout)

            size = os.path.getsize(disasm_file) / (1024 * 1024)
            print(f"✓ Disassembly saved: {disasm_file} ({size:.1f} MB)")

            return result.stdout

        except FileNotFoundError:
            print("✗ otool not found (macOS only)")
            return None
        except Exception as e:
            print(f"✗ Error: {e}")
            return None

    def extract_symbols(self):
        """Extract symbols from binary."""
        print("\n[Advanced] Extracting symbols...")

        try:
            symbols_file = self.output_dir / "symbols.txt"

            result = subprocess.run(
                ['nm', str(self.binary_path)],
                capture_output=True,
                text=True,
                timeout=60
            )

            with open(symbols_file, 'w') as f:
                f.write(result.stdout)

            symbol_count = len(result.stdout.split('\n'))
            print(f"✓ Extracted {symbol_count:,} symbols")
            print(f"✓ Saved to: {symbols_file}")

            return result.stdout

        except Exception as e:
            print(f"✗ Error: {e}")
            return None

    def find_swift_code(self):
        """Detect and analyze Swift code."""
        print("\n[Advanced] Analyzing Swift code...")

        try:
            # Use swift-demangle to find Swift symbols
            result = subprocess.run(
                ['nm', str(self.binary_path)],
                capture_output=True,
                text=True,
                timeout=60
            )

            # Swift symbols start with _$s
            swift_symbols = [line for line in result.stdout.split('\n') if '_$s' in line]

            if swift_symbols:
                swift_file = self.output_dir / "swift_symbols.txt"
                with open(swift_file, 'w') as f:
                    f.write('\n'.join(swift_symbols))

                print(f"✓ Found {len(swift_symbols):,} Swift symbols")
                print(f"✓ Saved to: {swift_file}")

                # Try to demangle
                self._demangle_swift_symbols(swift_symbols)

            else:
                print("✗ No Swift code detected (Objective-C only)")

            return swift_symbols

        except Exception as e:
            print(f"✗ Error: {e}")
            return []

    def _demangle_swift_symbols(self, symbols):
        """Demangle Swift symbols to readable names."""
        try:
            demangled = []
            for symbol in symbols[:100]:  # Limit for speed
                # Extract just the symbol name
                parts = symbol.split()
                if len(parts) >= 3:
                    mangled = parts[2]

                    # Try swift-demangle
                    result = subprocess.run(
                        ['swift-demangle', mangled],
                        capture_output=True,
                        text=True,
                        timeout=1
                    )

                    if result.returncode == 0:
                        demangled.append(f"{mangled} -> {result.stdout.strip()}")

            if demangled:
                demangled_file = self.output_dir / "swift_demangled.txt"
                with open(demangled_file, 'w') as f:
                    f.write('\n'.join(demangled))

                print(f"✓ Demangled Swift symbols: {demangled_file}")

        except FileNotFoundError:
            print("  (swift-demangle not available)")
        except Exception as e:
            print(f"  Error demangling: {e}")

    def analyze_encryption(self):
        """Check if binary is encrypted."""
        print("\n[Advanced] Checking encryption...")

        try:
            result = subprocess.run(
                ['otool', '-l', str(self.binary_path)],
                capture_output=True,
                text=True,
                timeout=30
            )

            # Look for encryption info
            is_encrypted = 'cryptid 1' in result.stdout

            status = "ENCRYPTED ⚠️" if is_encrypted else "NOT ENCRYPTED ✓"
            print(f"✓ Binary status: {status}")

            if is_encrypted:
                print("  Note: Encrypted binaries require decryption first")
                print("  Use tools like: Clutch, frida-ios-dump, or CrackerXI")

            return is_encrypted

        except Exception as e:
            print(f"✗ Error: {e}")
            return None

    def full_advanced_analysis(self):
        """Run all advanced analysis."""
        print("="*60)
        print("ADVANCED IPA ANALYSIS")
        print("="*60)

        results = {}

        results['encryption'] = self.analyze_encryption()
        results['classes'] = self.dump_classes()
        results['symbols'] = self.extract_symbols()
        results['swift'] = self.find_swift_code()
        results['disassembly'] = self.disassemble_binary()

        print("\n" + "="*60)
        print("✓ ADVANCED ANALYSIS COMPLETE")
        print("="*60)
        print(f"\nResults in: {self.output_dir}/")

        return results


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python ipa_advanced.py <path_to_binary>")
        print("\nExample:")
        print("  python ipa_advanced.py MyApp_analysis/extracted/Payload/MyApp.app/MyApp")
        sys.exit(1)

    binary_path = sys.argv[1]

    analyzer = AdvancedIPAAnalyzer(binary_path)
    analyzer.full_advanced_analysis()
