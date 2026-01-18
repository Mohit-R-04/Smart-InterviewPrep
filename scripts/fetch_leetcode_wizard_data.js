import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fetches company problem counts from LeetCode Wizard
 * Companies data is embedded in the page's Nuxt state
 */
async function fetchLeetCodeWizardData() {
    console.log('🧙 Fetching data from LeetCode Wizard...');

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'leetcodewizard.io',
            path: '/problem-database',
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };

        https.get(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    // Find the script tag containing window.__NUXT__
                    const scriptMatch = data.match(/<script[^>]*>window\.__NUXT__\s*=\s*({[^<]+})<\/script>/);

                    if (!scriptMatch) {
                        console.error('❌ Could not find __NUXT__ script in page');
                        resolve({ companyMap: {}, companiesList: [] });
                        return;
                    }

                    // Parse the NUXT data
                    const nuxtData = JSON.parse(scriptMatch[1]);

                    // Extract companies array
                    const companies = nuxtData?.data?.companies || [];

                    if (companies.length === 0) {
                        console.error('❌ No companies found in NUXT data');
                        resolve({ companyMap: {}, companiesList: [] });
                        return;
                    }

                    // Convert to a map of company name -> count
                    const companyMap = {};
                    const companiesList = [];

                    companies.forEach(company => {
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

                    resolve({ companyMap, companiesList });
                } catch (error) {
                    console.error('❌ Error parsing LeetCode Wizard data:', error.message);
                    resolve({ companyMap: {}, companiesList: [] });
                }
            });
        }).on('error', (error) => {
            console.error('❌ Error fetching from LeetCode Wizard:', error.message);
            resolve({ companyMap: {}, companiesList: [] });
        });
    });
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
