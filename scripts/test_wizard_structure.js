import puppeteer from 'puppeteer';

async function testWizardStructure() {
    console.log('🧪 Testing LeetCode Wizard structure...\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Test 1: Main page
    console.log('📋 Test 1: Main problem database page');
    await page.goto('https://leetcodewizard.io/problem-database', {
        waitUntil: 'networkidle2',
        timeout: 30000
    });

    const mainPageData = await page.evaluate(() => {
        const nuxt = window.__NUXT__;
        return {
            hasProblems: !!nuxt?.data?.problems,
            problemsCount: nuxt?.data?.problems?.length || 0,
            hasCompanies: !!nuxt?.data?.companies,
            companiesCount: nuxt?.data?.companies?.length || 0,
            dataKeys: nuxt?.data ? Object.keys(nuxt.data) : [],
            sampleProblem: nuxt?.data?.problems?.[0]
        };
    });

    console.log('Main page data:', JSON.stringify(mainPageData, null, 2));

    // Test 2: Company-specific page (Google)
    console.log('\n📋 Test 2: Company-specific page (Google)');
    await page.goto('https://leetcodewizard.io/problem-database?company=google', {
        waitUntil: 'networkidle2',
        timeout: 30000
    });

    await new Promise(r => setTimeout(r, 2000));

    const companyPageData = await page.evaluate(() => {
        const nuxt = window.__NUXT__;
        return {
            hasProblems: !!nuxt?.data?.problems,
            problemsCount: nuxt?.data?.problems?.length || 0,
            dataKeys: nuxt?.data ? Object.keys(nuxt.data) : [],
            sampleProblems: nuxt?.data?.problems?.slice(0, 3)
        };
    });

    console.log('Company page data:', JSON.stringify(companyPageData, null, 2));

    await browser.close();

    console.log('\n✅ Test complete!');
    console.log(`\nSummary:`);
    console.log(`- Main page has ${mainPageData.problemsCount} problems`);
    console.log(`- Company page (Google) has ${companyPageData.problemsCount} problems`);
    console.log(`- Data structure looks good: ${mainPageData.hasProblems && companyPageData.hasProblems ? '✅' : '❌'}`);
}

testWizardStructure()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
