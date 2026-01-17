import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

// Read Grind75 CSV
const grindCSV = fs.readFileSync(path.join(ROOT_DIR, 'data/grind75.csv'), 'utf8');
const lines = grindCSV.split('\n').filter(l => l.trim());

// Skip header
const problems = [];
let idCounter = 1;

for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length < 7) continue;

    const week = parts[0];
    const title = parts[2];
    const url = parts[3];
    const difficulty = parts[4];
    const topic = parts[5];
    const timeStr = parts[6];

    // Parse time (e.g., "15 mins" -> 15)
    const duration = parseInt(timeStr.match(/\d+/)?.[0] || '30');

    // Generate problem ID from URL
    const slug = url.split('/').filter(Boolean).pop();

    // Estimate company count and likes based on difficulty
    let company_count = 3;
    let likes = 10000;
    let companies = ['Amazon', 'Google', 'Microsoft'];

    if (difficulty === 'Easy') {
        company_count = 4;
        likes = 15000 + Math.random() * 10000;
        companies = ['Amazon', 'Google', 'Microsoft', 'Facebook'];
    } else if (difficulty === 'Medium') {
        company_count = 5;
        likes = 20000 + Math.random() * 15000;
        companies = ['Amazon', 'Google', 'Microsoft', 'Facebook', 'Apple'];
    } else if (difficulty === 'Hard') {
        company_count = 4;
        likes = 15000 + Math.random() * 10000;
        companies = ['Google', 'Facebook', 'Amazon', 'Microsoft'];
    }

    problems.push({
        id: String(idCounter++),
        title: title.trim(),
        url: url.trim(),
        difficulty: difficulty.trim(),
        duration: duration,
        companies: companies,
        company_count: company_count,
        topic: topic.trim(),
        relatedTopics: [{ name: topic.trim() }],
        isGrind75: true,
        likes: Math.floor(likes)
    });
}

// Write to public/problems.json
const outputPath = path.join(ROOT_DIR, 'public/problems.json');
fs.writeFileSync(outputPath, JSON.stringify(problems, null, 2));

console.log(`✅ Generated ${problems.length} problems from Grind75 data!`);
console.log(`📝 Saved to: ${outputPath}`);
