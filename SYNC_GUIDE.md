# Local & Production Sync Guide

## Problem
When we make changes to production, local development gets out of sync. The site selector was added to production but local didn't have it.

## Solution
Use a **Git-based sync workflow** where:
1. All changes are committed to GitHub
2. Local always pulls latest from GitHub
3. Production pulls latest from GitHub
4. Both stay in sync automatically

---

## 🔄 Development Workflow

### Step 1: Start Your Day
```bash
# Pull latest changes from GitHub
git pull origin main

# Install any new dependencies
npm install

# Start backend (connects to shared GoDaddy database)
npm run dev
```

### Step 2: Make Changes
```bash
# Edit files locally
# Test at http://localhost:5173

# When satisfied, commit
git add .
git commit -m "Feature: Add new functionality"
```

### Step 3: Push to GitHub
```bash
# Push to GitHub
git push origin main

# Frontend auto-deploys to Vercel
# Backend needs manual pull on droplet
```

### Step 4: Deploy Backend to Production
```bash
# SSH into droplet
ssh root@143.244.149.238

# Go to denick directory
cd /home/apps/denick

# Pull latest code
git pull origin main

# Restart backend
pm2 restart denick

# Verify it's running
pm2 status
```

---

## ✅ Keeping Local & Production in Sync

### Rule 1: Always Pull Before Starting
```bash
git pull origin main
```

### Rule 2: Always Push After Committing
```bash
git push origin main
```

### Rule 3: Always Pull on Droplet After Push
```bash
# On droplet
cd /home/apps/denick
git pull origin main
pm2 restart denick
```

### Rule 4: Check Git Status Before Making Changes
```bash
git status
```

If you see uncommitted changes, either:
- Commit them: `git add . && git commit -m "message"`
- Discard them: `git checkout .`

---

## 🐛 Troubleshooting

### Site Selector Not Showing
1. Check backend is running: `npm run dev`
2. Check `/api/sites` endpoint: `curl http://localhost:3001/api/sites`
3. Check browser console for errors
4. Verify you're logged in (site selector only shows for authenticated users)

### Changes Not Syncing
1. Check git status: `git status`
2. Pull latest: `git pull origin main`
3. Check for merge conflicts: `git log --oneline -5`
4. If conflicts, resolve them and commit

### Backend Not Starting
1. Check `.env.local` exists and has correct values
2. Check database connection: `mysql -h 72.167.125.133 -u TexSparky -p"Sparky#2020"`
3. Check port 3001 is not in use: `lsof -i :3001`
4. Check logs: `npm run dev` (should show errors)

---

## 📋 Quick Checklist

Before pushing to production:
- [ ] Code tested locally
- [ ] No hardcoded URLs (use environment variables)
- [ ] No secrets in code
- [ ] `.env.local` NOT committed
- [ ] All changes committed
- [ ] Ready to push

After pushing to production:
- [ ] SSH into droplet
- [ ] Pull latest code
- [ ] Restart PM2
- [ ] Verify backend is running
- [ ] Test in browser

---

## 🔗 Related Files
- `.env.example` - Template for environment variables
- `.env.local` - Your local development environment (git-ignored)
- `routes/sites.js` - Site selector backend
- `src/context/SiteContext.jsx` - Site selector frontend
- `src/components/DenickLayout.jsx` - Where site selector is rendered

