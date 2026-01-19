import puppeteer from 'puppeteer';

async function captureAPIRequests() {
    console.log('🔍 Capturing API requests from LeetCode Wizard...\n');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Capture network requests
    const requests = [];
    page.on('request', request => {
        if (request.url().includes('api') || request.url().includes('graphql') || request.url().includes('json')) {
            requests.push({
                url: request.url(),
                method: request.method(),
                headers: request.headers()
            });
        }
    });

    // Capture responses
    const responses = [];
    page.on('response', async response => {
        const url = response.url();
        if (url.includes('api') || url.includes('graphql') || url.includes('json')) {
            try {
                const contentType = response.headers()['content-type'];
                if (contentType && contentType.includes('json')) {
                    const data = await response.json();
                    responses.push({
                        url,
                        status: response.status(),
                        data: JSON.stringify(data).substring(0, 500) // First 500 chars
                    });
                }
            } catch (e) {
                // Ignore errors
            }
        }
    });

    console.log('📋 Loading Google problems page...');
    await page.goto('https://leetcodewizard.io/problem-database?company=google', {
        waitUntil: 'networkidle2',
        timeout: 30000
    });

    await new Promise(r => setTimeout(r, 5000));

    console.log('\n📡 API Requests found:');
    requests.forEach((req, i) => {
        console.log(`${i + 1}. ${req.method} ${req.url}`);
    });

    console.log('\n📥 API Responses found:');
    responses.forEach((res, i) => {
        console.log(`${i + 1}. [${res.status}] ${res.url}`);
        console.log(`   Data preview: ${res.data.substring(0, 200)}...`);
    });

    await browser.close();

    console.log('\n✅ Done!');
}

captureAPIRequests()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
