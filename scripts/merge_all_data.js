import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

/**
 * COMPREHENSIVE DATA MERGER
 * 
 * Combines:
 * 1. LeetCode problems data (problems.json) - 52 companies with real problems
 * 2. Wizard company data (wizard-companies-full.json) - 951 companies with frequency counts
 * 
 * Creates unified company list with proper name mapping
 */

// Name mapping between wizard slugs and LeetCode friendly names
const WIZARD_TO_LEETCODE = {
    'facebook': 'Facebook',
    'meta': 'Meta',
    'google': 'Google',
    'amazon': 'Amazon',
    'microsoft': 'Microsoft',
    'apple': 'Apple',
    'netflix': 'Netflix',
    'uber': 'Uber',
    'airbnb': 'Airbnb',
    'goldman-sachs': 'Goldman Sachs',
    'linkedin': 'LinkedIn',
    'jpmorgan': 'JPMorgan',
    'morgan-stanley': 'Morgan Stanley',
    'capital-one': 'Capital One',
    'doordash': 'DoorDash',
    'bytedance': 'ByteDance',
    'booking.com': 'Booking.com',
    'bookingcom': 'Booking.com',
    'tiktok': 'TikTok',
    'snapchat': 'Snapchat',
    'twitter': 'Twitter',
    'tesla': 'Tesla',
    'adobe': 'Adobe',
    'bloomberg': 'Bloomberg',
    'oracle': 'Oracle',
    'salesforce': 'Salesforce',
    'cisco': 'Cisco',
    'intuit': 'Intuit',
    'atlassian': 'Atlassian',
    'nvidia': 'Nvidia',
    'citadel': 'Citadel',
    'databricks': 'Databricks',
    'dropbox': 'Dropbox',
    'expedia': 'Expedia',
    'instacart': 'Instacart',
    'lyft': 'Lyft',
    'coinbase': 'Coinbase',
    'paypal': 'PayPal',
    'ebay': 'eBay',
    'vmware': 'VMware',
    'walmart-labs': 'Walmart',
    'palantir-technologies': 'Palantir',
    'robinhood': 'Robinhood',
    'roblox': 'Roblox',
    'stripe': 'Stripe',
    'square': 'Square',
    'spotify': 'Spotify',
    'snowflake': 'Snowflake',
    'twilio': 'Twilio',
    'slack': 'Slack',
    'pinterest': 'Pinterest',
    'reddit': 'Reddit'
};

