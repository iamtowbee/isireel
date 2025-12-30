"""
iOS IPA Decompilation and Analysis Toolkit

AUTHORIZATION REQUIRED:
- Only use on apps you own or have explicit permission to analyze
- For security research, penetration testing, or educational purposes
- Unauthorized reverse engineering may violate terms of service
"""
import zipfile
import os
import subprocess
import plistlib
import json
import re
from pathlib import Path
from typing import Dict, List, Optional
import shutil


class IPAAnalyzer:
    """Comprehensive IPA decompilation and analysis tool."""

    def __init__(self, ipa_path: str, output_dir: str = "ipa_analysis"):
        """
        Initialize IPA analyzer.

        Args:
            ipa_path: Path to .ipa file
            output_dir: Directory for extracted files and analysis
        """
        self.ipa_path = Path(ipa_path)
        self.output_dir = Path(output_dir)
        self.app_name = None
        self.app_path = None
        self.binary_path = None

        if not self.ipa_path.exists():
            raise FileNotFoundError(f"IPA file not found: {ipa_path}")

        # Create output directory
        self.output_dir.mkdir(exist_ok=True)

        print(f"Analyzing: {self.ipa_path.name}")
        print(f"Output: {self.output_dir}")

    def extract_ipa(self):
        """Extract IPA contents (IPA is a ZIP file)."""
        print("\n[1/7] Extracting IPA...")

        extract_path = self.output_dir / "extracted"
        extract_path.mkdir(exist_ok=True)

        with zipfile.ZipFile(self.ipa_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)

        print(f"✓ Extracted to: {extract_path}")

        # Find .app bundle
        payload_path = extract_path / "Payload"
        if payload_path.exists():
            app_bundles = list(payload_path.glob("*.app"))
            if app_bundles:
                self.app_path = app_bundles[0]
                self.app_name = self.app_path.stem
                print(f"✓ Found app bundle: {self.app_name}")

                # Find main binary
                binary = self.app_path / self.app_name
                if binary.exists():
                    self.binary_path = binary
                    print(f"✓ Found binary: {binary.name}")

        return extract_path

    def analyze_info_plist(self):
        """Analyze Info.plist for app metadata."""
        print("\n[2/7] Analyzing Info.plist...")

        if not self.app_path:
            print("✗ App bundle not found")
            return {}

        info_plist = self.app_path / "Info.plist"
        if not info_plist.exists():
            print("✗ Info.plist not found")
            return {}

        try:
            with open(info_plist, 'rb') as f:
                plist_data = plistlib.load(f)

            # Save as readable JSON
            json_path = self.output_dir / "info_plist.json"
            with open(json_path, 'w') as f:
                json.dump(plist_data, f, indent=2, default=str)

            print(f"✓ Saved to: {json_path}")

            # Extract key info
            info = {
                'bundle_id': plist_data.get('CFBundleIdentifier', 'Unknown'),
                'version': plist_data.get('CFBundleShortVersionString', 'Unknown'),
                'build': plist_data.get('CFBundleVersion', 'Unknown'),
                'min_ios': plist_data.get('MinimumOSVersion', 'Unknown'),
                'display_name': plist_data.get('CFBundleDisplayName', 'Unknown'),
                'executable': plist_data.get('CFBundleExecutable', 'Unknown'),
            }

            print(f"\nApp Info:")
            for key, value in info.items():
                print(f"  {key}: {value}")

            return plist_data

        except Exception as e:
            print(f"✗ Error reading plist: {e}")
            return {}

    def extract_strings(self):
        """Extract readable strings from binary."""
        print("\n[3/7] Extracting strings from binary...")

        if not self.binary_path:
            print("✗ Binary not found")
            return []

        try:
            # Use strings command
            result = subprocess.run(
                ['strings', str(self.binary_path)],
                capture_output=True,
                text=True,
                timeout=30
            )

            strings_list = result.stdout.split('\n')
            strings_list = [s.strip() for s in strings_list if len(s.strip()) > 3]

            # Save to file
            strings_file = self.output_dir / "strings.txt"
            with open(strings_file, 'w') as f:
                f.write('\n'.join(strings_list))

            print(f"✓ Extracted {len(strings_list):,} strings")
            print(f"✓ Saved to: {strings_file}")

            return strings_list

        except FileNotFoundError:
            print("✗ 'strings' command not found (install binutils)")
            return []
        except Exception as e:
            print(f"✗ Error extracting strings: {e}")
            return []

    def find_sensitive_data(self, strings_list: List[str]):
        """Search for API keys, URLs, secrets in strings."""
        print("\n[4/7] Searching for sensitive data...")

        patterns = {
            'URLs': re.compile(r'https?://[^\s<>"]+'),
            'API Keys': re.compile(r'(?i)(api[_-]?key|apikey|api[_-]?secret)["\s:=]+([a-zA-Z0-9_-]{20,})'),
            'AWS Keys': re.compile(r'AKIA[0-9A-Z]{16}'),
            'Tokens': re.compile(r'(?i)(token|bearer|auth)["\s:=]+([a-zA-Z0-9_-]{20,})'),
            'Email': re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'),
            'IP Addresses': re.compile(r'\b(?:\d{1,3}\.){3}\d{1,3}\b'),
            'Paths': re.compile(r'/[a-zA-Z0-9_/-]+\.(json|xml|plist|db|sqlite)'),
        }

        findings = {}

        for category, pattern in patterns.items():
            matches = []
            for string in strings_list:
                found = pattern.findall(string)
                if found:
                    if isinstance(found[0], tuple):
                        matches.extend([m[1] if len(m) > 1 else m[0] for m in found])
                    else:
                        matches.extend(found)

            if matches:
                findings[category] = list(set(matches))[:50]  # Limit to 50 unique

        # Save findings
        findings_file = self.output_dir / "sensitive_data.json"
        with open(findings_file, 'w') as f:
            json.dump(findings, f, indent=2)

        print(f"✓ Found sensitive data:")
        for category, items in findings.items():
            print(f"  {category}: {len(items)} items")

        print(f"✓ Saved to: {findings_file}")

        return findings

    def analyze_binary(self):
        """Analyze binary structure using otool."""
        print("\n[5/7] Analyzing binary structure...")

        if not self.binary_path:
            print("✗ Binary not found")
            return {}

        analysis = {}

        try:
            # Get dependencies
            result = subprocess.run(
                ['otool', '-L', str(self.binary_path)],
                capture_output=True,
                text=True,
                timeout=30
            )
            dependencies = result.stdout.strip().split('\n')[1:]  # Skip first line
            analysis['dependencies'] = [d.strip().split()[0] for d in dependencies if d.strip()]

            # Get architecture
            result = subprocess.run(
                ['file', str(self.binary_path)],
                capture_output=True,
                text=True,
                timeout=10
            )
            analysis['architecture'] = result.stdout.strip()

            # Save analysis
            binary_file = self.output_dir / "binary_analysis.json"
            with open(binary_file, 'w') as f:
                json.dump(analysis, f, indent=2)

            print(f"✓ Architecture: {analysis['architecture']}")
            print(f"✓ Dependencies: {len(analysis['dependencies'])} libraries")
            print(f"✓ Saved to: {binary_file}")

            return analysis

        except FileNotFoundError:
            print("✗ 'otool' not found (macOS only)")
            return {}
        except Exception as e:
            print(f"✗ Error analyzing binary: {e}")
            return {}

    def extract_assets(self):
        """Extract images, configs, and other assets."""
        print("\n[6/7] Extracting assets...")

        if not self.app_path:
            print("✗ App path not found")
            return {}

        assets_dir = self.output_dir / "assets"
        assets_dir.mkdir(exist_ok=True)

        assets = {
            'images': [],
            'plists': [],
            'json': [],
            'databases': [],
            'other': []
        }

        # Copy assets
        for file_path in self.app_path.rglob('*'):
            if file_path.is_file():
                ext = file_path.suffix.lower()

                # Categorize
                if ext in ['.png', '.jpg', '.jpeg', '.gif', '.webp']:
                    assets['images'].append(str(file_path.name))
                    shutil.copy2(file_path, assets_dir / file_path.name)

                elif ext == '.plist':
                    assets['plists'].append(str(file_path.name))
                    # Convert binary plist to XML
                    try:
                        with open(file_path, 'rb') as f:
                            plist_data = plistlib.load(f)
                        json_name = file_path.stem + '.json'
                        with open(assets_dir / json_name, 'w') as f:
                            json.dump(plist_data, f, indent=2, default=str)
                    except:
                        shutil.copy2(file_path, assets_dir / file_path.name)

                elif ext == '.json':
                    assets['json'].append(str(file_path.name))
                    shutil.copy2(file_path, assets_dir / file_path.name)

                elif ext in ['.db', '.sqlite', '.sqlite3']:
                    assets['databases'].append(str(file_path.name))
                    shutil.copy2(file_path, assets_dir / file_path.name)

                elif ext in ['.txt', '.xml', '.html', '.js', '.css']:
                    assets['other'].append(str(file_path.name))
                    shutil.copy2(file_path, assets_dir / file_path.name)

        print(f"✓ Extracted assets:")
        for category, files in assets.items():
            if files:
                print(f"  {category}: {len(files)} files")

        print(f"✓ Saved to: {assets_dir}")

        return assets

    def generate_report(self, plist_data, strings_list, findings, binary_analysis, assets):
        """Generate comprehensive analysis report."""
        print("\n[7/7] Generating report...")

        report = {
            'app_name': self.app_name,
            'ipa_file': str(self.ipa_path),
            'analysis_date': str(Path.ctime(self.output_dir)),
            'info': plist_data,
            'statistics': {
                'total_strings': len(strings_list),
                'sensitive_findings': sum(len(v) for v in findings.values()),
                'dependencies': len(binary_analysis.get('dependencies', [])),
                'total_assets': sum(len(v) for v in assets.values())
            },
            'sensitive_data': findings,
            'binary': binary_analysis,
            'assets': assets
        }

        # Save full report
        report_file = self.output_dir / "REPORT.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)

        # Generate markdown report
        md_report = self._generate_markdown_report(report)
        md_file = self.output_dir / "REPORT.md"
        with open(md_file, 'w') as f:
            f.write(md_report)

        print(f"✓ Report saved:")
        print(f"  JSON: {report_file}")
        print(f"  Markdown: {md_file}")

        return report

    def _generate_markdown_report(self, report):
        """Generate markdown formatted report."""
        md = f"""# IPA Analysis Report

## App Information
- **Name:** {report['app_name']}
- **Bundle ID:** {report['info'].get('CFBundleIdentifier', 'N/A')}
- **Version:** {report['info'].get('CFBundleShortVersionString', 'N/A')}
- **Build:** {report['info'].get('CFBundleVersion', 'N/A')}
- **Min iOS:** {report['info'].get('MinimumOSVersion', 'N/A')}

## Statistics
- **Total Strings:** {report['statistics']['total_strings']:,}
- **Sensitive Findings:** {report['statistics']['sensitive_findings']}
- **Dependencies:** {report['statistics']['dependencies']}
- **Assets:** {report['statistics']['total_assets']}

## Sensitive Data Findings
"""

        for category, items in report['sensitive_data'].items():
            if items:
                md += f"\n### {category} ({len(items)})\n"
                for item in items[:10]:  # Show first 10
                    md += f"- `{item}`\n"
                if len(items) > 10:
                    md += f"- ... and {len(items) - 10} more\n"

        md += "\n## Files\n"
        md += f"- Extracted IPA: `{self.output_dir}/extracted/`\n"
        md += f"- Strings: `{self.output_dir}/strings.txt`\n"
        md += f"- Assets: `{self.output_dir}/assets/`\n"
        md += f"- Binary Analysis: `{self.output_dir}/binary_analysis.json`\n"

        return md

    def analyze_all(self):
        """Run complete analysis pipeline."""
        print("="*60)
        print("IPA DECOMPILATION & ANALYSIS")
        print("="*60)

        # Extract
        self.extract_ipa()

        # Analyze
        plist_data = self.analyze_info_plist()
        strings_list = self.extract_strings()
        findings = self.find_sensitive_data(strings_list)
        binary_analysis = self.analyze_binary()
        assets = self.extract_assets()

        # Report
        report = self.generate_report(plist_data, strings_list, findings, binary_analysis, assets)

        print("\n" + "="*60)
        print("✓ ANALYSIS COMPLETE")
        print("="*60)
        print(f"\nResults in: {self.output_dir}/")
        print(f"Review: {self.output_dir}/REPORT.md")

        return report


def quick_analyze(ipa_path: str, output_dir: str = None):
    """Quick analysis helper."""
    if output_dir is None:
        output_dir = f"{Path(ipa_path).stem}_analysis"

    analyzer = IPAAnalyzer(ipa_path, output_dir)
    return analyzer.analyze_all()


if __name__ == "__main__":
    import sys

    print("""
╔══════════════════════════════════════════════════════════╗
║          IPA Decompilation Toolkit                       ║
║                                                          ║
║  AUTHORIZATION REQUIRED                                  ║
║  Only use on apps you own or have permission to analyze ║
╚══════════════════════════════════════════════════════════╝
""")

    if len(sys.argv) < 2:
        print("Usage: python ipa_decompiler.py <path_to_ipa>")
        print("\nExample:")
        print("  python ipa_decompiler.py MyApp.ipa")
        print("\nOutput will be saved to: MyApp_analysis/")
        sys.exit(1)

    ipa_file = sys.argv[1]

    # Run analysis
    try:
        report = quick_analyze(ipa_file)
        print("\n✓ Analysis complete! Check the output directory for results.")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)
