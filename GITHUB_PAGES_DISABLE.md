# GitHub Pages Deployment Issue

## Problem
GitHub Pages build workflow is failing because this is a **Flask backend application**, not a static site.

## Current Status
- ✅ `.nojekyll` file added (tells GitHub to skip Jekyll processing)
- ✅ `.github/workflows/disable-pages.yml` documents the issue
- ❌ Pages build still triggers (GitHub's automatic workflow)

## Solution: Manually Disable GitHub Pages

To completely stop GitHub Pages builds:

1. Go to: **Settings > Pages** (in your GitHub repository)
2. Under "Build and deployment":
   - Find "Source" dropdown
   - Change from "Deploy from a branch" to **"None"**
   - Click **Save**

## Why This Matters

The Pages build is unnecessary because:
- This project deploys to **Render** (via `render.yaml`)
- The app is a Flask backend, not static HTML
- GitHub Actions workflows are defined in `.github/workflows/`
- Render handles all production deployment

## After Disabling

Once disabled:
- ✅ No more Pages build failures
- ✅ Deployments only via Render (auto on main push)
- ✅ GitHub Actions workflows remain operational
- ✅ Nail Salon Check-In stays running at: https://nail-salon-checkin.onrender.com/

## References

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Render Documentation](https://render.com/docs)
- [render.yaml Configuration](./render.yaml)
