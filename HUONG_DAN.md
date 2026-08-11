# 📰 Hướng Dẫn: Hệ Thống RSS News Digest Email Tự Động

## 🎯 Mục Tiêu
Hệ thống tự động tìm tin từ RSS feeds, tóm tắt bằng AI, và gửi email hàng ngày lúc 2pm ET.

---

## 📋 Yêu Cầu Tiên Quyết

1. **Claude Code Desktop** (phiên bản mới nhất)
2. **Gmail Account** (để gửi email)
3. **Quyền truy cập máy tính** (để chạy scheduled task)
4. **Python 3.8+** (trên máy)

---

## 🔧 Bước 1: Thiết Lập Gmail App Password

### 1.1 Bật 2-Step Verification
- Truy cập: https://myaccount.google.com/security
- Scroll xuống "How you sign in to Google"
- Click "2-Step Verification" → Follow các bước

### 1.2 Tạo App Password
- Truy cập: https://myaccount.google.com/apppasswords
- Chọn: **Mail** → **Windows Computer** (hoặc thiết bị của bạn)
- Click **Create**
- **Copy** mật khẩu 16 ký tự mà Google sinh ra

**⚠️ Lưu ý:** Đây là mật khẩu RIÊNG cho ứng dụng, không phải mật khẩu Gmail thường

---

## 📁 Bước 2: Setup Thư Mục & File

### 2.1 Tạo Thư Mục
```bash
# macOS / Linux
mkdir -p ~/.claude/scheduled-tasks/daily-news-digest

# Windows (PowerShell)
New-Item -ItemType Directory -Path "$env:USERPROFILE\.claude\scheduled-tasks\daily-news-digest" -Force
```

### 2.2 Copy 3 File Vào Thư Mục
Lấy từ repo: `huong-pharmacy-ai-copilot/`

```
~/.claude/scheduled-tasks/daily-news-digest/
├── send_email.py        ← Script gửi email
├── .env                 ← File chứa mật khẩu (copy từ .env.example)
└── SKILL.md            ← Prompt cho scheduled task
```

### 2.3 Cấu Hình File `.env`

**Tạo file `.env` từ `.env.example`:**

```bash
cp .env.example .env
```

**Nội dung `.env` (ví dụ):**
```
GMAIL_ADDRESS=your_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
RECIPIENT_EMAIL=recipient@example.com
```

**Ghi chú:**
- `GMAIL_ADDRESS`: Email Gmail của bạn
- `GMAIL_APP_PASSWORD`: Mật khẩu 16 ký tự từ Bước 1.2
- `RECIPIENT_EMAIL`: Email người nhận (có thể giống với GMAIL_ADDRESS)

---

## 🤖 Bước 3: Tạo Scheduled Task Trong Claude Code Desktop

### 3.1 Mở Claude Code Desktop
1. Mở ứng dụng **Claude Code Desktop**
2. Mở repo: `huong-pharmacy-ai-copilot`

### 3.2 Tạo Scheduled Task
1. Click menu **Schedule** (hoặc nút lịch) ở sidebar
2. Click **New Task** / **Create New Schedule**
3. Đặt tên: `Daily News Digest`

### 3.3 Cấu Hình Task
**Prompt:**
- Copy toàn bộ nội dung từ file `SKILL.md`
- Paste vào trường "Prompt"

**Lịch:**
- Loại: **Recurring**
- Thời gian: **2:00 PM ET** (hoặc giờ khác tùy bạn)
- Tần suất: **Every day**

**Quyền hạn:**
- Chọn **Always allow** (để không bị treo chờ duyệt quyền)

### 3.4 Kích Hoạt Task
1. Click **Save** hoặc **Create**
2. Task sẽ chạy vào lúc quy định mỗi ngày

---

## ✅ Bước 4: Test Hệ Thống

### 4.1 Test Script Trực Tiếp (Tuỳ Chọn)
```bash
cd ~/.claude/scheduled-tasks/daily-news-digest

# Test gửi email
python send_email.py
```

### 4.2 Kiểm Tra Hộp Thư
- Kiểm tra hộp thư của `RECIPIENT_EMAIL`
- Email nên có chứa:
  - **Tiêu đề:** "📰 Daily News Digest - [ngày]"
  - **Nội dung:** Tóm tắt tin từ các RSS feeds

