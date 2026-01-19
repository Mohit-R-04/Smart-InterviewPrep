import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Scrapes the actual HTML table for company problems
 * Since NUXT data doesn't have the problems list, we scrape the rendered table
 */
async function fetchCompanyProblemsFromTable(page, companySlug, companyName) {
    try {
        console.log(`  📥 Fetching problems for ${companyName}...`);

        // Navigate to company-specific page
        await page.goto(`https://leetcodewizard.io/problem-database?company=${companySlug}`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for table to load
        await new Promise(r => setTimeout(r, 3000));

        // Scrape the problem table
        const problems = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));

            return rows.map(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 4) return null;

                // Extract data from table cells
                const titleCell = cells[1];
                const link = titleCell.querySelector('a');
                const title = link?.textContent?.trim() || '';
                const href = link?.getAttribute('href') || '';

                // Extract problem ID from href (e.g., /problems/two-sum/ -> two-sum)
                const titleSlug = href.match(/\/problems\/([^\/]+)/)?.[1] || '';

                // Difficulty is usually in a badge/span
                const difficultyCell = cells[2];
                const difficulty = difficultyCell?.textContent?.trim() || 'Medium';

                // Topics might be in another cell
                const topicsCell = cells[3];
                const topicsText = topicsCell?.textContent?.trim() || '';
                const topics = topicsText.split(',').map(t => ({ name: t.trim() })).filter(t => t.name);

                return {
                    title,
                    titleSlug,
                    url: `https://leetcode.com/problems/${titleSlug}/`,
                    difficulty,
                    topics
                };
            }).filter(p => p && p.titleSlug);
        });

        console.log(`    ✅ Found ${problems.length} problems for ${companyName}`);
        return problems;

    } catch (error) {
        console.error(`    ❌ Error fetching ${companyName}:`, error.message);
        return [];
    }
}

/**
 * Simplified fetch - gets problems for top N companies only
 */
async function fetchTopCompaniesProblems(topN = 20) {
    console.log(`🧙 Fetching problems for top ${topN} companies from LeetCode Wizard...\n`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Get company list
        console.log('📋 Step 1: Fetching company list...');
        await page.goto('https://leetcodewizard.io/problem-database', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        const companiesData = await page.evaluate(() => {
            return window.__NUXT__?.data?.companies || [];
        });

        const companiesList = companiesData
            .filter(c => c.name && c.totalEntries > 0)
            .map(c => ({
                name: c.name.charAt(0).toUpperCase() + c.name.slice(1),
                slug: c.name,
                count: c.totalEntries
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, topN);

        console.log(`✅ Found ${companiesList.length} companies to process\n`);

        // Fetch problems for each company
        console.log('📥 Step 2: Fetching problems...\n');

        const companyProblemsMap = {};
        const allProblemsMap = new Map();

        for (let i = 0; i < companiesList.length; i++) {
            const company = companiesList[i];
            console.log(`[${i + 1}/${companiesList.length}] ${company.name}...`);

            const problems = await fetchCompanyProblemsFromTable(page, company.slug, company.name);

            if (problems.length > 0) {
                companyProblemsMap[company.name] = problems;

                // Add to global map
                problems.forEach(problem => {
                    const key = problem.titleSlug;
                    if (!allProblemsMap.has(key)) {
                        allProblemsMap.set(key, {
                            ...problem,
                            companies: [company.name],
                            companyCount: 1,
                            id: problem.titleSlug
                        });
                    } else {
                        const existing = allProblemsMap.get(key);
                        if (!existing.companies.includes(company.name)) {
                            existing.companies.push(company.name);
                            existing.companyCount++;
                        }
                    }
                });
            }

            // Rate limiting
            await new Promise(r => setTimeout(r, 2000));
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

        // Summary
        const summary = {
            totalProblems: allProblems.length,
            companiesProcessed: Object.keys(companyProblemsMap).length,
            lastUpdated: new Date().toISOString(),
            companies: Object.keys(companyProblemsMap).map(name => ({
                name,
                problemCount: companyProblemsMap[name].length
            }))
        };

        fs.writeFileSync(
            path.join(outputDir, 'wizard-summary.json'),
            JSON.stringify(summary, null, 2)
        );
        console.log(`💾 Saved summary`);

        return { allProblems, companyProblemsMap };

    } catch (error) {
        console.error('❌ Error:', error);
        if (browser) await browser.close();
        throw error;
    }
}

// Run with top 20 companies by default (change to 664 for full fetch)
const topN = process.argv[2] ? parseInt(process.argv[2]) : 20;

fetchTopCompaniesProblems(topN)
    .then(() => {
        console.log('\n🎉 Done! Run: node scripts/merge_wizard_data.js');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });
