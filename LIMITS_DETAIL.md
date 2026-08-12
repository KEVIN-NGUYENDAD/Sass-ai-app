# 📊 CHI TIẾT TỪng HẠN MỤC - Tự Kiểm Tra Từng Cái

**Bản hướng dẫn chi tiết để bạn kiểm tra và theo dõi tất cả các hạn mức của từng dịch vụ**

---

## 🎯 NHANH NHẤT: Bảng So Sánh Hạn Mục

| Dịch vụ | Hạn mục | Hiện tại | % Sử dụng | Nguy hiểm? |
|---------|---------|---------|-----------|-----------|
| **Render - Compute** | 5000 min/tháng | ? | ? | 🔴 CAO |
| **Render - Disk** | 100 GB | ? | ? | 🟢 THẤP |
| **Twilio - SMS** | Unlimited* | 0 | 0% | 🔴 NGUY HIỂM |
| **GitHub - Actions** | 2000 min/tháng | ? | ? | 🟢 THẤP |
| **GitHub - Storage** | 100 GB free | ? | ? | 🟢 THẤP |
| **Render - Bandwidth** | Unlimited | ? | ? | 🟢 THẤP |

*Twilio không có hạn mục nhưng TRẢ TIỀN PER SMS

---

## 1️⃣ RENDER - CÓ HẠN MỤC CHẶT NHẤT ⚠️

### 1.1 Compute Minutes (QUAN TRỌNG NHẤT)

**Hạn mục:**
```
Free Tier: 5,000 minutes/tháng
Starter: UNLIMITED (nhưng tính phí $7/service/tháng)
```

**Cách tính:**
```
1 service chạy 24/7 trong 1 tháng = ?
= 60 min/hour × 24 hour/day × 30 day/month
= 43,200 minutes

Vậy: 1 service Free Tier sẽ VƯỢT quá!
2 services (backend + frontend) = 86,400 minutes
→ QUAY CÓ SỰ CỐ!
```

**Kiểm tra cách nào:**

📱 **Trên Render Dashboard:**
```
1. Vào: https://dashboard.render.com
2. Chọn tab: Billing
3. Xem: "Usage" section
4. Kiếm: "Compute" hoặc "Instance hours"
5. Nhìn số hiện tại vs 5000
```

📊 **Cách đọc:**
```
✅ 0-1000 min:    Bình thường (20% sử dụng)
✅ 1000-3000 min: OK (20-60%)
🟡 3000-4500 min: Cảnh báo (60-90%)
🔴 4500-5000 min: NGUY HIỂM (90-100%)
🔴 5000+ min:    ĐÃ VƯỢT → Services tắt!
```

**Khi vượt hạn mục:**
```
❌ Services sẽ TỰ ĐỘNG TẮT
❌ App không hoạt động
❌ Phải chờ đến tháng sau để reset
✅ Giải pháp: Nâng Starter ($7/tháng)
```

**Cách tính nhanh:**
```
Nếu backend chạy 24/7 × 30 ngày = 43,200 min
Nếu frontend chạy 24/7 × 30 ngày = 43,200 min
TỔNG = 86,400 min >> 5000 min
→ CHẮC CHẮN VƯỢT! Phải nâng Starter.
```

---

### 1.2 Disk Storage (Ít quan trọng hơn)

**Hạn mục:**
```
Free Tier: 100 GB
Starter: 100 GB (sau đó tính thêm)
```

**Cách tính:**
```
Backend (Flask): ~500 MB (với dependencies)
Frontend (React): ~200 MB (với node_modules)
Database (nếu có): tùy
Logs: ~10-100 MB/tháng (tùy mức độ)

Bạn hiện tại sử dụng: < 1 GB
→ An toàn (sử dụng <1% hạn mục)
```

**Kiểm tra:**
```
1. Render Dashboard → Chọn service
2. Tab: Metrics/Disk
3. Xem: Disk Usage (GB)
```

---

### 1.3 Bandwidth (Ít quan trọng)

**Hạn mục:**
```
Free Tier: ~100 GB bandwidth/tháng (thường không bị tính chặt)
Starter: Unlimited
```

**Cách tính:**
```
1 req: ~50 KB (average)
1000 req/tháng = 50 MB
Bạn: Có lẽ < 100 MB/tháng
→ An toàn
```

---

## 2️⃣ TWILIO - NGUY HIỂM NHẤT (KHÔNG CÓ HẠN MỤC!) 🔴

### 2.1 SMS - Pay Per Use

**Hạn mục:**
```
❌ KHÔNG CÓ HẠN MỤC!
✅ Miễn phí tạo tài khoản
🔴 TRẢ TIỀN NGAY KHI GỬDI SMS
```

**Giá cả:**
```
Gửi SMS (outbound):  $0.0075/SMS (mỗi tin nhắn)
Nhận SMS (inbound):  $0.02/SMS
```

