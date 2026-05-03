# Production vs Local Differences Report
**Generated**: May 3, 2026  
**Purpose**: Document all differences between local development and production deployment

---

## 🔴 CRITICAL ISSUES

### 1. Hardcoded Production URLs in Denick ✅ FIXED
**Files Affected**:
- `denick/src/pages/social/SocialPostsManager.jsx` (line 89) ✅ FIXED
- `denick/src/pages/BlogPage.jsx` (line 80) ✅ FIXED

**Issue**: Hardcoded `https://cardsparky.com/blog/` URLs
```javascript
// Before (WRONG):
url: `https://cardsparky.com/blog/${article.slug}`

// After (CORRECT):
url: `${import.meta.env.VITE_BLOG_URL || 'https://cardsparky.com'}/blog/${article.slug}`
```

**Impact**: Blog links will now use environment variable, allowing different URLs per deployment

**Fix Applied**: ✅ Replaced with environment variable `VITE_BLOG_URL` with fallback to `https://cardsparky.com`

**Status**: ✅ COMPLETE - Committed and pushed to GitHub (commit: 5e69746)

---

### 2. Inconsistent Environment Variable Names Across Projects

| Project | Variable Name | Fallback | Issue |
|---------|---------------|----------|-------|
| CardSparky | `VITE_API_URL` | `http://localhost:3001` | ✅ Correct |
| Denick | `VITE_API_URL` | `http://localhost:3001` | ✅ Correct |
| SerialKillers | `VITE_API_URL` | `http://localhost:5001` | ⚠️ Different port! |
| SoccerBeacon | `REACT_APP_API_BASE` | `http://localhost:3001` | ❌ Wrong var name (React not Vite) |

**Impact**: If environment variables aren't set correctly, each project falls back to different defaults

**Fix**: Standardize all projects to use `VITE_API_URL`

---

### 3. CORS Configuration Defaults to Localhost

**Files Affected**:
- `denick/server.js` (line 36)
- `cardsparky/server.js` (similar)

**Issue**:
```javascript
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174').split(',')
```

**Impact**: If `ALLOWED_ORIGINS` environment variable not set in production, server will reject requests from actual domain

**Current Status on Droplet**:
- ✅ Denick: `ALLOWED_ORIGINS=https://denick.vercel.app,http://localhost:5173,http://localhost:5174`
- ✅ CardSparky: `ALLOWED_ORIGINS=https://cardsparky.vercel.app,http://localhost:5173,http://localhost:5174`

**Fix**: Verify all production `.env` files have correct ALLOWED_ORIGINS

---

### 4. Hardcoded Production Paths in Server Code

**File**: `denick/server.js` (line 22)

**Issue**:
```javascript
dotenv.config({ path: '/home/apps/denick/.env' })
```

**Impact**: Assumes specific server directory structure. Won't work if deployed elsewhere

**Fix**: Use relative paths or environment variable for config path

---

### 5. Default JWT Secrets in Code

**Files Affected**:
- `denick/routes/_helpers.js` (line 4): `'cs_jwt_secret_change_in_production'`
- `serielkillers/server/middleware/auth.js` (line 3): `'your-secret-key-change-in-production'`

**Issue**: Placeholder secrets in code as fallback

**Impact**: Security risk if environment variables not properly set

**Current Status**: ✅ All production `.env` files have strong JWT_SECRET values

---

## ⚠️ CONFIGURATION DIFFERENCES

### Environment Variable Handling

**CardSparky Frontend** (`src/config/api.js`):
```javascript
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
```
✅ Uses nullish coalescing (`??`) - correct

**Denick Frontend** (`src/config/api.js`):
```javascript
export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
```
✅ Uses nullish coalescing (`??`) - correct

**SerialKillers Frontend** (`src/config/api.js`):
```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001'
```
⚠️ Uses logical OR (`||`) - treats empty string as falsy (different behavior)
⚠️ Falls back to port 5001 instead of 3001

**SoccerBeacon Frontend** (`DocumentationManagementPage.jsx`):
```javascript
${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/api/pt
```
❌ Uses React env var naming (not Vite)
❌ Hardcoded in component instead of centralized config

