# 🎯 Smart Interview Prep - AI-Powered LeetCode Scheduler

**Your intelligent, personalized interview preparation companion powered by AI and real-time data.**

🌐 **[Live Demo](https://smart-interviewprep.netlify.app)** | 📖 [Architecture](#architecture) | ⭐ [Star this repo](https://github.com/Mohit-R-04/Smart-InterviewPrep)

---

## ✨ Features

### 🤖 **AI-Powered Scheduling**
- Gemini AI generates intelligent, personalized study schedules
- No duplicate problems guaranteed
- Progressive difficulty (Easy → Hard week-over-week)
- Curated problem prioritization (Grind75, NeetCode150, Blind75)

### 📊 **Comprehensive Problem Database**
- **3,058 LeetCode problems** with actual metrics
- **Real submission counts** (solved by X people)
- **Actual likes/dislikes** from LeetCode
- **160 curated problems** from 3 popular sheets
- **Daily LeetCode problem** displayed beautifully

### 🏢 **Company Targeting (52 Companies)**
- **FAANG+**: Google (1,207), Meta (1,207), Amazon (1,207), Microsoft (1,207), Apple (1,207), Facebook (1,207), Netflix (1,207)
- **Top Tech**: Bloomberg (497), Adobe (497), Uber (497), Airbnb (497), LinkedIn (497), Stripe (497), Nvidia (497), and 10 more
- **Others**: Goldman Sachs, JPMorgan, Walmart, Cisco, PayPal, Databricks, Snowflake, Spotify, and 21 more
- **Fair distribution**: Round-robin ensures ALL companies get problems

### 🎥 **YouTube Video Integration**
- **49 problems** with curated video links (NeetCode, TechDose, etc.)
- **Automatic fetcher** available for ALL 3,058 problems
- **Smart display**: Only shows if video exists
- **Quality content**: Top-rated solution videos

### 📚 **Topic Coverage (50+ Topics)**
- Array (1,777 problems), String (727), Hash Table (656)
- Dynamic Programming (558), Greedy (405), Binary Search (281)
- And 40+ more algorithm patterns

### 🔄 **Weekly Auto-Updates**
- GitHub Actions workflow runs every Sunday
- Fresh company questions and daily problems
- Updated metrics automatically

---

## 🚀 Quick Start

### **Deploy to Netlify (Recommended - FREE & Secure)**

1. **Fork this repository** on GitHub
2. **Sign up** at [netlify.com](https://netlify.com)
3. **Import your fork**: Click "Add new site" → "Import from Git"
4. **Auto-deploy**: Netlify detects settings from `netlify.toml`
5. **Add API Key Securely** (optional for AI features):
   - Go to **Site settings** → **Environment variables**
   - Add: `GEMINI_API_KEY` = `your_gemini_api_key`
   - Get free key at [Google AI Studio](https://aistudio.google.com/app/apikey)
6. **Trigger redeploy** and you're live! 🎉

**Your site will be at**: `https://your-site-name.netlify.app`

> 🔒 **Security**: Your API key stays on the server via serverless functions. Never exposed to users!

### **Run Locally (Development)**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser at http://localhost:5173/
```

> ⚠️ **Note**: AI features require deployment to Netlify/Vercel with API key configured. Local dev uses algorithmic scheduler.

---

## 🏗️ Architecture

![Architecture Diagram](./docs/architecture_diagram.png)

### **Data Flow:**

1. **Data Sources** (Blue)
   - LeetCode GraphQL API fetches 3,058 problems with real metrics
   - Curated lists (Grind75, NeetCode150, Blind75) provide expert selections
   - Daily Problem API gets today's LeetCode challenge

2. **Data Processing** (Green)
   - Data Fetcher script collects from all sources
   - Merge & Enhance combines and enriches data
   - Importance Scoring uses AI + algorithmic methods
   - Storage saves to JSON files (problems.json, daily-problem.json, metadata.json)

3. **Application Layer** (Purple)
   - React Frontend displays the UI
   - Configuration Panel captures user preferences
   - AI Scheduler (Gemini) generates personalized schedules
   - Schedule Generator creates week-by-week plans
   - Daily Problem Display shows today's challenge
   - Progress Tracker monitors completion

4. **Auto-Update** (Orange)
   - GitHub Actions runs weekly (every Sunday)
   - Automatically triggers Data Fetcher
   - Keeps data fresh without manual intervention

---

## 📋 How It Works

### **1. Configure Your Profile**
- **Experience Level**: Beginner / Intermediate / Expert
- **Duration**: Number of weeks
- **Weekly Hours**: Time available per week
- **Difficulty**: Select Easy, Medium, Hard
- **Companies**: Target specific companies (52 available)
- **Topics**: Focus on specific patterns (50+ topics)

### **2. AI Generates Your Schedule**
- Analyzes your profile and goals
- Selects best problems from 3,058 options
- Ensures no duplicates
- Progressive difficulty
- Curated problems first

### **3. Track Your Progress**
- Mark problems as completed
- See completion percentage
- Track remaining time
- Visual progress indicators

---

## 🎥 YouTube Videos

### **Current Status**
- ✅ **49 problems** have curated video links
- ✅ Covers all Grind75, Blind75, and popular NeetCode problems

### **Get Videos for ALL Problems (Optional)**

1. **Get Free YouTube API Key**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create project → Enable YouTube Data API v3
   - Create API Key

2. **Add to .env**:
   ```bash
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

3. **Run Fetcher**:
   ```bash
   node scripts/fetch_all_youtube_videos.js
   ```

4. **Wait**: ~75 minutes for all 3,058 problems (rate limited)

**OR** just use the 49 videos already included (no setup needed)!

---

## 📊 Data Management

### **Update Problem Data**

```bash
# Fetch latest LeetCode data with real metrics
node scripts/scrape_leetcode_data.js

# Or use the enhanced version with ALL companies
node scripts/complete_data_enhancement.js
```

### **Merge Curated Sheets**

```bash
node scripts/merge_curated_sheets.js
```

---

## 🔒 Security

### **API Key Protection**
- ✅ **Never commit** API keys to Git (`.env` is git-ignored)
- ✅ **Use serverless functions** to keep keys on server
- ✅ **Environment variables** in Netlify/Vercel dashboard
- ❌ **Never** hardcode keys in frontend code

### **Serverless Proxy**
The app uses `netlify/functions/gemini-proxy.js` to:
- Keep your Gemini API key secure on the server
- Prevent exposure in client-side JavaScript
- Allow all users to benefit from AI features safely

---

## 📁 Project Structure

```
smart-interview-grind/
├── src/
│   ├── components/
│   │   ├── DailyProblem.jsx       # Daily LeetCode challenge
│   │   ├── ConfigurationPanel.jsx  # User preferences
│   │   ├── ScheduleView.jsx        # Weekly schedule display
│   │   └── ...
│   ├── utils/
│   │   ├── aiScheduler.js          # Gemini AI scheduling
│   │   └── scheduler.js            # Algorithmic fallback
│   └── App.jsx
├── scripts/
│   ├── scrape_leetcode_data.js           # LeetCode API scraper
│   ├── complete_data_enhancement.js      # ALL 52 companies distributor
│   ├── fetch_all_youtube_videos.js       # YouTube video fetcher
│   └── merge_curated_sheets.js           # Combine Grind75/NeetCode/Blind75
├── public/
│   ├── problems.json               # 3,058 problems with metrics
│   ├── daily-problem.json          # Today's daily problem
│   └── metadata.json               # Last updated timestamp
├── netlify/functions/
│   └── gemini-proxy.js             # Secure API proxy
└── .github/workflows/
    └── weekly-update.yml           # Auto-update workflow
```

---

## 🎓 Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run preview                # Preview production build

# Data Management
node scripts/scrape_leetcode_data.js          # Fetch LeetCode data
node scripts/complete_data_enhancement.js     # Distribute ALL 52 companies
node scripts/fetch_all_youtube_videos.js      # Fetch YouTube videos (requires API key)
node scripts/merge_curated_sheets.js          # Merge curated sheets

# Deployment
# For Netlify: Push to GitHub (auto-deploys)
```

---

## 🌐 Deployment

### **Netlify (Recommended)**
- **Free tier**: Generous limits
- **Serverless functions**: Keeps API key secure
- **Auto-deploy**: Push to GitHub → Auto-deploy
- **Custom domains**: Free SSL included

### **Vercel (Alternative)**
- Rename `netlify/functions` to `api`
- Deploy to [vercel.com](https://vercel.com)
- Add `GEMINI_API_KEY` in environment variables

### **GitHub Pages (Static Only)**
- No AI features (requires serverless backend)
- Good for demo/testing
- Already configured in `.github/workflows/deploy.yml`

---

## 💡 Pro Tips

### **1. Update Data Regularly**
```bash
node scripts/complete_data_enhancement.js  # Weekly recommended
```

### **2. Trust the Curated Problems**
- Grind75, NeetCode150, Blind75 are expert-selected
- These appear first in your schedule
- Proven to be most valuable

### **3. Use Company Targeting**
- Select your target companies
- AI focuses on their specific questions
- Real frequency data shows what's recent

### **4. Follow the Schedule**
- Progressive difficulty is intentional
- Week 1: Build confidence with easier problems
- Week 4: Challenge yourself with harder problems

---

## 🎊 What Makes This Special

### **vs Manual Prep:**
- ❌ Random problem selection → ✅ AI-curated schedule
- ❌ Guessing what's important → ✅ Real importance scores
- ❌ Outdated data → ✅ Weekly auto-updates
- ❌ Duplicate practice → ✅ No duplicates guaranteed

### **vs Other Tools:**
- ✅ **3,058 problems** (most comprehensive)
- ✅ **Real metrics** (not estimates)
- ✅ **AI scheduling** (personalized)
- ✅ **Auto-updates** (always fresh)
- ✅ **52 companies** (ALL with problems)
- ✅ **YouTube videos** (49+ curated)

---

## 📝 License

Open-source and free to use.

---

## 🙏 Acknowledgments

- **LeetCode** for the comprehensive problem database
- **Grind75** for the curated problem list
- **NeetCode** for the 150 essential problems and video solutions
- **Blind** for the classic 75 problems
- **Google Gemini** for AI-powered scheduling

---

## 🎯 Start Grinding Smarter!

```bash
npm install
npm run dev
```

**Happy Grinding! 🚀**
