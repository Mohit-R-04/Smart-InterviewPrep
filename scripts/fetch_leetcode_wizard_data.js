import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fetches company problem counts from LeetCode Wizard using Puppeteer
 * This properly executes JavaScript to access window.__NUXT__.data.companies
 */
async function fetchLeetCodeWizardData() {
    console.log('🧙 Fetching data from LeetCode Wizard (using Puppeteer)...');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.goto('https://leetcodewizard.io/problem-database', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Extract companies data from window.__NUXT__
        const companiesData = await page.evaluate(() => {
            return window.__NUXT__?.data?.companies || [];
        });

        await browser.close();

        if (!Array.isArray(companiesData) || companiesData.length === 0) {
            console.error('❌ No companies found in NUXT data');
            return { companyMap: {}, companiesList: [] };
        }

        // Convert to a map of company name -> count
        const companyMap = {};
        const companiesList = [];

        companiesData.forEach(company => {
            if (company.name && company.totalEntries) {
                // Capitalize first letter of company name
                const displayName = company.name.charAt(0).toUpperCase() + company.name.slice(1);

                companyMap[displayName] = company.totalEntries;
                companiesList.push({
                    name: displayName,
                    count: company.totalEntries,
                    slug: company.name,
                    id: company.id
                });
            }
        });

        // Sort by count (descending) - this is the priority
        companiesList.sort((a, b) => b.count - a.count);

        console.log(`✅ Fetched ${Object.keys(companyMap).length} companies from LeetCode Wizard`);
        console.log(`📊 Top 5: ${companiesList.slice(0, 5).map(c => `${c.name}(${c.count})`).join(', ')}`);

        return { companyMap, companiesList };
    } catch (error) {
        console.error('❌ Error fetching from LeetCode Wizard:', error.message);
        if (browser) {
            await browser.close();
        }
        return { companyMap: {}, companiesList: [] };
    }
}

/**
 * Merges LeetCode Wizard company counts with existing problems data
 */
async function updateProblemsWithWizardData() {
    const problemsPath = path.join(__dirname, '../public/problems.json');

    // Check if problems.json exists
    if (!fs.existsSync(problemsPath)) {
        console.error('❌ problems.json not found. Run fetch_realtime_data.js first.');
        process.exit(1);
    }

    // Load existing problems
    const problems = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));
    console.log(`📚 Loaded ${problems.length} problems from problems.json`);

    // Fetch LeetCode Wizard data
    const { companyMap: wizardCompanyCounts, companiesList } = await fetchLeetCodeWizardData();

    if (Object.keys(wizardCompanyCounts).length === 0) {
        console.warn('⚠️  No data from LeetCode Wizard, skipping update');
        return;
    }

    // Update company frequencies in problems
    let updatedCount = 0;

    problems.forEach(problem => {
        // Update company frequency counts
        if (problem.companies && Array.isArray(problem.companies)) {
            problem.companies.forEach(company => {
                if (wizardCompanyCounts[company]) {
                    if (!problem.companyFrequency) {
                        problem.companyFrequency = {};
                    }
                    problem.companyFrequency[company] = wizardCompanyCounts[company];
                    updatedCount++;
                }
            });
        }
    });

    // Save updated problems
    fs.writeFileSync(problemsPath, JSON.stringify(problems, null, 2));
    console.log(`✅ Updated ${updatedCount} company frequency entries`);
    console.log(`💾 Saved to ${problemsPath}`);

    // Save the complete companies list with priority (sorted by count)
    const companiesListPath = path.join(__dirname, '../public/companies-list.json');
    fs.writeFileSync(companiesListPath, JSON.stringify(companiesList, null, 2));
    console.log(`💾 Saved ${companiesList.length} companies (sorted by priority) to ${companiesListPath}`);

    // Also save the raw wizard data for reference
    const wizardDataPath = path.join(__dirname, '../public/wizard-company-counts.json');
    fs.writeFileSync(wizardDataPath, JSON.stringify(wizardCompanyCounts, null, 2));
    console.log(`💾 Saved raw wizard data to ${wizardDataPath}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    updateProblemsWithWizardData()
        .then(() => {
            console.log('🎉 LeetCode Wizard data integration complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Error:', error);
            process.exit(1);
        });
}

export { fetchLeetCodeWizardData, updateProblemsWithWizardData };
