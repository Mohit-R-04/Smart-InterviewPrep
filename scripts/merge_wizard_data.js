import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Merges wizard problems with existing problems.json
 * Ensures all 664 companies have their problems tagged
 */
function mergeWizardProblems() {
    console.log('🔄 Merging LeetCode Wizard problems with existing data...\n');

    // Load existing problems
    const problemsPath = path.join(__dirname, '../public/problems.json');
    const existingProblems = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));
    console.log(`📚 Loaded ${existingProblems.length} existing problems`);

    // Load wizard problems
    const wizardProblemsPath = path.join(__dirname, '../public/wizard-problems.json');

    if (!fs.existsSync(wizardProblemsPath)) {
        console.error('❌ wizard-problems.json not found!');
        console.log('   Run: node scripts/fetch_wizard_problems.js first');
        process.exit(1);
    }

    const wizardProblems = JSON.parse(fs.readFileSync(wizardProblemsPath, 'utf8'));
    console.log(`🧙 Loaded ${wizardProblems.length} wizard problems`);

    // Create a map of existing problems by ID
    const existingMap = new Map();
    existingProblems.forEach(p => {
        const key = p.titleSlug || p.id;
        existingMap.set(key, p);
    });

    // Merge wizard data into existing problems
    let updatedCount = 0;
    let newProblemsCount = 0;

    wizardProblems.forEach(wizardProblem => {
        const key = wizardProblem.titleSlug || wizardProblem.id;

        if (existingMap.has(key)) {
            // Update existing problem with wizard company data
            const existing = existingMap.get(key);

            // Merge companies (avoid duplicates)
            const existingCompanies = new Set(existing.companies || []);
            const wizardCompanies = wizardProblem.companies || [];

            wizardCompanies.forEach(company => existingCompanies.add(company));

            existing.companies = Array.from(existingCompanies);
            existing.company_count = existing.companies.length;

            // Update other fields if missing
            if (!existing.likes && wizardProblem.likes) {
                existing.likes = wizardProblem.likes;
            }
            if (!existing.acceptanceRate && wizardProblem.acceptanceRate) {
                existing.acceptanceRate = wizardProblem.acceptanceRate;
            }

            updatedCount++;
        } else {
            // Add new problem from wizard
            const newProblem = {
                id: wizardProblem.id,
                title: wizardProblem.title,
                titleSlug: wizardProblem.titleSlug,
                url: wizardProblem.url,
                difficulty: wizardProblem.difficulty,
                duration: getDurationByDifficulty(wizardProblem.difficulty),
                companies: wizardProblem.companies || [],
                company_count: (wizardProblem.companies || []).length,
                topic: (wizardProblem.topics && wizardProblem.topics[0]?.name) || 'Unknown',
                relatedTopics: wizardProblem.topics || [],
                likes: wizardProblem.likes || 0,
                acceptanceRate: wizardProblem.acceptanceRate || 0,
                frequency: wizardProblem.frequency || 0,
                isGrind75: false,
                isCurated: false
            };

            existingMap.set(key, newProblem);
            newProblemsCount++;
        }
    });

    // Convert map back to array
    const mergedProblems = Array.from(existingMap.values());

    console.log(`\n✅ Merge complete!`);
    console.log(`   Updated: ${updatedCount} existing problems`);
    console.log(`   Added: ${newProblemsCount} new problems`);
    console.log(`   Total: ${mergedProblems.length} problems`);

    // Count companies
    const allCompanies = new Set();
    mergedProblems.forEach(p => {
        (p.companies || []).forEach(c => allCompanies.add(c));
    });
    console.log(`   Companies: ${allCompanies.size} unique companies`);

    // Save merged data
    const backupPath = path.join(__dirname, '../public/problems.backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(existingProblems, null, 2));
    console.log(`\n💾 Backed up original to problems.backup.json`);

    fs.writeFileSync(problemsPath, JSON.stringify(mergedProblems, null, 2));
    console.log(`💾 Saved merged data to problems.json`);

    // Generate company statistics
    const companyStats = {};
    mergedProblems.forEach(p => {
        (p.companies || []).forEach(company => {
            if (!companyStats[company]) {
                companyStats[company] = 0;
            }
            companyStats[company]++;
        });
    });

    const sortedCompanies = Object.entries(companyStats)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

    console.log(`\n📊 Top 20 companies by problem count:`);
    sortedCompanies.slice(0, 20).forEach((c, i) => {
        console.log(`   ${(i + 1).toString().padStart(2, ' ')}. ${c.name.padEnd(25, ' ')} - ${c.count} problems`);
    });

    return mergedProblems;
}

function getDurationByDifficulty(difficulty) {
    const durations = {
        'Easy': 15,
        'Medium': 30,
        'Hard': 45,
        'Very Easy': 10,
        'Very Hard': 60
    };
    return durations[difficulty] || 30;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        mergeWizardProblems();
        console.log('\n🎉 Merge complete! Your problems.json now has all company data.');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    }
}

export { mergeWizardProblems };
