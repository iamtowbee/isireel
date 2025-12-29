# 📱 Telegram Auto-Delivery Setup

Get your IPA files sent directly to your iPhone via Telegram automatically! 🚀

## Quick Setup (5 Minutes)

### Step 1: Create a Telegram Bot

1. **Open Telegram** on your iPhone
2. **Search for** `@BotFather`
3. **Send** `/newbot`
4. **Choose a name**: `My IPA Delivery Bot` (or anything you like)
5. **Choose a username**: `yobi_ipa_bot` (must end with _bot)
6. **BotFather gives you a token** like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`
7. **Copy this token** (you'll need it!)

### Step 2: Get Your Chat ID

1. **Search for** `@userinfobot` in Telegram
2. **Send** any message to it
3. **It replies with your ID** like: `Your ID: 123456789`
4. **Copy this ID** (you'll need it!)

### Step 3: Start Your Bot

1. **Search for your bot** (the username you created)
2. **Press START**
3. **Send a test message**: "Hello!"

### Step 4: Add Secrets to GitHub

1. **Go to your GitHub repo**: `https://github.com/YOUR_USERNAME/isireel`
2. **Click** Settings (top right)
3. **Click** Secrets and variables → Actions (left sidebar)
4. **Click** "New repository secret"

**Add Secret #1:**
- Name: `TELEGRAM_BOT_TOKEN`
- Value: (paste the token from BotFather)
- Click "Add secret"

**Add Secret #2:**
- Name: `TELEGRAM_CHAT_ID`
- Value: (paste your ID from userinfobot)
- Click "Add secret"

### Step 5: Test It! 🎉

1. **Make any change** to your repo (or just push)
2. **GitHub Actions runs** automatically
3. **Wait ~10-15 minutes** for the build
4. **Check Telegram** - Your IPA appears! 📱

## How It Works

```
You push code to GitHub
         ↓
GitHub Actions builds IPA (automatically)
         ↓
Sends IPA to your Telegram bot
         ↓
You get notification on iPhone
         ↓
Download IPA from Telegram
         ↓
Open in AltStore → Installed! 🎉
```

## What You'll Receive

When the build completes, you'll get a Telegram message like:

```
🎉 New iOS Build Ready!

📱 App: AI Training Terminal
📦 File: AITrainerTerminal.ipa
💾 Size: 45.2 MB
🌿 Branch: claude/mobile-ai-training-app-vC6On
🔖 Commit: 4cdce31

📝 Add built-in IPA sideloader

✅ Download and install with AltStore!
```

Plus the actual IPA file attached!

## Installing from Telegram

### Method 1: Direct to AltStore (Easiest)

1. **Tap the IPA** in Telegram
2. **Tap "Open in..."**
3. **Select AltStore**
4. **Done!** App installs

### Method 2: Download First

1. **Tap the IPA** in Telegram
2. **Download** to Files
3. **Open Files app**
4. **Tap the IPA** → Open in AltStore
5. **Done!**

### Method 3: Use IPA Manager Tab

1. **Download IPA** from Telegram
2. **Open AI Training Terminal app**
3. **Go to IPAs tab**
4. The IPA will be available there!

## Customizing Messages

Want to change the Telegram message format? Edit `.github/workflows/build-ios.yml`:

```yaml
CAPTION="Your custom message here
📱 App: $IPA_NAME
💾 Size: $FILE_SIZE"
```

## Troubleshooting

### "Bot token not found"
- Make sure you added `TELEGRAM_BOT_TOKEN` secret correctly
- Check for typos in the secret name
- Token should start with a number like `1234567890:`

### "Chat ID not found"
- Make sure you added `TELEGRAM_CHAT_ID` secret correctly
- It should be just numbers like `123456789`
- Make sure you pressed START on your bot first

### "Build succeeds but no Telegram message"
- Check GitHub Actions logs for errors
- Verify both secrets are set
- Make sure you sent at least one message to your bot

### "File too large" error
- Telegram has a 50MB limit for bots
- If your IPA is >50MB, it won't send
- Consider reducing app size or using artifacts

## Privacy & Security

- ✅ Only you receive the IPAs (sent to your chat ID)
- ✅ Bot token is secret (stored in GitHub Secrets)
- ✅ Messages are encrypted by Telegram
- ✅ You can delete the bot anytime via @BotFather

## Pro Tips

**Tip 1: Group Chats**
Send to a group instead:
1. Add your bot to a group
2. Get the group chat ID (it's negative, like `-123456789`)
3. Use that as `TELEGRAM_CHAT_ID`

**Tip 2: Multiple Recipients**
Create multiple secrets:
- `TELEGRAM_CHAT_ID_1`, `TELEGRAM_CHAT_ID_2`, etc.
- Modify workflow to send to multiple IDs

**Tip 3: Build Notifications**
Get notified when builds start:
```yaml
- name: Notify build started
  run: |
    curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
      -d "chat_id=$TELEGRAM_CHAT_ID" \
      -d "text=🔨 Building new iOS app..."
```

**Tip 4: Only on Success**
The workflow already has `if: success()` so it only sends when build works!

## Cost

- **Telegram**: 100% FREE forever
- **GitHub Actions**: FREE (2000 minutes/month)
- **Storage**: FREE (Telegram stores files)

## Complete Workflow

```
1. You write code on iPhone (Working Copy app)
2. Push to GitHub
3. GitHub Actions builds (automatic, ~15 min)
4. IPA sent to your Telegram
5. Notification on iPhone
6. Download from Telegram
7. Install with AltStore
8. Enjoy your app!
```

**All from your iPhone! No Mac needed!** 🎉

## Example Secrets Setup

In GitHub → Settings → Secrets:

```
TELEGRAM_BOT_TOKEN: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID: 123456789
```

That's it! Now every time you push code, you get the IPA delivered to your iPhone! 📱✨

---

**Questions?**
- Telegram Bot docs: https://core.telegram.org/bots
- GitHub Actions docs: https://docs.github.com/actions