**Ví dụ chi phí:**
```
1 customer check-in:
  - Gửi SMS cho owner:     $0.0075
  - Gửi SMS cho customer:  $0.0075
  - TỔNG per check-in:     $0.015

100 check-in/tháng:  $1.50
1000 check-in/tháng: $15
10,000 check-in/tháng: $150 ⚠️
```

**Kiểm tra:**
```
1. Vào: https://www.twilio.com/console
2. Chọn: Account → Billing
3. Xem: "Estimated Usage"
4. Tìm: "Messaging" section
5. Xem: Total charges to date
```

**Cách đọc Twilio Billing:**
```
Tab: "Billing"
  ├─ Overview: Hiện tại charge
  ├─ Usage: Chi tiết từng loại
  │   ├─ Messaging → SMS charges
  │   ├─ Logs
  │   └─ etc.
  └─ Payment methods: Card trên file

Red Flag: Charges bất ngờ → Check "Usage" ngay
```

**Khi bị charge:**
```
1. Vào Usage → Messaging
2. Xem "Message Logs"
3. Kiểm tra số lượng SMS sent vs nhận được
4. Nếu lạ → disable Twilio ngay
5. Liên hệ Twilio support (có thể refund)
```

---

## 3️⃣ GITHUB - AN TOÀN

### 3.1 Actions - Compute Minutes

**Hạn mục:**
```
Free: 2000 min/tháng
Pro/Org: Tùy plan
```

**Bạn đang dùng:**
```
render-deploy.yml: ~1 min per run
Chạy khoảng 1-2 lần/tháng
Ước tính: ~2-4 min/tháng

→ An toàn! (dùng <1% hạn mục)
```

**Kiểm tra:**
```
1. Vào: https://github.com/settings/billing
2. Chọn: "Actions" section
3. Xem: "Shared storage" and "Minutes included"
4. Kiếm dòng: "X of 2,000 minutes"
```

**Cách đọc:**
```
Nếu hiển thị: "45 of 2,000 minutes used"
→ Đã dùng 45 phút, còn 1955 phút
→ An toàn! (2% sử dụng)
```

---

## 4️⃣ NETWORK SECURITY AUDIT (KHÔNG CÓ HẠN MỤC) ✅

**API được dùng:**
```
✅ socket (port scanning)  - Miễn phí
✅ os, platform           - Miễn phí
✅ requests (HTTP)        - Miễn phí
```

**Hạn mục:** KHÔNG CÓ
**Chi phí:** $0
**Nguy hiểm:** Không

---

## 🔍 KIỂM TRA CHI TIẾT HÀNG TUẦN

### Thứ 2 Hàng Tuần (5 phút):

#### ✅ BƯỚC 1: Render (2 phút)
```
1. Mở: https://dashboard.render.com
2. Xem Billing Tab:
   ├─ Compute: ______ / 5000 min
   ├─ Disk: ______ / 100 GB
   └─ Bandwidth: ______ GB
3. Viết vào Notepad: "08/12: compute=500, disk=1GB"
4. So sánh với tuần trước:
   - Tăng bao nhiêu?
   - Có bất thường không?
```

**Đỏ cờ nếu:**
- Compute > 3000 min (chưa hết tháng)
- Disk > 50 GB (lớn bất thường)
- Bandwidth > 500 MB (dị thường)

---

#### ✅ BƯỚC 2: Twilio (2 phút)
```
1. Mở: https://www.twilio.com/console
2. Chọn: Billing
3. Kiếm: "Estimated Usage"
4. Xem: Messaging charges
5. Viết vào Notepad: "08/12: charges=$0"
6. Kiểm tra:
   - Có charge nào không?
   - Nếu có, bao nhiêu?
   - Có SMS nào được gửi không?
```

**Đỏ cờ nếu:**
- Có charge khi Twilio disabled
- Số SMS sent không khớp check-in count
- Charge > expected

---

#### ✅ BƯỚC 3: GitHub (1 phút)
```
1. Mở: https://github.com/settings/billing
2. Chọn: Actions
3. Kiếm: "X of 2,000 minutes"
4. Viết: "08/12: actions=45/2000 min"
5. Kiểm tra:
   - Còn đủ không?
   - Dự tính cuối tháng có vượt không?
```

**Đỏ cờ nếu:**
- > 1500 min (tuần 1 tháng)
- > 1000 min (tuần 2)
- > 500 min (tuần 3)
- > 100 min (tuần 4)

---

## 📋 TRACKING SHEET (Copy vào Notepad/Excel)

