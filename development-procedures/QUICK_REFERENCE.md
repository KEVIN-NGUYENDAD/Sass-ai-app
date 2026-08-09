# 📚 Quick Reference Guide

**Fast lookup for common development tasks**

---

## Directory Structure

```
development-procedures/
├── README.md                    ← START HERE (setup & overview)
├── QUICK_REFERENCE.md           ← This file
│
├── procedures/                  📖 Step-by-step guides
│   ├── PROCEDURE_HANDBOOK.md    (15+ pages: code review, testing, deployment)
│   └── DEVELOPER_HANDBOOK.md    (Standards, conventions, best practices)
│
├── templates/                   ✅ Reusable checklists
│   ├── CODE_REVIEW_CHECKLIST.md
│   ├── DEPLOYMENT_VERIFICATION.md
│   └── QA_CHECKLIST.md
│
├── scripts/                     🔧 Automation scripts
│   ├── verify-deployment.sh     (Verify production is working)
│   ├── run-tests.sh             (Run test suite)
│   ├── pre-commit-hook.py       (Auto-run before commits)
│   └── create-bug-report.sh     (Create structured bug reports)
│
└── ci-cd/                       🔄 GitHub Actions workflows
    ├── test-and-lint.yml        (Runs on every push/PR)
    └── deploy.yml               (Runs on merge to main)
```

---

## Quick Commands

### Development

```bash
# Make a change
git checkout -b feature/my-feature
# ... edit files ...

# Run tests before committing (auto-runs with hook)
./development-procedures/scripts/run-tests.sh all

# Commit (pre-commit hook runs automatically)
git commit -m "feat: Add new feature"

# Push and create PR
git push origin feature/my-feature
# Create PR on GitHub → CI runs automatically
```

### Testing

```bash
# Run all tests
./development-procedures/scripts/run-tests.sh all

# Run specific tests
./development-procedures/scripts/run-tests.sh unit
./development-procedures/scripts/run-tests.sh integration
./development-procedures/scripts/run-tests.sh e2e

# View coverage
python -m pytest tests/ --cov=nail_salon_checkin --cov-report=html
open htmlcov/index.html
```

### Code Review

```bash
# Use checklist for reviewing code
cat development-procedures/templates/CODE_REVIEW_CHECKLIST.md

# Or high-effort review
cat development-procedures/procedures/PROCEDURE_HANDBOOK.md  # Section 2
```

### Quality Assurance

```bash
# Use QA checklist before release
cat development-procedures/templates/QA_CHECKLIST.md

# Fill it out completely, score the system
# Target: >95/100 before production
```

### Deployment

```bash
# After merge to main, Render auto-deploys
# Wait for build (2-5 minutes)

# Verify deployment worked
./development-procedures/scripts/verify-deployment.sh \
  https://nail-salon-checkin.onrender.com

# Use deployment checklist to verify
cat development-procedures/templates/DEPLOYMENT_VERIFICATION.md
```

### Bug Tracking

```bash
# Create structured bug report
./development-procedures/scripts/create-bug-report.sh

# Follow up with GitHub issue
# Label: bug/critical, bug/major, or bug/minor
```

---

## Common Scenarios

### "I found a bug in production"

1. **Create bug report:**
   ```bash
   ./development-procedures/scripts/create-bug-report.sh
   ```

2. **Review PROCEDURE_HANDBOOK.md section 5 (Bug Fixing Protocol)**

3. **Create hotfix branch:**
   ```bash
   git checkout main && git pull
   git checkout -b fix/issue-name
   # Make fix
   git commit -m "fix: Issue description"
   git push origin fix/issue-name
   ```

4. **Create PR and merge** → Auto-deploy

5. **Verify deployment:**
   ```bash
   ./development-procedures/scripts/verify-deployment.sh <url>
   ```

### "I'm reviewing someone's code"

1. **Use CODE_REVIEW_CHECKLIST.md** at `development-procedures/templates/CODE_REVIEW_CHECKLIST.md`

2. **Pick review level:**
   - Basic (15 min): Formatting, style, obvious errors
   - Standard (30 min): Logic, APIs, performance, security
   - High-Effort (2-3 hours): Comprehensive analysis with testing

3. **Run their code locally:**
   ```bash
   ./development-procedures/scripts/run-tests.sh all
   ```

4. **Document findings** in the checklist

5. **Request changes** or **Approve**

### "Deployment failed, I need to rollback"

