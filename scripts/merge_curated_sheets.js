import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');

/**
 * CURATED PROBLEM SHEETS AGGREGATOR
 * 
 * Combines multiple popular problem sheets:
 * 1. Grind75 (75 problems)
 * 2. NeetCode 150 (150 problems)
 * 3. Blind 75 (75 problems)
 * 4. Top Interview Questions (varies)
 * 
 * Creates a unified curated list with no duplicates
 */

// Grind75 - Already have this
function loadGrind75() {
    const grindPath = path.join(ROOT_DIR, 'data/grind75.csv');
    if (!fs.existsSync(grindPath)) return [];

    const content = fs.readFileSync(grindPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());

    const problems = [];
    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 3) {
            problems.push({
                title: parts[2].trim(),
                source: 'Grind75',
                priority: 'high'
            });
        }
    }
    return problems;
}

// NeetCode 150 - Popular YouTube educator's list
function getNeetCode150() {
    return [
        // Arrays & Hashing
        { title: "Contains Duplicate", source: "NeetCode150", priority: "high" },
        { title: "Valid Anagram", source: "NeetCode150", priority: "high" },
        { title: "Two Sum", source: "NeetCode150", priority: "high" },
        { title: "Group Anagrams", source: "NeetCode150", priority: "medium" },
        { title: "Top K Frequent Elements", source: "NeetCode150", priority: "medium" },
        { title: "Product of Array Except Self", source: "NeetCode150", priority: "high" },
        { title: "Valid Sudoku", source: "NeetCode150", priority: "medium" },
        { title: "Encode and Decode Strings", source: "NeetCode150", priority: "medium" },
        { title: "Longest Consecutive Sequence", source: "NeetCode150", priority: "high" },

        // Two Pointers
        { title: "Valid Palindrome", source: "NeetCode150", priority: "high" },
        { title: "Two Sum II Input Array Is Sorted", source: "NeetCode150", priority: "medium" },
        { title: "3Sum", source: "NeetCode150", priority: "high" },
        { title: "Container With Most Water", source: "NeetCode150", priority: "high" },
        { title: "Trapping Rain Water", source: "NeetCode150", priority: "hard" },

        // Sliding Window
        { title: "Best Time to Buy and Sell Stock", source: "NeetCode150", priority: "high" },
        { title: "Longest Substring Without Repeating Characters", source: "NeetCode150", priority: "high" },
        { title: "Longest Repeating Character Replacement", source: "NeetCode150", priority: "medium" },
        { title: "Permutation in String", source: "NeetCode150", priority: "medium" },
        { title: "Minimum Window Substring", source: "NeetCode150", priority: "hard" },
        { title: "Sliding Window Maximum", source: "NeetCode150", priority: "hard" },

        // Stack
        { title: "Valid Parentheses", source: "NeetCode150", priority: "high" },
        { title: "Min Stack", source: "NeetCode150", priority: "medium" },
        { title: "Evaluate Reverse Polish Notation", source: "NeetCode150", priority: "medium" },
        { title: "Generate Parentheses", source: "NeetCode150", priority: "medium" },
        { title: "Daily Temperatures", source: "NeetCode150", priority: "medium" },
        { title: "Car Fleet", source: "NeetCode150", priority: "medium" },
        { title: "Largest Rectangle in Histogram", source: "NeetCode150", priority: "hard" },

        // Binary Search
        { title: "Binary Search", source: "NeetCode150", priority: "high" },
        { title: "Search a 2D Matrix", source: "NeetCode150", priority: "medium" },
        { title: "Koko Eating Bananas", source: "NeetCode150", priority: "medium" },
        { title: "Find Minimum in Rotated Sorted Array", source: "NeetCode150", priority: "medium" },
        { title: "Search in Rotated Sorted Array", source: "NeetCode150", priority: "high" },
        { title: "Time Based Key-Value Store", source: "NeetCode150", priority: "medium" },
        { title: "Median of Two Sorted Arrays", source: "NeetCode150", priority: "hard" },

        // Linked List
        { title: "Reverse Linked List", source: "NeetCode150", priority: "high" },
        { title: "Merge Two Sorted Lists", source: "NeetCode150", priority: "high" },
        { title: "Reorder List", source: "NeetCode150", priority: "medium" },
        { title: "Remove Nth Node From End of List", source: "NeetCode150", priority: "medium" },
        { title: "Copy List with Random Pointer", source: "NeetCode150", priority: "medium" },
        { title: "Add Two Numbers", source: "NeetCode150", priority: "medium" },
        { title: "Linked List Cycle", source: "NeetCode150", priority: "high" },
        { title: "Find the Duplicate Number", source: "NeetCode150", priority: "medium" },
        { title: "LRU Cache", source: "NeetCode150", priority: "hard" },
        { title: "Merge k Sorted Lists", source: "NeetCode150", priority: "hard" },
        { title: "Reverse Nodes in k-Group", source: "NeetCode150", priority: "hard" },

        // Trees
        { title: "Invert Binary Tree", source: "NeetCode150", priority: "high" },
        { title: "Maximum Depth of Binary Tree", source: "NeetCode150", priority: "high" },
        { title: "Diameter of Binary Tree", source: "NeetCode150", priority: "medium" },
        { title: "Balanced Binary Tree", source: "NeetCode150", priority: "medium" },
        { title: "Same Tree", source: "NeetCode150", priority: "medium" },
        { title: "Subtree of Another Tree", source: "NeetCode150", priority: "medium" },
        { title: "Lowest Common Ancestor of a Binary Search Tree", source: "NeetCode150", priority: "high" },
        { title: "Binary Tree Level Order Traversal", source: "NeetCode150", priority: "high" },
        { title: "Binary Tree Right Side View", source: "NeetCode150", priority: "medium" },
        { title: "Count Good Nodes in Binary Tree", source: "NeetCode150", priority: "medium" },
        { title: "Validate Binary Search Tree", source: "NeetCode150", priority: "high" },
        { title: "Kth Smallest Element in a BST", source: "NeetCode150", priority: "medium" },
        { title: "Construct Binary Tree from Preorder and Inorder Traversal", source: "NeetCode150", priority: "medium" },
        { title: "Binary Tree Maximum Path Sum", source: "NeetCode150", priority: "hard" },
        { title: "Serialize and Deserialize Binary Tree", source: "NeetCode150", priority: "hard" },

        // Tries
        { title: "Implement Trie Prefix Tree", source: "NeetCode150", priority: "medium" },
        { title: "Design Add and Search Words Data Structure", source: "NeetCode150", priority: "medium" },
        { title: "Word Search II", source: "NeetCode150", priority: "hard" },

        // Heap / Priority Queue
        { title: "Kth Largest Element in a Stream", source: "NeetCode150", priority: "medium" },
        { title: "Last Stone Weight", source: "NeetCode150", priority: "medium" },
        { title: "K Closest Points to Origin", source: "NeetCode150", priority: "medium" },
        { title: "Kth Largest Element in an Array", source: "NeetCode150", priority: "medium" },
        { title: "Task Scheduler", source: "NeetCode150", priority: "medium" },
        { title: "Design Twitter", source: "NeetCode150", priority: "medium" },
        { title: "Find Median from Data Stream", source: "NeetCode150", priority: "hard" },

        // Backtracking
        { title: "Subsets", source: "NeetCode150", priority: "medium" },
        { title: "Combination Sum", source: "NeetCode150", priority: "medium" },
        { title: "Permutations", source: "NeetCode150", priority: "medium" },
        { title: "Subsets II", source: "NeetCode150", priority: "medium" },
        { title: "Combination Sum II", source: "NeetCode150", priority: "medium" },
        { title: "Word Search", source: "NeetCode150", priority: "medium" },
        { title: "Palindrome Partitioning", source: "NeetCode150", priority: "medium" },
        { title: "Letter Combinations of a Phone Number", source: "NeetCode150", priority: "medium" },
        { title: "N-Queens", source: "NeetCode150", priority: "hard" },

        // Graphs
        { title: "Number of Islands", source: "NeetCode150", priority: "high" },
        { title: "Clone Graph", source: "NeetCode150", priority: "medium" },
        { title: "Max Area of Island", source: "NeetCode150", priority: "medium" },
        { title: "Pacific Atlantic Water Flow", source: "NeetCode150", priority: "medium" },
        { title: "Surrounded Regions", source: "NeetCode150", priority: "medium" },
        { title: "Rotting Oranges", source: "NeetCode150", priority: "medium" },
        { title: "Walls and Gates", source: "NeetCode150", priority: "medium" },
        { title: "Course Schedule", source: "NeetCode150", priority: "high" },
        { title: "Course Schedule II", source: "NeetCode150", priority: "medium" },
        { title: "Redundant Connection", source: "NeetCode150", priority: "medium" },
        { title: "Number of Connected Components in an Undirected Graph", source: "NeetCode150", priority: "medium" },
        { title: "Graph Valid Tree", source: "NeetCode150", priority: "medium" },
        { title: "Word Ladder", source: "NeetCode150", priority: "hard" },

        // Advanced Graphs
        { title: "Reconstruct Itinerary", source: "NeetCode150", priority: "hard" },
        { title: "Min Cost to Connect All Points", source: "NeetCode150", priority: "medium" },
        { title: "Network Delay Time", source: "NeetCode150", priority: "medium" },
        { title: "Swim in Rising Water", source: "NeetCode150", priority: "hard" },
        { title: "Alien Dictionary", source: "NeetCode150", priority: "hard" },
        { title: "Cheapest Flights Within K Stops", source: "NeetCode150", priority: "medium" },

        // 1-D Dynamic Programming
        { title: "Climbing Stairs", source: "NeetCode150", priority: "high" },
        { title: "Min Cost Climbing Stairs", source: "NeetCode150", priority: "medium" },
        { title: "House Robber", source: "NeetCode150", priority: "high" },
        { title: "House Robber II", source: "NeetCode150", priority: "medium" },
        { title: "Longest Palindromic Substring", source: "NeetCode150", priority: "medium" },
        { title: "Palindromic Substrings", source: "NeetCode150", priority: "medium" },
        { title: "Decode Ways", source: "NeetCode150", priority: "medium" },
        { title: "Coin Change", source: "NeetCode150", priority: "high" },
        { title: "Maximum Product Subarray", source: "NeetCode150", priority: "medium" },
        { title: "Word Break", source: "NeetCode150", priority: "high" },
        { title: "Longest Increasing Subsequence", source: "NeetCode150", priority: "high" },
        { title: "Partition Equal Subset Sum", source: "NeetCode150", priority: "medium" },

        // 2-D Dynamic Programming
        { title: "Unique Paths", source: "NeetCode150", priority: "medium" },
        { title: "Longest Common Subsequence", source: "NeetCode150", priority: "medium" },
        { title: "Best Time to Buy and Sell Stock with Cooldown", source: "NeetCode150", priority: "medium" },
        { title: "Coin Change II", source: "NeetCode150", priority: "medium" },
        { title: "Target Sum", source: "NeetCode150", priority: "medium" },
        { title: "Interleaving String", source: "NeetCode150", priority: "medium" },
        { title: "Longest Increasing Path in a Matrix", source: "NeetCode150", priority: "hard" },
        { title: "Distinct Subsequences", source: "NeetCode150", priority: "hard" },
        { title: "Edit Distance", source: "NeetCode150", priority: "hard" },
        { title: "Burst Balloons", source: "NeetCode150", priority: "hard" },
        { title: "Regular Expression Matching", source: "NeetCode150", priority: "hard" },

        // Greedy
        { title: "Maximum Subarray", source: "NeetCode150", priority: "high" },
        { title: "Jump Game", source: "NeetCode150", priority: "medium" },
        { title: "Jump Game II", source: "NeetCode150", priority: "medium" },
        { title: "Gas Station", source: "NeetCode150", priority: "medium" },
        { title: "Hand of Straights", source: "NeetCode150", priority: "medium" },
        { title: "Merge Triplets to Form Target Triplet", source: "NeetCode150", priority: "medium" },
        { title: "Partition Labels", source: "NeetCode150", priority: "medium" },
        { title: "Valid Parenthesis String", source: "NeetCode150", priority: "medium" },

        // Intervals
        { title: "Insert Interval", source: "NeetCode150", priority: "medium" },
        { title: "Merge Intervals", source: "NeetCode150", priority: "high" },
        { title: "Non-overlapping Intervals", source: "NeetCode150", priority: "medium" },
        { title: "Meeting Rooms", source: "NeetCode150", priority: "medium" },
        { title: "Meeting Rooms II", source: "NeetCode150", priority: "medium" },
        { title: "Minimum Interval to Include Each Query", source: "NeetCode150", priority: "hard" },

        // Math & Geometry
        { title: "Rotate Image", source: "NeetCode150", priority: "medium" },
        { title: "Spiral Matrix", source: "NeetCode150", priority: "medium" },
        { title: "Set Matrix Zeroes", source: "NeetCode150", priority: "medium" },
        { title: "Happy Number", source: "NeetCode150", priority: "medium" },
        { title: "Plus One", source: "NeetCode150", priority: "medium" },
        { title: "Pow(x, n)", source: "NeetCode150", priority: "medium" },
        { title: "Multiply Strings", source: "NeetCode150", priority: "medium" },
        { title: "Detect Squares", source: "NeetCode150", priority: "medium" },

        // Bit Manipulation
        { title: "Single Number", source: "NeetCode150", priority: "medium" },
        { title: "Number of 1 Bits", source: "NeetCode150", priority: "medium" },
        { title: "Counting Bits", source: "NeetCode150", priority: "medium" },
        { title: "Reverse Bits", source: "NeetCode150", priority: "medium" },
        { title: "Missing Number", source: "NeetCode150", priority: "medium" },
        { title: "Sum of Two Integers", source: "NeetCode150", priority: "medium" },
        { title: "Reverse Integer", source: "NeetCode150", priority: "medium" }
    ];
}

