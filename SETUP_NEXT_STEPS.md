# ✅ Render Monitoring Setup - Next Steps

Hệ thống monitoring tự động đã sẵn sàng! Chỉ cần 1 bước cuối để kích hoạt.

---

## 🎯 Bước Cuối: Add GitHub Secret (2 phút)

### **Để GitHub Actions có quyền check Render status, bạn cần:**

1. **Vào GitHub Settings:**
   - Repo: https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot
   - Click: Settings (top menu)
   - Click: Secrets and variables → Actions

2. **Tạo Secret mới:**
   - Click: "New repository secret"
   - **Name:** `RENDER_API_KEY`
   - **Secret:** `rnd_usp5xXVQ3IuEk4iaH7ihRW4ueQBD`
   - Click: "Add secret"

3. **Xác nhận:**
   - Bạn sẽ thấy: `RENDER_API_KEY` trong list secrets
   - Status: ✅ (dấu tick xanh)

---

## 🚀 Test Ngay (Tuỳ Chọn)

Sau khi thêm secret:

1. Vào: https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot/actions
2. Click: "Monitor Render Status" workflow
3. Click: "Run workflow"
4. Xem logs → Status báo cáo

**Kết quả mong muốn:**
```
✅ Running Services
   - network-security-audit-backend (service)
   - Region: us-east-1
   - Status: live

📊 Summary
   - Running: 2
   - Deploying: 0
   - Suspended: 0
   - Failed: 0
```

---

## 📅 Tự Động Chạy Lúc Nào?

**Sau khi secret được add:**

- ✅ Tự chạy mỗi 5 phút (Thứ 2-6, 9AM-5PM UTC)
- ✅ Hoặc chạy manual bất kỳ lúc nào
- ✅ Report được lưu 7 ngày

---

## 📊 Monitoring Dashboard

### **Xem status mỗi ngày:**

1. GitHub Actions tab:
   - https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot/actions
   - Click: "Monitor Render Status"
   - Xem latest run

2. Render Dashboard (vẫn cần check):
   - https://dashboard.render.com
   - Xem: Billing → Usage → Compute minutes
   - Warning nếu > 3000 min

---

## ✨ Bây Giờ Có Gì?

### **Tự động monitoring:**
- ✅ Workflow chạy auto mỗi 5 phút
- ✅ Check tất cả services
- ✅ Report health status
- ✅ Lưu history 7 ngày
- ✅ Cost: $0 (GitHub free tier)

### **Manual check:**
- ✅ Trigger workflow manual anytime
- ✅ Xem logs + artifacts
- ✅ Export status reports

### **Alert (future):**
- 🔲 Create issues nếu services down
- 🔲 Send Slack notification
- 🔲 Auto-restart failed services

---

## 🔒 Bảo Mật

- ✅ API key stored as GitHub Secret (encrypted)
- ✅ Key không show trong logs
- ✅ Chỉ dùng khi workflow chạy
- ✅ Access controlled by GitHub permissions

---

## 📝 Files Created

```
✅ .github/workflows/monitor-render-status.yml
   ↳ Workflow chạy auto mỗi 5 phút

✅ scripts/check_render_status.py
   ↳ Python script check Render API

✅ RENDER_MONITORING_SETUP.md
   ↳ Detailed setup guide

✅ SETUP_NEXT_STEPS.md
   ↳ This file
```

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Workflow fails with "401 Unauthorized" | API key sai hoặc Secret chưa add |
| No services showing | Verify có services trên Render dashboard |
| Workflow không chạy auto | Check secret đã được add đúng không |

---

## 📞 Khi Cần Help

1. Check detailed guide: `RENDER_MONITORING_SETUP.md`
2. Review workflow file: `.github/workflows/monitor-render-status.yml`
3. Test script locally: `export RENDER_API_KEY=xxx && python scripts/check_render_status.py`

---

## ✅ Checklist

- [ ] Add `RENDER_API_KEY` secret to GitHub
- [ ] Verify secret appears in Settings → Secrets
- [ ] (Optional) Trigger workflow manually to test
- [ ] (Optional) Check artifact output
- [ ] Bookmark Render dashboard: https://dashboard.render.com
- [ ] Bookmark GitHub Actions: https://github.com/kevin-nguyendad/huong-pharmacy-ai-copilot/actions
- [ ] ✅ DONE! Monitoring is now active

---

**Status:** 🚀 Ready to activate!

**Next Action:** Add RENDER_API_KEY secret → Monitoring will start automatically

**Last Updated:** 2026-08-13