function main() {
    console.log('\n🔄 COMPREHENSIVE DATA MERGER');
    console.log('='.repeat(60));
    console.log('Merging LeetCode problems + Wizard company data...\n');

    // Load LeetCode problems
    const problemsPath = path.join(ROOT_DIR, 'public/problems.json');
    const problems = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));
    console.log(`✅ Loaded ${problems.length} problems from LeetCode`);

    // Load Wizard companies
    const wizardPath = path.join(ROOT_DIR, 'public/wizard-companies-full.json');
    const wizardCompanies = JSON.parse(fs.readFileSync(wizardPath, 'utf8'));
    console.log(`✅ Loaded ${wizardCompanies.length} companies from Wizard\n`);

    // Extract companies from problems
    const leetcodeCompanies = new Set();
    const companyProblemCounts = {};

    problems.forEach(p => {
        (p.companies || []).forEach(company => {
            leetcodeCompanies.add(company);
            companyProblemCounts[company] = (companyProblemCounts[company] || 0) + 1;
        });
    });

    console.log(`📊 Found ${leetcodeCompanies.size} companies with problems in LeetCode\n`);

    // Create unified company list
    const unifiedCompanies = [];
    const processedNames = new Set();

    // First, add all LeetCode companies (these have real problems)
    Array.from(leetcodeCompanies).sort().forEach(leetcodeName => {
        const problemCount = companyProblemCounts[leetcodeName] || 0;

        // Find matching wizard data
        let wizardCount = 0;
        let wizardSlug = leetcodeName.toLowerCase().replace(/\s+/g, '-');

        const wizardCompany = wizardCompanies.find(wc => {
            const mappedName = WIZARD_TO_LEETCODE[wc.name];
            return mappedName === leetcodeName || wc.name === wizardSlug;
        });

        if (wizardCompany) {
            wizardCount = wizardCompany.totalEntries;
            wizardSlug = wizardCompany.name;
        }

        unifiedCompanies.push({
            name: leetcodeName,
            slug: wizardSlug,
            problemCount: problemCount,
            wizardCount: wizardCount,
            hasProblems: true,
            source: 'leetcode'
        });

        processedNames.add(leetcodeName);
        processedNames.add(wizardSlug);
    });

    // Then, add wizard companies that don't have LeetCode problems
    wizardCompanies
        .filter(wc => wc.totalEntries >= 10) // Only companies with 10+ entries
        .forEach(wizardCompany => {
            const leetcodeName = WIZARD_TO_LEETCODE[wizardCompany.name];
            const slug = wizardCompany.name;

            // Skip if already processed
            if (processedNames.has(leetcodeName) || processedNames.has(slug)) {
                return;
            }

            // Add as wizard-only company
            unifiedCompanies.push({
                name: leetcodeName || capitalizeCompanyName(wizardCompany.name),
                slug: slug,
                problemCount: 0,
                wizardCount: wizardCompany.totalEntries,
                hasProblems: false,
                source: 'wizard'
            });

            processedNames.add(leetcodeName || slug);
        });

    // Sort by: has problems first, then by problem count, then by wizard count
    unifiedCompanies.sort((a, b) => {
        if (a.hasProblems && !b.hasProblems) return -1;
        if (!a.hasProblems && b.hasProblems) return 1;
        if (a.problemCount !== b.problemCount) return b.problemCount - a.problemCount;
        return b.wizardCount - a.wizardCount;
    });

    console.log('📊 UNIFIED COMPANY LIST:');
    console.log(`   Total companies: ${unifiedCompanies.length}`);
    console.log(`   With LeetCode problems: ${unifiedCompanies.filter(c => c.hasProblems).length}`);
    console.log(`   Wizard-only: ${unifiedCompanies.filter(c => !c.hasProblems).length}\n`);

    // Save unified list
    const unifiedPath = path.join(ROOT_DIR, 'public/companies-unified.json');
    fs.writeFileSync(unifiedPath, JSON.stringify(unifiedCompanies, null, 2));
    console.log(`💾 Saved unified company list to companies-unified.json\n`);

    // Update companies-list.json with unified data
    const companiesListPath = path.join(ROOT_DIR, 'public/companies-list.json');
    const companiesList = unifiedCompanies.map(c => ({
        name: c.name,
        count: c.problemCount || c.wizardCount,
        slug: c.slug,
        hasProblems: c.hasProblems,
        leetcodeProblems: c.problemCount,
        wizardReports: c.wizardCount
    }));
    fs.writeFileSync(companiesListPath, JSON.stringify(companiesList, null, 2));
    console.log(`💾 Updated companies-list.json with ${companiesList.length} companies\n`);

    // Show top 30
    console.log('📈 Top 30 companies:');
    unifiedCompanies.slice(0, 30).forEach((c, i) => {
        const status = c.hasProblems ? '✅' : '⚠️ ';
        const counts = c.hasProblems
            ? `${c.problemCount} problems`
            : `${c.wizardCount} wizard reports`;
        console.log(`  ${(i + 1).toString().padStart(2, ' ')}. ${status} ${c.name.padEnd(25, ' ')} - ${counts}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ MERGE COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\n🎉 Your app now has ${unifiedCompanies.length} companies!`);
    console.log(`   ${unifiedCompanies.filter(c => c.hasProblems).length} with real LeetCode problems`);
    console.log(`   ${unifiedCompanies.filter(c => !c.hasProblems).length} with wizard frequency data\n`);
}

function capitalizeCompanyName(slug) {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

main();
