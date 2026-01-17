import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

/**
 * INTELLIGENT PROBLEM IMPORTANCE ANALYZER
 * 
 * Uses multiple signals to determine problem importance:
 * 1. Company frequency (how many companies ask this)
 * 2. Problem popularity (likes, acceptance rate)
 * 3. Topic fundamentals (is this a core pattern?)
 * 4. Grind75 status (expert-curated)
 * 5. AI analysis (Gemini evaluates problem importance)
 */

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

async function analyzeProblemsWithGemini(problems, apiKey, batchSize = 50) {
    console.log('\n🤖 Analyzing problem importance with Gemini AI...');

    const analyzedProblems = [];

    // Process in batches to avoid token limits
    for (let i = 0; i < problems.length; i += batchSize) {
        const batch = problems.slice(i, i + batchSize);
        console.log(`  Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(problems.length / batchSize)}...`);

        try {
            const problemSummaries = batch.map(p => ({
                id: p.id,
                title: p.title,
                difficulty: p.difficulty,
                topics: p.relatedTopics.map(t => t.name).slice(0, 3).join(', '),
                companies: p.companies.slice(0, 5).join(', '),
                acceptanceRate: p.acceptanceRate,
                isGrind75: p.isGrind75
            }));

            const prompt = `You are an expert technical interviewer analyzing LeetCode problems for interview preparation.

For each problem below, assign an IMPORTANCE SCORE from 1-100 based on:
- How fundamental the pattern/concept is
- How frequently it appears in real interviews
- How well it teaches transferable skills
- Whether it's a "must-know" problem

Problems:
${JSON.stringify(problemSummaries, null, 2)}

Respond with ONLY a JSON array of objects with this format:
[
  {"id": "1", "importanceScore": 95, "reason": "Fundamental hash table pattern, asked everywhere"},
  {"id": "2", "importanceScore": 75, "reason": "Good linked list practice, common pattern"}
]

Be concise with reasons (max 10 words). Focus on interview relevance.`;

            const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 8000
                    }
                })
            });

            if (!response.ok) {
                console.error(`  ❌ Gemini API error: ${response.status}`);
                // Fallback to algorithmic scoring
                batch.forEach(p => {
                    analyzedProblems.push({
                        ...p,
                        importanceScore: calculateAlgorithmicScore(p),
                        aiReason: 'Algorithmic scoring (API unavailable)'
                    });
                });
                continue;
            }

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;

            // Parse AI response
            const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                console.error('  ⚠️  Invalid AI response format, using algorithmic scoring');
                batch.forEach(p => {
                    analyzedProblems.push({
                        ...p,
                        importanceScore: calculateAlgorithmicScore(p),
                        aiReason: 'Algorithmic scoring (parsing failed)'
                    });
                });
                continue;
            }

            const aiScores = JSON.parse(jsonMatch[0]);

            // Merge AI scores with problems
            batch.forEach(problem => {
                const aiScore = aiScores.find(s => s.id === problem.id);
                analyzedProblems.push({
                    ...problem,
                    importanceScore: aiScore ? aiScore.importanceScore : calculateAlgorithmicScore(problem),
                    aiReason: aiScore ? aiScore.reason : 'No AI analysis available'
                });
            });

            console.log(`  ✅ Analyzed ${batch.length} problems`);

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`  ❌ Error in batch: ${error.message}`);
            // Fallback to algorithmic scoring
            batch.forEach(p => {
                analyzedProblems.push({
                    ...p,
                    importanceScore: calculateAlgorithmicScore(p),
                    aiReason: 'Algorithmic scoring (error occurred)'
                });
            });
        }
    }

    console.log('✅ AI analysis complete');
    return analyzedProblems;
}

