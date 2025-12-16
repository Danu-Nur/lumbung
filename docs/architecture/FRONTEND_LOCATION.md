# 🚨 IMPORTANT - Correct Frontend Location

## Problem
You're running `npm run dev` from the WRONG frontend folder!

## Two Frontend Folders Exist:

### ❌ WRONG: `c:\laragon\www\lumbung\frontend`
- This is from the failed move operation
- Incomplete/broken
- Missing next-intl config
- **DO NOT USE THIS**

### ✅ CORRECT: `c:\laragon\www\lumbung\lumbung-microservices\frontend`
- This is the real frontend
- Has all files and configs
- **USE THIS ONE**

## Solution

### Step 1: Stop Current Server
Press `Ctrl+C` in the terminal running `npm run dev`

### Step 2: Navigate to Correct Frontend
```powershell
cd c:\laragon\www\lumbung\lumbung-microservices\frontend
```

### Step 3: Install Dependencies (if not done)
```powershell
npm install
```

### Step 4: Start Dev Server
```powershell
npm run dev
```

## Cleanup (Optional)

Delete the wrong frontend folder:
```powershell
cd c:\laragon\www\lumbung
Remove-Item "frontend" -Recurse -Force
```

Also delete other leftover folders from failed move:
```powershell
Remove-Item "backend" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "docs" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "docker" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "shared" -Recurse -Force -ErrorAction SilentlyContinue
```

## Correct Structure

```
c:\laragon\www\lumbung\
└── lumbung-microservices\     ← Everything should be here
    ├── backend\
    ├── frontend\              ← Run npm run dev from HERE
    ├── docs\
    └── docker-compose.yml
```

## Quick Commands

```powershell
# Stop any running servers
# Press Ctrl+C in terminals

# Navigate to correct location
cd c:\laragon\www\lumbung\lumbung-microservices\frontend

# Install (if needed)
npm install

# Run dev server
npm run dev

# Visit http://localhost:3000
```

---

**Remember**: Always run commands from `lumbung-microservices/frontend`, NOT from `lumbung/frontend`!
