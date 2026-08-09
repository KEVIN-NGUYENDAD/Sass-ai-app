# 🚀 Development Procedures Handbook

**Organization:** Nail Salon AI Copilot  
**Version:** 1.0  
**Last Updated:** 2026-08-09  
**Status:** PRODUCTION READY

---

## Table of Contents

1. [Overview](#overview)
2. [Code Review Process](#code-review-process)
3. [Testing Procedures](#testing-procedures)
4. [Deployment Workflow](#deployment-workflow)
5. [Bug Fixing Protocol](#bug-fixing-protocol)
6. [Quality Assurance](#quality-assurance)
7. [Emergency Procedures](#emergency-procedures)

---

## Overview

This handbook documents standardized procedures for developing, testing, reviewing, and deploying code to production. These procedures ensure code quality, minimize bugs, and maintain production stability.

### Key Principles

- **Quality First**: Every change must pass code review before deployment
- **Test Everything**: Automated + manual testing required
- **Document Changes**: Clear commit messages and PR descriptions
- **Verify Deployments**: Production verification checklist mandatory
- **Learn from Failures**: Incident reviews improve procedures

---

## Code Review Process

### Purpose
Comprehensive code review identifies bugs, security issues, and architecture problems before they reach production.

### Review Levels

#### Level 1: Basic Review (15 minutes)
- Syntax and formatting check
- Variable naming conventions
- Comment quality
- Basic logic flow

#### Level 2: Standard Review (30 minutes)
- Data structure validation
- API contract review
- Error handling check
- Performance considerations
- Security vulnerabilities

#### Level 3: High-Effort Review (2-3 hours)
- **Comprehensive analysis** of entire functionality
- Multi-scenario testing (golden path + edge cases)
- Cross-file consistency checks
- Database/state impact analysis
- Integration with other systems
- Performance profiling
- Security audit

**When to use:** Before major releases, critical path code, financial/data-sensitive operations

### High-Effort Review Checklist

Use the template in `templates/CODE_REVIEW_CHECKLIST.md`

**Key focus areas:**
1. **Data Integrity**
   - [ ] Data overwrites correctly
   - [ ] Calculations are accurate
   - [ ] Status fields updated consistently
   - [ ] Timestamps preserved

2. **Logic Correctness**
   - [ ] Conditional branches handle all cases
   - [ ] Loop invariants correct
   - [ ] Comparison operators (>, <, ==) correct
   - [ ] Boundary conditions handled

3. **State Management**
   - [ ] API updates all required fields
   - [ ] No inconsistent states possible
   - [ ] Rollback/recovery viable if needed

4. **Error Handling**
   - [ ] Exceptions caught and logged
   - [ ] User-facing errors informative
   - [ ] Failures don't cascade
   - [ ] Graceful degradation

5. **Performance**
   - [ ] N+1 queries avoided
   - [ ] File I/O batched appropriately
   - [ ] Large data sets handled efficiently

6. **Security**
   - [ ] Authentication enforced
   - [ ] Authorization boundaries respected
   - [ ] Input validation present
   - [ ] SQL injection / command injection prevented
   - [ ] Sensitive data not logged

### Review Process Steps

1. **Prepare Code**
   ```bash
   git checkout main && git pull origin main
   git checkout -b claude/feature-name
   # Make changes, commit
   ```

2. **Run Local Tests**
   - See Testing Procedures section
   - All tests must pass locally

3. **Create Pull Request**
   - Use PR template from `.github/PULL_REQUEST_TEMPLATE.md`
   - Link related issues
   - Provide context and testing notes

4. **Conduct Review**
   - Follow review checklist for appropriate level
   - Document findings in code review template
   - Test in local environment if needed

5. **Report Findings**
   - Use `templates/CODE_REVIEW_REPORT.md` format
   - Categorize by severity: Critical, Major, Minor, Style
   - Provide specific line numbers and fixes

6. **Author Fixes**
   - Address all Critical and Major findings
   - Create new commit (don't amend)
   - Push and request re-review

7. **Approval & Merge**
   - Requires passing code review
   - All automated tests passing
   - Ready for deployment

---

## Testing Procedures

### Testing Pyramid

```
        E2E Tests (5%)
      Integration Tests (25%)
      Unit Tests (70%)
```

### Unit Tests

**Location:** `tests/unit/`  
**Framework:** Python unittest  
**Coverage Goal:** >80%

```python
# Example structure
def test_api_checkin_creates_record():
    """Verify check-in creates record with correct fields."""
    # Arrange
    test_data = {"name": "Khách test", "phone": "555-1234"}
    
    # Act
    response = client.post('/api/checkin', json=test_data)
    
    # Assert
    assert response.status_code == 201
    assert response.json['id']
    assert response.json['status'] == 'waiting_confirm'
```

### Integration Tests

**Location:** `tests/integration/`  
**Framework:** pytest  
**Coverage Goal:** All APIs and workflows

Test scenarios:
- Complete check-in workflow (checkin → confirm → complete)
- Staff operations (login → queue view → status update)
- Report generation (daily → weekly → monthly)
- Data persistence (create → read → update → delete)

### E2E Tests

**Location:** `tests/e2e/`  
**Framework:** Playwright  
**Coverage Goal:** Critical user journeys

Key flows:
1. Customer check-in from landing page
2. Staff login and queue management
3. Report generation and CSV export
4. Customer management and search
5. SMS notifications

### Running Tests

```bash
# Unit tests
python -m pytest tests/unit/ -v --cov=nail_salon_checkin

# Integration tests
python -m pytest tests/integration/ -v

# E2E tests (requires running server)
python -m pytest tests/e2e/ -v --headed  # Show browser

# All tests
python -m pytest tests/ -v --cov=nail_salon_checkin
```

### Test Coverage Report

Generate HTML coverage report:
```bash
python -m pytest tests/ --cov=nail_salon_checkin --cov-report=html
open htmlcov/index.html
```

**Requirement:** Maintain >80% coverage before deployment

---

## Deployment Workflow

### Pre-Deployment Checklist

**24 hours before:**
1. [ ] All code merged to main branch
2. [ ] All tests passing (100% green)
3. [ ] Code review completed and approved
4. [ ] Deployment plan documented

**1 hour before:**
1. [ ] Backup production database (if applicable)
2. [ ] Notify stakeholders
3. [ ] Have rollback plan ready
4. [ ] Verify deployment credentials

### Deployment Steps

#### Step 1: Verify Main Branch
```bash
git checkout main
git pull origin main
git log -1 --oneline  # Verify latest commit
```

#### Step 2: Run Final Tests
```bash
python -m pytest tests/ -v
npm run lint  # If applicable
```

#### Step 3: Deploy to Staging (if applicable)
```bash
# Push to staging branch
git push origin main:staging

# Monitor for 15 minutes
# Check logs, run smoke tests
```

#### Step 4: Deploy to Production

**Render Deployment:**
```bash
# Render auto-deploys from main branch
# Verify at: https://dashboard.render.com/

# Manual trigger if needed:
# - Push to main branch triggers webhook
# - Check Render dashboard for build status
# - Build typically takes 2-5 minutes
```

#### Step 5: Post-Deployment Verification

Use checklist from `templates/DEPLOYMENT_VERIFICATION.md`

- [ ] Health check endpoint responding
- [ ] Key pages loading (home, staff, reports)
- [ ] Staff login working
- [ ] Customer check-in working
- [ ] Reports generating
- [ ] CSV export working
- [ ] SMS notifications functional
- [ ] Error logs clean
- [ ] Performance acceptable

```bash
# Quick verification script
./scripts/verify-deployment.sh
```

#### Step 6: Monitor & Rollback Plan

**Monitoring (first 30 minutes):**
- Watch error logs for 500 errors
- Monitor API response times
- Check for spike in error rates

**Rollback (if needed):**
```bash
# Revert to previous commit
git revert HEAD  # Creates new commit that undoes changes
git push origin main

# Or reset to previous version
git reset --hard HEAD~1
git push -f origin main  # Force push if urgent
```

### Deployment Frequency
- **Normal releases:** Weekly on Mondays 10 AM
- **Hotfixes:** ASAP when critical bug in production
- **Feature releases:** Bi-weekly

---

## Bug Fixing Protocol

### Bug Identification

**Sources:**
1. Code review findings
2. Automated test failures
3. Production errors (monitoring)
4. User reports
5. Manual testing

### Severity Classification

| Level | Impact | Response Time | Example |
|-------|--------|---------------|---------|
| **Critical** | System down or data corruption | Immediate (< 30 min) | Status not updated after confirmation |
| **Major** | Feature broken or significant data issue | Within 4 hours | Wrong calculation in reports |
| **Minor** | Feature partially broken | Within 1 day | UI element misaligned |
| **Style** | Code quality or cosmetic | Next release | Variable naming inconsistent |

### Bug Fixing Steps

#### 1. Document the Bug
```markdown
**Title:** Status not updated after owner confirmation

**Severity:** Critical

**Reproduction:**
1. Customer checks in
2. Owner confirms via link
3. Status remains 'waiting_confirm' (should be 'confirmed')

**Impact:**
- Appointments not counted in reports
- Inconsistent state
- Confusing user experience

**Root Cause:** api_owner_confirm() sets duration but not status
```

#### 2. Create Feature Branch
```bash
git checkout main && git pull
git checkout -b fix/status-not-updated
```

#### 3. Write Test Case
```python
def test_owner_confirm_updates_status():
    """Status should change to confirmed after owner confirmation."""
    # Setup
    checkin = create_test_checkin(status='waiting_confirm')
    
    # Act
    response = client.post(f'/api/confirm/{checkin["id"]}', 
                          json={'duration': 30})
    
    # Assert
    assert response.json['status'] == 'confirmed'
```

#### 4. Fix the Bug
```python
# BEFORE
checkin["duration_minutes"] = duration
checkin["confirmed"] = True

# AFTER
checkin["duration_minutes"] = duration
checkin["confirmed"] = True
checkin["status"] = "confirmed"  # ← FIX
```

#### 5. Verify Fix
- [ ] Test case passes
- [ ] No new test failures
- [ ] Manual verification in browser
- [ ] Check for side effects
- [ ] Performance impact acceptable

#### 6. Code Review
- Submit PR with bug fix
- Request thorough review
- Provide test evidence
- Document changes clearly

#### 7. Deploy
- Merge to main
- Deploy to production
- Monitor for regressions

### Bug Tracking

Use GitHub Issues with labels:
- `bug/critical` - Production issue
- `bug/major` - Significant impact
- `bug/minor` - Low impact
- `bug/regression` - Fix caused new issue

---

## Quality Assurance

### QA Checklist

Use template: `templates/QA_CHECKLIST.md`

**Before every deployment verify:**

1. **Functionality** (15 min)
   - All features working as designed
   - Edge cases handled
   - Error messages clear

2. **Performance** (10 min)
   - Page loads < 2 seconds
   - API responses < 500ms
   - No memory leaks

3. **Security** (10 min)
   - Authentication working
   - Authorization enforced
   - Input validation present

4. **Compatibility** (5 min)
   - Mobile responsive
   - Multiple browsers tested
   - Older browser support

5. **Data Integrity** (10 min)
   - Data persists across restarts
   - CSV exports correct
   - Reports accurate

### Scoring System

**Overall Quality Score:**
```
Score = (P × 0.5 + S × 0.2 + D × 0.3) × 100

P = Passing tests / Total tests
S = Security issues fixed / Total issues
D = Data accuracy / Expected accuracy
```

**Target:** ≥95/100 before production

---

## Emergency Procedures

### Production Outage Response

**Step 1: Immediate Action (< 2 min)**
```
1. Declare incident
2. Start incident timer
3. Notify team via Slack
4. Gather initial info
```

**Step 2: Assessment (2-5 min)**
```
1. Check error logs
2. Review recent deployments
3. Check system resources
4. Determine scope (single user / all users)
```

**Step 3: Mitigation (5-30 min)**

Option A: Quick Fix
```bash
# If bug is obvious and fix is simple
git checkout -b hotfix/issue-name
# Make minimal fix
git commit -m "HOTFIX: Issue description"
git push origin hotfix/issue-name
# Deploy immediately
```

Option B: Rollback
```bash
# If change caused regression
git revert HEAD
git push origin main
# Faster than debugging
```

Option C: Scale Down
```bash
# If performance issue
Temporarily disable non-critical features
Clear cache
Reduce database load
```

**Step 4: Post-Incident**
```
1. Document what happened
2. Root cause analysis
3. Prevent recurrence
4. Incident review meeting
5. Update procedures if needed
```

### Communication Template

```
🚨 INCIDENT: [Issue Name]
- Start Time: [Time]
- Status: [Investigating / Fixing / Resolved]
- Impact: [What users affected]
- ETA Fix: [Estimated time]

Updates:
- 10:15 - Issue identified: [Description]
- 10:25 - Fix deployed, monitoring
- 10:30 - ✅ RESOLVED
```

---

## Continuous Improvement

### Monthly Review

Every month, review:
1. Bug trends (are Critical bugs increasing?)
2. Test coverage (trends)
3. Deployment frequency (is it improving?)
4. Production incidents (root causes)

### Process Updates

When procedures need improvement:
1. Document the issue
2. Propose new procedure
3. Get team approval
4. Update this handbook
5. Train team on changes

---

## Getting Help

**Questions about procedures?**
- See relevant section above
- Check `templates/` for examples
- Review `scripts/` for automation

**Need to add new procedure?**
1. Create documentation in `procedures/`
2. Add checklist template in `templates/`
3. Create automation scripts in `scripts/`
4. Update this handbook

**Have feedback?**
- Create GitHub issue with `label:procedure`
- Describe what could be improved
- Include reasoning and examples

---

**Last Updated:** 2026-08-09  
**Next Review:** 2026-09-09  
**Maintained By:** Development Team
