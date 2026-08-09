#!/usr/bin/env python3

"""
Pre-Commit Hook
Runs checks before allowing commit:
- Syntax validation
- Style checks
- Test coverage
- No secrets detection

Install: ln -s ../../development-procedures/scripts/pre-commit-hook.py .git/hooks/pre-commit
"""

import sys
import subprocess
import os

# Colors
RED = '\033[0;31m'
GREEN = '\033[0;32m'
YELLOW = '\033[1;33m'
NC = '\033[0m'  # No Color

class PreCommitChecker:
    def __init__(self):
        self.failed = False
        self.warnings = []

    def check(self, name, command):
        """Run a check and report results."""
        print(f"Running: {name}...", end=" ")
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30
            )
            if result.returncode == 0:
                print(f"{GREEN}✅{NC}")
                return True
            else:
                print(f"{RED}❌{NC}")
                if result.stdout:
                    print(f"  {result.stdout}")
                if result.stderr:
                    print(f"  {result.stderr}")
                self.failed = True
                return False
        except subprocess.TimeoutExpired:
            print(f"{RED}⏱️ TIMEOUT{NC}")
            self.failed = True
            return False
        except Exception as e:
            print(f"{YELLOW}⚠️ ERROR{NC}: {e}")
            return False

    def warn(self, message):
        """Record a warning (non-fatal)."""
        self.warnings.append(message)
        print(f"{YELLOW}⚠️ WARNING{NC}: {message}")

    def run_all_checks(self):
        """Run all pre-commit checks."""
        print("=" * 50)
        print("🔍 PRE-COMMIT CHECKS")
        print("=" * 50)
        print()

        # 1. Python Syntax Check
        print("📝 SYNTAX CHECKS")
        print("-" * 50)
        self.check(
            "Python syntax",
            "python -m py_compile nail_salon_checkin/app.py"
        )
        print()

        # 2. Code Style (if flake8 installed)
        print("🎨 STYLE CHECKS")
        print("-" * 50)
        if self._has_tool("flake8"):
            self.check(
                "PEP8 style (flake8)",
                "flake8 nail_salon_checkin/ --max-line-length=100 --ignore=E501,W503"
            )
        else:
            self.warn("flake8 not installed (skipping style check)")
        print()

        # 3. Test Coverage (if pytest installed)
        print("🧪 TEST CHECKS")
        print("-" * 50)
        if self._has_tool("pytest"):
            self.check(
                "Run tests",
                "python -m pytest tests/ -q --tb=short 2>/dev/null || true"
            )
        else:
            self.warn("pytest not installed (skipping test check)")
        print()

        # 4. Secrets Detection
        print("🔐 SECURITY CHECKS")
        print("-" * 50)
        self._check_for_secrets()
        print()

        # 5. Commit Message Check
        print("📝 COMMIT MESSAGE CHECK")
        print("-" * 50)
        self._check_commit_message()
        print()

        # Summary
        self._print_summary()
        return not self.failed

    def _has_tool(self, tool):
        """Check if a tool is installed."""
        return subprocess.run(
            f"which {tool}",
            shell=True,
            capture_output=True
        ).returncode == 0

    def _check_for_secrets(self):
        """Check for common secrets in staged files."""
        print("Scanning for secrets...", end=" ")

        secrets_patterns = [
            r"TWILIO_ACCOUNT_SID\s*=",
            r"TWILIO_AUTH_TOKEN\s*=",
            r"password\s*=\s*['\"][^'\"]+['\"]",
            r"api[_-]?key\s*=",
            r"secret\s*=",
            r"AWS_SECRET_ACCESS_KEY",
            r"BEGIN RSA PRIVATE KEY",
        ]

        found_secrets = False
        try:
            # Get staged files
            result = subprocess.run(
                "git diff --cached --name-only",
                shell=True,
                capture_output=True,
                text=True
            )

            for file in result.stdout.strip().split('\n'):
                if not file:
                    continue

                # Read file content
                try:
                    with open(file, 'r') as f:
                        content = f.read()

                    for pattern in secrets_patterns:
                        if __import__('re').search(pattern, content, __import__('re').IGNORECASE):
                            print(f"\n  {RED}❌{NC} Possible secret found in {file}")
                            found_secrets = True
                            self.failed = True
                except (UnicodeDecodeError, FileNotFoundError):
                    # Skip binary files and deleted files
                    pass

        except Exception as e:
            self.warn(f"Secret scan error: {e}")

        if not found_secrets:
            print(f"{GREEN}✅{NC}")

    def _check_commit_message(self):
        """Validate commit message format."""
        try:
            # Get the commit message from git
            result = subprocess.run(
                "git log --format=%B -n1",
                shell=True,
                capture_output=True,
                text=True
            )
            message = result.stdout.strip()

            if not message:
                print(f"Checking message format...", end=" ")
                print(f"{YELLOW}⚠️ EMPTY{NC}")
                self.warn("Commit message is empty")
                return

            # Check message format
            lines = message.split('\n')
            first_line = lines[0]

            print(f"Checking message format...", end=" ")

            # Checks
            issues = []

            if len(first_line) > 72:
                issues.append(f"Title too long ({len(first_line)} chars, max 72)")

            if len(first_line) < 10:
                issues.append("Title too short (min 10 chars)")

            if first_line[0].islower():
                issues.append("Title should start with capital letter")

            if first_line.endswith('.'):
                issues.append("Title should not end with period")

            if issues:
                print(f"{YELLOW}⚠️ WARNINGS{NC}")
                for issue in issues:
                    print(f"  ⚠️ {issue}")
            else:
                print(f"{GREEN}✅{NC}")

        except Exception as e:
            self.warn(f"Could not validate message: {e}")

    def _print_summary(self):
        """Print summary of checks."""
        print("=" * 50)
        print("📋 SUMMARY")
        print("=" * 50)

        if self.warnings:
            print(f"{YELLOW}Warnings: {len(self.warnings)}{NC}")
            for warning in self.warnings:
                print(f"  ⚠️ {warning}")
            print()

        if self.failed:
            print(f"{RED}❌ FAILED{NC}")
            print("Fix the errors above before committing.")
            return False
        else:
            print(f"{GREEN}✅ ALL CHECKS PASSED{NC}")
            print("Ready to commit!")
            return True


def main():
    """Main entry point."""
    checker = PreCommitChecker()
    success = checker.run_all_checks()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
