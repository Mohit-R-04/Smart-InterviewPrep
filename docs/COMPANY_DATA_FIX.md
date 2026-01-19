# Company Data Sync Issue - RESOLVED ✅

## Problem Summary

Users were seeing companies with "0" problems even though the wizard showed those companies had problems available.

### Example
- Selected "Gojek" → Shows 0 / 0 (0%) progress
- Wizard said "Gojek: 10 problems"
- But no actual problems were available

## Root Cause Analysis

The application had **TWO SEPARATE DATA SOURCES** that were **OUT OF SYNC**:

### Data Source 1: `problems.json` (Source of Truth)
- **3,058 total problems**
- **52 unique companies** with actual problem tags
- Uses friendly names: `"Goldman Sachs"`, `"Capital One"`, `"Meta"`, `"LinkedIn"`
- This is what the app actually uses to generate schedules

### Data Source 2: `wizard-company-counts.json` (External API)
- **664 companies** listed
- From LeetCode Wizard API
- Uses slug names: `"goldman-sachs"`, `"capital-one"`, `"facebook"`, `"linkedin"`
- **NOT synced with actual problems.json**

### The Mismatch

```
wizard-company-counts.json says: "Gojek": 10
problems.json has: 0 problems tagged with "Gojek"

Result: User selects Gojek → Gets 0 problems → Sees 0/0 progress
```

**612 companies** in the wizard data have **NO actual problems** in problems.json!

## Solution Implemented

### 1. **Removed Wizard Data Dependency**
Changed from using `wizard-company-counts.json` to calculating counts directly from `problems.json`:

```javascript
// OLD (BROKEN):
const wizardCompanyCounts = useMemo(() => {
    if (!companiesData) return null;
    const map = new Map();
    companiesData.forEach(company => {
        map.set(company.name, company.count); // ❌ Out of sync!
    });
    return map;
}, [companiesData]);

// NEW (FIXED):
const dynamicCompanyCounts = useMemo(() => {
    const map = new Map();
    if (!problemsData) return map;
    
    // Count ACTUAL problems per company
    problemsData.forEach(p => {
        p.companies.forEach(c => {
            map.set(c, (map.get(c) || 0) + 1); // ✅ Real counts!
        });
    });
    
    return map;
}, [problemsData]);
```

### 2. **Added Company Name Normalization**
Created `/src/utils/companyNameMapper.js` to handle name variations:

- Maps `"facebook"` → `"Facebook"` and `"Meta"`
- Maps `"goldman-sachs"` → `"Goldman Sachs"`
- Maps `"linkedin"` → `"LinkedIn"`
- etc.

This ensures fuzzy matching works even if names don't match exactly.

### 3. **Updated Filtering Logic**
Updated three places to use fuzzy company name matching:

1. **`scheduler.js`** - Problem filtering for schedule generation
2. **`App.jsx` - `filteredStats`** - Difficulty stats calculation
3. **`App.jsx` - `dynamicTopicCounts`** - Topic counts calculation

```javascript
// Fuzzy matching logic
const hasCompany = config.selectedCompanies.some(selectedCompany => {
    const variations = getCompanyNameVariations(selectedCompany);
    return p.companies.some(problemCompany => {
        const problemCompanyLower = problemCompany.toLowerCase();
        return variations.some(v => v.toLowerCase() === problemCompanyLower);
    });
});
```

## Files Changed

1. ✅ `/src/utils/companyNameMapper.js` - NEW: Company name normalization
2. ✅ `/src/utils/scheduler.js` - Updated: Fuzzy company matching
3. ✅ `/src/App.jsx` - Updated: Use actual problem counts, fuzzy matching
4. ✅ `/src/components/Wizard.jsx` - Fixed: "Meta" → "Facebook"
5. ✅ `/.github/workflows/monthly-update.yml` - Fixed: Workflow context error

## Result

### Before Fix ❌
- Wizard showed 664 companies
- Many companies showed "0" problems
- Selecting "Gojek" → 0 / 0 (0%) progress
- Confusing user experience

### After Fix ✅
- UI shows only 52 companies (the ones with actual problems)
- All companies show accurate problem counts
- Selecting any company → Shows real problems
- Clear, accurate user experience

## Verification

The 52 companies with actual problems in your data:

```
Adobe, Airbnb, Amazon, Apple, Atlassian, Bloomberg, Booking.com, 
ByteDance, Capital One, Cisco, Citadel, Coinbase, Databricks, 
DoorDash, Dropbox, Expedia, Facebook, Goldman Sachs, Google, 
Instacart, Intuit, JPMorgan, LinkedIn, Lyft, Meta, Microsoft, 
Morgan Stanley, Netflix, Nvidia, Oracle, Palantir, PayPal, 
Pinterest, Qualcomm, Reddit, Robinhood, Salesforce, Shopify, 
Snap, Snowflake, Spotify, Square, Stripe, Tesla, TikTok, 
Twitter, Uber, Visa, VMware, Walmart, Yahoo, Yelp
```

## Next Steps

### Option 1: Use Current Fix (Recommended)
- The app now works correctly with the 52 companies
- All counts are accurate
- No more "0" problem companies

### Option 2: Update Problems Data
If you want more companies, you need to:
1. Run the data fetching scripts to get updated problems.json
2. Ensure the scripts tag problems with all 664 companies
3. Re-deploy the updated data

### Option 3: Hybrid Approach
- Keep wizard data for display purposes only
- Use actual problem counts for filtering
- Show a badge like "No problems available" for companies with 0 actual problems

## Testing

To test the fix:

1. Clear localStorage:
   ```javascript
   localStorage.clear(); location.reload();
   ```

2. Go through the wizard

3. Select any company from the list

4. Verify you see actual problems (not 0/0)

5. Check that problem counts match reality

## Prevention

Going forward:
- ✅ Company counts come from actual problems data
- ✅ Fuzzy matching handles name variations
- ✅ Only companies with problems are shown
- ✅ No more sync issues between data sources
