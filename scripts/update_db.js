import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

// === CONFIG ===
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..'); // Workspace Root
const DATA_DIR = path.join(ROOT_DIR, 'data');
const OUT_FILE = path.join(ROOT_DIR, 'src/data/problems.json');

// Filenames (User provided)
const MAPPING_CSV_NAME = 'global_problem_company_mapping.csv';
const EXCEL_PREFIX = 'leetcode_problems_';

// === HELPERS ===

function parseUserCSV(content) {
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
    // header: problem_id,problem_name,number_of_companies,list_of_companies
    // Skip header
    return lines.slice(1).map(line => {
        const parts = line.split(',');
        if (parts.length < 4) return null;
        // Logic: ID is first, Count is 2nd last, Companies is last.
        const id = parts[0];
        const companies = parts[parts.length - 1]; // bullet list
        const count = parts[parts.length - 2];
        const titleParts = parts.slice(1, parts.length - 2);
        const title = titleParts.join(','); // Re-join title works if comma in name
        const titleStr = title.trim();
        const cleanTitle = titleStr.startsWith('"') && titleStr.endsWith('"') ? titleStr.slice(1, -1) : titleStr;
        return { problem_id: id, problem_name: cleanTitle, number_of_companies: count, list_of_companies: companies };
    }).filter(Boolean);
}

function parseGrindCSV(content) {
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
    // header: Week,No,Question Title,Question URL,Difficulty,Topic,Time
    // Skip header
    return lines.slice(1).map(line => {
        const parts = line.split(',');
        if (parts.length < 7) return null;
        // Logic from original script:
        // Title is parts[2...-4]
        const title = parts.slice(2, parts.length - 4).join(',');
        const time = parts[parts.length - 1];
        return { 'Question Title': title.trim(), Time: time.trim() };
    }).filter(Boolean);
}

function loadExcelMeta(excelPath) {
    console.log(`Loading Excel from: ${excelPath}`);
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const meta = [];
    if (rows.length < 5) return [];

    // Header index check might be needed if format changes, but assuming user format is stable
    // Row 4 is header in the provided sample
    for (let i = 4; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[1]) continue;

        const title = row[1];
        const likes = row[2] || 0;
        const topicsRaw = row[6] || '';
        const difficulty = row[9] || 'Medium';

        // Clean topics
        const topics = topicsRaw.toString().split(',').map(t => t.trim()).filter(Boolean);
        const primaryTopic = topics.length > 0 ? topics[0] : 'Algorithms';

        // Structure related topics clearly
        const relatedTopics = topics.map(name => ({ name }));

        meta.push({
            Title: title.trim(),
            Difficulty: difficulty,
            Topic: primaryTopic,
            relatedTopics: relatedTopics, // Key fix from previous session
            Likes: likes
        });
    }
    return meta;
}

function estimateTime(difficulty, title) {
    let base = 30;
    let variance = 10;
    if (difficulty === 'Easy') { base = 15; variance = 10; } // 10-25
    if (difficulty === 'Medium') { base = 35; variance = 20; } // 25-55
    if (difficulty === 'Hard') { base = 60; variance = 30; } // 45-90

    // Consistent hash for deterministic variation
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = ((hash << 5) - hash) + title.charCodeAt(i);
        hash |= 0;
    }
    const offset = Math.abs(hash) % variance;
    const final = base + (hash % 2 === 0 ? offset : -offset);
    return Math.max(10, final);
}

