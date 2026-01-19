import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch ALL problems with company tags using LeetCode's GraphQL API
 * This fetches the companyTagStats which includes all company information
 */
async function fetchAllProblemsWithCompanies() {
    console.log('🔍 Fetching ALL LeetCode problems with company data...\n');

    const allProblems = [];
    let skip = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
        const query = `
            query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
                problemsetQuestionList: questionList(
                    categorySlug: $categorySlug
                    limit: $limit
                    skip: $skip
                    filters: $filters
                ) {
                    total: totalNum
                    questions: data {
                        acRate
                        difficulty
                        freqBar
                        frontendQuestionId: questionFrontendId
                        title
                        titleSlug
                        topicTags {
                            name
                            slug
                        }
                        hasSolution
                        hasVideoSolution
                        likes
                        dislikes
                        stats
                        companyTagStats
                    }
                }
            }
        `;

        try {
            console.log(`  Fetching batch: ${skip + 1} to ${skip + limit}...`);

            const response = await fetch('https://leetcode.com/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0',
                    'Referer': 'https://leetcode.com/problemset/all/'
                },
                body: JSON.stringify({
                    query: query,
                    variables: {
                        categorySlug: "",
                        skip: skip,
                        limit: limit,
                        filters: {}
                    }
                })
            });

            if (!response.ok) {
                console.error(`  ❌ HTTP Error: ${response.status}`);
                break;
            }

            const data = await response.json();
            const batch = data.data.problemsetQuestionList.questions;
            const total = data.data.problemsetQuestionList.total;

            allProblems.push(...batch);

            console.log(`  ✅ Fetched ${batch.length} problems (Total: ${allProblems.length}/${total})`);

            skip += limit;
            hasMore = batch.length === limit && allProblems.length < total;

            if (hasMore) {
                await delay(1000);
            }

        } catch (error) {
            console.error(`  ❌ Error: ${error.message}`);
            break;
        }
    }

    console.log(`\n✅ Total problems fetched: ${allProblems.length}\n`);
    return allProblems;
}

/**
 * Parse company tag stats to extract company names
 */
function parseCompanyTags(companyTagStats) {
    if (!companyTagStats) return [];

    try {
        const stats = JSON.parse(companyTagStats);
        const companies = [];

        // CompanyTagStats has structure like:
        // [{ taggedByAdmin: true, timesEncountered: X, slug: "google", name: "Google" }, ...]
        if (Array.isArray(stats)) {
            stats.forEach(company => {
                if (company.name) {
                    companies.push(company.name);
                }
            });
        }

        return companies;
    } catch (e) {
        return [];
    }
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('\n🎯 LEETCODE COMPANY DATA FETCHER');
        console.log('='.repeat(60));
        console.log('Fetching ALL problems with complete company data...\n');

        // Fetch all problems
        const rawProblems = await fetchAllProblemsWithCompanies();

        // Filter free problems and parse company data
        const freeProblems = rawProblems.filter(p => !p.paidOnly);
        console.log(`📊 Processing ${freeProblems.length} free problems...\n`);

        // Extract all companies
        const allCompanies = new Set();
        const problemsWithCompanies = freeProblems.map(problem => {
            const companies = parseCompanyTags(problem.companyTagStats);
            companies.forEach(c => allCompanies.add(c));

            return {
                id: problem.frontendQuestionId,
                title: problem.title,
                titleSlug: problem.titleSlug,
                url: `https://leetcode.com/problems/${problem.titleSlug}/`,
                difficulty: problem.difficulty,
                duration: estimateDuration(problem.difficulty),
                companies: companies,
                company_count: companies.length,
                topic: problem.topicTags.length > 0 ? problem.topicTags[0].name : 'Algorithms',
                relatedTopics: problem.topicTags.map(tag => ({ name: tag.name })),
                likes: problem.likes || 0,
                dislikes: problem.dislikes || 0,
                acceptanceRate: Math.round(problem.acRate * 10) / 10,
                frequency: problem.freqBar || 0,
                hasSolution: problem.hasSolution,
                hasVideoSolution: problem.hasVideoSolution,
                isCurated: false,
                importanceScore: 50
            };
        });

        console.log(`✅ Found ${allCompanies.size} unique companies!\n`);
        console.log('Top 50 companies:');
        Array.from(allCompanies).sort().slice(0, 50).forEach((c, i) => {
            console.log(`  ${(i + 1).toString().padStart(2, ' ')}. ${c}`);
        });
        if (allCompanies.size > 50) {
            console.log(`  ... and ${allCompanies.size - 50} more`);
        }

        // Save problems
        const problemsPath = path.join(ROOT_DIR, 'public/problems.json');
        fs.writeFileSync(problemsPath, JSON.stringify(problemsWithCompanies, null, 2));
        console.log(`\n💾 Saved ${problemsWithCompanies.length} problems to problems.json`);

        // Save company list
        const companiesList = Array.from(allCompanies).sort().map(name => ({ name }));
        const companiesPath = path.join(ROOT_DIR, 'public/leetcode-companies.json');
        fs.writeFileSync(companiesPath, JSON.stringify(companiesList, null, 2));
        console.log(`💾 Saved ${companiesList.length} companies to leetcode-companies.json`);

        // Generate statistics
        const companyStats = {};
        problemsWithCompanies.forEach(p => {
            p.companies.forEach(company => {
                companyStats[company] = (companyStats[company] || 0) + 1;
            });
        });

        const sortedStats = Object.entries(companyStats)
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({ name, count }));

        console.log(`\n📊 Top 20 companies by problem count:`);
        sortedStats.slice(0, 20).forEach((c, i) => {
            console.log(`  ${(i + 1).toString().padStart(2, ' ')}. ${c.name.padEnd(25, ' ')} - ${c.count} problems`);
        });

        const statsPath = path.join(ROOT_DIR, 'public/company-stats.json');
        fs.writeFileSync(statsPath, JSON.stringify(sortedStats, null, 2));
        console.log(`\n💾 Saved company statistics to company-stats.json`);

        console.log('\n' + '='.repeat(60));
        console.log('✅ COMPLETE!');
        console.log('='.repeat(60));
        console.log(`\n📈 SUMMARY:`);
        console.log(`   Total problems: ${problemsWithCompanies.length}`);
        console.log(`   Total companies: ${allCompanies.size}`);
        console.log(`   Problems with companies: ${problemsWithCompanies.filter(p => p.companies.length > 0).length}`);
        console.log(`\n🎉 All done! Your app now has ${allCompanies.size} companies!\n`);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

function estimateDuration(difficulty) {
    const durations = {
        'Easy': [10, 15, 20, 25],
        'Medium': [25, 30, 35, 40, 45],
        'Hard': [45, 50, 60, 70, 80, 90]
    };
    const options = durations[difficulty] || durations['Medium'];
    return options[Math.floor(Math.random() * options.length)];
}

main();
