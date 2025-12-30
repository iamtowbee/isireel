# IPA Decompilation Guide

Complete toolkit for iOS IPA analysis and reverse engineering.

⚠️ **AUTHORIZATION REQUIRED** - Only use on apps you own or have explicit permission to analyze.

## Quick Start

### Basic Analysis

```bash
python ipa_decompiler.py YourApp.ipa
```

**Outputs:**
- Extracted app bundle
- Strings from binary
- Info.plist analysis
- Sensitive data findings (URLs, API keys, etc.)
- Assets (images, configs, databases)
- Comprehensive report

### Advanced Analysis

```bash
# First run basic analysis
python ipa_decompiler.py YourApp.ipa

# Then run advanced on the binary
python ipa_advanced.py YourApp_analysis/extracted/Payload/YourApp.app/YourApp
```

**Additional outputs:**
- Objective-C class headers
- Disassembly code
- Symbol table
- Swift code detection
- Encryption status

## What Gets Extracted

### 1. App Metadata (Info.plist)
- Bundle ID
- Version & build number
- Minimum iOS version
- Permissions & capabilities
- URL schemes
- App Transport Security settings

### 2. Binary Analysis
- Architecture (ARM64, ARMv7, etc.)
- Dependencies & frameworks
- Linked libraries
- Symbols & functions

### 3. Strings & Sensitive Data
- All readable strings from binary
- API endpoints & URLs
- API keys & tokens
- AWS credentials
- Email addresses
- File paths
- Database queries

### 4. Assets
- Images (PNG, JPG, etc.)
- Configuration files (plist, json)
- Databases (SQLite)
- HTML/CSS/JS files
- Certificates

### 5. Code Structure
- Objective-C class headers
- Swift symbols (demangled)
- Function names
- Method signatures

## Installation

### Required Tools

```bash
# macOS only
xcode-select --install  # Includes otool, nm, strings

# Optional (for advanced features)
brew install class-dump
```

### Python Requirements

```bash
pip install pathlib  # Usually included
```

## Usage Examples

### Example 1: Security Audit

```bash
# Analyze app for security issues
python ipa_decompiler.py CompanyApp.ipa

# Check results
cat CompanyApp_analysis/sensitive_data.json
```

