import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fetches problems using the LeetCode Wizard API
 */
async function fetchProblemsViaAPI() {
    console.log('🧙 Fetching ALL problems from LeetCode Wizard API...\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Intercept API responses
    let apiData = null;

    page.on('response', async response => {
        const url = response.url();
        if (url.includes('api.leetcodewizard.io/api/v1/treasurer')) {
            try {
                apiData = await response.json();
                console.log('✅ Captured API response!');
            } catch (e) {
                console.error('❌ Failed to parse API response:', e.message);
            }
        }
    });

    // Visit the page to trigger the API call
    console.log('📋 Loading LeetCode Wizard...');
    await page.goto('https://leetcodewizard.io/problem-database', {
        waitUntil: 'networkidle2',
        timeout: 30000
    });

    await new Promise(r => setTimeout(r, 3000));

    await browser.close();

    if (!apiData) {
        throw new Error('Failed to capture API data');
    }

    console.log('\n📊 API Data Structure:');
    console.log('Keys:', Object.keys(apiData));

    // Save raw API data for inspection
    const rawPath = path.join(__dirname, '../public/wizard-api-raw.json');
    fs.writeFileSync(rawPath, JSON.stringify(apiData, null, 2));
    console.log(`💾 Saved raw API data to wizard-api-raw.json`);

    return apiData;
}

fetchProblemsViaAPI()
    .then(data => {
        console.log('\n🎉 Success! Check wizard-api-raw.json to see the data structure.');
        console.log('\nData keys:', Object.keys(data));
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ Error:', err);
        process.exit(1);
    });