// Blind 75 - Classic curated list
function getBlind75() {
    return [
        { title: "Two Sum", source: "Blind75", priority: "high" },
        { title: "Best Time to Buy and Sell Stock", source: "Blind75", priority: "high" },
        { title: "Contains Duplicate", source: "Blind75", priority: "high" },
        { title: "Product of Array Except Self", source: "Blind75", priority: "high" },
        { title: "Maximum Subarray", source: "Blind75", priority: "high" },
        { title: "Maximum Product Subarray", source: "Blind75", priority: "medium" },
        { title: "Find Minimum in Rotated Sorted Array", source: "Blind75", priority: "medium" },
        { title: "Search in Rotated Sorted Array", source: "Blind75", priority: "high" },
        { title: "3Sum", source: "Blind75", priority: "high" },
        { title: "Container With Most Water", source: "Blind75", priority: "high" },
        { title: "Sum of Two Integers", source: "Blind75", priority: "medium" },
        { title: "Number of 1 Bits", source: "Blind75", priority: "medium" },
        { title: "Counting Bits", source: "Blind75", priority: "medium" },
        { title: "Missing Number", source: "Blind75", priority: "medium" },
        { title: "Reverse Bits", source: "Blind75", priority: "medium" },
        { title: "Climbing Stairs", source: "Blind75", priority: "high" },
        { title: "Coin Change", source: "Blind75", priority: "high" },
        { title: "Longest Increasing Subsequence", source: "Blind75", priority: "high" },
        { title: "Longest Common Subsequence", source: "Blind75", priority: "medium" },
        { title: "Word Break", source: "Blind75", priority: "high" },
        { title: "Combination Sum IV", source: "Blind75", priority: "medium" },
        { title: "House Robber", source: "Blind75", priority: "high" },
        { title: "House Robber II", source: "Blind75", priority: "medium" },
        { title: "Decode Ways", source: "Blind75", priority: "medium" },
        { title: "Unique Paths", source: "Blind75", priority: "medium" },
        { title: "Jump Game", source: "Blind75", priority: "medium" },
        { title: "Clone Graph", source: "Blind75", priority: "medium" },
        { title: "Course Schedule", source: "Blind75", priority: "high" },
        { title: "Pacific Atlantic Water Flow", source: "Blind75", priority: "medium" },
        { title: "Number of Islands", source: "Blind75", priority: "high" },
        { title: "Longest Consecutive Sequence", source: "Blind75", priority: "high" },
        { title: "Alien Dictionary", source: "Blind75", priority: "hard" },
        { title: "Graph Valid Tree", source: "Blind75", priority: "medium" },
        { title: "Number of Connected Components in an Undirected Graph", source: "Blind75", priority: "medium" },
        { title: "Insert Interval", source: "Blind75", priority: "medium" },
        { title: "Merge Intervals", source: "Blind75", priority: "high" },
        { title: "Non-overlapping Intervals", source: "Blind75", priority: "medium" },
        { title: "Meeting Rooms", source: "Blind75", priority: "medium" },
        { title: "Meeting Rooms II", source: "Blind75", priority: "medium" },
        { title: "Reverse Linked List", source: "Blind75", priority: "high" },
        { title: "Linked List Cycle", source: "Blind75", priority: "high" },
        { title: "Merge Two Sorted Lists", source: "Blind75", priority: "high" },
        { title: "Merge k Sorted Lists", source: "Blind75", priority: "hard" },
        { title: "Remove Nth Node From End of List", source: "Blind75", priority: "medium" },
        { title: "Reorder List", source: "Blind75", priority: "medium" },
        { title: "Set Matrix Zeroes", source: "Blind75", priority: "medium" },
        { title: "Spiral Matrix", source: "Blind75", priority: "medium" },
        { title: "Rotate Image", source: "Blind75", priority: "medium" },
        { title: "Word Search", source: "Blind75", priority: "medium" },
        { title: "Longest Substring Without Repeating Characters", source: "Blind75", priority: "high" },
        { title: "Longest Repeating Character Replacement", source: "Blind75", priority: "medium" },
        { title: "Minimum Window Substring", source: "Blind75", priority: "hard" },
        { title: "Valid Anagram", source: "Blind75", priority: "high" },
        { title: "Group Anagrams", source: "Blind75", priority: "medium" },
        { title: "Valid Parentheses", source: "Blind75", priority: "high" },
        { title: "Valid Palindrome", source: "Blind75", priority: "high" },
        { title: "Longest Palindromic Substring", source: "Blind75", priority: "medium" },
        { title: "Palindromic Substrings", source: "Blind75", priority: "medium" },
        { title: "Encode and Decode Strings", source: "Blind75", priority: "medium" },
        { title: "Maximum Depth of Binary Tree", source: "Blind75", priority: "high" },
        { title: "Same Tree", source: "Blind75", priority: "medium" },
        { title: "Invert Binary Tree", source: "Blind75", priority: "high" },
        { title: "Binary Tree Maximum Path Sum", source: "Blind75", priority: "hard" },
        { title: "Binary Tree Level Order Traversal", source: "Blind75", priority: "high" },
        { title: "Serialize and Deserialize Binary Tree", source: "Blind75", priority: "hard" },
        { title: "Subtree of Another Tree", source: "Blind75", priority: "medium" },
        { title: "Construct Binary Tree from Preorder and Inorder Traversal", source: "Blind75", priority: "medium" },
        { title: "Validate Binary Search Tree", source: "Blind75", priority: "high" },
        { title: "Kth Smallest Element in a BST", source: "Blind75", priority: "medium" },
        { title: "Lowest Common Ancestor of a Binary Search Tree", source: "Blind75", priority: "high" },
        { title: "Implement Trie Prefix Tree", source: "Blind75", priority: "medium" },
        { title: "Add and Search Word", source: "Blind75", priority: "medium" },
        { title: "Word Search II", source: "Blind75", priority: "hard" },
        { title: "Merge k Sorted Lists", source: "Blind75", priority: "hard" },
        { title: "Top K Frequent Elements", source: "Blind75", priority: "medium" },
        { title: "Find Median from Data Stream", source: "Blind75", priority: "hard" }
    ];
}

