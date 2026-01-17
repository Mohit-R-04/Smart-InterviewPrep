
/**
 * Extracts LeetCode problem IDs from a video title.
 * Strategies:
 * 1. "LeetCode <List>" (Comma/Space separated) -> "LeetCode 125, 3, 63"
 * 2. "LeetCode <ID>" or "LeetCode #<ID>" -> "LeetCode 125"
 * 3. "#<ID>" -> "#125"
 * 4. Start of string "<ID>." -> "125. Valid Palindrome"
 * 5. Suffix "- <ID>" -> "Two Sum - 1"
 * 
 * @param {string} title 
 * @returns {Set<string>} Set of problem IDs
 */
export function extractProblemIds(title) {
    const matchedIds = new Set();

    // Strategy 0: "LeetCode <List>" (Comma/Space separated)
    // Matches: "LeetCode 125, 3, 63"
    // Greedy match for the list part
    const listMatch = title.match(/LeetCode\s+([0-9,\s&and]+)/i);
    if (listMatch) {
        // Split by non-digits to get numbers: "125, 3, 63" -> ["125", "3", "63"]
        const numbers = listMatch[1].split(/[^0-9]+/).filter(s => s.length > 0);
        numbers.forEach(n => matchedIds.add(n));
    }

    // Strategy 1: "LeetCode <ID>" or "LeetCode #<ID>"
    // Matches: "LeetCode 125", "LeetCode #9"
    const explicitMatches = [...title.matchAll(/LeetCode\s*#?(\d+)/gi)];
    explicitMatches.forEach(m => matchedIds.add(m[1]));

    // Strategy 2: "#<ID>"
    // Matches: "#125", "#9"
    const hashMatches = [...title.matchAll(/#(\d+)/g)];
    hashMatches.forEach(m => matchedIds.add(m[1]));

    // Strategy 3: Start of string "<ID>."
    // Matches: "125. Valid Palindrome"
    const startMatch = title.match(/^(\d+)\./);
    if (startMatch) matchedIds.add(startMatch[1]);

    // Strategy 4: Suffix "- <ID>" (Legacy backup)
    // Matches: "Two Sum - 1"
    const suffixMatch = title.match(/-\s*(\d+)$/);
    if (suffixMatch) matchedIds.add(suffixMatch[1]);

    return matchedIds;
}
