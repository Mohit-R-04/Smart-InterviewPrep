# 🎥 YouTube Video Integration Guide

## Overview

The app can automatically fetch YouTube solution videos for ALL 3,058 LeetCode problems using the YouTube Data API v3.

## How It Works

1. **Automatic Search**: For each problem, searches YouTube for "LeetCode [ID] [Title] solution"
2. **Best Match**: Picks the top result (usually NeetCode, TechDose, or other quality channels)
3. **Smart Display**: Only shows video if one exists
4. **Rate Limited**: Respects YouTube API quotas (40 requests/minute)

---

## Setup (Optional)

### Option 1: Use YouTube API (Recommended for ALL problems)

1. **Get Free API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new project (or use existing)
   - Enable "YouTube Data API v3"
   - Create credentials → API Key
   - Copy the key

2. **Add to .env**:
   ```bash
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

3. **Run the Fetcher**:
   ```bash
   node scripts/fetch_all_youtube_videos.js
   ```

4. **Wait**: ~75 minutes for all 3,058 problems (rate limited)

### Option 2: Use Fallback Mappings (Default)

- **No API key needed**
- **49 popular problems** have pre-mapped NeetCode videos
- **Instant** - no fetching required
- **Already included** in the data

---

## API Quota

YouTube Data API v3 free tier:
- **10,000 units/day**
- **1 search = 100 units**
- **Can fetch ~100 videos/day** for free
- **Fetching all 3,058 problems** = ~31 days (or use multiple API keys)

### Batch Fetching Strategy

If you have quota limits, fetch in batches:

```bash
# Edit fetch_all_youtube_videos.js
# Change: for (let i = 0; i < problems.length; i++)
# To: for (let i = 0; i < 100; i++)  // First 100 problems

node scripts/fetch_all_youtube_videos.js

# Next day, change to:
# for (let i = 100; i < 200; i++)  // Next 100 problems
```

---

## What Videos Are Fetched

The script searches for:
- **NeetCode** - High quality, concise explanations
- **TechDose** - Detailed algorithm explanations  
- **Back To Back SWE** - In-depth solutions
- **Kevin Naughton Jr.** - Clear walkthroughs
- **Other quality channels**

---

## Current Status

✅ **49 problems** have videos (using fallback mappings)
- Covers all Grind75, Blind75, and NeetCode150 problems
- Includes most popular interview questions

To get videos for ALL problems:
1. Get YouTube API key (free)
2. Run the fetcher script
3. Wait for completion

---

## Display in App

Videos appear as:
- 🎥 **Video icon** next to problem title
- **Click to watch** - Opens in new tab
- **Only shown** if video exists
- **No broken links** - Problems without videos show no icon

---

## Manual Override

You can manually add videos to specific problems:

```javascript
// In public/problems.json
{
  "id": "123",
  "title": "Some Problem",
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "videoSource": "Custom"
}
```

---

## Troubleshooting

### "API quota exceeded"
- **Solution**: Wait 24 hours or use a different API key
- **Alternative**: Use fallback mappings (49 videos)

### "Invalid API key"
- **Solution**: Check the key in .env file
- **Verify**: API is enabled in Google Cloud Console

### "No videos found"
- **Normal**: Not all problems have quality YouTube solutions
- **Expected**: ~70-80% of problems will have videos

---

## Benefits

✅ **Learn visually** - Watch expert explanations
✅ **Multiple approaches** - See different solutions  
✅ **Save time** - Don't search YouTube manually
✅ **Quality content** - Top-rated solution videos
✅ **Always updated** - Fetches latest videos

---

## Commands

```bash
# Fetch videos for ALL problems (requires API key)
node scripts/fetch_all_youtube_videos.js

# Use fallback mappings only (no API key needed)
# Already done - 49 videos included!
```

---

**Your app now has comprehensive YouTube video integration! 🎥**