function calculateAlgorithmicScore(problem) {
    let score = 50; // Base score

    // Company frequency (0-25 points)
    score += Math.min(problem.company_count * 3, 25);

    // Grind75 boost (15 points)
    if (problem.isGrind75) score += 15;

    // Difficulty adjustment
    if (problem.difficulty === 'Medium') score += 5; // Sweet spot
    if (problem.difficulty === 'Easy') score += 3;

    // Acceptance rate (higher = more fundamental, 0-10 points)
    score += Math.min(problem.acceptanceRate / 10, 10);

    // Topic importance (core topics get boost)
    const coreTopics = ['Array', 'String', 'Hash Table', 'Two Pointers', 'Sliding Window',
        'Binary Search', 'Linked List', 'Tree', 'Graph', 'Dynamic Programming'];
    const hasCoreTopics = problem.relatedTopics.some(t => coreTopics.includes(t.name));
    if (hasCoreTopics) score += 10;

    // Frequency bar (0-10 points)
    score += Math.min(problem.frequency / 10, 10);

    return Math.min(Math.round(score), 100);
}

function calculateCompanyTopicImportance(problems) {
    console.log('\n📊 Calculating company-topic importance matrix...');

    const companyTopicMatrix = {};

    problems.forEach(problem => {
        problem.companies.forEach(company => {
            if (!companyTopicMatrix[company]) {
                companyTopicMatrix[company] = {};
            }

            problem.relatedTopics.forEach(topic => {
                const topicName = topic.name;
                if (!companyTopicMatrix[company][topicName]) {
                    companyTopicMatrix[company][topicName] = {
                        count: 0,
                        problems: [],
                        avgImportance: 0,
                        topProblems: []
                    };
                }

                companyTopicMatrix[company][topicName].count++;
                companyTopicMatrix[company][topicName].problems.push({
                    id: problem.id,
                    title: problem.title,
                    importance: problem.importanceScore,
                    difficulty: problem.difficulty
                });
            });
        });
    });

    // Calculate averages and top problems for each company-topic pair
    Object.keys(companyTopicMatrix).forEach(company => {
        Object.keys(companyTopicMatrix[company]).forEach(topic => {
            const data = companyTopicMatrix[company][topic];

            // Calculate average importance
            data.avgImportance = data.problems.reduce((sum, p) => sum + p.importance, 0) / data.problems.length;

            // Get top 5 most important problems
            data.topProblems = data.problems
                .sort((a, b) => b.importance - a.importance)
                .slice(0, 5)
                .map(p => ({
                    id: p.id,
                    title: p.title,
                    importance: p.importance,
                    difficulty: p.difficulty
                }));

            // Clean up full problems array to save space
            delete data.problems;
        });
    });

    console.log('✅ Company-topic matrix calculated');
    return companyTopicMatrix;
}

function generateImportanceReport(problems, companyTopicMatrix) {
    console.log('\n📈 Generating importance report...');

    const report = {
        totalProblems: problems.length,
        avgImportance: problems.reduce((sum, p) => sum + p.importanceScore, 0) / problems.length,

        topProblems: problems
            .sort((a, b) => b.importanceScore - a.importanceScore)
            .slice(0, 50)
            .map(p => ({
                id: p.id,
                title: p.title,
                importance: p.importanceScore,
                difficulty: p.difficulty,
                companies: p.companies.slice(0, 3),
                topics: p.relatedTopics.map(t => t.name).slice(0, 3),
                reason: p.aiReason
            })),

        byDifficulty: {
            Easy: {
                count: problems.filter(p => p.difficulty === 'Easy').length,
                avgImportance: problems.filter(p => p.difficulty === 'Easy')
                    .reduce((sum, p) => sum + p.importanceScore, 0) /
                    problems.filter(p => p.difficulty === 'Easy').length
            },
            Medium: {
                count: problems.filter(p => p.difficulty === 'Medium').length,
                avgImportance: problems.filter(p => p.difficulty === 'Medium')
                    .reduce((sum, p) => sum + p.importanceScore, 0) /
                    problems.filter(p => p.difficulty === 'Medium').length
            },
            Hard: {
                count: problems.filter(p => p.difficulty === 'Hard').length,
                avgImportance: problems.filter(p => p.difficulty === 'Hard')
                    .reduce((sum, p) => sum + p.importanceScore, 0) /
                    problems.filter(p => p.difficulty === 'Hard').length
            }
        },

        topCompanies: Object.entries(companyTopicMatrix)
            .map(([company, topics]) => {
                const allProblems = Object.values(topics).flatMap(t => t.topProblems);
                const avgImportance = allProblems.reduce((sum, p) => sum + p.importance, 0) / allProblems.length;
                return {
                    company,
                    topicCount: Object.keys(topics).length,
                    avgImportance: Math.round(avgImportance * 10) / 10,
                    topTopics: Object.entries(topics)
                        .sort((a, b) => b[1].avgImportance - a[1].avgImportance)
                        .slice(0, 5)
                        .map(([topic, data]) => ({
                            topic,
                            count: data.count,
                            avgImportance: Math.round(data.avgImportance * 10) / 10
                        }))
                };
            })
            .sort((a, b) => b.avgImportance - a.avgImportance)
            .slice(0, 10),

        companyTopicMatrix: companyTopicMatrix
    };

    console.log('✅ Report generated');
    return report;
}

