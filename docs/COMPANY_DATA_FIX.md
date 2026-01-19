# Company Data Fix Guide

## Problem Summary

Many companies are showing "0" problems because their names don't match the exact names in the data files.

## Root Cause

The application stores company selections in browser localStorage. If you previously selected companies with names like:
- "Meta" (should be "Facebook")
- "Goldman Sachs" (should be "Goldman-sachs")
- "LinkedIn" (should be "Linkedin")
- "JPMorgan" (should be "Jpmorgan")
- etc.

These won't match the actual data and will show 0 problems.

## Solution

### Option 1: Reset Everything (Recommended)

1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Run this command:
   ```javascript
   localStorage.clear(); location.reload();
   ```
4. This will reset all your selections and reload the page
5. Go through the wizard again to select companies

### Option 2: Fix Selected Companies Only

1. Open Developer Tools → Console
2. Run this command to see your current selections:
   ```javascript
   JSON.parse(localStorage.getItem('grind_config')).selectedCompanies
   ```
3. Clear just the companies:
   ```javascript
   const config = JSON.parse(localStorage.getItem('grind_config'));
   config.selectedCompanies = [];
   localStorage.setItem('grind_config', JSON.stringify(config));
   location.reload();
   ```

### Option 3: Manual Fix (Advanced)

If you want to keep your other settings but fix the company names:

```javascript
const config = JSON.parse(localStorage.getItem('grind_config'));

// Map of incorrect names to correct names
const nameMap = {
    'Meta': 'Facebook',
    'Goldman Sachs': 'Goldman-sachs',
    'LinkedIn': 'Linkedin',
    'JPMorgan': 'Jpmorgan',
    'Morgan Stanley': 'Morgan-stanley',
    'TikTok': 'Tiktok',
    'ByteDance': 'Bytedance',
    'Capital One': 'Capital-one',
    'Walmart': 'Walmart-labs',
    'DoorDash': 'Doordash',
    'VMware': 'Vmware',
    'eBay': 'Ebay',
    'PayPal': 'Paypal',
    'Booking.com': 'Bookingcom',
    'Palantir': 'Palantir-technologies'
};

// Fix the names
config.selectedCompanies = config.selectedCompanies.map(company => 
    nameMap[company] || company
);

// Remove any companies that don't exist in the data
// (You can get the valid list from the companies-list.json file)

localStorage.setItem('grind_config', JSON.stringify(config));
location.reload();
```

## Verification

After resetting, verify the fix worked:

1. Open the app
2. Check that companies now show their correct problem counts
3. The "Top Tech" preset should show:
   - Google: 5432
   - Facebook: 3429
   - Amazon: 4749
   - Microsoft: 3198
   - Apple: 878
   - Netflix: 76
   - Uber: 884
   - Airbnb: 128

## Prevention

Going forward, the wizard and configuration panel will only allow selecting companies that exist in the data, preventing this issue from happening again.

## Technical Details

The fix applied:
- ✅ Updated `Wizard.jsx` to use "Facebook" instead of "Meta"
- ✅ Created validation script to check wizard presets
- ✅ All wizard presets now match the actual data

The companies in your data use specific naming conventions:
- Lowercase with hyphens (e.g., "goldman-sachs", "morgan-stanley")
- Specific capitalization (e.g., "Linkedin" not "LinkedIn", "Jpmorgan" not "JPMorgan")
- Combined words (e.g., "Bookingcom" not "Booking.com")
