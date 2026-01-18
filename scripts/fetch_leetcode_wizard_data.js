const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Fetches company problem counts from LeetCode Wizard
 * This provides more accurate company frequency data
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
                    // Extract the __NUXT__ data from the HTML
                    const nuxtDataMatch = data.match(/window\.__NUXT__\s*=\s*({.*?});/s);

                    if (!nuxtDataMatch) {
                        console.error('❌ Could not find __NUXT__ data in page');
                        resolve({});
                        return;
                    }

                    // Parse the NUXT data
                    const nuxtData = JSON.parse(nuxtDataMatch[1]);

                    // Extract companies array
                    const companies = nuxtData?.data?.companies || [];

                    if (companies.length === 0) {
                        console.error('❌ No companies found in NUXT data');
                        resolve({});
                        return;
                    }

                    // Convert to a map of company name -> count
                    const companyMap = {};
                    companies.forEach(company => {
                        if (company.name && company.totalEntries) {
                            companyMap[company.name] = company.totalEntries;
                        }
                    });

                    console.log(`✅ Fetched ${Object.keys(companyMap).length} companies from LeetCode Wizard`);
                    console.log(`📊 Sample counts: Google=${companyMap['Google']}, Amazon=${companyMap['Amazon']}, Microsoft=${companyMap['Microsoft']}`);

                    resolve(companyMap);
                } catch (error) {
                    console.error('❌ Error parsing LeetCode Wizard data:', error.message);
                    resolve({});
                }
            });
        }).on('error', (error) => {
            console.error('❌ Error fetching from LeetCode Wizard:', error.message);
            resolve({});
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
    const wizardCompanyCounts = await fetchLeetCodeWizardData();

    if (Object.keys(wizardCompanyCounts).length === 0) {
        console.warn('⚠️  No data from LeetCode Wizard, skipping update');
        return;
    }

    // Update company frequencies in problems
    let updatedCount = 0;
    problems.forEach(problem => {
        if (problem.companies && Array.isArray(problem.companies)) {
            problem.companies.forEach(company => {
                // If we have more accurate data from LeetCode Wizard, use it
                if (wizardCompanyCounts[company]) {
                    // Store the wizard count as metadata
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

    // Also save the raw wizard data for reference
    const wizardDataPath = path.join(__dirname, '../public/wizard-company-counts.json');
    fs.writeFileSync(wizardDataPath, JSON.stringify(wizardCompanyCounts, null, 2));
    console.log(`💾 Saved raw wizard data to ${wizardDataPath}`);
}

// Run if called directly
if (require.main === module) {
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

module.exports = { fetchLeetCodeWizardData, updateProblemsWithWizardData };