function mergeCuratedSheets() {
    console.log('\n📚 Loading curated problem sheets...\n');

    const grind75 = loadGrind75();
    const neetcode150 = getNeetCode150();
    const blind75 = getBlind75();

    console.log(`  ✅ Grind75: ${grind75.length} problems`);
    console.log(`  ✅ NeetCode150: ${neetcode150.length} problems`);
    console.log(`  ✅ Blind75: ${blind75.length} problems`);

    // Merge all sheets
    const allCurated = [...grind75, ...neetcode150, ...blind75];

    // Remove duplicates (by title)
    const uniqueMap = new Map();
    allCurated.forEach(problem => {
        const normalizedTitle = problem.title.toLowerCase().trim();
        if (!uniqueMap.has(normalizedTitle)) {
            uniqueMap.set(normalizedTitle, problem);
        } else {
            // If duplicate, keep the one with higher priority or combine sources
            const existing = uniqueMap.get(normalizedTitle);
            existing.source = `${existing.source}, ${problem.source}`;
        }
    });

    const uniqueCurated = Array.from(uniqueMap.values());

    console.log(`\n  📊 Total unique curated problems: ${uniqueCurated.length}`);
    console.log(`  🔄 Duplicates removed: ${allCurated.length - uniqueCurated.length}\n`);

    return uniqueCurated;
}

function saveCuratedList() {
    const curated = mergeCuratedSheets();

    // Save to data directory
    const outputPath = path.join(ROOT_DIR, 'data/curated-problems.json');
    fs.writeFileSync(outputPath, JSON.stringify(curated, null, 2));

    console.log(`💾 Saved to: ${outputPath}`);
    console.log('\n✅ Curated sheets merged successfully!\n');

    // Print summary
    const sources = {};
    curated.forEach(p => {
        const sourceList = p.source.split(', ');
        sourceList.forEach(s => {
            sources[s] = (sources[s] || 0) + 1;
        });
    });

    console.log('📈 Source breakdown:');
    Object.entries(sources).forEach(([source, count]) => {
        console.log(`   ${source}: ${count} problems`);
    });
}

saveCuratedList();
