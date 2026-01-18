# Architecture Diagram Generation Prompt

Use this prompt with any AI image generator (DALL-E, Midjourney, Stable Diffusion, etc.):

---

**PROMPT:**

Create a professional, modern software architecture diagram for "Smart Interview Prep - LeetCode Scheduler" with the following specifications:

**Layout:** Left-to-right flow diagram with 4 main sections

**Section 1 - DATA SOURCES (Blue theme, #2196F3):**
- Title: "DATA SOURCES"
- 4 rounded rectangle boxes:
  1. "LeetCode GraphQL API" (with database icon)
     - Subtitle: "3,058 Problems"
  2. "LeetCode Wizard" (with wizard hat icon)
     - Subtitle: "664 Companies"
  3. "Curated Lists" (with star icon)
     - Subtitle: "Grind75, NeetCode150"
  4. "Daily Problem API" (with calendar icon)
     - Subtitle: "Today's Challenge"

**Section 2 - DATA PROCESSING (Green theme, #4CAF50):**
- Title: "DATA PROCESSING"
- 5 rounded rectangle boxes stacked vertically:
  1. "Data Fetcher" (with download icon)
     - Subtitle: "fetch_realtime_data.js"
  2. "Puppeteer Scraper" (with browser icon)
     - Subtitle: "fetch_leetcode_wizard_data.js"
  3. "Company Categorizer" (with layers icon)
     - Subtitle: "7 Tiers"
  4. "Merge & Enhance" (with merge icon)
     - Subtitle: "Combine & Enrich"
  5. "JSON Storage" (with database cylinder icon)
     - Subtitle: "problems.json, companies.json"

**Section 3 - APPLICATION LAYER (Purple theme, #9C27B0):**
- Title: "APPLICATION"
- 5 rounded rectangle boxes:
  1. "React Frontend" (with React logo)
  2. "Configuration Panel" (with settings icon)
     - Subtitle: "User Preferences"
  3. "AI Scheduler" (with brain/AI icon)
     - Subtitle: "Gemini AI"
  4. "Schedule Generator" (with calendar icon)
     - Subtitle: "Week-by-Week Plans"
  5. "Progress Tracker" (with checkmark icon)
     - Subtitle: "Completion %"

**Section 4 - AUTO-UPDATE (Orange theme, #FF9800):**
- Title: "AUTOMATION"
- 1 rounded rectangle box:
  - "GitHub Actions" (with GitHub logo)
  - Subtitle: "Weekly Cron (Sundays)"
  - Arrow looping back to "Data Fetcher"

**Arrows/Flow:**
- Blue arrows from DATA SOURCES → DATA PROCESSING
- Green arrows from DATA PROCESSING → APPLICATION
- Purple arrows connecting APPLICATION components
- Orange dashed arrow from AUTOMATION → DATA PROCESSING (loop back)

**Style Requirements:**
- Clean, modern, flat design
- White background
- Rounded rectangles for all boxes
- Drop shadows for depth
- Clear, readable sans-serif font (like Inter or Roboto)
- Icons inside boxes (simple, minimalist style)
- Smooth, curved arrows with arrowheads
- Professional color palette (not too bright)
- High resolution (at least 1920x1080)
- Proper spacing between elements

**Additional Elements:**
- Title at top: "Smart Interview Prep - System Architecture"
- Small legend at bottom showing color meanings:
  - Blue = External Data Sources
  - Green = Data Processing Pipeline
  - Purple = User-Facing Application
  - Orange = Automated Updates

**Overall Feel:**
Modern SaaS architecture diagram, similar to AWS/Azure architecture diagrams but more colorful and user-friendly.

---

**Alternative Simpler Prompt (if the above is too complex):**

Create a clean software architecture flowchart with 4 columns:
1. Blue column "DATA SOURCES": LeetCode API, LeetCode Wizard, Curated Lists
2. Green column "PROCESSING": Data Fetcher, Puppeteer, Categorizer, Storage
3. Purple column "APPLICATION": React UI, AI Scheduler, Progress Tracker
4. Orange box "AUTOMATION": GitHub Actions (with arrow looping back)

Show arrows flowing left to right. Modern, professional style with icons. White background.

---

**Tools You Can Use:**
- ChatGPT (DALL-E 3)
- Midjourney
- Stable Diffusion
- Canva (with AI)
- Figma (with AI plugins)
- draw.io / diagrams.net (manual but precise)

**After Generation:**
Save the image as `docs/architecture_diagram.png` and it will automatically appear in the README!
