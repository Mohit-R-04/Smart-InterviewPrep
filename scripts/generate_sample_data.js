// Sample problems data for Smart Interview Grind
// This is a free, open-source version with sample LeetCode problems

const sampleProblems = [
    {
        "id": "1",
        "title": "Two Sum",
        "url": "https://leetcode.com/problems/two-sum/",
        "difficulty": "Easy",
        "duration": 15,
        "companies": ["Google", "Amazon", "Microsoft", "Facebook", "Apple"],
        "company_count": 5,
        "topic": "Array",
        "relatedTopics": [
            { "name": "Array" },
            { "name": "Hash Table" }
        ],
        "isGrind75": true,
        "likes": 45000
    },
    {
        "id": "2",
        "title": "Add Two Numbers",
        "url": "https://leetcode.com/problems/add-two-numbers/",
        "difficulty": "Medium",
        "duration": 30,
        "companies": ["Amazon", "Microsoft", "Adobe"],
        "company_count": 3,
        "topic": "Linked List",
        "relatedTopics": [
            { "name": "Linked List" },
            { "name": "Math" },
            { "name": "Recursion" }
        ],
        "isGrind75": false,
        "likes": 25000
    },
    {
        "id": "3",
        "title": "Longest Substring Without Repeating Characters",
        "url": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
        "difficulty": "Medium",
        "duration": 35,
        "companies": ["Amazon", "Google", "Facebook", "Microsoft"],
        "company_count": 4,
        "topic": "String",
        "relatedTopics": [
            { "name": "String" },
            { "name": "Hash Table" },
            { "name": "Sliding Window" }
        ],
        "isGrind75": true,
        "likes": 35000
    },
    {
        "id": "15",
        "title": "3Sum",
        "url": "https://leetcode.com/problems/3sum/",
        "difficulty": "Medium",
        "duration": 40,
        "companies": ["Facebook", "Amazon", "Microsoft", "Apple"],
        "company_count": 4,
        "topic": "Array",
        "relatedTopics": [
            { "name": "Array" },
            { "name": "Two Pointers" },
            { "name": "Sorting" }
        ],
        "isGrind75": true,
        "likes": 28000
    },
    {
        "id": "20",
        "title": "Valid Parentheses",
        "url": "https://leetcode.com/problems/valid-parentheses/",
        "difficulty": "Easy",
        "duration": 20,
        "companies": ["Amazon", "Microsoft", "Google", "Facebook", "Bloomberg"],
        "company_count": 5,
        "topic": "Stack",
        "relatedTopics": [
            { "name": "Stack" },
            { "name": "String" }
        ],
        "isGrind75": true,
        "likes": 22000
    },
    {
        "id": "21",
        "title": "Merge Two Sorted Lists",
        "url": "https://leetcode.com/problems/merge-two-sorted-lists/",
        "difficulty": "Easy",
        "duration": 20,
        "companies": ["Amazon", "Microsoft", "Apple"],
        "company_count": 3,
        "topic": "Linked List",
        "relatedTopics": [
            { "name": "Linked List" },
            { "name": "Recursion" }
        ],
        "isGrind75": true,
        "likes": 19000
    },
    {
        "id": "23",
        "title": "Merge k Sorted Lists",
        "url": "https://leetcode.com/problems/merge-k-sorted-lists/",
        "difficulty": "Hard",
        "duration": 60,
        "companies": ["Amazon", "Google", "Facebook", "Microsoft", "Uber"],
        "company_count": 5,
        "topic": "Linked List",
        "relatedTopics": [
            { "name": "Linked List" },
            { "name": "Divide and Conquer" },
            { "name": "Heap" },
            { "name": "Merge Sort" }
        ],
        "isGrind75": false,
        "likes": 18000
    },
    {
        "id": "33",
        "title": "Search in Rotated Sorted Array",
        "url": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
        "difficulty": "Medium",
        "duration": 35,
        "companies": ["Amazon", "Microsoft", "Facebook", "Google"],
        "company_count": 4,
        "topic": "Binary Search",
        "relatedTopics": [
            { "name": "Array" },
            { "name": "Binary Search" }
        ],
        "isGrind75": true,
        "likes": 24000
    },
    {
        "id": "42",
        "title": "Trapping Rain Water",
        "url": "https://leetcode.com/problems/trapping-rain-water/",
        "difficulty": "Hard",
        "duration": 65,
        "companies": ["Amazon", "Google", "Facebook", "Apple", "Microsoft"],
        "company_count": 5,
        "topic": "Array",
        "relatedTopics": [
            { "name": "Array" },
            { "name": "Two Pointers" },
            { "name": "Dynamic Programming" },
            { "name": "Stack" }
        ],
        "isGrind75": false,
        "likes": 30000
    },
    {
        "id": "53",
        "title": "Maximum Subarray",
        "url": "https://leetcode.com/problems/maximum-subarray/",
        "difficulty": "Medium",
        "duration": 30,
        "companies": ["Amazon", "Microsoft", "Google", "Apple", "Bloomberg"],
        "company_count": 5,
        "topic": "Dynamic Programming",
        "relatedTopics": [
            { "name": "Array" },
            { "name": "Divide and Conquer" },
            { "name": "Dynamic Programming" }
        ],
        "isGrind75": true,
        "likes": 32000
    },
    {
        "id": "70",
        "title": "Climbing Stairs",
        "url": "https://leetcode.com/problems/climbing-stairs/",
        "difficulty": "Easy",
        "duration": 15,
        "companies": ["Amazon", "Google", "Adobe"],
        "company_count": 3,
        "topic": "Dynamic Programming",
        "relatedTopics": [
            { "name": "Math" },
            { "name": "Dynamic Programming" },
            { "name": "Memoization" }
        ],
        "isGrind75": true,
        "likes": 20000
    },
    {
        "id": "121",
        "title": "Best Time to Buy and Sell Stock",
        "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
        "difficulty": "Easy",
        "duration": 20,
        "companies": ["Amazon", "Microsoft", "Facebook", "Google", "Apple"],
        "company_count": 5,
        "topic": "Array",
        "relatedTopics": [
            { "name": "Array" },
            { "name": "Dynamic Programming" }
        ],
        "isGrind75": true,
        "likes": 28000
    },
    {
        "id": "125",
        "title": "Valid Palindrome",
        "url": "https://leetcode.com/problems/valid-palindrome/",
        "difficulty": "Easy",
        "duration": 15,
        "companies": ["Facebook", "Amazon", "Microsoft"],
        "company_count": 3,
        "topic": "String",
        "relatedTopics": [
            { "name": "Two Pointers" },
            { "name": "String" }
        ],
        "isGrind75": true,
        "likes": 8000
    },
    {
        "id": "200",
        "title": "Number of Islands",
        "url": "https://leetcode.com/problems/number-of-islands/",
        "difficulty": "Medium",
        "duration": 40,
        "companies": ["Amazon", "Google", "Facebook", "Microsoft", "Apple"],
        "company_count": 5,
        "topic": "Graph",
        "relatedTopics": [
            { "name": "Array" },
            { "name": "Depth-First Search" },
            { "name": "Breadth-First Search" },
            { "name": "Union Find" },
            { "name": "Matrix" }
        ],
        "isGrind75": true,
        "likes": 22000
    },
    {
        "id": "206",
        "title": "Reverse Linked List",
        "url": "https://leetcode.com/problems/reverse-linked-list/",
        "difficulty": "Easy",
        "duration": 20,
        "companies": ["Amazon", "Microsoft", "Google", "Facebook", "Apple"],
        "company_count": 5,
        "topic": "Linked List",
        "relatedTopics": [
            { "name": "Linked List" },
            { "name": "Recursion" }
        ],
        "isGrind75": true,
        "likes": 20000
    },
    {
        "id": "226",
        "title": "Invert Binary Tree",
        "url": "https://leetcode.com/problems/invert-binary-tree/",
        "difficulty": "Easy",
        "duration": 15,
        "companies": ["Google", "Amazon", "Facebook"],
        "company_count": 3,
        "topic": "Tree",
        "relatedTopics": [
            { "name": "Tree" },
            { "name": "Depth-First Search" },
            { "name": "Breadth-First Search" },
            { "name": "Binary Tree" }
        ],
        "isGrind75": true,
        "likes": 13000
    },
    {
        "id": "238",
        "title": "Product of Array Except Self",
        "url": "https://leetcode.com/problems/product-of-array-except-self/",
        "difficulty": "Medium",
        "duration": 35,
        "companies": ["Amazon", "Microsoft", "Facebook", "Apple", "Google"],
        "company_count": 5,
        "topic": "Array",
        "relatedTopics": [
            { "name": "Array" },
            { "name": "Prefix Sum" }
        ],
        "isGrind75": true,
        "likes": 21000
    },
    {
        "id": "242",
        "title": "Valid Anagram",
        "url": "https://leetcode.com/problems/valid-anagram/",
        "difficulty": "Easy",
        "duration": 15,
        "companies": ["Amazon", "Google", "Facebook"],
        "company_count": 3,
        "topic": "String",
        "relatedTopics": [
            { "name": "Hash Table" },
            { "name": "String" },
            { "name": "Sorting" }
        ],
        "isGrind75": true,
        "likes": 11000
    },
    {
        "id": "283",
        "title": "Move Zeroes",
        "url": "https://leetcode.com/problems/move-zeroes/",
        "difficulty": "Easy",
        "duration": 15,
        "companies": ["Facebook", "Amazon", "Bloomberg"],
        "company_count": 3,
        "topic": "Array",
        "relatedTopics": [
            { "name": "Array" },
            { "name": "Two Pointers" }
        ],
        "isGrind75": false,
        "likes": 15000
    },
    {
        "id": "300",
        "title": "Longest Increasing Subsequence",
        "url": "https://leetcode.com/problems/longest-increasing-subsequence/",
        "difficulty": "Medium",
        "duration": 45,
        "companies": ["Amazon", "Microsoft", "Google", "Facebook"],
        "company_count": 4,
        "topic": "Dynamic Programming",
        "relatedTopics": [
            { "name": "Array" },
            { "name": "Binary Search" },
            { "name": "Dynamic Programming" }
        ],
        "isGrind75": false,
        "likes": 19000
    }
];

console.log(JSON.stringify(sampleProblems, null, 2));
