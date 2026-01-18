# 🎯 Smart Interview Prep - AI-Powered LeetCode Scheduler

**Your intelligent, personalized interview preparation companion powered by AI and real-time data from LeetCode Wizard.**

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
- **Weekly auto-updates** via GitHub Actions

### 🏢 **Company Targeting (664 Companies!)**
- **664 companies** with interview frequency data from LeetCode Wizard
- **Tier 1 - FAANG+** (9): Google (5,432), Amazon (4,749), Facebook (3,429), Microsoft (3,198), etc.
- **Tier 2 - Major Tech** (26): Bloomberg (2,835), Adobe, Oracle, Nvidia, etc.
- **Tier 3 - Finance** (2): Citadel, Barclays
- **Tier 4-7**: 627 more companies organized by problem volume
- **Company counts represent**: Total interview occurrences/reports (not unique problems)
  - *Example: Google's 5,432 count = total interview reports processed by LeetCode Wizard*
  - *Actual unique problems per company: ~180-200 for top companies*
- **All problems link to**: LeetCode.com (verified - no multi-platform issues)

### 📚 **Topic Coverage (50+ Topics)**
- Array (1,777 problems), String (727), Hash Table (656)
- Dynamic Programming (558), Greedy (405), Binary Search (281)
- And 40+ more algorithm patterns

### 🔄 **Monthly Auto-Updates**
- GitHub Actions workflow runs on the 1st of every month at 00:00 UTC
- Fetches latest LeetCode problems
- Updates company data from LeetCode Wizard (using Puppeteer)
- Categorizes companies into tiers
- **Automatic rollback**: If any step fails, keeps old data intact
- Commits and deploys automatically

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
   - **LeetCode GraphQL API**: Fetches 3,058 problems with real metrics
   - **LeetCode Wizard**: Provides accurate company problem counts (664 companies)
   - **Curated Lists**: Grind75, NeetCode150, Blind75 expert selections
   - **Daily Problem API**: Gets today's LeetCode challenge

2. **Data Processing** (Green)
   - **Data Fetcher**: Collects from LeetCode API
   - **Wizard Data Fetcher**: Uses Puppeteer to extract company data
   - **Company Tier Categorization**: Organizes 664 companies into 7 tiers
   - **Merge & Enhance**: Combines and enriches all data sources
   - **Storage**: Saves to JSON files (problems.json, companies-list.json, companies-by-tier.json, etc.)

3. **Application Layer** (Purple)
   - **React Frontend**: Modern, responsive UI
   - **Configuration Panel**: Collapsible sections for companies, topics, settings
   - **AI Scheduler (Gemini)**: Generates personalized schedules
   - **Schedule Generator**: Creates week-by-week plans
   - **Daily Problem Display**: Shows today's challenge
   - **Progress Tracker**: Monitors completion with confetti celebrations

4. **Auto-Update** (Orange)
   - **GitHub Actions**: Runs weekly (every Sunday)
   - **Automated Pipeline**: Fetches → Processes → Commits → Deploys
   - **Keeps data fresh** without manual intervention

---

## 📋 How It Works

### **1. Configure Your Profile**
- **Experience Level**: Beginner / Intermediate / Expert
- **Duration**: Number of weeks until interview
- **Weekly Hours**: Time available per week
- **Difficulty**: Select Easy, Medium, Hard, Very Hard
- **Companies**: Choose from 664 companies organized by tier
- **Topics**: Focus on specific patterns (50+ topics)

### **2. AI Generates Your Schedule**
- Analyzes your profile and goals
- Selects best problems from 3,058 options
- Ensures no duplicates
- Progressive difficulty
- Prioritizes curated problems
- Uses company frequency data for targeting

### **3. Track Your Progress**
- Mark problems as completed
- See completion percentage per week
- Track remaining time
- Visual progress indicators
- Confetti celebration on week completion
- Grand finale fireworks on 100% completion

---

## 📊 Data Management

### **Automated Monthly Updates**

The system automatically updates on the **1st of every month at 00:00 UTC** with built-in failure protection:

#### **Update Process:**
1. **Backup** - Creates backups of all current data
2. **Fetch** - Gets latest data from LeetCode and LeetCode Wizard
3. **Verify** - Checks if all steps succeeded
4. **Rollback** - If ANY step fails, restores backups automatically
5. **Commit** - Pushes new data or keeps old data based on success

#### **What Gets Updated:**
- 3,058 LeetCode problems with latest metrics
- 664 companies with accurate interview frequency data
- Company tier categorization
- Metadata and timestamps

#### **Failure Protection:**
- ✅ If LeetCode API fails → Keeps old data
- ✅ If LeetCode Wizard fails → Keeps old data  
- ✅ If categorization fails → Keeps old data
- ✅ Site always has valid, working data

