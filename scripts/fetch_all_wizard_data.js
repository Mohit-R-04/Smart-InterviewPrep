import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fetches ALL data directly from NUXT state on the main page
 * The main page has all companies and we can extract all problems from there
 */
async function fetchAllWizardData() {
    console.log('🧙 Fetching ALL data from LeetCode Wizard NUXT state...\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    console.log('📋 Loading main page...');
    await page.goto('https://leetcodewizard.io/problem-database', {
        waitUntil: 'networkidle2',
        timeout: 30000
    });

    // Wait for page to fully load
    await new Promise(r => setTimeout(r, 5000));

    // Extract ALL data from NUXT state
    const allData = await page.evaluate(() => {
        const nuxt = window.__NUXT__;

        // Get the full NUXT state
        const state = nuxt?.state || {};
        const data = nuxt?.data || {};

        // Try to find problems in various locations
        const problems = data.problems || state.problems || [];
        const companies = data.companies || state.companies || [];

        // Also check if there's a store or other data structures
        const allKeys = Object.keys(nuxt || {});

        return {
            companies,
            problems,
            nuxtKeys: allKeys,
            dataKeys: Object.keys(data),
            stateKeys: Object.keys(state),
            companiesCount: companies.length,
            problemsCount: problems.length
        };
    });

    console.log('\n📊 Data Found:');
    console.log(`- Companies: ${allData.companiesCount}`);
    console.log(`- Problems: ${allData.problemsCount}`);
    console.log(`- NUXT keys: ${allData.nuxtKeys.join(', ')}`);
    console.log(`- Data keys: ${allData.dataKeys.join(', ')}`);

    // Save companies
    if (allData.companies.length > 0) {
        const companiesPath = path.join(__dirname, '../public/wizard-companies-full.json');
        fs.writeFileSync(companiesPath, JSON.stringify(allData.companies, null, 2));
        console.log(`\n💾 Saved ${allData.companies.length} companies to wizard-companies-full.json`);
    }

    // If we got problems, save them
    if (allData.problems.length > 0) {
        const problemsPath = path.join(__dirname, '../public/wizard-problems-full.json');
        fs.writeFileSync(problemsPath, JSON.stringify(allData.problems, null, 2));
        console.log(`💾 Saved ${allData.problems.length} problems to wizard-problems-full.json`);
    }

    // Now, since the main page doesn't have all problems, let's fetch them by visiting
    // each company page. But we'll do it smarter - get the data from the page state
    console.log('\n📥 Now fetching problems for each company...');
    console.log(`⏱️  This will take ~${Math.ceil(allData.companies.length * 3 / 60)} minutes\n`);

    const allProblemsMap = new Map();
    const companyProblemsMap = {};

    // Process top companies (you can change this to allData.companies for all 664)
    const companiesToProcess = allData.companies
        .filter(c => c.totalEntries > 0)
        .sort((a, b) => b.totalEntries - a.totalEntries)
        .slice(0, 100); // Start with top 100, change to .length for all

    for (let i = 0; i < companiesToProcess.length; i++) {
        const company = companiesToProcess[i];
        const companyName = company.name.charAt(0).toUpperCase() + company.name.slice(1);

        console.log(`[${i + 1}/${companiesToProcess.length}] ${companyName}...`);

        try {
            await page.goto(`https://leetcodewizard.io/problem-database?company=${company.name}`, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            await new Promise(r => setTimeout(r, 2000));

            const companyData = await page.evaluate(() => {
                const nuxt = window.__NUXT__;
                const data = nuxt?.data || {};

                // The problems should be in the data when filtered
                return data.problems || data.filteredProblems || [];
            });

            if (companyData.length > 0) {
                console.log(`  ✅ Found ${companyData.length} problems`);
                companyProblemsMap[companyName] = companyData;

                // Add to global map
                companyData.forEach(problem => {
                    const key = problem.titleSlug || problem.id || problem.title;
                    if (!allProblemsMap.has(key)) {
                        allProblemsMap.set(key, {
                            ...problem,
                            companies: [companyName],
                            companyCount: 1
                        });
                    } else {
                        const existing = allProblemsMap.get(key);
                        if (!existing.companies.includes(companyName)) {
                            existing.companies.push(companyName);
                            existing.companyCount++;
                        }
                    }
                });
            } else {
                console.log(`  ⚠️  No problems found`);
            }

        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
        }

        // Rate limiting
        await new Promise(r => setTimeout(r, 1000));
    }

    await browser.close();

    const allProblems = Array.from(allProblemsMap.values());

    console.log(`\n✅ Fetch complete!`);
    console.log(`📊 Total unique problems: ${allProblems.length}`);
    console.log(`🏢 Companies processed: ${Object.keys(companyProblemsMap).length}`);

    // Save results
    const outputDir = path.join(__dirname, '../public');

    fs.writeFileSync(
        path.join(outputDir, 'wizard-problems.json'),
        JSON.stringify(allProblems, null, 2)
    );
    console.log(`💾 Saved to wizard-problems.json`);

    fs.writeFileSync(
        path.join(outputDir, 'company-problems-map.json'),
        JSON.stringify(companyProblemsMap, null, 2)
    );
    console.log(`💾 Saved to company-problems-map.json`);

    return { allProblems, companyProblemsMap };
}

// Run with argument for how many companies to process
const numCompanies = process.argv[2] ? parseInt(process.argv[2]) : 100;
console.log(`Will process top ${numCompanies} companies\n`);

fetchAllWizardData()
    .then(() => {
        console.log('\n🎉 Done! Now run: node scripts/merge_wizard_data.js');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ Error:', err);
        process.exit(1);
    });