1. **Check error:**
   - GitHub Actions logs
   - Render dashboard

2. **Rollback to previous commit:**
   ```bash
   git revert HEAD      # Create new commit undoing changes
   git push origin main # Deploy previous version
   ```

3. **Monitor for 15 minutes:**
   ```bash
   ./development-procedures/scripts/verify-deployment.sh <url>
   ```

4. **Document incident** and review what went wrong

### "Tests are failing"

1. **Run locally:**
   ```bash
   ./development-procedures/scripts/run-tests.sh all
   ```

2. **Check specific test:**
   ```bash
   pytest tests/unit/test_api.py::test_checkin_creates_record -v
   ```

3. **Add debug output:**
   ```bash
   pytest tests/ -v -s  # -s shows print() output
   ```

4. **Check CI logs** on GitHub Actions

### "Code review found critical issues"

1. **Review issue** in the checklist

2. **Fix on your branch:**
   ```bash
   git checkout your-feature-branch
   # Make fixes
   git add .
   git commit -m "fix: Address review comments"  # NEW commit, don't amend
   git push origin your-feature-branch
   ```

3. **Request re-review** from reviewer

4. **Repeat until approved** ✅

---

## Performance Targets

| Metric | Target | How to Verify |
|--------|--------|--------------|
| Test Coverage | >80% | `pytest --cov` |
| Code Quality | >95/100 | Use QA_CHECKLIST.md |
| Page Load | < 2 sec | Use browser DevTools |
| API Response | < 500ms | `curl -w "%{time_total}"` |
| Uptime | 99% | Monitor logs |

---

## Key Files to Know

| File | Purpose | When to Use |
|------|---------|------------|
| `PROCEDURE_HANDBOOK.md` | Complete procedures | Need step-by-step guide |
| `DEVELOPER_HANDBOOK.md` | Standards & conventions | Writing code |
| `CODE_REVIEW_CHECKLIST.md` | Code review template | Reviewing PRs |
| `QA_CHECKLIST.md` | Quality assurance | Before production |
| `DEPLOYMENT_VERIFICATION.md` | Post-deploy verification | After deployment |
| `run-tests.sh` | Test runner | Before committing |
| `verify-deployment.sh` | Deployment checker | After deploying |

---

## Useful Links

- **Main README:** `development-procedures/README.md`
- **Procedure Handbook:** `development-procedures/procedures/PROCEDURE_HANDBOOK.md`
- **Developer Handbook:** `development-procedures/procedures/DEVELOPER_HANDBOOK.md`
- **GitHub Actions:** `.github/workflows/`
- **Project:** https://nail-salon-checkin.onrender.com/

---

## Critical Checklists

### Before Pushing Code
- [ ] All tests passing locally
- [ ] No secrets in commit
- [ ] Commit message is clear
- [ ] Pre-commit hook passed

### Before Merging PR
- [ ] Code reviewed and approved
- [ ] All tests passing in CI
- [ ] Coverage maintained (>80%)
- [ ] No merge conflicts

### Before Production Deployment
- [ ] Main branch has latest changes
- [ ] All tests green in CI/CD
- [ ] Deployment checklist printed
- [ ] Stakeholders notified

### After Production Deployment
- [ ] Verification script passed
- [ ] Health checks green
- [ ] Key features working
- [ ] No critical errors in logs
- [ ] Monitor for 30 minutes

---

## Troubleshooting Quick Answers

| Problem | Solution |
|---------|----------|
| Tests failing locally | Run `pytest -v --tb=long` to see details |
| Pre-commit hook blocking commit | Check error, fix issue, or `git commit --no-verify` |
| Deployment still shows old code | Wait 2-5 minutes for Render build to complete |
| Can't access staff page | Need to login first at `/staff-login` |
| SMS not sending | Check Twilio credentials in logs |
| Production down | Check Render dashboard, rollback if needed |

---

## Contact & Questions

**Found an issue with procedures?**
- Create GitHub issue with `label:procedures`
- Update the relevant file and commit

**Need help with a task?**
1. Check the main README
2. Check PROCEDURE_HANDBOOK.md
3. Check the relevant template
4. Ask team lead

**Want to improve procedures?**
- Edit files in `development-procedures/`
- Commit: `docs: improve [what improved]`
- Share with team

---

**Last Updated:** 2026-08-09  
**Version:** 1.0  
**Status:** Production Ready ✅
