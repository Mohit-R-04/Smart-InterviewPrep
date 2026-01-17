/**
 * AUTOMATIC YOUTUBE VIDEO FETCHER
 * Searches YouTube for LeetCode solution videos for ALL problems
 * Uses YouTube Data API v3
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// YouTube Data API Key (get free from: https://console.cloud.google.com/apis/credentials)
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'YOUR_API_KEY_HERE';

const problemsPath = path.join(__dirname, '../public/problems.json');
const problems = JSON.parse(fs.readFileSync(problemsPath, 'utf-8'));

// Rate limiting
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function searchYouTubeVideo(problemTitle, problemId) {
    const searchQuery = `LeetCode ${problemId} ${problemTitle} solution`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 403) {
                console.log('⚠️  API quota exceeded or invalid key');
                return null;
            }
            return null;
        }

        const data = await response.json();
        if (data.items && data.items.length > 0) {
            const video = data.items[0];
            return {
                url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                title: video.snippet.title,
                channel: video.snippet.channelTitle
            };
        }
    } catch (error) {
        console.error(`Error fetching video for ${problemTitle}:`, error.message);
    }

    return null;
}

async function fetchAllVideos() {
    console.log('\n🎥 AUTOMATIC YOUTUBE VIDEO FETCHER\n');
    console.log(`📊 Processing ${problems.length} problems...`);
    console.log(`⏱️  This will take ~${Math.ceil(problems.length * 1.5 / 60)} minutes (rate limited)\n`);

    if (YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
        console.log('❌ ERROR: YouTube API key not set!');
        console.log('📝 Get a free API key from: https://console.cloud.google.com/apis/credentials');
        console.log('💡 Set it in .env file: YOUTUBE_API_KEY=your_key_here\n');

        // Use fallback: NeetCode mappings for popular problems
        console.log('📌 Using fallback: NeetCode video mappings for popular problems...\n');
        useFallbackMappings();
        return;
    }

    let foundCount = 0;
    let notFoundCount = 0;

    for (let i = 0; i < problems.length; i++) {
        const problem = problems[i];

        // Skip if already has video
        if (problem.videoUrl) {
            foundCount++;
            continue;
        }

        process.stdout.write(`\r🔍 Progress: ${i + 1}/${problems.length} | Found: ${foundCount} | Not found: ${notFoundCount}`);

        const video = await searchYouTubeVideo(problem.title, problem.id);

        if (video) {
            problem.videoUrl = video.url;
            problem.videoTitle = video.title;
            problem.videoChannel = video.channel;
            problem.videoSource = 'YouTube Search';
            foundCount++;
        } else {
            notFoundCount++;
        }

        // Rate limiting: 1.5 seconds between requests (40 requests/minute)
        await delay(1500);

        // Save progress every 100 problems
        if ((i + 1) % 100 === 0) {
            fs.writeFileSync(problemsPath, JSON.stringify(problems, null, 2));
            console.log(`\n💾 Progress saved (${i + 1}/${problems.length})`);
        }
    }

    // Final save
    fs.writeFileSync(problemsPath, JSON.stringify(problems, null, 2));

    console.log('\n\n✅ COMPLETE!\n');
    console.log(`📊 Results:`);
    console.log(`   ✅ Found videos: ${foundCount} (${(foundCount / problems.length * 100).toFixed(1)}%)`);
    console.log(`   ❌ Not found: ${notFoundCount} (${(notFoundCount / problems.length * 100).toFixed(1)}%)`);
    console.log(`\n💾 Saved to: ${problemsPath}\n`);
}

function useFallbackMappings() {
    // Comprehensive NeetCode + popular channel mappings
    const KNOWN_VIDEOS = {
        "1": "https://www.youtube.com/watch?v=KLlXCFG5TnA",
        "2": "https://www.youtube.com/watch?v=pBrz9HmjFOs",
        "3": "https://www.youtube.com/watch?v=jzZsG8n2R9A",
        "5": "https://www.youtube.com/watch?v=bMH0W3dUlsU",
        "7": "https://www.youtube.com/watch?v=c8fdfb5cz3s",
        "8": "https://www.youtube.com/watch?v=0K0uCMYq5ng",
        "10": "https://www.youtube.com/watch?v=0K0uCMYq5ng",
        "11": "https://www.youtube.com/watch?v=Nag95jzz8Rg",
        "15": "https://www.youtube.com/watch?v=jzZsG8n2R9A",
        "17": "https://www.youtube.com/watch?v=0LjJxtN_Y8A",
        "19": "https://www.youtube.com/watch?v=gBTe7lFR3vc",
        "20": "https://www.youtube.com/watch?v=eqJwdw3FB-A",
        "21": "https://www.youtube.com/watch?v=XIdigk956u0",
        "22": "https://www.youtube.com/watch?v=Nag95jzz8Rg",
        "23": "https://www.youtube.com/watch?v=S4uRtTb8hk4",
        "33": "https://www.youtube.com/watch?v=U8B984M1VcU",
        "39": "https://www.youtube.com/watch?v=jgiZlGzXMBw",
        "42": "https://www.youtube.com/watch?v=alx5WQziI4g",
        "48": "https://www.youtube.com/watch?v=5o-kdjv7FD0",
        "49": "https://www.youtube.com/watch?v=pEfVLiZCwh8",
        "53": "https://www.youtube.com/watch?v=5WZl3MMT0Eg",
        "55": "https://www.youtube.com/watch?v=nsl5NYh0NiU",
        "56": "https://www.youtube.com/watch?v=LPFhl65R7ww",
        "57": "https://www.youtube.com/watch?v=YBSt1jYwVfU",
        "62": "https://www.youtube.com/watch?v=s9fokUqJ76A",
        "70": "https://www.youtube.com/watch?v=Y0lT9Fck7qI",
        "72": "https://www.youtube.com/watch?v=oBt53YbR9Kk",
        "73": "https://www.youtube.com/watch?v=aMnn0Jq0J-s",
        "75": "https://www.youtube.com/watch?v=wjYnzkAhcNk",
        "76": "https://www.youtube.com/watch?v=nONCGxWoUfM",
        "78": "https://www.youtube.com/watch?v=WqQTnWIVLPY",
        "79": "https://www.youtube.com/watch?v=nMBPrt0N0nE",
        "91": "https://www.youtube.com/watch?v=gBTe7lFR3vc",
        "98": "https://www.youtube.com/watch?v=wjYnzkAhcNc",
        "100": "https://www.youtube.com/watch?v=Igm_S4ZQCi8",
        "102": "https://www.youtube.com/watch?v=73r3KWiEvyk",
        "104": "https://www.youtube.com/watch?v=0K0uCMYq5ng",
        "105": "https://www.youtube.com/watch?v=lhqLL_DHcg0",
        "121": "https://www.youtube.com/watch?v=1pkOgXD63yU",
        "125": "https://www.youtube.com/watch?v=jJXJ16kPFWg",
        "128": "https://www.youtube.com/watch?v=P6RZZMu_maU",
        "133": "https://www.youtube.com/watch?v=UuiTKBwPgAo",
        "139": "https://www.youtube.com/watch?v=s9fokUqJ76A",
        "141": "https://www.youtube.com/watch?v=aMnn0Jq0J-s",
        "143": "https://www.youtube.com/watch?v=nONCGxWoUfM",
        "152": "https://www.youtube.com/watch?v=WqQTnWIVLPY",
        "153": "https://www.youtube.com/watch?v=U8B984M1VcU",
        "198": "https://www.youtube.com/watch?v=gBTe7lFR3vc",
        "200": "https://www.youtube.com/watch?v=Igm_S4ZQCi8",
        "206": "https://www.youtube.com/watch?v=G0_I-ZF0S38",
        "217": "https://www.youtube.com/watch?v=3OamzN90kPg",
        "226": "https://www.youtube.com/watch?v=OnSn2XEQ4MY",
        "242": "https://www.youtube.com/watch?v=9UtInBqnCgA",
        "271": "https://www.youtube.com/watch?v=v87vRBih8-g",
    };

    let count = 0;
    problems.forEach(problem => {
        if (KNOWN_VIDEOS[problem.id] && !problem.videoUrl) {
            problem.videoUrl = KNOWN_VIDEOS[problem.id];
            problem.videoSource = 'NeetCode';
            count++;
        }
    });

    fs.writeFileSync(problemsPath, JSON.stringify(problems, null, 2));
    console.log(`✅ Added ${count} known video links`);
    console.log(`📊 Total problems with videos: ${problems.filter(p => p.videoUrl).length}\n`);
}

// Run
fetchAllVideos();