### **Manual Data Update (Optional)**

```bash
# Fetch latest LeetCode data
node scripts/fetch_realtime_data.js

# Fetch company data from LeetCode Wizard
node scripts/fetch_leetcode_wizard_data.js

# Categorize companies into tiers
node scripts/categorize_companies.js
```

---

## 📁 Project Structure

```
smart-interview-grind/
├── src/
│   ├── components/
│   │   ├── DailyProblem.jsx          # Daily LeetCode challenge
│   │   ├── ConfigurationPanel.jsx    # Collapsible config sections
│   │   ├── ScheduleView.jsx          # Collapsible week sections
│   │   ├── Wizard.jsx                # Multi-step setup wizard
│   │   └── ...
│   ├── utils/
│   │   ├── aiScheduler.js            # Gemini AI scheduling
│   │   └── scheduler.js              # Algorithmic fallback
│   └── App.jsx
├── scripts/
│   ├── fetch_realtime_data.js        # LeetCode API scraper
│   ├── fetch_leetcode_wizard_data.js # Puppeteer-based company data fetch
│   └── categorize_companies.js       # Company tier categorization
├── public/
│   ├── problems.json                 # 3,058 problems with metrics (2.7MB)
│   ├── companies-list.json           # 664 companies sorted by priority (79KB)
│   ├── companies-by-tier.json        # Companies organized into 7 tiers (87KB)
│   ├── wizard-company-counts.json    # Raw company counts (11KB)
│   ├── daily-problem.json            # Today's daily problem
│   └── metadata.json                 # Last updated timestamp
├── netlify/functions/
│   └── gemini-proxy.js               # Secure API proxy
└── .github/workflows/
    ├── weekly-update.yml             # Auto-update workflow (Sundays)
    └── daily-update.yml              # Daily problem fetch
```

---

## 🎓 Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run preview                # Preview production build

# Data Management (Manual - Optional)
node scripts/fetch_realtime_data.js           # Fetch LeetCode data
node scripts/fetch_leetcode_wizard_data.js    # Fetch company data (requires Puppeteer)
node scripts/categorize_companies.js          # Categorize companies into tiers

# Deployment
# For Netlify: Push to GitHub (auto-deploys)
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

## 💡 Pro Tips

### **1. Trust the Automated Updates**
- GitHub Actions keeps your data fresh every week
- No manual intervention needed
- Always have the latest company data

### **2. Use Company Tiers for Prioritization**
- **Tier 1 (FAANG+)**: Highest priority for most candidates
- **Tier 2 (Major Tech)**: Great for diversification
- **Tier 3 (Finance)**: Specialized for finance roles
- **Tiers 4-7**: Explore based on your interests

### **3. Follow the Progressive Schedule**
- Week 1: Build confidence with easier problems
- Week 4: Challenge yourself with harder problems
- AI ensures optimal difficulty progression

### **4. Use Collapsible Sections**
- All week sections are collapsible
- Focus on one week at a time
- Better mobile experience

---

## 🎊 What Makes This Special

### **vs Manual Prep:**
- ❌ Random problem selection → ✅ AI-curated schedule
- ❌ Guessing what's important → ✅ Real importance scores
- ❌ Outdated data → ✅ Weekly auto-updates
- ❌ Duplicate practice → ✅ No duplicates guaranteed

### **vs Other Tools:**
- ✅ **664 companies** (most comprehensive)
- ✅ **Real metrics** from LeetCode Wizard
- ✅ **AI scheduling** (personalized)
- ✅ **Auto-updates** (always fresh)
- ✅ **Company tiers** (organized by priority)
- ✅ **Collapsible UI** (better UX)
- ✅ **Mobile optimized** (works on all devices)

---

## 🌐 Deployment

### **Netlify (Recommended)**
- **Free tier**: Generous limits
- **Serverless functions**: Keeps API key secure
- **Auto-deploy**: Push to GitHub → Auto-deploy
- **Custom domains**: Free SSL included
- **Puppeteer support**: Works out of the box

### **GitHub Pages (Static Only)**
- No AI features (requires serverless backend)
- No automated data updates
- Good for demo/testing only

---

## 📝 License

Open-source and free to use.

---

## 🙏 Acknowledgments

- **LeetCode** for the comprehensive problem database
- **LeetCode Wizard** for accurate company problem counts
- **Grind75** for the curated problem list
- **NeetCode** for the 150 essential problems
- **Blind** for the classic 75 problems
- **Google Gemini** for AI-powered scheduling
- **Puppeteer** for reliable web scraping

---

## 🎯 Start Grinding Smarter!

```bash
npm install
npm run dev
```

**Happy Grinding! 🚀**