---

## 📋 Missing Environment Variable Documentation

### CardSparky
**Missing `.env.example`** - No template file for developers

**Required Variables**:
```
DB_HOST=72.167.125.133
DB_USER=TexSparky
DB_PASSWORD="Sparky#2020"
DB_NAMES=Baseball,Basketball,Football,Soccer,Hockey,MMA,Wrestling,Racing,MiscSports,MultiSport,Boxing,Cricket,Formula1,Golf,Rugby,Softball,Tennis,Gaming,Magic,Pokemon,NonSports,Yugioh,Funko,IndCards,Auth,ProjectTracker,true_crime_db,PitchPassport
DB_PORT=3306
JWT_SECRET=<strong_random_string>
JWT_EXPIRES_IN=8h
ALLOWED_ORIGINS=https://cardsparky.vercel.app,http://localhost:5173
VITE_API_URL=https://api.cardsparky.com (production) or http://localhost:3002 (local)
NODE_ENV=production
PORT=3002
```

### Denick
**`.env.example` incomplete** - Missing many required variables

**Required Variables**:
```
DB_HOST=72.167.125.133
DB_USER=TexSparky
DB_PASSWORD="Sparky#2020"
DB_NAMES=Auth,ProjectTracker
DB_PORT=3306
DB_CONN_LIMIT=2
JWT_SECRET=<strong_random_string>
JWT_EXPIRES_IN=8h
ALLOWED_ORIGINS=https://denick.vercel.app,http://localhost:5173
VITE_API_URL=https://api.denick.com (production) or http://localhost:3001 (local)
NODE_ENV=production
PORT=3001
```

### SerialKillers
**Missing `.env.example`** - No template file

**Required Variables**:
```
DB_HOST=72.167.125.133
DB_USER=TexSparky
DB_PASSWORD="Sparky#2020"
DB_NAMES=<database_list>
DB_PORT=3306
JWT_SECRET=<strong_random_string>
JWT_EXPIRES_IN=8h
ALLOWED_ORIGINS=https://serialkillers.vercel.app,http://localhost:5173
VITE_API_URL=https://api.casecipher.com (production) or http://localhost:3003 (local)
NODE_ENV=production
PORT=3003
```

### SoccerBeacon
**Missing `.env.example`** - No template file

**Required Variables**:
```
DB_HOST=72.167.125.133
DB_USER=TexSparky
DB_PASSWORD="Sparky#2020"
DB_NAMES=SoccerBeacon
DB_PORT=3306
JWT_SECRET=<strong_random_string>
JWT_EXPIRES_IN=8h
ALLOWED_ORIGINS=https://soccerbeacon.vercel.app,http://localhost:5173
REACT_APP_API_BASE=https://api.soccerbeacon.com (production) or http://localhost:5001 (local)
NODE_ENV=production
PORT=5001
```

---

## 🔧 Site-Specific Configuration Issues

### CardSparky
**Status**: ✅ Mostly correct

**Issues**:
- [ ] No `.env.example` file
- [ ] API config centralized (good)
- [ ] All hardcoded URLs replaced with API config (good)

**Vercel Environment Variables Set**:
- ✅ `VITE_API_URL=https://api.cardsparky.com`

---

### Denick
**Status**: ⚠️ Partially correct

**Issues**:
- [ ] Hardcoded blog URLs in components
- [ ] Site filtering returns hardcoded array (no permission checking)
- [ ] `.env.example` incomplete

**Vercel Environment Variables Set**:
- ✅ `VITE_API_URL=https://api.denick.com`

**Backend Issues**:
- [ ] Hardcoded production path `/home/apps/denick/.env`
- [ ] CORS configuration depends on env var

---

### SerialKillers
**Status**: ❌ Multiple issues

**Issues**:
- [ ] Wrong environment variable name (`VITE_API_URL` but different fallback port)
- [ ] No `.env.example` file
- [ ] Inconsistent with other projects

**Vercel Environment Variables Set**:
- ⚠️ `VITE_API_URL` set but fallback is `http://localhost:5001` (should be 3003)

