# ⚡ Harness Cheatsheet - Quick Reference

**For quick commands and common tasks. Full guide: see `HARNESS_GUIDE.md`**

---

## 🚀 Quick Start (Copy-Paste)

```bash
# Setup new project with harness
bash scripts/setup-harness.sh my-project 5000

# Start development
harness dev start-server

# Run tests
harness test run-tests

# Check code quality
harness test lint-code

# Deploy
harness deploy verify-deployment
```

---

## 📋 Common Commands

### Development
| Command | What It Does |
|---------|-------------|
| `harness dev start-server` | Start Flask server on localhost |
| `harness test run-tests` | Run all unit tests |
| `harness test lint-code` | Check code quality |
| `h dev start-server` | Shortcut version (if aliased) |

### Deployment
| Command | What It Does |
|---------|-------------|
| `harness deploy verify-deployment` | Verify deployment ready |
| `git push origin main` | Auto-deploy to production (if configured) |

### Setup
| Command | What It Does |
|---------|-------------|
| `bash scripts/setup-harness.sh app-name` | Auto-setup harness for new project |
| `harness setup` | Manual setup (if needed) |

---

## 🎯 Aliases (If Configured)

If you have `.claude/settings.json` with aliases:

```bash
# Instead of: harness dev start-server
/start

# Instead of: harness test run-tests
/test

# Instead of: harness test lint-code
/lint

# Instead of: harness deploy verify-deployment
/deploy

# Instead of: bash scripts/setup-harness.sh
/setup
```

---

## 📁 Project Structure Checklist

Before running harness, make sure you have:

```
✅ requirements.txt     - Python dependencies
✅ app.py              - Flask application
✅ .env.example        - Environment template (optional)
✅ tests/              - Test files (optional)
✅ scripts/            - Utility scripts (optional)
```

---

## 🔧 Configuration Files

### Main Files
| File | Purpose |
|------|---------|
| `.claude/harness.yml` | Harness configuration (main) |
| `.claude/settings.json` | Claude Code settings + hooks |
| `.claude/HARNESS_GUIDE.md` | Full documentation |
| `.claude/harness-template.yml` | Template for new projects |
| `scripts/setup-harness.sh` | Auto-setup script |

### Edit These For Your Project
```yaml
# In .claude/harness.yml:
structure:
  source_dirs:
    - your_app_dir    # Change this
    - your_src_dir    # Add more if needed

environment:
  port: 5000          # Change if needed
```

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check if port is in use
lsof -i :5000

# Try different port
harness dev start-server --port 5001
```

### Tests fail
```bash
# Run with verbose output
pytest tests/ -vv

# Run specific test
pytest tests/test_specific.py::test_name
```

### Lint errors
```bash
# See what flake8 found
flake8 . --max-line-length=120

# Auto-fix some issues (with autopep8)
autopep8 --in-place --aggressive app.py
```

### Dependencies missing
```bash
# Reinstall all
pip install -r requirements.txt --force-reinstall

# Install specific package
pip install package-name
```

---

## 📊 Performance Targets

Harness monitors these metrics:

| Metric | Target | Status |
|--------|--------|--------|
| Test Coverage | 80%+ | Check with: `pytest --cov` |
| Performance | 95/100 | Measured in CI/CD |
| Response Time | < 500ms | Monitor in production |

---

## 🔗 File References

### Most Used
- **Quick start:** `HARNESS_GUIDE.md` - Section "Quick Start"
- **Commands:** This file (HARNESS_CHEATSHEET.md)
- **Setup:** `scripts/setup-harness.sh`

### Full Documentation
- **Complete guide:** `.claude/HARNESS_GUIDE.md`
- **For new projects:** `.claude/harness-template.yml`
- **Value assessment:** Read `HARNESS_VALUE_ASSESSMENT.md`

---

## 💡 Tips & Tricks

### Batch Operations
```bash
# Run everything before commit
harness test run-tests && harness test lint-code

# Deploy with verification
git push origin main && harness deploy verify-deployment
```

### Environment Setup
```bash
# Set custom port
export FLASK_PORT=5001
harness dev start-server

# Set environment
export FLASK_ENV=production
```

### Debugging
```bash
# Enable Flask debug mode
export FLASK_DEBUG=1
harness dev start-server

# Verbose logging
export LOG_LEVEL=DEBUG
```

---

## 🚀 Setup New Project (Step-by-Step)

### Quick Version (1 command)
```bash
bash scripts/setup-harness.sh my-new-app 5000
```

### Manual Version (if needed)
```bash
# 1. Copy template
cp .claude/harness-template.yml .claude/harness.yml

# 2. Edit for your project
nano .claude/harness.yml
# Change: project name, paths, port, dependencies

# 3. Setup
pip install -r requirements.txt
mkdir -p data

# 4. Test
harness dev start-server
```

---

## ✅ Verification Checklist

After setup, verify:

```bash
□ Dependencies installed:      pip list | grep flask
□ App runs:                   harness dev start-server
□ Tests pass:                 harness test run-tests
□ Code lints:                 harness test lint-code
□ Environment vars set:       env | grep FLASK
□ .env file exists:           ls -la .env
□ Data directory created:     ls -la data/
```

---

## 🎓 Learning Path

1. **Quick start** (5 min)
   ```bash
   harness dev start-server
   # Open browser to http://localhost:5000
   ```

2. **Run tests** (2 min)
   ```bash
   harness test run-tests
   ```

3. **Check code quality** (1 min)
   ```bash
   harness test lint-code
   ```

4. **Setup new project** (5 min)
   ```bash
   bash scripts/setup-harness.sh my-app
   ```

5. **Read full guide** (20 min)
   ```bash
   cat .claude/HARNESS_GUIDE.md
   ```

---

## 📞 Help

### Quick Questions
- **"How do I start?"** → Run `harness dev start-server`
- **"How do I test?"** → Run `harness test run-tests`
- **"How do I deploy?"** → Run `harness deploy verify-deployment`
- **"How do I setup new project?"** → Run `bash scripts/setup-harness.sh app-name`

### More Info
- Full guide: `HARNESS_GUIDE.md`
- Setup script: `scripts/setup-harness.sh --help`
- Configuration: `.claude/harness.yml`

---

## 🎯 One-Liners

```bash
# Start everything
harness dev start-server

# Test everything
harness test run-tests && harness test lint-code

# Setup and start
bash scripts/setup-harness.sh my-app && harness dev start-server

# Deploy
git push origin main

# Full CI/CD (manual)
harness test run-tests && harness test lint-code && git push
```

---

**Last Updated:** 2026-08-12  
**Harness Version:** 1.0  
**Project:** Any Flask Application
