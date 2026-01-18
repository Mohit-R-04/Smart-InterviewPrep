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
                        resolve({ companyMap: {}, companiesList: [] });
                        return;
                    }

                    // Parse the NUXT data
                    const nuxtData = JSON.parse(nuxtDataMatch[1]);

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
                            companyMap[company.name] = company.totalEntries;
                            companiesList.push({
                                name: company.name,
                                count: company.totalEntries,
                                slug: company.slug || company.name.toLowerCase().replace(/\s+/g, '-')
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

    // Fetch problem-level frequency data from LeetCode Wizard
    console.log('🔍 Fetching problem-level frequency data...');
    const problemFrequencyData = await fetchProblemFrequencyData();

    // Update company frequencies and problem metadata
    let updatedCount = 0;
    let frequencyUpdates = 0;

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

        // Update problem-specific frequency and metadata from wizard
        const wizardProblem = problemFrequencyData[problem.id];
        if (wizardProblem) {
            // Add wizard frequency score (0-100)
            problem.wizardFrequency = wizardProblem.frequency;

            // Add wizard difficulty if available (1=Easy, 2=Medium, 3=Hard)
            if (wizardProblem.difficulty) {
                problem.wizardDifficulty = wizardProblem.difficulty;
            }

            // Add wizard tags if available
            if (wizardProblem.tags && wizardProblem.tags.length > 0) {
                problem.wizardTags = wizardProblem.tags;
            }

            frequencyUpdates++;
        }
    });

    // Save updated problems
    fs.writeFileSync(problemsPath, JSON.stringify(problems, null, 2));
    console.log(`✅ Updated ${updatedCount} company frequency entries`);
    console.log(`✅ Updated ${frequencyUpdates} problems with wizard frequency data`);
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

/**
 * Fetches problem-level frequency data from LeetCode Wizard
 * This includes per-problem frequency scores, difficulty, and tags
 */
async function fetchProblemFrequencyData() {
    console.log('🧙 Fetching problem frequency data from LeetCode Wizard...');

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

                    // Extract problems array with frequency data
                    const problemsData = nuxtData?.data?.problems?.data || [];

                    if (problemsData.length === 0) {
                        console.warn('⚠️  No problem frequency data found');
                        resolve({});
                        return;
                    }

                    // Convert to a map of problem ID -> frequency data
                    const problemMap = {};
                    problemsData.forEach(prob => {
                        if (prob.externalId) {
                            problemMap[prob.externalId] = {
                                frequency: prob.frequency || 0,
                                difficulty: prob.difficulty,
                                tags: prob.tags || [],
                                title: prob.title,
                                titleSlug: prob.titleSlug
                            };
                        }
                    });

                    console.log(`✅ Fetched frequency data for ${Object.keys(problemMap).length} problems`);
                    console.log(`📊 Sample: Problem #1 frequency=${problemMap[1]?.frequency}, difficulty=${problemMap[1]?.difficulty}`);

                    resolve(problemMap);
                } catch (error) {
                    console.error('❌ Error parsing problem frequency data:', error.message);
                    resolve({});
                }
            });
        }).on('error', (error) => {
            console.error('❌ Error fetching problem frequency data:', error.message);
            resolve({});
        });
    });
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
