# 📱 IPA Sideloader - Built-in App Manager

Your AI Training Terminal app now includes a **built-in IPA Manager** that lets you download and sideload apps directly on your iPhone!

## What It Does

The IPA Manager tab allows you to:

✅ **Download IPAs** directly from GitHub Actions
✅ **Store and manage** IPA files on your iPhone
✅ **One-tap install** via AltStore or Sideloadly
✅ **Track downloads** with progress indicator
✅ **Share IPAs** with other devices
✅ **Auto-fetch** latest builds from GitHub

## How to Use

### 1. Open the IPA Manager Tab

After installing the AI Training Terminal app:
1. Tap the **📦 IPAs** tab (fourth tab)
2. You'll see the IPA Manager screen

### 2. Download Apps from GitHub

Tap **"📦 Download from GitHub"**

The app will:
- Connect to GitHub Actions
- Show all available iOS builds
- Let you select which build to download
- Download with progress indicator
- Save to your iPhone's storage

### 3. Install the Downloaded IPA

Once downloaded, tap **"Install"** on any IPA:

**Option A: Via AltStore** (Recommended)
- Taps "Install" → "AltStore"
- AltStore opens automatically
- Confirms installation
- App installs to your Home Screen!

**Option B: Via Share**
- Taps "Install" → "Share"
- Share to AltStore, Sideloadly, or AirDrop
- Recipient can install

### 4. Manage Your IPAs

- **View all** downloaded IPAs in one place
- **Check file size** and download date
- **Delete** IPAs you no longer need
- **Pull to refresh** to update the list

## Setup Requirements

### First Time Setup:

1. **Install AltStore** (one-time):
   - Visit https://altstore.io on any computer
   - Install AltStore Helper
   - Sync to your iPhone
   - Done! (You can disconnect the computer)

2. **Trust the App**:
   - Settings → General → VPN & Device Management
   - Trust your Apple ID

That's it! Now you can sideload forever from just your iPhone!

## How It Works

```
GitHub Actions (cloud) → Builds IPA
         ↓
IPA Manager (downloads to iPhone)
         ↓
Your iPhone Storage
         ↓
Tap "Install" → AltStore → Installed!
```

## Example Workflow

Let's say you want to install the latest AI Training Terminal build:

1. **Open IPA Manager tab**
2. **Tap "Download from GitHub"**
3. **Select "AITrainerTerminal-iOS"** from the list
4. **Wait for download** (progress bar shows status)
5. **Tap "Install"** when complete
6. **Choose "AltStore"**
7. **App installs!**

## Features

### Smart Download
- Fetches only iOS builds from GitHub Actions
- Shows build date and size
- Downloads in background
- Progress indicator

### Easy Management
- All IPAs in one place
- Sort by date
- Quick delete
- Pull to refresh

### Multiple Install Methods
- AltStore (primary)
- Sideloadly (if installed)
- Share via AirDrop
- Share via Files app

### Storage Info
- Shows file size for each IPA
- Tracks download date
- Total storage used

## Advanced: Custom GitHub Repos

The IPA Manager is pre-configured for this repo, but you can modify it to download from any GitHub repository:

In `IPAManagerScreen.tsx`, change:
```typescript
const [githubOwner, setGithubOwner] = useState('YOUR_USERNAME');
const [githubRepo, setGithubRepo] = useState('YOUR_REPO');
```

Now it will fetch IPAs from your custom repo!

## Troubleshooting

### "No Builds Found"
- Make sure GitHub Actions has run
- Check that the workflow produced iOS artifacts
- Verify repo name is correct

### "AltStore Not Found"
- Install AltStore from https://altstore.io
- Make sure it's running on your iPhone
- Try restarting AltStore

### "Download Failed"
- Check internet connection
- Verify GitHub Actions artifact is available
- Try again (temporary GitHub issue)

### "Installation Failed"
- Make sure AltStore is active
- Check that you haven't exceeded Apple's 3-app limit
- Delete an old app from AltStore

## Why This Is Cool

**Before:**
- Need a Mac to build
- Need Xcode installed
- Need to connect iPhone via cable
- Complex build process

**Now:**
- GitHub builds automatically (free cloud Mac!)
- Download IPA directly to iPhone
- One tap to install
- Everything from your iPhone!

## Comparison with Other Methods

| Method | Requires Computer | Cost | Refresh Needed |
|--------|------------------|------|----------------|
| IPA Manager + AltStore | Once (setup) | Free | Weekly (10 sec) |
| Xcode | Always | Free | No |
| TestFlight | No | $99/year | No |
| Enterprise | No | $299/year | No |

## Pro Tips

1. **Download multiple versions** - Keep old IPAs as backups
2. **Share with friends** - Use AirDrop to share IPAs
3. **Auto-update workflow** - GitHub Actions builds on every push
4. **Airplane mode safe** - Download when you have WiFi, install anytime

## Future Enhancements

Possible additions:
- [ ] In-app build triggers (trigger GitHub Actions from the app)
- [ ] Auto-install latest build
- [ ] IPA file inspector (view app info without installing)
- [ ] Multiple repo support (switch between repos)
- [ ] Build notifications (notify when new build is ready)

## Security Note

IPAs are downloaded from GitHub Actions, which builds them from your source code. Always verify:
- You trust the GitHub repository
- The GitHub Actions workflow is legitimate
- The IPA is from your expected build

---

**Built with ❤️ for iPhone-only developers!**

No Mac? No problem. Build and install iOS apps entirely from your iPhone! 🚀
