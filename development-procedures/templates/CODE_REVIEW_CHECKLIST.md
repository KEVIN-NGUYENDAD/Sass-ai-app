# Code Review Checklist

**Reviewer:** ___________________  
**Date:** ___________________  
**PR Number:** ___________________  
**Review Level:** ☐ Basic  ☐ Standard  ☐ High-Effort

---

## 1. Code Quality

### Formatting & Style
- [ ] Code follows project style guide
- [ ] Variable/function names are descriptive
- [ ] Comments are clear and necessary
- [ ] No dead code or commented-out code
- [ ] Line length < 100 characters
- [ ] Proper indentation (spaces/tabs consistent)

### Structure
- [ ] Methods are focused (single responsibility)
- [ ] Functions are reasonably sized (< 50 lines)
- [ ] Classes have clear purpose
- [ ] Imports organized and necessary
- [ ] No circular dependencies

---

## 2. Logic & Correctness

### Control Flow
- [ ] if/else conditions handle all cases
- [ ] Loop conditions are correct
- [ ] Break/continue used appropriately
- [ ] No unreachable code
- [ ] Switch statements complete (no fall-through bugs)

### Data Handling
- [ ] Variable initialization before use
- [ ] Data types are correct
- [ ] Calculations are accurate
- [ ] Comparisons use correct operators (>, <, ==, etc.)
- [ ] Null/None checks present where needed

### Business Logic
- [ ] Business rules correctly implemented
- [ ] Edge cases handled
- [ ] Boundary conditions tested
- [ ] State transitions valid
- [ ] No race conditions in concurrent code

---

## 3. Error Handling

### Exception Handling
- [ ] Try/catch blocks have specific exceptions
- [ ] Exceptions are logged with context
- [ ] User-facing errors are clear
- [ ] System errors don't expose internals
- [ ] Error recovery possible where needed

### Validation
- [ ] Input parameters validated
- [ ] API responses validated
- [ ] Database queries safe (no SQL injection)
- [ ] File operations handle errors
- [ ] Network calls have timeout/retry logic

---

## 4. Performance

### Efficiency
- [ ] No obvious inefficient algorithms
- [ ] Database queries optimized
- [ ] No N+1 query problems
- [ ] Large data sets handled efficiently
- [ ] File I/O batched appropriately

### Scalability
- [ ] Can handle 10x more users?
- [ ] Can handle 10x more data?
- [ ] Memory usage reasonable
- [ ] Cache used where appropriate
- [ ] No memory leaks detected

---

## 5. Security

### Authentication & Authorization
- [ ] Auth checks on protected endpoints
- [ ] User can't access other users' data
- [ ] Admin-only operations protected
- [ ] Session management secure
- [ ] CSRF protection if needed

### Data Security
- [ ] Sensitive data not logged
- [ ] Passwords/tokens never exposed
- [ ] SQL injection prevented
- [ ] Command injection prevented
- [ ] XSS prevention (if web)

### Infrastructure
- [ ] API keys not in code
- [ ] Secrets in environment variables
- [ ] HTTPS enforced
- [ ] Database credentials secure
- [ ] No hardcoded production URLs

---

## 6. Testing

### Test Coverage
- [ ] Unit tests for new code
- [ ] Edge cases tested
- [ ] Error conditions tested
- [ ] Integration tests for APIs
- [ ] E2E tests for user workflows

### Test Quality
- [ ] Tests are deterministic (not flaky)
- [ ] Tests verify behavior, not implementation
- [ ] Test names describe what they verify
- [ ] No test interdependencies
- [ ] Tests are maintainable

---

## 7. Documentation

### Code Comments
- [ ] Complex logic explained
- [ ] Non-obvious intent documented
- [ ] Assumptions stated
- [ ] Edge cases noted
- [ ] No comment explaining obvious code

### API Documentation
- [ ] Endpoints documented
- [ ] Parameters explained
- [ ] Response format shown
- [ ] Error cases documented
- [ ] Examples provided

### Commit Messages
- [ ] Commit message descriptive
- [ ] Explains "why" not just "what"
- [ ] References issue/ticket
- [ ] One logical change per commit

---

## 8. Database & State

### Data Integrity
- [ ] New fields properly initialized
- [ ] Migrations if schema changes
- [ ] Backward compatible if possible
- [ ] Data consistency maintained
- [ ] No data loss in updates

### Concurrency
- [ ] Concurrent updates handled
- [ ] Race conditions prevented
- [ ] Locks used appropriately
- [ ] Deadlock prevention considered

---

## 9. Dependencies

### External Libraries
- [ ] No unnecessary dependencies added
- [ ] Versions pinned appropriately
- [ ] Security updates applied
- [ ] License compatible
- [ ] Library actively maintained

### Code Dependencies
- [ ] No circular dependencies
- [ ] Coupling is loose
- [ ] External API contracts stable
- [ ] Backward compatibility maintained

---

## 10. Deployment Readiness

### Configuration
- [ ] Environment variables documented
- [ ] Default values reasonable
- [ ] No hardcoded values
- [ ] Works in dev, staging, prod
- [ ] Feature flags if needed

### Monitoring
- [ ] Errors logged appropriately
- [ ] Metrics for monitoring included
- [ ] Can diagnose issues from logs
- [ ] Performance measurable
- [ ] Alerts configured

---

## Findings Summary

### Critical Issues
(Must fix before merge)

```
1. [Line X] Issue description
   Impact: ...
   Fix: ...

2. [Line Y] Issue description
   Impact: ...
   Fix: ...
```

### Major Issues
(Should fix before merge)

```
1. [Line X] Issue description
   Recommendation: ...

2. [Line Y] Issue description
   Recommendation: ...
```

### Minor Issues
(Nice to fix)

```
1. [Line X] Issue description
   Suggestion: ...
```

---

## Overall Assessment

**Code Quality Score:** ___/100

**Maintainability:** ☐ Excellent  ☐ Good  ☐ Fair  ☐ Poor

**Security Rating:** ☐ Excellent  ☐ Good  ☐ Fair  ☐ Poor

**Performance:** ☐ Excellent  ☐ Good  ☐ Fair  ☐ Poor

**Recommendation:**
- [ ] ✅ Approve - Ready to merge
- [ ] ✅ Approve with minor fixes - Can fix after merge
- [ ] 🔄 Request changes - Resubmit after fixes
- [ ] ❌ Reject - Major issues, significant rework needed

**Comments:**

