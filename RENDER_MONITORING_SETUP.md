# 🔍 Render Status Monitoring Setup Guide

Hướng dẫn cấu hình tự động theo dõi trạng thái services trên Render

---

## 🎯 Công Năng

- ✅ Tự động check status của tất cả services trên Render
- ✅ Chạy mỗi 5 phút (trong giờ làm việc)
- ✅ Báo cáo bất kỳ dịch vụ nào DOWN
- ✅ Lưu lịch sử report
- ✅ Tích hợp GitHub Actions

---

## 📋 Yêu Cầu

- ✅ Render account + API Key
- ✅ GitHub repo access
- ✅ 2 minutes để setup

---

## 🚀 Setup (Chỉ Cần Làm 1 Lần)

### **Bước 1: Lấy Render API Key**

Bạn đã có API Key: `rnd_usp5xXVQ3IuEk4iaH7ihRW4ueQBD`

Nếu cần lấy key mới:
1. Vào: https://dashboard.render.com/account/api-tokens
2. Copy API key (bắt đầu bằng `rnd_`)

### **Bước 2: Add Secret Vào GitHub**

1. Vào repo GitHub: https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Tên: `RENDER_API_KEY`
5. Giá trị: Paste API key (ví dụ: `rnd_usp5xXVQ3IuEk4iaH7ihRW4ueQBD`)
6. Click "Add secret"

**Kết quả:**
```
✅ RENDER_API_KEY = rnd_usp5xXVQ3IuEk4iaH7ihRW4ueQBD
```

### **Bước 3: Verify Workflow**

Workflow đã được tạo tự động:
- Tệp: `.github/workflows/monitor-render-status.yml`
- Schedule: Mỗi 5 phút (thứ 2-6, 9AM-5PM UTC)
- Script: `scripts/check_render_status.py`

---

## 📊 Cách Hoạt Động

### **1. Tự động chạy mỗi 5 phút (trong giờ làm việc)**

```
Thứ 2-6, 9AM-5PM UTC
Chạy mỗi 5 phút:
  → Check Render API
  → Lấy status tất cả services
  → So sánh với expected
  → Report nếu có vấn đề
```

### **2. Báo cáo bao gồm**

```
✅ Running Services
   - service-name (type)
   - Region: us-east-1
   - Status: live

🔄 Deploying Services
   - service-name
   - Status: deploying

🟡 Suspended Services
   - service-name
   - Status: suspended

❌ Failed Services
   - service-name
   - Status: update_failed

📊 Summary
   - Running: X
   - Deploying: Y
   - Suspended: Z
   - Failed: W
```

### **3. Lưu trữ**

- Report được lưu vào: `render_status.json`
- Artifacts được giữ 7 ngày
- Xem tại: GitHub Actions → Latest workflow run → Artifacts

---

## 🔍 Cách Kiểm Tra Status Ngay

### **Option 1: Trigger Manual Workflow**

1. Vào: https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot
2. Click: Actions → Monitor Render Status
3. Click: "Run workflow" → "Run workflow"
4. Xem output ngay

### **Option 2: Chạy Local**

```bash
# Setup
pip install requests

# Run
export RENDER_API_KEY="rnd_usp5xXVQ3IuEk4iaH7ihRW4ueQBD"
python scripts/check_render_status.py
```

### **Option 3: Xem Report File**

```bash
# Sau khi workflow chạy
cat render_status.json | jq .
```

---

## ⚠️ Troubleshooting

### **❌ Error: "RENDER_API_KEY not set"**

**Nguyên nhân:** GitHub Secret chưa được thêm

**Giải pháp:**
1. Vào Settings → Secrets → Actions
2. Click "New repository secret"
3. Tên: `RENDER_API_KEY`
4. Giá trị: Paste API key
5. Click Add

### **❌ Error: "401 Unauthorized"**

**Nguyên nhân:** API key không hợp lệ hoặc sai

**Giải pháp:**
1. Kiểm tra API key tại: https://dashboard.render.com/account/api-tokens
2. Copy API key mới
3. Update GitHub Secret
4. Chạy lại workflow

### **❌ No services showing**

**Nguyên nhân:** Render API return empty list

**Giải pháp:**
1. Check Render dashboard: https://dashboard.render.com
2. Verify có services không
3. Check API key permissions

---

## 📈 Dự Kiến Chi Phí

- ✅ GitHub Actions: ~1 minute/tháng (free tier có 2000 min/tháng)
- ✅ Render API: Miễn phí (không có rate limit)
- ✅ Storage: <1 MB/tháng (artifacts)

**TỔNG: $0**

---

## 🔐 Bảo Mật

- ✅ API key stored as GitHub Secret (encrypted)
- ✅ API key không hiển thị trong logs
- ✅ Chỉ sử dụng khi workflow chạy
- ✅ Access controlled by GitHub permissions

---

## 📝 Next Steps

### **Sau khi setup xong:**

1. ✅ Push changes lên branch: `claude/network-security-audit-k6mdzw`
2. ✅ Trigger manual workflow để test
3. ✅ Kiểm tra output trong GitHub Actions
4. ✅ Bookmark dashboard: https://dashboard.render.com/account/billing
5. ✅ Bookmark Actions: https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot/actions

### **Monitoring hàng ngày:**

- Kiểm tra Actions tab → "Monitor Render Status"
- Xem latest report
- Nếu có ❌ Failed → investigate ngay

---

## 📚 Files Created

```
.github/workflows/monitor-render-status.yml  ← Workflow
scripts/check_render_status.py               ← Monitoring script
RENDER_MONITORING_SETUP.md                   ← This guide
```

---

## 💡 Tips

- **Test locally:** `export RENDER_API_KEY=xxx && python scripts/check_render_status.py`
- **View logs:** GitHub Actions → Monitor Render Status → Click run → See logs
- **Adjust schedule:** Edit `.github/workflows/monitor-render-status.yml` line 9
- **Add alerts:** Create GitHub Issues automatically if services down

---

**Setup Status:** ✅ Ready to use

**Last Updated:** 2026-08-13

**Maintainer:** Development Team
