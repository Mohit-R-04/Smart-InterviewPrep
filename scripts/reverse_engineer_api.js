import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Captures the actual API request to understand the payload
 */
async function reverseEngineerAPI() {
    console.log('🔬 Reverse-engineering LeetCode Wizard API...\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Capture all requests
    const apiRequests = [];

    page.on('request', request => {
        if (request.url().includes('api.leetcodewizard.io')) {
            apiRequests.push({
                url: request.url(),
                method: request.method(),
                headers: request.headers(),
                postData: request.postData()
            });
        }
    });

    // Visit the page
    console.log('📋 Loading LeetCode Wizard...');
    await page.goto('https://leetcodewizard.io/problem-database', {
        waitUntil: 'networkidle2',
        timeout: 30000
    });

    await new Promise(r => setTimeout(r, 5000));

    // Now try filtering by a company to see if it makes different requests
    console.log('📋 Filtering by Google...');
    await page.goto('https://leetcodewizard.io/problem-database?company=google', {
        waitUntil: 'networkidle2',
        timeout: 30000
    });

    await new Promise(r => setTimeout(r, 5000));

    await browser.close();

    console.log('\n📡 Captured API Requests:');
    apiRequests.forEach((req, i) => {
        console.log(`\n${i + 1}. ${req.method} ${req.url}`);
        console.log('   Headers:', JSON.stringify(req.headers, null, 2));
        if (req.postData) {
            console.log('   POST Data:', req.postData);
        }
    });

    // Save to file
    const outputPath = path.join(__dirname, '../public/api-requests-captured.json');
    fs.writeFileSync(outputPath, JSON.stringify(apiRequests, null, 2));
    console.log(`\n💾 Saved to api-requests-captured.json`);

    return apiRequests;
}

reverseEngineerAPI()
    .then(() => {
        console.log('\n✅ Done! Check api-requests-captured.json');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ Error:', err);
        process.exit(1);
    });