**Look for:**
- Hardcoded API keys
- Unencrypted URLs (http://)
- Debug endpoints
- Sensitive file paths

### Example 2: Understanding App Structure

```bash
# Extract classes
python ipa_advanced.py path/to/binary

# View class headers
cat advanced_analysis/headers/all_headers.h
```

### Example 3: Finding Specific Strings

```bash
# Extract strings
python ipa_decompiler.py App.ipa

# Search for specific terms
grep -i "api" App_analysis/strings.txt
grep -i "secret" App_analysis/strings.txt
grep -i "password" App_analysis/strings.txt
```

### Example 4: Asset Extraction

```bash
python ipa_decompiler.py App.ipa

# Assets saved to:
# App_analysis/assets/
# - All images
# - Configuration files (converted to JSON)
# - Databases
```

## Output Structure

```
YourApp_analysis/
├── REPORT.md                  # Human-readable summary
├── REPORT.json                # Full analysis data
├── info_plist.json           # App metadata
├── strings.txt               # All extracted strings
├── sensitive_data.json       # Security findings
├── binary_analysis.json      # Binary info
├── extracted/                # Full IPA contents
│   └── Payload/
│       └── YourApp.app/
│           ├── YourApp       # Main binary
│           ├── Info.plist
│           └── ...
└── assets/                   # Extracted resources
    ├── images/
    ├── configs/
    └── databases/
```

## Advanced Features

### Class Dumping

Extracts Objective-C interfaces and method signatures:

```bash
python ipa_advanced.py binary_path
```

**Output example:**
```objc
@interface LoginViewController : UIViewController
- (void)loginWithUsername:(NSString *)username password:(NSString *)password;
- (void)validateCredentials;
@end
```

### Disassembly

Full ARM assembly code:

```bash
python ipa_advanced.py binary_path
# Creates: advanced_analysis/disassembly.asm
```

### Swift Analysis

Detects and demangles Swift code:

```bash
python ipa_advanced.py binary_path
# Identifies Swift vs Objective-C
# Demangles Swift symbol names
```

### Encryption Check

Determines if binary is encrypted (App Store protection):

```bash
python ipa_advanced.py binary_path
# Shows: ENCRYPTED or NOT ENCRYPTED
```

**If encrypted:**
- Binary must be decrypted first
- Use: Clutch, frida-ios-dump, or CrackerXI
- Requires jailbroken device

## Common Use Cases

### 1. Security Research

```bash
# Find vulnerabilities
python ipa_decompiler.py app.ipa
cat app_analysis/sensitive_data.json

# Check for:
# - Hardcoded credentials
# - Insecure URLs
# - Debug code left in production
# - Weak encryption
```

### 2. Competitive Analysis

```bash
# Understand competitor features
python ipa_decompiler.py competitor.ipa
python ipa_advanced.py competitor_analysis/.../binary

# Analyze:
# - Feature list (from classes)
# - Third-party SDKs (dependencies)
# - API endpoints
# - Technology stack
```

### 3. Your Own App Audit

```bash
# Before App Store submission
python ipa_decompiler.py MyApp.ipa

# Verify:
# - No test/debug code
# - No hardcoded secrets
# - Proper encryption
# - Clean assets
```

### 4. Legacy App Understanding

```bash
# Understand undocumented legacy code
python ipa_advanced.py old_app_binary

# Extract:
# - Class structure
# - Method names
# - Dependencies
# - Flow logic from disassembly
```

## Security Findings Interpretation

### High Risk
- **AWS/API Keys in strings** → Immediate rotation required
- **http:// URLs** → Man-in-the-middle vulnerability
- **Passwords in code** → Critical security issue

### Medium Risk
- **Internal IPs** → Information disclosure
- **Debug endpoints** → Should be removed in production
- **Verbose error messages** → Potential info leakage

### Low Risk
- **Email addresses** → Contact info (usually okay)
- **Public APIs** → Normal if properly secured
- **Paths** → Only risky if sensitive

## Tools Reference

### Built-in Tools

| Tool | Purpose | Platform |
|------|---------|----------|
| `strings` | Extract readable text | macOS/Linux |
| `otool` | Binary analysis | macOS only |
| `nm` | Symbol extraction | macOS/Linux |
| `file` | Detect file type | macOS/Linux |

### Optional Tools

| Tool | Purpose | Install |
|------|---------|---------|
| `class-dump` | Extract Obj-C headers | `brew install class-dump` |
| `Hopper` | Decompiler (GUI) | hopperapp.com |
| `Ghidra` | Decompiler (free) | ghidra-sre.org |
| `IDA Pro` | Professional disassembler | hex-rays.com |

## Programmatic Usage

### Python API

```python
from ipa_decompiler import IPAAnalyzer

# Create analyzer
analyzer = IPAAnalyzer("MyApp.ipa", output_dir="custom_output")

# Run specific analyses
analyzer.extract_ipa()
plist = analyzer.analyze_info_plist()
strings = analyzer.extract_strings()
findings = analyzer.find_sensitive_data(strings)

# Or run everything
report = analyzer.analyze_all()

# Access results
print(f"Found {len(findings['URLs'])} URLs")
print(f"Bundle ID: {plist['CFBundleIdentifier']}")
```

### Quick Analysis

```python
from ipa_decompiler import quick_analyze

report = quick_analyze("app.ipa")
print(report['statistics'])
```

## Troubleshooting

### "strings command not found"

```bash
# Install binutils
brew install binutils
# Or use xcode-select --install
```

### "otool not found"

- macOS only tool
- Alternative: Use Ghidra or IDA Pro on other platforms

### "class-dump failed"

```bash
# Install class-dump
brew install class-dump

# Or try with --arch flag
class-dump --arch arm64 binary
```

### Binary is encrypted

- Download IPA from App Store → Encrypted
- Build your own IPA → Not encrypted
- **Solution:** Use decryption tools (requires jailbreak)

### Permission denied

```bash
chmod +x ipa_decompiler.py
chmod +x ipa_advanced.py
```

## Legal & Ethical Considerations

### ✅ Allowed

- Your own apps
- Apps you developed
- Authorized penetration testing
- Security research (responsible disclosure)
- Educational purposes (non-commercial)

### ❌ Not Allowed

- Stealing proprietary code
- Bypassing DRM/licenses
- Redistributing extracted code
- Commercial use without permission
- Violating ToS agreements

### Best Practices

1. **Get permission** - Written authorization for third-party apps
2. **Responsible disclosure** - Report vulnerabilities privately
3. **Respect IP** - Don't copy or redistribute code
4. **Follow laws** - DMCA, CFAA, and local regulations
5. **Document purpose** - Keep records of authorization

## Next Steps

1. **Basic analysis** - Start with `ipa_decompiler.py`
2. **Review findings** - Check REPORT.md for overview
3. **Deep dive** - Use `ipa_advanced.py` for detailed analysis
4. **Manual review** - Examine specific areas of interest
5. **Use professional tools** - Hopper/Ghidra for decompilation

## Resources

- [iOS App Security Best Practices](https://developer.apple.com/security/)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [Reverse Engineering iOS Apps](https://github.com/iosre/iOSAppReverseEngineering)
- [Hopper Disassembler](https://www.hopperapp.com/)
- [Ghidra](https://ghidra-sre.org/)