**Backend Issues**:
- [ ] Similar CORS and JWT secret issues as other projects

---

### SoccerBeacon
**Status**: ❌ Multiple issues

**Issues**:
- [ ] Wrong environment variable name (`REACT_APP_API_BASE` instead of `VITE_API_URL`)
- [ ] API config hardcoded in components instead of centralized
- [ ] No `.env.example` file
- [ ] Uses React naming convention (not Vite)

**Vercel Environment Variables Set**:
- ❌ `REACT_APP_API_BASE` not set (using fallback `http://localhost:3001`)

**Fix Required**: Set `REACT_APP_API_BASE=https://api.soccerbeacon.com` in Vercel

---

## 📊 Production Environment Variables Status

### Droplet (.env files)

**Denick** (`/home/apps/denick/.env`):
```
✅ DB_HOST=72.167.125.133
✅ DB_USER=TexSparky
✅ DB_PASSWORD="Sparky#2020"
✅ DB_NAMES=Auth,ProjectTracker
✅ JWT_SECRET=j3k9xgz9vzjKgrSElB/ISRuG4yxJ8B+wct8tMlPFXfkFiYqcb14IiH2IpJZVW17O
✅ JWT_EXPIRES_IN=8h
✅ ALLOWED_ORIGINS=https://denick.vercel.app,http://localhost:5173,http://localhost:5174
✅ NODE_ENV=production
✅ PORT=3001
✅ VITE_API_URL=http://localhost:3001
```

**CardSparky** (`/home/apps/cardsparky/.env`):
```
✅ DB_HOST=72.167.125.133
✅ DB_USER=TexSparky
✅ DB_PASSWORD="Sparky#2020"
✅ DB_NAMES=Baseball,Basketball,Football,Soccer,Hockey,MMA,Wrestling,Racing,MiscSports,MultiSport,Boxing,Cricket,Formula1,Golf,Rugby,Softball,Tennis,Gaming,Magic,Pokemon,NonSports,Yugioh,Funko,IndCards,Auth,ProjectTracker,true_crime_db
✅ JWT_SECRET=j3k9xgz9vzjKgrSElB/ISRuG4yxJ8B+wct8tMlPFXfkFiYqcb14IiH2IpJZVW17O
✅ JWT_EXPIRES_IN=8h
✅ ALLOWED_ORIGINS=https://cardsparky.vercel.app,http://localhost:5173,http://localhost:5174
✅ NODE_ENV=production
✅ PORT=3002
✅ VITE_API_URL=http://localhost:3002
```

### Vercel Environment Variables

**CardSparky**:
- ✅ `VITE_API_URL=https://api.cardsparky.com`

**Denick**:
- ✅ `VITE_API_URL=https://api.denick.com`

**SerialKillers**:
- ⚠️ `VITE_API_URL` set but fallback port is wrong

**SoccerBeacon**:
- ❌ `REACT_APP_API_BASE` NOT SET (should be `https://api.soccerbeacon.com`)

---

## 🎯 Action Items for Tomorrow

### High Priority (Blocking Issues)
- [x] **Denick**: Remove hardcoded blog URLs, use environment variables ✅ FIXED
- [ ] **SoccerBeacon**: Set `REACT_APP_API_BASE=https://api.soccerbeacon.com` in Vercel
- [ ] **SerialKillers**: Fix environment variable name and fallback port

### Medium Priority (Configuration)
- [ ] Create `.env.example` files for all projects
- [ ] Standardize on `VITE_API_URL` for all Vite projects
- [ ] Document all required environment variables

### Low Priority (Code Quality)
- [ ] Remove hardcoded production paths from server.js
- [ ] Centralize API configuration in all projects
- [ ] Add deployment documentation

---

## 📝 Summary

**Local vs Production Sync Status**:
- ✅ All local files synced with GitHub
- ✅ All backends running on droplet
- ✅ All frontends deployed to Vercel
- ⚠️ Environment variables partially configured
- ❌ Some hardcoded URLs and inconsistent configurations

**Most Critical Fix**: Set `REACT_APP_API_BASE` in SoccerBeacon Vercel deployment

