# 📱 Install on iPhone Only (No Mac Needed!)

Since you only have an iPhone, here are your options to install the AI Training Terminal app:

## Option 1: AltStore (Recommended - Easiest)

AltStore lets you install apps on your iPhone without a Mac or jailbreak.

### Steps:

1. **Download AltStore on your iPhone**
   - Visit: https://altstore.io
   - Tap "Download AltStore" and follow instructions
   - You'll need to install AltServer on any computer (Windows/Mac) just once for initial setup

2. **Get the IPA file**
   - Go to this repo's GitHub Actions tab
   - Click the latest successful build
   - Download "AITrainerTerminal-iOS" artifact
   - Extract the .ipa file

3. **Install via AltStore**
   - Open AltStore on your iPhone
   - Tap the "+" button
   - Select the .ipa file
   - The app installs automatically!

**Pros**: Free, works great, no jailbreak needed
**Cons**: Need to refresh weekly (takes 10 seconds)

## Option 2: Sideloadly (Windows/Mac Required Once)

Similar to AltStore but with more features.

### Steps:

1. **Download Sideloadly**
   - Visit: https://sideloadly.io
   - Install on any computer

2. **Get the IPA**
   - From GitHub Actions (see above)

3. **Connect iPhone via USB**
   - Open Sideloadly
   - Drag the .ipa file
   - Enter your Apple ID
   - App installs to your iPhone!

**Pros**: More reliable, works longer
**Cons**: Need a computer for first-time setup

## Option 3: TestFlight (If You Have Apple Developer Account)

If you have an Apple Developer account ($99/year):

1. **Build with GitHub Actions**
   - Push to GitHub
   - Actions automatically build the app

2. **Upload to TestFlight**
   - Download the IPA from GitHub Actions
   - Upload to App Store Connect
   - Send yourself a TestFlight invite

3. **Install from TestFlight app**
   - Open TestFlight on iPhone
   - Accept the invite
   - Install the app

**Pros**: Most official, no weekly refresh needed
**Cons**: Costs $99/year

## Option 4: GitHub Actions + Direct Install

The repo now has GitHub Actions set up to automatically build the app!

### How it works:

1. **Push to GitHub** (you can do this from your iPhone using a Git client app)

2. **GitHub Actions builds the app** automatically in the cloud

3. **Download the IPA**:
   - Go to: `https://github.com/YOUR_USERNAME/isireel/actions`
   - Click the latest workflow run
   - Download the "AITrainerTerminal-iOS" artifact
   - Extract the .ipa file

4. **Install using AltStore or Sideloadly** (see options above)

## Option 5: Using iPhone Only with Scriptable + Shortcuts

For a purely iPhone-only workflow:

1. **Install Scriptable app** (free from App Store)
2. **Install Working Copy** (Git client for iOS)
3. Use Working Copy to push changes to GitHub
4. GitHub Actions builds the app
5. Use Scriptable to download and trigger installation via AltStore

## Easiest Path for You:

Since you only have an iPhone, I recommend:

```
1. Get AltStore working (ask a friend with a computer to help set it up once)
2. Push your code to GitHub (use Working Copy app on iPhone)
3. GitHub Actions builds the IPA automatically
4. Download IPA from GitHub
5. Install via AltStore
```

After the first setup with AltStore, you can do everything from your iPhone!

## Already Have Developer Account?

If you have an Apple Developer account, you can also use TestFlight which is the most seamless option.

---

**Note**: iOS security requires some way to sign apps. The methods above are the standard ways to install custom apps without a Mac. AltStore is the most popular free method.

## Need Help?

- AltStore guide: https://altstore.io/faq/
- Sideloadly guide: https://sideloadly.io/#how-to-use
- r/sideloaded community on Reddit for help

Let me know which option works best for you and I can provide more specific instructions!