async function main() {
    try {
        console.log('\n🎯 INTELLIGENT PROBLEM IMPORTANCE ANALYZER');
        console.log('='.repeat(60));

        // Check for Gemini API key
        const apiKey = process.env.GEMINI_API_KEY || process.argv[2];
        if (!apiKey) {
            console.log('\n⚠️  No Gemini API key provided. Using algorithmic scoring only.');
            console.log('   To use AI analysis, run: GEMINI_API_KEY=your_key node scripts/analyze_importance.js');
            console.log('   Or: node scripts/analyze_importance.js your_key\n');
        }

        // Load problems
        const problemsPath = path.join(ROOT_DIR, 'public/problems.json');
        if (!fs.existsSync(problemsPath)) {
            console.error('❌ problems.json not found. Run npm run fetch-leetcode first.');
            process.exit(1);
        }

        const problems = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));
        console.log(`\n📚 Loaded ${problems.length} problems`);

        // Analyze with AI or algorithmic scoring
        let analyzedProblems;
        if (apiKey) {
            analyzedProblems = await analyzeProblemsWithGemini(problems, apiKey);
        } else {
            console.log('\n🔢 Using algorithmic scoring...');
            analyzedProblems = problems.map(p => ({
                ...p,
                importanceScore: calculateAlgorithmicScore(p),
                aiReason: 'Algorithmic scoring'
            }));
            console.log('✅ Scoring complete');
        }

        // Calculate company-topic importance matrix
        const companyTopicMatrix = calculateCompanyTopicImportance(analyzedProblems);

        // Generate report
        const report = generateImportanceReport(analyzedProblems, companyTopicMatrix);

        // Save enhanced problems
        const outputPath = path.join(ROOT_DIR, 'public/problems.json');
        fs.writeFileSync(outputPath, JSON.stringify(analyzedProblems, null, 2));
        console.log(`\n💾 Saved enhanced problems to: ${outputPath}`);

        // Save importance report
        const reportPath = path.join(ROOT_DIR, 'public/importance-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📊 Saved importance report to: ${reportPath}`);

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ ANALYSIS COMPLETE!');
        console.log('='.repeat(60));
        console.log(`\n📈 SUMMARY:`);
        console.log(`   Average importance score: ${Math.round(report.avgImportance)}/100`);
        console.log(`\n   Top 5 Most Important Problems:`);
        report.topProblems.slice(0, 5).forEach((p, idx) => {
            console.log(`     ${idx + 1}. ${p.title} (${p.importance}/100) - ${p.difficulty}`);
            console.log(`        ${p.reason}`);
        });

        console.log(`\n   Top 5 Companies by Problem Importance:`);
        report.topCompanies.slice(0, 5).forEach((c, idx) => {
            console.log(`     ${idx + 1}. ${c.company} (avg: ${c.avgImportance}/100)`);
            console.log(`        Top topics: ${c.topTopics.slice(0, 3).map(t => t.topic).join(', ')}`);
        });

        console.log('\n' + '='.repeat(60));
        console.log('\n🎉 Done! Your problems now have importance scores!');
        console.log('   The AI recommendations will use these scores for better suggestions.\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
