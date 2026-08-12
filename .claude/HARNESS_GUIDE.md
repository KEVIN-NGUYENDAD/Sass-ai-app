# 🔧 Harness Configuration Guide

## Giới thiệu
File `harness.yml` này cấu hình tự động hóa cho dự án Flask. Bạn có thể tái sử dụng nó cho các dự án Python/Flask tiếp theo.

---

## 📋 Cấu trúc Harness

### 1. **Setup Environment** 🚀
```yaml
environment:
  runtime: python3.9+
  package_manager: pip
  shell: bash
```
- Tự động thiết lập Python environment
- Cài đặt dependencies từ `requirements.txt`

### 2. **Development Commands** ⚙️

#### Start Server
```bash
harness dev start-server
```
- Khởi động Flask server tại `http://localhost:5000/`
- Tự động healthcheck

#### Run Tests
```bash
harness test run-tests
```
- Chạy toàn bộ test suite
- Bắt buộc trước mỗi commit

#### Lint Code
```bash
harness test lint-code
```
- Kiểm tra code quality
- Đảm bảo đúng format

### 3. **CI/CD Pipeline** 🔄

Harness tự động chạy 3 stages:

| Stage | Command | Failure |
|-------|---------|---------|
| **Lint** | Kiểm tra syntax | Warn |
| **Test** | Chạy unit tests | Fail |
| **Build** | Build production | Fail |

### 4. **Pre-commit Hooks** 🎯
Tự động chạy trước commit:
- ✅ Kiểm tra syntax Python
- ✅ Chạy linter
- ✅ Xác minh tests pass

### 5. **Deployment** 🚀
- Platform: Render (auto-deploy từ `main` branch)
- Post-deploy: Health check tự động
- Script verify: `verify-deployment.sh`

---

## 🔄 Cách sử dụng cho Dự án Tiếp theo

### Bước 1: Copy Harness File
```bash
cp .claude/harness.yml /path/to/new-project/.claude/
```

### Bước 2: Cập nhật config cho dự án mới
```yaml
# Thay đổi thông tin dự án
name: "Your New Project Name"
description: "Your project description"

# Cập nhật paths
structure:
  source_dirs:
    - your_app_dir
  test_dirs:
    - your_tests_dir
  config_files:
    - requirements.txt

# Cập nhật development server nếu cần
dev:
  - name: "start-server"
    port: 5000  # Đổi port nếu cần
```

### Bước 3: Activate Harness
```bash
# Trong Claude Code
/plugin install harness@harness-marketplace
/harness activate
```

---

## 📊 Targets & Metrics

Harness tự động theo dõi:
- **Test Coverage**: 80%+
- **Performance Score**: 95/100
- **Response Time**: < 500ms

---

## 🎯 Hooks & Automation

### Pre-commit
- Chạy syntax check
- Chạy linter
- Chạy tests (nếu required)

### Pre-push
- Verify CI/CD pass
- Check deployment readiness

### Post-deploy
- Health check tự động
- Log verification

---

## 🔗 Integration với Development Procedures

Harness tự động link đến các procedures:
```yaml
procedures:
  code_review: "development-procedures/templates/CODE_REVIEW_CHECKLIST.md"
  qa_checklist: "development-procedures/templates/QA_CHECKLIST.md"
  deployment: "development-procedures/templates/DEPLOYMENT_VERIFICATION.md"
```

Bạn có thể:
1. `harness review` → Mở code review checklist
2. `harness qa` → Mở QA checklist
3. `harness deploy` → Mở deployment verification

---

## 💡 Tips & Tricks

### Customize cho Project Type
```yaml
# Cho API projects
tags:
  - api
  - flask
  - rest

# Cho Web projects
tags:
  - web-app
  - responsive-design
  - frontend
```

### Thêm Custom Commands
```yaml
commands:
  custom:
    - name: "generate-docs"
      command: "python -m sphinx"
      description: "Generate documentation"
```

### Environment Variables
```yaml
env_vars:
  FLASK_ENV: "production"  # Đổi cho production
  DEBUG: "False"
  API_KEY: "${SECRET_API_KEY}"  # Use secrets
```

---

## 🚀 Quick Start cho Dự án Mới

1. **Copy harness file**
   ```bash
   cp .claude/harness.yml /path/to/new-project/
   ```

2. **Cập nhật project info**
   - Tên project
   - Paths (source_dirs, test_dirs)
   - Port nếu cần

3. **Activate**
   ```bash
   cd /path/to/new-project
   /harness activate
   ```

4. **Test**
   ```bash
   harness dev start-server
   harness test run-tests
   ```

---

## 📞 Troubleshooting

### Setup fail
```bash
# Clear cache và reinstall
rm -rf venv/
harness setup --force
```

### Tests fail
```bash
# Debug mode
harness test run-tests --verbose
```

### Deployment issue
```bash
# Verify deployment
harness deploy verify-deployment
```

---

**Status:** ✅ Ready to use  
**Version:** 1.0  
**Created:** 2026-08-12
