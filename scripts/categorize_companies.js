const fs = require('fs');
const path = require('path');

/**
 * Categorizes companies into tiers based on their problem count and industry reputation
 * This helps users prioritize their preparation
 */
function categorizeCompaniesIntoTiers() {
    const companiesListPath = path.join(__dirname, '../public/companies-list.json');

    if (!fs.existsSync(companiesListPath)) {
        console.error('❌ companies-list.json not found. Run fetch_leetcode_wizard_data.js first.');
        process.exit(1);
    }

    const companiesList = JSON.parse(fs.readFileSync(companiesListPath, 'utf8'));
    console.log(`📚 Loaded ${companiesList.length} companies`);

    // Define tier criteria and manual overrides for well-known companies
    const tierOverrides = {
        // Tier 1: FAANG+ and Top Tech Giants
        'Tier 1 - FAANG+': [
            'Google', 'Amazon', 'Meta', 'Facebook', 'Apple', 'Netflix',
            'Microsoft', 'Uber', 'Airbnb', 'LinkedIn', 'Salesforce'
        ],

        // Tier 2: Major Tech Companies
        'Tier 2 - Major Tech': [
            'Bloomberg', 'Adobe', 'Oracle', 'Twitter', 'Tesla', 'Snapchat',
            'TikTok', 'ByteDance', 'Nvidia', 'Stripe', 'Lyft', 'DoorDash',
            'Instacart', 'Atlassian', 'Dropbox', 'Reddit', 'Pinterest',
            'Zillow', 'Expedia', 'Booking.com', 'Twilio', 'Databricks',
            'Snowflake', 'Palantir', 'Roblox', 'Spotify', 'Slack',
            'Cisco', 'VMware', 'Intuit', 'eBay', 'PayPal', 'Square',
            'Robinhood', 'Coinbase', 'Walmart'
        ],

        // Tier 3: Finance & Trading
        'Tier 3 - Finance': [
            'Goldman Sachs', 'JPMorgan', 'Morgan Stanley', 'Citadel',
            'Capital One', 'Two Sigma', 'Jane Street', 'DE Shaw',
            'Bridgewater', 'BlackRock', 'Barclays', 'Credit Suisse',
            'Deutsche Bank', 'Bank of America', 'Wells Fargo'
        ]
    };

    // Create tier structure
    const tiers = {
        'Tier 1 - FAANG+': [],
        'Tier 2 - Major Tech': [],
        'Tier 3 - Finance': [],
        'Tier 4 - High Volume (1000+)': [],
        'Tier 5 - Medium Volume (500-999)': [],
        'Tier 6 - Standard Volume (100-499)': [],
        'Tier 7 - Emerging (<100)': []
    };

    // Categorize each company
    companiesList.forEach(company => {
        let assigned = false;

        // Check manual overrides first
        for (const [tierName, companies] of Object.entries(tierOverrides)) {
            if (companies.includes(company.name)) {
                tiers[tierName].push(company);
                assigned = true;
                break;
            }
        }

        // If not manually assigned, use count-based tiers
        if (!assigned) {
            if (company.count >= 1000) {
                tiers['Tier 4 - High Volume (1000+)'].push(company);
            } else if (company.count >= 500) {
                tiers['Tier 5 - Medium Volume (500-999)'].push(company);
            } else if (company.count >= 100) {
                tiers['Tier 6 - Standard Volume (100-499)'].push(company);
            } else {
                tiers['Tier 7 - Emerging (<100)'].push(company);
            }
        }
    });

    // Sort companies within each tier by count (descending)
    Object.keys(tiers).forEach(tierName => {
        tiers[tierName].sort((a, b) => b.count - a.count);
    });

    // Create summary
    const summary = Object.entries(tiers).map(([tierName, companies]) => ({
        tier: tierName,
        count: companies.length,
        totalProblems: companies.reduce((sum, c) => sum + c.count, 0),
        topCompanies: companies.slice(0, 5).map(c => c.name)
    }));

    // Save tiered companies
    const tieredPath = path.join(__dirname, '../public/companies-by-tier.json');
    fs.writeFileSync(tieredPath, JSON.stringify(tiers, null, 2));
    console.log(`✅ Categorized companies into ${Object.keys(tiers).length} tiers`);
    console.log(`💾 Saved to ${tieredPath}`);

    // Print summary
    console.log('\n📊 Tier Summary:');
    summary.forEach(tier => {
        console.log(`  ${tier.tier}: ${tier.count} companies, ${tier.totalProblems} total problems`);
        console.log(`    Top: ${tier.topCompanies.join(', ')}`);
    });

    return tiers;
}

// Run if called directly
if (require.main === module) {
    categorizeCompaniesIntoTiers();
    console.log('\n🎉 Company tier categorization complete!');
}

module.exports = { categorizeCompaniesIntoTiers };
