import puppeteer from 'puppeteer';

async function debugWizardPage() {
    console.log('🔍 Debugging LeetCode Wizard page structure...\n');

    const browser = await puppeteer.launch({
        headless: false, // Show browser to see what's happening
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Go to Google's page
    console.log('📋 Loading Google problems page...');
    await page.goto('https://leetcodewizard.io/problem-database?company=google', {
        waitUntil: 'networkidle2',
        timeout: 30000
    });

    console.log('⏸️  Waiting 5 seconds for page to fully load...');
    await new Promise(r => setTimeout(r, 5000));

    // Check what's on the page
    const pageInfo = await page.evaluate(() => {
        return {
            // Check for table
            hasTables: document.querySelectorAll('table').length,
            hasRows: document.querySelectorAll('table tbody tr').length,

            // Check NUXT data
            nuxtDataKeys: window.__NUXT__?.data ? Object.keys(window.__NUXT__.data) : [],
            nuxtProblemsType: typeof window.__NUXT__?.data?.problems,
            nuxtProblemsIsArray: Array.isArray(window.__NUXT__?.data?.problems),
            nuxtProblemsLength: window.__NUXT__?.data?.problems?.length,

            // Get first few elements to see structure
            firstRowHTML: document.querySelector('table tbody tr')?.outerHTML,

            // Check for Vue/Nuxt rendered content
            bodyClasses: document.body.className,
            hasVueApp: !!document.querySelector('[data-v-app]'),

            // Sample the actual data
            sampleNuxtData: window.__NUXT__?.data
        };
    });

    console.log('\n📊 Page Information:');
    console.log(JSON.stringify(pageInfo, null, 2));

    // Take a screenshot
    await page.screenshot({ path: 'wizard-debug.png', fullPage: true });
    console.log('\n📸 Screenshot saved to wizard-debug.png');

    console.log('\n⏸️  Browser will stay open for 30 seconds for manual inspection...');
    await new Promise(r => setTimeout(r, 30000));

    await browser.close();
}

debugWizardPage()
    .then(() => {
        console.log('\n✅ Debug complete!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
