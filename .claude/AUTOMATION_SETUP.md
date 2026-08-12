# 🤖 Automation Setup Guide

**3 cách để hoàn toàn tự động hóa Harness - Không cần nhớ gì!**

---

## 📋 Các File Đã Được Tạo

### 1. ✅ `.claude/settings.json` - Auto-Activate Hook
**Purpose:** Tự động nhắc nhở harness khi mở project  
**Status:** Đã tạo và sẵn sàng  

```json
{
  "hooks": {
    "on_session_start": {
      "command": "echo '🚀 Harness ready! Run: harness dev start-server'",
      "description": "Remind user harness is active on session start"
    }
  },
  "aliases": {
    "start": "harness dev start-server",
    "test": "harness test run-tests",
    "lint": "harness test lint-code",
    "deploy": "harness deploy verify-deployment"
  }
}
```

**Khi bạn mở project:**
```
🚀 Harness ready! Run: harness dev start-server
```

---

### 2. ✅ `scripts/setup-harness.sh` - Setup Script
**Purpose:** Tự động setup harness cho dự án mới  
**Status:** Đã tạo, executable, sẵn sàng

**Cách dùng:**
```bash
bash scripts/setup-harness.sh my-project 5000
# Tự động:
# ✅ Copy harness template
# ✅ Cập nhật tên & port
# ✅ Tạo settings.json
# ✅ Lưu log backup
```

**Output:**
```
✅ Files created:
  1. .claude/harness.yml
  2. .claude/settings.json

✅ Next steps:
  1. Install dependencies: pip install -r requirements.txt
  2. Start server: harness dev start-server
  3. Run tests: harness test run-tests
```

---

### 3. ✅ `.claude/harness-template.yml` - Harness Template
**Purpose:** Template có sẵn để copy cho dự án mới  
**Status:** Đã tạo, có comments hướng dẫn

**Điểm cần cập nhật (có comment 👈):**
```yaml
structure:
  source_dirs:
    - app_dir          # 👈 Change this to your app directory

deployment:
  platform: "render"  # 👈 Change if using different platform

env_vars:
  # 👈 Add your project-specific vars here
```

---

### 4. ✅ `.claude/HARNESS_CHEATSHEET.md` - Quick Reference
**Purpose:** Cheatsheet để không quên commands  
**Status:** Đã tạo, ready to use

**Quick commands:**
```bash
harness dev start-server      # Start server
harness test run-tests        # Run tests
harness test lint-code        # Check quality
harness deploy verify-deploy  # Deploy
```

**Aliases (từ settings.json):**
```bash
/start    # Start server
/test     # Run tests
/lint     # Check code
/deploy   # Deploy
```

---

## 🚀 Cách Sử Dụng

### Cho Dự Án Hiện Tại (Huong Pharmacy)

**Bước 1: Harness đã ready sẵn**
```bash
# File này đã tồn tại:
✅ .claude/harness.yml
✅ .claude/settings.json
✅ .claude/HARNESS_CHEATSHEET.md

# Chỉ cần dùng:
harness dev start-server
```

**Bước 2: Use aliases (nếu muốn gõ nhanh)**
```bash
/start    # Instead of: harness dev start-server
/test     # Instead of: harness test run-tests
/lint     # Instead of: harness test lint-code
```

---

### Cho Dự Án Tiếp Theo (Hoàn Toàn Tự Động)

**Scenario 1: Dùng Setup Script (Recommended - 5 phút)**

```bash
# Bước 1: Clone repo mới
git clone <new-project>
cd <new-project>

# Bước 2: Copy setup script từ huong-pharmacy
cp /path/to/huong-pharmacy/scripts/setup-harness.sh scripts/

# Bước 3: Chạy setup (TỰ ĐỘNG!)
bash scripts/setup-harness.sh my-new-app 5001

# Bước 4: Ready! Chỉ cần chạy
harness dev start-server
```

**Script sẽ tự động:**
- ✅ Copy harness template
- ✅ Cập nhật project name
- ✅ Cập nhật port
- ✅ Tạo settings.json
- ✅ Lưu backup + log

---

**Scenario 2: Manual Copy (Nếu không thích script - 10 phút)**

```bash
# Bước 1: Copy harness files
cp /path/to/huong-pharmacy/.claude/harness-template.yml .claude/harness.yml
cp /path/to/huong-pharmacy/.claude/settings.json .claude/

# Bước 2: Edit harness.yml (thay đổi):
nano .claude/harness.yml
# - Tên project
# - Paths
# - Port
# - Cấu hình khác

# Bước 3: Ready!
harness dev start-server
```

---

### Cho Team (Share Configuration)

**Tất cả team members sẽ tự động có harness:**

```bash
# Khi clone repo:
git clone <project>
cd <project>

# 🚀 Auto-activation hook chạy:
# "🚀 Harness ready! Run: harness dev start-server"

# Mọi người chỉ cần:
harness dev start-server
```

**Không cần:**
- ❌ Document setup
- ❌ Troubleshoot environment
- ❌ Nhớ commands
- ❌ Hỏi "làm sao để setup?"

---

## 📊 So Sánh: Trước vs Sau

