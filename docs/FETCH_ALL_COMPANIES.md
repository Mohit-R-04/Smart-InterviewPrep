# Fetching All 664 Companies' Problems from LeetCode Wizard

## Overview

You're right! LeetCode Wizard has problems for all 664 companies. The current fetch script only gets company **counts**, not the actual **problem lists**. I've created new scripts to fetch everything.

## New Scripts Created

### 1. `fetch_wizard_problems.js`
Fetches actual problem lists for all 664 companies from LeetCode Wizard.

### 2. `merge_wizard_data.js`
Merges the wizard problems with your existing problems.json.

## How to Fetch All Company Problems

### Step 1: Fetch Problems from LeetCode Wizard

```bash
node scripts/fetch_wizard_problems.js
```

**What this does:**
- Visits LeetCode Wizard for each of the 664 companies
- Extracts all problems for each company
- Saves to `wizard-problems.json`
- Creates `company-problems-map.json` (problems grouped by company)
- Generates `wizard-summary.json` (statistics)

**Time estimate:** 30-60 minutes (rate-limited to avoid blocking)

**Output files:**
- `public/wizard-problems.json` - All unique problems with company tags
- `public/company-problems-map.json` - Problems organized by company
- `public/wizard-summary.json` - Statistics and summary

### Step 2: Merge with Existing Data

```bash
node scripts/merge_wizard_data.js
```

**What this does:**
- Loads your existing `problems.json` (3,058 problems, 52 companies)
- Loads wizard data (all 664 companies)
- Merges company tags
- Adds new problems if found
- Backs up original to `problems.backup.json`
- Saves merged data to `problems.json`

**Result:**
- `problems.json` now has ALL 664 companies properly tagged!
- Gojek and all other companies will have their problems

### Step 3: Restart Your App

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

**Clear browser cache:**
```javascript
localStorage.clear(); location.reload();
```

## Expected Results

### Before:
- 3,058 problems
- 52 companies
- Gojek: 0 problems ❌

### After:
- 3,000+ problems (possibly more if wizard has additional problems)
- 664 companies ✅
- Gojek: ~10 problems ✅
- All companies have accurate problem lists ✅

## Important Notes

### Rate Limiting
The fetch script includes rate limiting:
- 1 second delay between companies
- 5 second delay between batches of 10 companies
- Total time: ~30-60 minutes for all 664 companies

### Data Quality
- Wizard data is sourced from LeetCode's official API
- All problems link to leetcode.com
- Company tags are based on actual interview reports
- Data is as accurate as LeetCode Wizard's database

### Backup
- Original `problems.json` is backed up to `problems.backup.json`
- You can restore if needed: `cp public/problems.backup.json public/problems.json`

## Troubleshooting

### If fetch fails:
```bash
# Check if Puppeteer is installed
npm list puppeteer

# Reinstall if needed
npm install puppeteer
```

### If merge fails:
```bash
# Make sure wizard-problems.json exists
ls -lh public/wizard-problems.json

# If not, run fetch first
node scripts/fetch_wizard_problems.js
```

### If app still shows 0 problems:
1. Clear browser cache: `localStorage.clear(); location.reload();`
2. Check if problems.json was updated: `ls -lh public/problems.json`
3. Verify company tags: `grep -i "gojek" public/problems.json`

## Alternative: Quick Test

To test with just a few companies first:

Edit `fetch_wizard_problems.js` line 95:
```javascript
// Test with just top 10 companies
const companiesList = companiesData
    .filter(c => c.name && c.totalEntries > 0)
    .slice(0, 10)  // <-- Add this line
    .map(c => ({
```

Then run:
```bash
node scripts/fetch_wizard_problems.js
node scripts/merge_wizard_data.js
```

This will fetch only the top 10 companies (~2 minutes) for testing.

## Automation

To keep data fresh, update your GitHub Actions workflow to run these scripts monthly:

```yaml
- name: Fetch wizard problems
  run: node scripts/fetch_wizard_problems.js

- name: Merge wizard data
  run: node scripts/merge_wizard_data.js
```

## Summary

**Run these two commands to get all 664 companies:**

```bash
# 1. Fetch all company problems (30-60 min)
node scripts/fetch_wizard_problems.js

# 2. Merge with existing data (instant)
node scripts/merge_wizard_data.js

# 3. Restart app
npm run dev
```

Then clear browser cache and you'll have all 664 companies with their problems! 🎉
