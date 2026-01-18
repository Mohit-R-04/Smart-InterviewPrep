# System Architecture

```mermaid
graph TD
    %% Styling
    classDef source fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
    classDef process fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000
    classDef app fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    classDef auto fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#000

    subgraph DataSources [DATA SOURCES]
        direction TB
        LC["LeetCode GraphQL API"]:::source
        Wizard["LeetCode Wizard<br/>(Company Counts)"]:::source
        Curated["Curated Lists<br/>(Grind75, NeetCode)"]:::source
        DailyAPI["Daily Problem API"]:::source
    end

    subgraph Processing [DATA PROCESSING]
        direction TB
        Fetcher["Data Fetcher"]:::process
        Puppeteer["Puppeteer Scraper"]:::process
        Categorizer["Company Tier<br/>Categorizer"]:::process
        Merger["Merge & Enhance"]:::process
        Storage[("JSON Storage<br/>(problems.json,<br/>companies.json)")]:::process
    end

    subgraph Application [APPLICATION LAYER]
        direction TB
        UI["React Frontend"]:::app
        Config["Configuration Panel"]:::app
        AI["AI Scheduler<br/>(Gemini)"]:::app
        Schedule["Schedule Generator"]:::app
        Progress["Progress Tracker"]:::app
    end

    subgraph Automation [AUTO-UPDATE]
        GH["GitHub Actions<br/>(Weekly Cron)"]:::auto
    end

    %% Data Flow
    LC --> Fetcher
    Wizard --> Puppeteer
    Puppeteer --> Categorizer
    Curated --> Fetcher
    DailyAPI --> Fetcher

    Fetcher --> Merger
    Categorizer --> Merger
    Merger --> Storage

    Storage --> UI
    
    %% App Flow
    UI --> Config
    Config --> AI
    AI --> Schedule
    Schedule --> Progress

    %% Automation Flow
    GH -.->|Triggers| Fetcher
    GH -.->|Triggers| Puppeteer
```

## Component Description

### 1. Data Sources (Blue)
- **LeetCode GraphQL API**: Fetches detailed metrics for 3,058 problems.
- **LeetCode Wizard**: Provides accurate company problem counts using Puppeteer.
- **Curated Lists**: Expert-selected problem lists (Grind75, NeetCode150).
- **Daily Problem API**: Retrieves the daily challenge.

### 2. Data Processing (Green)
- **Data Fetcher**: Orchestrates the data collection from multiple sources.
- **Puppeteer Scraper**: Handles dynamic content extraction for company data.
- **Company Tier Categorizer**: Organizes 664 companies into 7 priority tiers.
- **Merge & Enhance**: Combines all data, ensures consistency, and adds importance scores.
- **Storage**: Static JSON files that drive the frontend (fast, cheap, reliable).

### 3. Application Layer (Purple)
- **React Frontend**: The main user interface.
- **AI Scheduler**: Uses Google Gemini to generate personalized paths.
- **Progress Tracker**: Persists user progress and celebrates milestones.

### 4. Auto-Update (Orange)
- **GitHub Actions**: Runs every Sunday at 00:00 UTC to keep data fresh.