### ❌ TRƯỚC (Không Automation)
```bash
# Dev A setup:
$ pip install -r requirements.txt
$ mkdir -p data
$ python app.py
$ # Quên cài Twilio
$ # Quên create data folder
$ # Lỗi! Phải troubleshoot

# Dev B setup:
$ git clone ...
$ # "Bạn làm gì để setup?"
$ # "Hm... python app.py? Nhưng cần pip install trước"
$ # Mất 1 giờ setup + troubleshooting

# New project C:
$ # Copy setup từ project A?
$ # Hay project B?
$ # Khác port? Khác dependencies?
$ # Phải tự viết harness lại từ đầu
```

### ✅ SAU (Với Automation)
```bash
# Dev A setup:
$ harness dev start-server
# Done! 2 phút, 0 lỗi

# Dev B setup:
$ git clone ...
# Hook tự chạy: "🚀 Harness ready!"
$ harness dev start-server
# Done! 2 phút, 0 troubleshooting

# New project C:
$ bash scripts/setup-harness.sh my-app 5001
# Tự động setup everything
$ harness dev start-server
# Done! 5 phút, 100% consistent
```

---

## 🔄 Workflow Hoàn Toàn Tự Động

### Ngày 1: Setup Dự Án Mới

```bash
# Copy setup script từ repo cũ
cp /huong-pharmacy/scripts/setup-harness.sh .

# Chạy auto-setup (1 command!)
bash setup-harness.sh my-salon-app 5000

# Output:
# ✅ Files created
# ✅ Next steps
# ✅ Happy coding!

# Start immediately
harness dev start-server
```

---

### Ngày 2+: Normal Development

```bash
# Mỗi lần code:
$ /start              # Start server (alias)
$ /test               # Run tests (alias)
$ /lint               # Check code (alias)

# Trước push:
$ /test && git push   # Tự động test → push

# Deploy:
$ /deploy             # Deploy to production
```

---

### Team Onboarding (Mới vào team)

```bash
# Dân developer mới chỉ cần:
$ git clone <project>
$ harness dev start-server

# DONE! 🎉
# Không cần:
- ❌ "Bạn làm gì để setup?"
- ❌ Nghe 20 phút hướng dẫn
- ❌ Troubleshoot environment
- ❌ Setup sai → fix → setup lại
```

---

## 📝 Checklists

### ✅ Automation Setup Checklist (Dự Án Hiện Tại)

```
✅ .claude/settings.json
   └─ on_session_start hook
   └─ aliases configured

✅ .claude/harness.yml
   └─ project name set
   └─ paths configured
   └─ port set to 5050

✅ scripts/setup-harness.sh
   └─ executable (+x permission)
   └─ ready for new projects

✅ .claude/harness-template.yml
   └─ template ready
   └─ placeholders documented

✅ .claude/HARNESS_CHEATSHEET.md
   └─ quick reference ready
   └─ all commands listed

✅ .claude/AUTOMATION_SETUP.md
   └─ this file
   └─ documentation complete
```

### ✅ New Project Setup Checklist

```
□ Copy scripts/setup-harness.sh
□ Run: bash setup-harness.sh my-app
□ Verify: ls -la .claude/
   ├─ harness.yml (tạo từ template)
   └─ settings.json (tạo tự động)
□ Test: harness dev start-server
□ Run: harness test run-tests
□ Commit & push
```

---

## 🎯 Summary

### 3 Cách Automation

| Cách | Tự Động? | Dễ? | Tốc Độ | Cho Ai? |
|------|---------|-----|--------|--------|
| **Hook** | ✅ Yes | ✅ Easy | ⚡ 0 min | Existing projects |
| **Script** | ✅ Yes | ✅ Easy | ⚡ 1 min | New projects |
| **Aliases** | ✅ Yes | ✅ Easy | ⚡ 0 min | Daily development |

### Kết Luận

**Bạn không cần nhớ gì vì:**

1. ✅ **Hook tự chạy** - Nhắc nhở khi mở project
2. ✅ **Script tự setup** - Auto-configure cho dự án mới
3. ✅ **Aliases sẵn** - Gõ nhanh (ví dụ: `/start`)
4. ✅ **Cheatsheet có** - Quick reference luôn sẵn

**Bạn chỉ cần:**
- Clone project → harness auto-ready
- Run setup script → cấu hình tự động
- Use aliases → gõ nhanh
- Refer cheatsheet → khi cần

---

## 📚 File References

| File | Purpose | Khi Dùng |
|------|---------|----------|
| `.claude/settings.json` | Auto-activation | Luôn (tự chạy) |
| `.claude/harness.yml` | Main config | Mỗi lần start server |
| `.claude/harness-template.yml` | Template | Để copy cho dự án mới |
| `scripts/setup-harness.sh` | Auto-setup | Khi tạo project mới |
| `.claude/HARNESS_CHEATSHEET.md` | Quick ref | Khi quên commands |
| `.claude/HARNESS_GUIDE.md` | Full docs | Khi cần chi tiết |

---

**Setup hoàn toàn tự động = ✅ DONE!**

Bạn có thể tập trung vào code, không cần lo về setup! 🎉
