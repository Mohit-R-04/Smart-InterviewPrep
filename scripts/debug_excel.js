import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

const files = fs.readdirSync(ROOT_DIR);
const excelFile = files.find(f => f.startsWith('leetcode_problems_') && f.endsWith('.xlsx'));
if (!excelFile) {
    console.error("No Excel file found");
    process.exit(1);
}

const workbook = xlsx.readFile(path.join(ROOT_DIR, excelFile));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

const target = "most visited sector in a circular track";

console.log(`Searching for: "${target}" in ${excelFile}`);

let found = false;
for (let i = 4; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[1]) continue;
    const title = row[1].toString().trim().toLowerCase();

    if (title.includes("most visited") || title.includes("circular track")) {
        console.log(`Found candidate at row ${i + 1}:`);
        console.log(`  Title: "${row[1]}"`);
        console.log(`  Likes: ${row[2]}`);
        if (title === target) {
            console.log("  -> EXACT MATCH!");
            found = true;
        }
    }
}

if (!found) {
    console.log("No match found.");
}
