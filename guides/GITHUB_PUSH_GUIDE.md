# Quick Guide: Push Code to GitHub

## Current Status

- **Repository**: `git@github.com:DINESHPRASAD935/DSP_STORE.git`
- **Current Branch**: `scratch`
- **Remote**: Already configured ✅

## Quick Commands

### 1. Check What Needs to be Committed

```bash
cd /home/dinesh/DSP_STORE/DSP_STORE
git status
```

### 2. Add All Files

```bash
# Add everything
git add .

# Or add specific directories
git add backend/
git add frontend/
git add guides/
git add .gitignore
git add README.md
```

### 3. Commit Changes

```bash
git commit -m "Complete multitenant application with admin panel

Features:
- Multitenant architecture with Tenant model
- Site Settings management in admin panel
- Email configuration in Site Settings
- Frontend admin panel with Site Settings tab
- Comprehensive deployment guides
- AWS deployment ready for mrdsphub.in"
```

### 4. Push to GitHub

**Option A: Push to current branch (scratch)**
```bash
git push origin scratch
```

**Option B: Push to main branch**
```bash
# Create or switch to main
git checkout -b main
# Or if main exists:
git checkout main
git merge scratch

# Push
git push origin main
```

**Option C: Push to new production branch**
```bash
git checkout -b production
git push origin production
```

### 5. Verify on GitHub

1. Go to: https://github.com/DINESHPRASAD935/DSP_STORE
2. Check that all files are there
3. Verify `.env` files are NOT uploaded (check .gitignore)

## Important Notes

### Files That Should NOT Be Committed

Make sure these are in `.gitignore`:
- `.env` files (backend/.env, frontend/.env)
- `db.sqlite3` (database file)
- `__pycache__/` (Python cache)
- `node_modules/` (Node.js dependencies)
- `venv/` (Python virtual environment)
- `.vscode/` (optional, IDE settings)

### If You Get "Permission Denied" Error

**For SSH (git@github.com):**
```bash
# Test SSH connection
ssh -T git@github.com

# If it fails, you may need to:
# 1. Generate SSH key: ssh-keygen -t ed25519 -C "your_email@example.com"
# 2. Add to GitHub: Settings → SSH and GPG keys → New SSH key
# 3. Copy public key: cat ~/.ssh/id_ed25519.pub
```

**Or use HTTPS instead:**
```bash
git remote set-url origin https://github.com/DINESHPRASAD935/DSP_STORE.git
git push origin scratch
# Enter GitHub username and password/token
```

### If You Get "Branch Not Found" Error

```bash
# Create branch on remote
git push -u origin scratch
```

## Next Steps After Push

1. ✅ Code is on GitHub
2. ✅ Ready for AWS deployment
3. See [DEPLOYMENT_COMPLETE_GUIDE.md](./DEPLOYMENT_COMPLETE_GUIDE.md) for AWS deployment