```
WEEKLY MONITORING SHEET - August 2026

Week 1 (08/05-08/11):
  Render Compute:  ____ / 5000 min
  Render Disk:     ____ / 100 GB
  Twilio Charges:  $____
  GitHub Actions:  ____ / 2000 min
  Notes: _________________________

Week 2 (08/12-08/18):
  Render Compute:  ____ / 5000 min
  Render Disk:     ____ / 100 GB
  Twilio Charges:  $____
  GitHub Actions:  ____ / 2000 min
  Notes: _________________________

Week 3 (08/19-08/25):
  Render Compute:  ____ / 5000 min
  Render Disk:     ____ / 100 GB
  Twilio Charges:  $____
  GitHub Actions:  ____ / 2000 min
  Notes: _________________________

Week 4 (08/26-09/01):
  Render Compute:  ____ / 5000 min
  Render Disk:     ____ / 100 GB
  Twilio Charges:  $____
  GitHub Actions:  ____ / 2000 min
  Notes: _________________________

TỔNG CHI PHÍ THÁNG: $____
```

---

## 🚨 EMERGENCY: KHI VỀ HẠN MỤC

### Nếu Render Compute gần 5000 min:

**Biểu hiện:**
```
❌ Dashboard hiển thị: "4800 / 5000 min"
❌ Email từ Render cảnh báo
❌ Services còn chạy nhưng sắp tắt
```

**Hành động NGAY:**
```
1. ⚠️ KHÔ-NG BỎ QUA
2. Upgrade Starter ($7/service/tháng):
   - Vào: Render Dashboard
   - Chọn service
   - Plan: Starter
   - Pay (add card nếu chưa có)
3. Confirm: Status thay đổi thành "Starter"
```

**Nếu chưa kịp upgrade:**
```
- Services sẽ TỰ ĐỘNG TẮT
- App không hoạt động
- Phải chờ tháng sau (hoặc upgrade để restart)
- Upgrade ngay để khôi phục
```

---

### Nếu Twilio có charge bất ngờ:

**Biểu hiện:**
```
❌ Twilio dashboard hiển thị: "$X.XX charges"
❌ SMS logs có nhiều message
❌ Chưa enable Twilio ở code
```

**Hành động NGAY:**
```
1. ⚠️ DISABLE NGAY:
   - Xóa TWILIO_ACCOUNT_SID từ .env
   - Redeploy Render
2. Kiểm tra logs:
   - Bao nhiêu SMS được gửi?
   - Lúc nào gửi?
3. Liên hệ Twilio support:
   - Yêu cầu refund (nếu bị charge sai)
   - Disable outbound nếu không cần
4. Update code:
   - Add rate limiting
   - Log tất cả SMS attempts
```

---

### Nếu GitHub Actions vượt hạn:

**Biểu hiện:**
```
❌ GitHub hiển thị: "2100 of 2000 minutes"
❌ Workflows tắt tự động
```

**Hành động:**
```
1. Kiểm tra CI/CD:
   - Có workflows chạy loop không?
   - Có tests chạy quá lâu không?
2. Optimize:
   - Cache dependencies
   - Chỉ chạy tests cần thiết
3. Kỳ tới:
   - Upgrade GitHub Pro ($4/tháng)
```

---

## 📊 EXPECTED USAGE (Dự kiến)

### Scenario: Nail Salon App

```
Hàng ngày:
- 20-30 check-in
- 5-10 reports view
- Tối đa 1000 req/day

Render Compute/tháng:
- Free Tier: VƯỢT (cần Starter)
- Estimated: 43,200 min (chạy 24/7)
→ Solution: Starter Plan $14/tháng

Twilio/tháng (nếu dùng):
- 20 check-in × 30 days = 600 check-in
- 600 × 2 SMS = 1200 SMS
- 1200 × $0.0075 = $9
→ Budget: ~$10/tháng (safe)

Total/tháng:
- Render: $14
- Twilio: $9
- GitHub: $0
- TỔNG: ~$23
```

### Scenario: Network Security Audit

```
Expected:
- 100-200 req/day (light usage)
- No external APIs
- No per-use costs

Render Compute/tháng:
- Free Tier? Light usage, có thể OK
- But: Chạy 24/7 CHƯA ĐỦ
- Recommendation: Starter để chắc chắn

Twilio: $0 (không dùng)
GitHub: $0 (minimal CI/CD)

Total/tháng: $14 (nếu upgrade Starter)
```

---

## ✅ CUỐI CÙNG: CHECKLIST

- [ ] Bookmark 3 dashboards (Render, Twilio, GitHub)
- [ ] Lên lịch kiểm tra hàng tuần (Thứ 2 10AM)
- [ ] In tracking sheet, dán trên bàn
- [ ] Setup calendar reminder
- [ ] Đọc lại section này nếu quên
- [ ] Không bỏ qua Render compute check!
- [ ] Luôn kiểm tra Twilio trước khi setup

---

**CẬP NHẬT LẦN CUỐI: 2026-08-12**
**TÌNH TRẠNG: All services safe, monitoring setup complete**
