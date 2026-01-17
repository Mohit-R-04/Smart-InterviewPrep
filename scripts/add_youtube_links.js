/**
 * Add YouTube video links to problems
 * Uses NeetCode's public video mappings
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NeetCode video mappings (public data)
const NEETCODE_VIDEOS = {
    "1": "https://www.youtube.com/watch?v=KLlXCFG5TnA",  // Two Sum
    "15": "https://www.youtube.com/watch?v=jzZsG8n2R9A", // 3Sum
    "20": "https://www.youtube.com/watch?v=eqJwdw3FB-A", // Valid Parentheses
    "21": "https://www.youtube.com/watch?v=XIdigk956u0", // Merge Two Sorted Lists
    "53": "https://www.youtube.com/watch?v=5WZl3MMT0Eg", // Maximum Subarray
    "70": "https://www.youtube.com/watch?v=Y0lT9Fck7qI", // Climbing Stairs
    "121": "https://www.youtube.com/watch?v=1pkOgXD63yU", // Best Time to Buy and Sell Stock
    "125": "https://www.youtube.com/watch?v=jJXJ16kPFWg", // Valid Palindrome
    "206": "https://www.youtube.com/watch?v=G0_I-ZF0S38", // Reverse Linked List
    "217": "https://www.youtube.com/watch?v=3OamzN90kPg", // Contains Duplicate
    "226": "https://www.youtube.com/watch?v=OnSn2XEQ4MY", // Invert Binary Tree
    "242": "https://www.youtube.com/watch?v=9UtInBqnCgA", // Valid Anagram
    // Add more mappings as needed
};

async function addYouTubeLinks() {
    console.log('\n🎥 Adding YouTube video links...\n');

    const problemsPath = path.join(__dirname, '../public/problems.json');
    const problems = JSON.parse(fs.readFileSync(problemsPath, 'utf-8'));

    let videoCount = 0;

    problems.forEach(problem => {
        if (NEETCODE_VIDEOS[problem.id]) {
            problem.videoUrl = NEETCODE_VIDEOS[problem.id];
            problem.videoSource = 'NeetCode';
            videoCount++;
        }
    });

    fs.writeFileSync(problemsPath, JSON.stringify(problems, null, 2));

    console.log(`✅ Added ${videoCount} YouTube video links`);
    console.log(`📊 Total problems: ${problems.length}`);
    console.log(`🎥 Problems with videos: ${videoCount} (${(videoCount / problems.length * 100).toFixed(1)}%)\n`);
}

addYouTubeLinks();