### 4.3 Kiểm Tra Logs (Tuỳ Chọn)
```bash
# Xem file log (nếu được lưu)
cat ~/.claude/scheduled-tasks/daily-news-digest/news_digest.log
```

---

## 🐛 Xử Lý Sự Cố

### Vấn đề 1: "SMTP Authentication Failed"
**Nguyên nhân:** Sai mật khẩu hoặc chưa bật 2-Step
**Giải pháp:**
1. Kiểm tra file `.env` - mật khẩu có đúng không?
2. Đảm bảo đã bật 2-Step Verification
3. Tạo mới App Password và cập nhật `.env`

### Vấn đề 2: "No such file or directory: .env"
**Nguyên nhân:** File `.env` chưa được tạo
**Giải pháp:**
```bash
cp .env.example .env
# Điền thông tin vào .env
```

### Vấn đề 3: Task không chạy vào đúng giờ
**Nguyên nhân:** Máy tính đã tắt hoặc Claude Code Desktop không mở
**Giải pháp:**
- Giữ Claude Code Desktop mở 24/7 (hoặc dùng máy chủ)
- Hoặc cấu hình để task chạy vào lần mở lại Claude Code

### Vấn đề 4: RSS feed không có tin mới
**Giải pháp:**
- Kiểm tra list RSS feed trong `SKILL.md`
- Thêm RSS feed khác nếu muốn
- RSS feed có thể không cập nhật hàng ngày

---

## 📊 Cấu Trúc Email

Email sẽ có định dạng:

```
📰 Daily News Digest - 2024-08-11

=== TECHNOLOGY ===

🔹 Tin 1
Tóm tắt: [2-3 dòng]
Nguồn: [Tên RSS Feed]
Link: [URL]

🔹 Tin 2
...

=== BUSINESS ===

🔹 Tin 3
...

=== SCIENCE ===
...
```

---

## 🚀 Tùy Chỉnh Nâng Cao

### Thay Đổi RSS Feeds
Chỉnh sửa biến `RSS_FEEDS` trong file `SKILL.md`:

```python
RSS_FEEDS = {
    "Technology": "https://feeds.example.com/tech",
    "Business": "https://feeds.example.com/business",
    # Thêm RSS feed khác ở đây
}
```

### Thay Đổi Thời Gian Gửi
Trong Claude Code Desktop, chỉnh schedule thành giờ khác:
- **3:00 PM ET** → `3:00 PM ET`
- **9:00 AM ET** → `9:00 AM ET`
- Etc.

### Thay Đổi Người Nhận
Chỉnh sửa `RECIPIENT_EMAIL` trong `.env`:

```
RECIPIENT_EMAIL=another_email@example.com
```

---

## 📝 Checklist Cuối Cùng

- [ ] Đã bật 2-Step Verification trên Gmail
- [ ] Đã tạo App Password (16 ký tự)
- [ ] Đã tạo thư mục `~/.claude/scheduled-tasks/daily-news-digest/`
- [ ] Đã copy file `send_email.py` vào thư mục
- [ ] Đã tạo file `.env` với credentials đúng
- [ ] Đã tạo scheduled task trong Claude Code Desktop
- [ ] Đã test gửi email (nên nhận được email)
- [ ] Claude Code Desktop chạy 24/7 (hoặc theo lịch)

---

## 🎯 Cách Sử Dụng Hàng Ngày

**Không cần làm gì!** Task sẽ chạy tự động lúc 2pm ET mỗi ngày.

Chỉ cần:
1. ✅ Giữ Claude Code Desktop mở (hoặc máy tính bật)
2. ✅ Kiểm tra email hàng ngày
3. ✅ (Tuỳ chọn) Cập nhật RSS feeds nếu muốn

---

## 💡 Tips & Tricks

- **Backup `.env`:** Lưu sao lưu file `.env` ở nơi an toàn
- **Log Check:** Xem `news_digest.log` nếu muốn biết chi tiết task chạy
- **Multiple Recipients:** Để gửi nhiều người, sửa code `send_email.py`
- **HTML Email:** Email được gửi dạng HTML (bảng, định dạng)

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra phần "Xử Lý Sự Cố" ở trên
2. Kiểm tra logs (nếu có)
3. Đảm bảo `.env` file được cấu hình đúng
4. Thử test script trực tiếp: `python send_email.py`

---

**Status:** ✅ Production Ready  
**Last Updated:** 2024-08-11  
**Version:** 1.0