function formatCompany(slug) {
    return slug.split('-').map(word => {
        if (word === 'ii') return 'II';
        if (word === 'iii') return 'III';
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

function getLeetCodeURL(title) {
    // Basic slugification
    const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .trim()
        .replace(/\s+/g, '-');
    return `https://leetcode.com/problems/${slug}/`;
}

const ADMIN_DIR = path.join(ROOT_DIR, 'admin');

// === MAIN ===

async function main() {
    try {
        console.log('--- Starting Data Update ---');

        // 1. Find Files in ADMIN_DIR
        const files = fs.readdirSync(ADMIN_DIR);

        // Find Excel
        const excelFile = files.find(f => f.startsWith(EXCEL_PREFIX) && f.endsWith('.xlsx'));
        if (!excelFile) {
            throw new Error(`Could not find Excel file starting with "${EXCEL_PREFIX}" in ${ADMIN_DIR}`);
        }

        // Find CSV
        const csvPath = path.join(ADMIN_DIR, MAPPING_CSV_NAME);
        if (!fs.existsSync(csvPath)) {
            throw new Error(`Could not find CSV mapping file: ${MAPPING_CSV_NAME}`);
        }

        // Find Grind75 (Static)
        const grindPath = path.join(DATA_DIR, 'grind75.csv');
        if (!fs.existsSync(grindPath)) {
            console.warn(`Warning: Grind75 data not found at ${grindPath}. Skipping Grind75 logic.`);
        }

        // 2. Load Content
        const userCSVContent = fs.readFileSync(csvPath, 'utf8');
        const userProbs = parseUserCSV(userCSVContent);

        const meta = loadExcelMeta(path.join(ADMIN_DIR, excelFile));

        let grindProbs = [];
        if (fs.existsSync(grindPath)) {
            grindProbs = parseGrindCSV(fs.readFileSync(grindPath, 'utf8'));
        }

        console.log(`Loaded: ${userProbs.length} Mapping Entries, ${meta.length} Excel Rows, ${grindProbs.length} Grind75 Entries`);

        // Indexing with normalized spacing
        const normalizeTitle = (t) => t.toLowerCase().replace(/\s+/g, ' ').trim();

        const metaMap = new Map();
        meta.forEach(p => metaMap.set(normalizeTitle(p.Title), p));

        const grindMap = new Map();
        grindProbs.forEach(p => grindMap.set(normalizeTitle(p['Question Title']), p));

        // 4. Merge
        const merged = [];

        userProbs.forEach(u => {
            const originalTitle = u['problem_name'];
            const lowerTitle = normalizeTitle(originalTitle);
            const id = u['problem_id'];

            // Normalize companies
            // Format in CSV is bullet list strings sometimes or just messy
            const rawCompanies = u['list_of_companies'].split('•').map(c => c.trim()).filter(Boolean);
            const companies = rawCompanies.map(formatCompany);

            const count = parseInt(u['number_of_companies']) || 0;

            // Defaults
            let difficulty = 'Medium';
            let topic = 'Algorithms';
            let relatedTopics = [];
            let duration = 30;
            let isGrind75 = false;
            let likes = 0;

            let url = getLeetCodeURL(originalTitle);

            // Match Excel Meta
            if (metaMap.has(lowerTitle)) {
                const m = metaMap.get(lowerTitle);
                difficulty = m.Difficulty;
                topic = m.Topic;
                relatedTopics = m.relatedTopics;
                likes = m.Likes;
                duration = estimateTime(difficulty, originalTitle);
            } else {
                duration = estimateTime(difficulty, originalTitle);
            }

            // Match Grind75 (Override duration/importance?)
            if (grindMap.has(lowerTitle)) {
                isGrind75 = true;
                // Optional: Use Grind75 time if available? 
                // keeping estimated for consistency unless needed
            }

            merged.push({
                id,
                title: originalTitle,
                url,
                difficulty,
                duration, // minutes
                companies,
                company_count: count,
                topic,
                relatedTopics, // { name: string }[]
                isGrind75,
                likes
            });
        });

        // 5. Write Output
        // Sort by company count descending by default
        merged.sort((a, b) => b.company_count - a.company_count);

        if (!fs.existsSync(path.dirname(OUT_FILE))) {
            fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
        }

        fs.writeFileSync(OUT_FILE, JSON.stringify(merged, null, 2));
        console.log(`Successfully wrote ${merged.length} problems to ${OUT_FILE}`);

    } catch (e) {
        console.error("Error updating data:", e.message);
        process.exit(1);
    }
}

main();
