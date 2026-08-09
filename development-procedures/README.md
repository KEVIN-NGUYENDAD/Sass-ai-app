# 🚀 Development Procedures Package

Complete, professional development procedures for the Nail Salon Check-In System.

**Version:** 1.0  
**Last Updated:** 2026-08-09  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [What's Included](#whats-included)
3. [Setup Instructions](#setup-instructions)
4. [Using the Procedures](#using-the-procedures)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### For Developers

```bash
# 1. Clone and setup
git clone <repo>
cd nail-salon-checkin

# 2. Install dependencies
pip install -r requirements.txt
pip install pytest pytest-cov flake8

# 3. Run pre-commit hooks
ln -s ../../development-procedures/scripts/pre-commit-hook.py .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# 4. Make changes and commit
git checkout -b feature/my-feature
# ... edit files ...
git commit -m "Add: my new feature"  # Pre-commit hook runs automatically

# 5. Push and create pull request
git push origin feature/my-feature
# Create PR on GitHub (CI automatically runs)

# 6. After approval, merge to main
# Render automatically deploys
```

### For QA/Testing

```bash
# Run all tests
./development-procedures/scripts/run-tests.sh all

# Run specific tests
./development-procedures/scripts/run-tests.sh unit
./development-procedures/scripts/run-tests.sh integration
./development-procedures/scripts/run-tests.sh e2e

# Use QA Checklist
# See: development-procedures/templates/QA_CHECKLIST.md
```

### For DevOps/Deployment

```bash
# Verify production deployment
./development-procedures/scripts/verify-deployment.sh https://nail-salon-checkin.onrender.com

# Check CI/CD status
# See: .github/workflows/
```

---

## What's Included

### 📚 Procedures
Complete step-by-step guides for all development activities:

- **`procedures/PROCEDURE_HANDBOOK.md`** (15+ pages)
  - Code Review Process (3 levels: Basic, Standard, High-Effort)
  - Testing Procedures (Unit, Integration, E2E)
  - Deployment Workflow
  - Bug Fixing Protocol
  - Quality Assurance Criteria
  - Emergency Procedures

### 📋 Templates
Reusable checklists and templates:

- **`templates/CODE_REVIEW_CHECKLIST.md`** - Comprehensive code review template
- **`templates/DEPLOYMENT_VERIFICATION.md`** - Post-deployment verification steps
- **`templates/QA_CHECKLIST.md`** - Quality assurance checklist (100 items)

### 🔧 Scripts
Automation scripts for common tasks:

- **`scripts/verify-deployment.sh`** - Automated deployment verification
  ```bash
  ./development-procedures/scripts/verify-deployment.sh <environment-url>
  ```

- **`scripts/pre-commit-hook.py`** - Pre-commit checks (syntax, style, secrets)
  - Install: `ln -s ../../development-procedures/scripts/pre-commit-hook.py .git/hooks/pre-commit`
  - Runs automatically on `git commit`

- **`scripts/run-tests.sh`** - Test runner with coverage analysis
  ```bash
  ./development-procedures/scripts/run-tests.sh [unit|integration|e2e|all]
  ```

### 🔄 CI/CD Workflows
GitHub Actions workflows for automation:

- **`ci-cd/test-and-lint.yml`** - Runs tests and linting on every push/PR
- **`ci-cd/deploy.yml`** - Deploys to production when merged to main

---

## Setup Instructions

### 1. Install to Your Repository

**Option A: Copy Files**
```bash
cp -r development-procedures /path/to/your/repo/
```

**Option B: Git Submodule** (recommended for shared procedures)
```bash
git submodule add https://github.com/yourgithub/procedures.git development-procedures
```

### 2. Set Up Pre-commit Hook

```bash
# Make script executable
chmod +x development-procedures/scripts/pre-commit-hook.py

# Install as git hook
ln -s ../../development-procedures/scripts/pre-commit-hook.py .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Test it
git commit --allow-empty -m "Test: pre-commit hook"
```

### 3. Set Up GitHub Actions

```bash
# Create GitHub Actions directory
mkdir -p .github/workflows

# Copy workflows
cp development-procedures/ci-cd/test-and-lint.yml .github/workflows/
cp development-procedures/ci-cd/deploy.yml .github/workflows/

# Commit and push
git add .github/workflows/
git commit -m "Add: GitHub Actions CI/CD pipelines"
git push origin main
```

### 4. Install Test Dependencies

```bash
pip install pytest pytest-cov pytest-asyncio flake8
```

### 5. Update README

Add to your main README.md:

```markdown
## Development

See [Development Procedures](development-procedures/README.md) for:
- Code review guidelines
- Testing procedures
- Deployment process
- Quality assurance checks

### Quick Commands

```bash
# Run tests
./development-procedures/scripts/run-tests.sh all

# Verify deployment
./development-procedures/scripts/verify-deployment.sh <url>
```
```

---

## Using the Procedures

### Code Review Process

**Before submitting a PR:**
1. Self-review using `CODE_REVIEW_CHECKLIST.md`
2. Run local tests: `./development-procedures/scripts/run-tests.sh all`
3. Check for secrets: pre-commit hook runs automatically

**During code review:**
1. Reviewer uses `CODE_REVIEW_CHECKLIST.md`
2. For high-effort reviews, use PROCEDURE_HANDBOOK section 2
3. Document findings in the template
4. Require fixes for Critical/Major issues

**Example review:**
```markdown
## Code Review

Using: High-Effort Review Level

### Findings

#### Critical ❌
- [ ] Line 433: Status not updated after confirmation

#### Major ⚠️
- [ ] Line 487: Inconsistent status values

#### Minor 💡
- [ ] Add docstring to function

**Overall:** Request changes
```

### Testing Procedures

**Run comprehensive test suite:**
```bash
./development-procedures/scripts/run-tests.sh all
```

**Results show:**
- ✅ Unit tests passed
- ✅ Integration tests passed
- ✅ E2E tests passed
- 📊 Coverage: 85% (target: >80%)

**For more details:**
- See: `procedures/PROCEDURE_HANDBOOK.md` section 3
- Coverage report: `htmlcov/index.html`

### Quality Assurance

**Before every release:**
1. Print QA checklist: `templates/QA_CHECKLIST.md`
2. Complete all items
3. Score the system (target: >95/100)
4. Sign off as approved

---

## CI/CD Pipeline

### Automated Workflow

```
Your Code
    ↓
Git Push
    ↓
GitHub Actions Triggered
    ├─ Run Tests (pytest)
    ├─ Run Linting (flake8)
    └─ Upload Coverage
        ↓
    ✅ All Pass?
        ├─ YES → Allow Merge
        └─ NO → Require Fixes
    ↓
Merge to Main
    ↓
GitHub Actions Deploy
    ├─ Run Tests Again
    ├─ Trigger Render Deploy
    └─ Verify Deployment
        ↓
    🎉 Production Live
```

### Accessing CI/CD Status

**On GitHub:**
1. Go to your repository
2. Click "Actions" tab
3. View workflow runs and logs

**Workflow Files:**
- `.github/workflows/test-and-lint.yml` - Runs on every push/PR
- `.github/workflows/deploy.yml` - Runs when merged to main

---

## Testing

### Test Types

**Unit Tests** (70%)
- Test individual functions
- Location: `tests/unit/`
- Run: `./development-procedures/scripts/run-tests.sh unit`

**Integration Tests** (25%)
- Test API endpoints and workflows
- Location: `tests/integration/`
- Run: `./development-procedures/scripts/run-tests.sh integration`

**E2E Tests** (5%)
- Test complete user journeys
- Location: `tests/e2e/`
- Run: `./development-procedures/scripts/run-tests.sh e2e`

### Coverage Requirements

- **Minimum:** 80% code coverage
- **Target:** 90%+ coverage
- **View:** `htmlcov/index.html` after running tests

### Running Tests Locally

```bash
# All tests
pytest tests/ -v

# Specific test file
pytest tests/unit/test_api.py -v

# With coverage
pytest tests/ --cov=nail_salon_checkin --cov-report=html

# Watch mode (if using pytest-watch)
ptw tests/
```

---

## Deployment

### Deployment Steps

1. **Code → Main Branch**
   ```bash
   git merge feature/my-feature
   git push origin main
   ```

2. **Automated CI/CD**
   - Tests run automatically (4 Python versions)
   - If all pass, deployment triggered
   - Takes ~5-10 minutes total

3. **Verify Deployment**
   ```bash
   ./development-procedures/scripts/verify-deployment.sh \
     https://nail-salon-checkin.onrender.com
   ```

4. **Manual Verification**
   - Use: `templates/DEPLOYMENT_VERIFICATION.md`
   - Check: Home page, staff login, reports
   - Test: Check-in flow, CSV export, SMS
   - Monitor: Logs for errors (first 30 min)

### Production Checklist

Before pushing to main:
- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Deployment verification checklist ready
- [ ] Stakeholders notified
- [ ] Rollback plan documented

After deployment:
- [ ] Health checks passing
- [ ] Key features working
- [ ] No critical errors in logs
- [ ] Performance acceptable
- [ ] Users happy ✨

---

## Troubleshooting

### Tests Failing

**Problem:** `pytest: command not found`
```bash
pip install pytest pytest-cov
```

**Problem:** Some tests fail
```bash
# Run with verbose output
pytest tests/ -v --tb=long

# Run single test
pytest tests/unit/test_api.py::test_checkin_creates_record -v
```

### Pre-commit Hook Issues

**Problem:** Hook not running
```bash
# Reinstall hook
ln -sf ../../development-procedures/scripts/pre-commit-hook.py .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

**Problem:** Hook blocking commit
```bash
# View issues
cat ~/.git/hooks/pre-commit  # Read the error

# Skip hook (if absolutely necessary)
git commit --no-verify
```

### Deployment Failures

**Problem:** Render build fails
1. Check Render dashboard: https://dashboard.render.com/
2. View build logs in Render
3. Common issues:
   - Missing `requirements.txt`
   - Python version mismatch
   - Port configuration

**Problem:** Tests fail in CI but pass locally
```bash
# Ensure Python version matches
python --version
# (CI uses 3.8, 3.9, 3.10, 3.11)

# Install exact dependencies
pip install -r requirements.txt
```

### Verification Script Issues

**Problem:** `verify-deployment.sh` returns 404 errors
```bash
# Check if site is up
curl https://nail-salon-checkin.onrender.com/

# Wait for deployment (2-5 minutes)
# Render needs time to build and start
```

**Problem:** SSL certificate errors
```bash
# Try without verification (development only!)
curl -k https://nail-salon-checkin.onrender.com/
```

---

## Best Practices

### Code Changes
1. ✅ Create feature branch
2. ✅ Make small, focused commits
3. ✅ Write clear commit messages
4. ✅ Run tests before pushing
5. ✅ Create descriptive PR

### Code Review
1. ✅ Use appropriate review level
2. ✅ Test locally if needed
3. ✅ Provide specific feedback
4. ✅ Approve only when confident
5. ✅ Document complex decisions

### Testing
1. ✅ Write tests for new features
2. ✅ Maintain >80% coverage
3. ✅ Test edge cases
4. ✅ Run full suite before pushing
5. ✅ Use CI for automated verification

### Deployment
1. ✅ Deploy during business hours (if possible)
2. ✅ Have rollback plan ready
3. ✅ Notify stakeholders before deploying
4. ✅ Verify each deployment step
5. ✅ Monitor logs after deployment

---

## Getting Help

### Documentation
- Full procedures: `procedures/PROCEDURE_HANDBOOK.md`
- Code review guide: `templates/CODE_REVIEW_CHECKLIST.md`
- Deployment guide: `templates/DEPLOYMENT_VERIFICATION.md`
- QA checklist: `templates/QA_CHECKLIST.md`

### Common Tasks

**Run tests:** `./development-procedures/scripts/run-tests.sh all`  
**Check deployment:** `./development-procedures/scripts/verify-deployment.sh <url>`  
**Code review:** Use `templates/CODE_REVIEW_CHECKLIST.md`  
**Deploy:** Push to main branch (automated)

### Questions?
1. Check PROCEDURE_HANDBOOK.md
2. Check relevant template
3. Check GitHub Issues
4. Ask team lead

---

## Updates & Improvements

### Staying Current

This procedures package is designed to evolve. When you discover:
- A missing step in a procedure
- A new tool that helps development
- A bug in a script
- A better workflow

**Update the procedures:**
1. Make change to relevant file
2. Commit with `docs: update procedures`
3. Share with team
4. Update this README if needed

### Contributing

To improve procedures:
1. Make changes to files in `development-procedures/`
2. Test changes (does procedure still work?)
3. Get team feedback
4. Commit: `docs: improve procedures - [what improved]`
5. Consider making it a GitHub discussion

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-09 | Initial release with code review, testing, deployment |
| - | - | - |

---

## License

These procedures are for internal team use. Feel free to customize and adapt to your team's needs.

---

**Maintained by:** Development Team  
**Last Updated:** 2026-08-09  
**Next Review:** 2026-09-09

Questions? Check the PROCEDURE_HANDBOOK.md or create an issue with `label:procedures`.
