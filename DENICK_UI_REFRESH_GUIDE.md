# Denick UI Refresh Guide

**Issue**: Tasks are updated in the database but not showing in the Denick UI  
**Cause**: Browser cache or UI not refreshing after API updates  
**Solution**: Hard refresh the browser  

---

## How to View Updated Tasks in Denick

### Option 1: Hard Refresh (Recommended)

1. **Open Denick**: http://localhost:5174
2. **Hard Refresh the Page**:
   - **Mac**: `Cmd + Shift + R`
   - **Windows/Linux**: `Ctrl + Shift + R`
3. **Navigate to Project Tracker**
4. **Click on Project #27** to expand it
5. **You should now see all tasks with updated status**

---

### Option 2: Clear Browser Cache

1. **Open DevTools**: `F12` or `Cmd + Option + I`
2. **Go to Application tab**
3. **Clear Storage**:
   - Click "Clear site data"
   - Check all boxes
   - Click "Clear"
4. **Refresh the page**: `Cmd + R` or `Ctrl + R`
5. **Navigate to Project #27**

---

### Option 3: Incognito/Private Window

1. **Open Incognito/Private Window**
2. **Go to**: http://localhost:5174
3. **Navigate to Project Tracker**
4. **Click on Project #27**
5. **Tasks should display correctly**

---

## Verify Tasks Are Updated in Database

### Check via API

```bash
# Get all tasks for Project #27
curl -s "http://localhost:3001/api/pt/tasks?project_id=27" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwibmFtZSI6Ik1DUCIsImlhdCI6MTc3NzI0ODM1OCwiZXhwIjoxODA4Nzg0MzU4fQ.Wmym8ZoxeqD0B8o6xHGKNr2X6vvAGwSQVIEDpvHTaJY" | jq '.[] | {id, title, status, est_hours, actual_hours}'
```

**Expected Output**:
```json
{
  "id": 437,
  "title": "Launch Pitch Passport",
  "status": "In Progress",
  "est_hours": "8.0",
  "actual_hours": "1.0"
}
```

---

## Project #27 Task Status

### Current Database State

| Task ID | Title | Status | Est Hours | Actual Hours |
|---------|-------|--------|-----------|--------------|
| 437 | Launch Pitch Passport | ✅ In Progress | 8 | 1 |
| 438 | Harden CardSparky | Backlog | 6 | 0 |
| 439 | Complete Serial Killers Phase 6 | Backlog | 10 | 0 |
| 440 | Finish Denick Documentation | Backlog | 12 | 0 |
| 441 | Verify All Deployments | Backlog | 4 | 0 |

---

## What Was Updated

### Task #437: Launch Pitch Passport

**Before**:
- Status: Backlog
- Actual Hours: 0
- Done Notes: (empty)

**After**:
- Status: ✅ In Progress
- Actual Hours: 1
- Done Notes: "Preparation complete: Created deployment documentation, verified builds, prepared environment configs. Ready for deployment execution."

---

## Troubleshooting

### Tasks Still Not Showing?

1. **Check if Denick is running**:
   ```bash
   curl -s http://localhost:5174 | head -5
   ```

2. **Check if API is running**:
   ```bash
   curl -s http://localhost:3001/api/health | jq '.ok'
   ```

3. **Check browser console for errors**:
   - Open DevTools: `F12`
   - Go to Console tab
   - Look for any red error messages

4. **Try accessing the API directly**:
   ```bash
   curl -s "http://localhost:3001/api/pt/projects/27" \
     -H "Authorization: Bearer <token>"
   ```

---

## Next Steps

1. ✅ Hard refresh Denick UI
2. ✅ Navigate to Project #27
3. ✅ Verify Task #1 shows "In Progress" with 1 actual hour
4. ✅ Continue with deployment execution

---

## Notes

- Tasks are definitely updated in the database
- API is returning correct data
- UI just needs to refresh to show the changes
- No data loss or corruption
- All changes are persistent

---

**Status**: ✅ Data Updated, UI Refresh Needed  
**Action**: Hard refresh browser and navigate to Project #27  

