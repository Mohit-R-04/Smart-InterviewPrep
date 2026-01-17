
import { describe, it, expect } from 'vitest';
import { extractProblemIds } from './video_matcher';

describe('Video Matcher Regex Logic', () => {

    it('matches single LeetCode ID', () => {
        const title = "LeetCode 125 - Valid Palindrome";
        const ids = extractProblemIds(title);
        expect(ids.has('125')).toBe(true);
        expect(ids.size).toBe(1);
    });

    it('matches single Hash ID', () => {
        const title = "Solving #125 Valid Palindrome";
        const ids = extractProblemIds(title);
        expect(ids.has('125')).toBe(true);
    });

    it('matches comma separated list after LeetCode prefix', () => {
        // User requested feature
        const title = "LeetCode 125, 3, 63 - Arrays";
        const ids = extractProblemIds(title);
        expect(ids.has('125')).toBe(true);
        expect(ids.has('3')).toBe(true);
        expect(ids.has('63')).toBe(true);
        expect(ids.size).toBe(3);
    });

    it('matches space separated list after LeetCode prefix', () => {
        const title = "LeetCode 125 3 63";
        const ids = extractProblemIds(title);
        expect(ids.has('125')).toBe(true);
        expect(ids.has('3')).toBe(true);
        expect(ids.has('63')).toBe(true);
    });

    it('matches "and" separated list', () => {
        const title = "LeetCode 125 and 9";
        const ids = extractProblemIds(title);
        expect(ids.has('125')).toBe(true);
        expect(ids.has('9')).toBe(true);
    });

    it('matches multiple explicit LeetCode mentions', () => {
        const title = "LeetCode 125 & LeetCode 9";
        const ids = extractProblemIds(title);
        expect(ids.has('125')).toBe(true);
        expect(ids.has('9')).toBe(true);
    });

    it('matches multiple hash mentions', () => {
        const title = "LeetCode #125 #9";
        const ids = extractProblemIds(title);
        expect(ids.has('125')).toBe(true);
        expect(ids.has('9')).toBe(true);
    });

    it('ignores random numbers not attached to LeetCode pattern', () => {
        // "Solving 125" shouldn't match unless it says LeetCode or #
        const title = "Solving 125 without prefix";
        const ids = extractProblemIds(title);
        expect(ids.size).toBe(0);
    });

    it('matches dot notation at start', () => {
        const title = "1. Two Sum";
        const ids = extractProblemIds(title);
        expect(ids.has('1')).toBe(true);
    });
});
