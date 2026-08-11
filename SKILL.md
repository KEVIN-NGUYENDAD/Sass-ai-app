# 📰 Daily News Digest - Scheduled Task Prompt

**For Claude Code Desktop Scheduled Task** - Run at 2:00 PM ET daily

---

## Setup Instructions (Do This First)

1. **Copy this entire prompt** (everything below the "---" line)
2. **Open Claude Code Desktop** → Schedule → New Task
3. **Paste** this prompt into the "Prompt" field
4. **Set Schedule:** 2:00 PM ET, Every Day
5. **Click "Always allow"** when first prompted for permissions
6. **Save & Done!**

---

# TASK: Send Daily RSS News Digest Email

You are a Daily News Digest automation agent. Your job is to:

1. **Fetch news** from RSS feeds (Technology, Business, Science)
2. **Find & run** the email sending script
3. **Report status** with clear emoji indicators

## 🎯 Step 1: Navigate to Script Directory

Run this command to find the send_email.py script:

\`\`\`bash
ls -la ~/.claude/scheduled-tasks/daily-news-digest/
\`\`\`

Expected output: You should see:
- `send_email.py` ← The email script
- `.env` ← Credentials file (Gmail password)
- This prompt file

**If files are missing:** Stop and inform user files need to be copied to `~/.claude/scheduled-tasks/daily-news-digest/`

## 🎯 Step 2: Verify Environment File

Check that `.env` exists and is readable:

\`\`\`bash
test -f ~/.claude/scheduled-tasks/daily-news-digest/.env && echo "✅ .env exists" || echo "❌ .env not found"
\`\`\`

**If .env doesn't exist:** 
- Copy from `.env.example`:
  \`\`\`bash
  cp ~/.claude/scheduled-tasks/daily-news-digest/.env.example ~/.claude/scheduled-tasks/daily-news-digest/.env
  \`\`\`
- Edit `.env` with proper credentials (Gmail & App Password)

## 🎯 Step 3: Run Email Script

Execute the Python script to send today's news digest:

\`\`\`bash
cd ~/.claude/scheduled-tasks/daily-news-digest && python3 send_email.py
\`\`\`

**Expected output:**
```
INFO - Starting Daily News Digest
INFO - Fetching news from RSS feeds...
INFO - Processing Technology...
INFO - Processing Business...
INFO - Processing Science...
INFO - Generating email content...
INFO - Sending email...
INFO - ✅ Daily News Digest completed successfully
```

## 🎯 Step 4: Check Logs (Optional)

View the detailed log file to verify everything worked:

\`\`\`bash
tail -20 ~/.claude/scheduled-tasks/daily-news-digest/news_digest.log
\`\`\`

## 📋 Success Criteria

Report success if:
- ✅ Script runs without errors
- ✅ Log shows "Completed successfully"
- ✅ Email was sent to recipient address

Example log entry:
```
2024-08-11 14:00:15,123 - INFO - Email sent successfully to recipient@example.com
2024-08-11 14:00:15,456 - INFO - ✅ Daily News Digest completed successfully
```

## ⚠️ Troubleshooting

### Error: "No such file or directory"
→ Files not in `~/.claude/scheduled-tasks/daily-news-digest/`
→ Solution: Copy files from repo to correct directory

### Error: "SMTP Authentication Failed"
→ Gmail App Password incorrect or missing
→ Solution: Check `.env` file has correct `GMAIL_APP_PASSWORD`

### Error: ".env file not found"
→ `.env` file doesn't exist
→ Solution: Copy from `.env.example` and add credentials

### No email received
→ Check `.env` for correct `RECIPIENT_EMAIL`
→ Check spam folder
→ Verify Gmail App Password is correct (not regular password)

## 📊 What This Task Does

- **Fetches** 15 latest articles from 9 RSS feeds:
  - Technology: TechCrunch, The Verge, Ars Technica
  - Business: Bloomberg, CNBC, Reuters
  - Science: NASA, Nature, ScienceDaily

- **Creates** beautiful HTML email with:
  - Organized by category
  - Clickable links to full articles
  - Summary text for each article

- **Sends** via Gmail SMTP (secure, direct)

- **Logs** everything for debugging

## 🔄 Daily Automation

This task runs automatically at **2:00 PM ET** every day.

If you want to:
- **Change time:** Edit schedule in Claude Code Desktop (Schedule tab)
- **Add more RSS feeds:** Edit `send_email.py` `RSS_FEEDS` dict
- **Change recipient:** Update `RECIPIENT_EMAIL` in `.env`

## ✅ One-Time Setup Checklist

- [ ] Gmail 2-Step Verification is enabled
- [ ] Gmail App Password created (16 characters)
- [ ] Files copied to `~/.claude/scheduled-tasks/daily-news-digest/`
- [ ] `.env` file created with credentials
- [ ] Scheduled task created in Claude Code Desktop (2:00 PM ET)
- [ ] "Always allow" selected for permissions
- [ ] Test run successful (received email)

After setup, **no manual action needed** — task runs automatically every day!

---

## 📞 Support / Debugging

If task fails:
1. Check logs: `tail ~/.claude/scheduled-tasks/daily-news-digest/news_digest.log`
2. Verify `.env` credentials
3. Test manually: `cd ~/.claude/scheduled-tasks/daily-news-digest && python3 send_email.py`
4. Check spam folder in Gmail

---

**This prompt was auto-generated for Claude Code Desktop Scheduled Tasks**  
**Version:** 1.0  
**Last Updated:** 2024-08-11
