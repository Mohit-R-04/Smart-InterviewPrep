# 📅 Monthly Auto-Update System

## 🔄 Update Schedule

**Runs:** 1st of every month at 00:00 UTC

## 🛡️ Failure Protection

The system now includes **automatic rollback** to protect your data:

### How It Works:

1. **Backup Phase** 📦
   - Creates backups of all current data files
   - Stores in `backups/` directory

2. **Update Phase** 🔄
   - Fetches LeetCode data (3,058 problems)
   - Fetches LeetCode Wizard data (664 companies)
   - Categorizes companies into tiers

3. **Verification Phase** ✅
   - Checks if all steps succeeded
   - If ANY step fails → Restores backups
   - If ALL steps succeed → Uses new data

4. **Commit Phase** 💾
   - Commits with status message
   - Success: "🔄 Monthly data update - YYYY-MM-DD"
   - Failure: "⚠️ Monthly update failed - kept old data - YYYY-MM-DD"

## 📊 What Gets Backed Up

- `problems.json` (3,058 problems)
- `metadata.json` (last update timestamp)
- `companies-list.json` (664 companies)
- `companies-by-tier.json` (7 tiers)
- `wizard-company-counts.json` (company counts)

## 🎯 Failure Scenarios

### Scenario 1: LeetCode API Down
- ❌ LeetCode fetch fails
- ✅ Restores old `problems.json`
- ✅ Keeps old company data
- ✅ Site continues working with previous data

### Scenario 2: LeetCode Wizard Down
- ✅ LeetCode fetch succeeds
- ❌ Wizard fetch fails
- ✅ Restores ALL backups (to keep data consistent)
- ✅ Site continues working with previous data

### Scenario 3: Partial Success
- ✅ LeetCode fetch succeeds
- ✅ Wizard fetch succeeds
- ❌ Categorization fails
- ✅ Restores ALL backups
- ✅ Site continues working with previous data

## 🧪 Manual Testing

You can manually trigger the workflow:
1. Go to GitHub → Actions
2. Select "Monthly Data Update"
3. Click "Run workflow"
4. Monitor the logs

## 📝 Commit Messages

### Success:
```
🔄 Monthly data update - 2026-01-01

LeetCode fetch: success
Wizard fetch: success
Categorization: success
```

### Failure:
```
⚠️ Monthly update failed - kept old data - 2026-01-01

LeetCode fetch: success
Wizard fetch: failure
Categorization: skipped
```

## ✅ Benefits

1. **Data Integrity**: Never lose working data
2. **Automatic Recovery**: No manual intervention needed
3. **Transparency**: Clear commit messages show what happened
4. **Reliability**: Site always has valid data
5. **Less Frequent**: Monthly updates reduce API load

## 🔧 Configuration

Located in: `.github/workflows/monthly-update.yml`

To change schedule, modify the cron expression:
```yaml
schedule:
  - cron: '0 0 1 * *'  # 1st of month at 00:00 UTC
```

Examples:
- `'0 0 1 * *'` - 1st of every month
- `'0 0 15 * *'` - 15th of every month
- `'0 0 1 */3 *'` - 1st of every 3 months (quarterly)
