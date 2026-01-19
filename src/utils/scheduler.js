
// "Smart Grinder" Algorithm
// Generates a weekly schedule based on constraints and intelligent weighting.

import { getCompanyNameVariations } from './companyNameMapper.js';

function getDifficultyWeight(diff) {
    switch (diff) {
        case 'Very Easy': return 1;
        case 'Easy': return 2;
        case 'Medium': return 3;
        case 'Hard': return 4;
        case 'Very Hard': return 5;
        default: return 3;
    }
}

function normalize(val, max) {
    return max > 0 ? val / max : 0;
}

export function generateSchedule(allProblems, config) {
    const { weeks, hoursPerWeek, selectedCompanies, selectedDifficulties, selectedTopics, experienceLevel } = config;
    const totalHoursV = weeks * hoursPerWeek * 60; // Total budget in minutes

    // Experience Multiplier
    let timeMultiplier = 1.0;
    if (experienceLevel === 'Beginner') timeMultiplier = 1.5;
    else if (experienceLevel === 'Expert') timeMultiplier = 0.7;

    // 1. FILTERING
    let pool = allProblems.filter(p => {
        // Difficulty Check
        if (!selectedDifficulties.includes(p.difficulty)) return false;

        // Company Check (if any selected)
        if (selectedCompanies.length > 0) {
            // Use fuzzy matching to handle name variations
            const hasCompany = selectedCompanies.some(selectedCompany => {
                const variations = getCompanyNameVariations(selectedCompany);
                return p.companies.some(problemCompany => {
                    const problemCompanyLower = problemCompany.toLowerCase();
                    return variations.some(v => v.toLowerCase() === problemCompanyLower);
                });
            });
            if (!hasCompany) return false;
        }

        // Topic Check (if any selected)
        if (selectedTopics && selectedTopics.length > 0) {
            const pTags = (p.relatedTopics || []).map(t => t.name);
            const hasTopic = selectedTopics.some(t => pTags.includes(t));
            if (!hasTopic) return false;
        }

        return true;
    });

    // 2. SCORING & RANKING
    // Find max values for normalization
    const maxCompanyCount = Math.max(...pool.map(p => p.company_count), 1);
    const maxLikes = Math.max(...pool.map(p => p.likes || 0), 1);

    pool = pool.map(p => {
        // Base Score: 70% Company Frequency, 30% Likes
        const normCompany = normalize(p.company_count, maxCompanyCount);
        const normLikes = normalize(p.likes || 0, maxLikes);

        let score = (normCompany * 0.7) + (normLikes * 0.3);

        // Grind75 Boost (Still valuable as a curated signal)
        if (p.isGrind75) score *= 1.2;

        // --- Difficulty Weighting based on Experience ---
        // Biasing the greedy selection to favor appropriate difficulties
        let diffWeight = 1.0;
        if (experienceLevel === 'Beginner') {
            if (p.difficulty === 'Very Easy' || p.difficulty === 'Easy') diffWeight = 3.0;
            else if (p.difficulty === 'Medium') diffWeight = 0.5;
            else diffWeight = 0.1; // Hard/Very Hard
        } else if (experienceLevel === 'Expert') {
            if (p.difficulty === 'Hard' || p.difficulty === 'Very Hard') diffWeight = 2.0; // Boosted but not overwhelming
            else if (p.difficulty === 'Medium') diffWeight = 1.0;
            else diffWeight = 0.5; // Soft penalty, allowing high-quality Easy refresher questions
        }
        // Note: For Intermediate, we apply NO static bias. We let the decay handle it.

        score *= diffWeight;

        return { ...p, score };
    });

    // Sort by Score DESC
    pool.sort((a, b) => b.score - a.score);

    // 3. SCHEDULE GENERATION
    // Strategy: Iterative Selection with "Topic Decay" and "Difficulty Decay" to ensure diversity.

    const finalSelection = [];
    let currentTotalTime = 0;

    // Copy pool to avoid mutation issues during splice
    const candidates = [...pool];
    const tagCounts = {}; // Track how many times we've picked a tag
    const difficultyCounts = {}; // Track selected difficulties for decay

    while (currentTotalTime < totalHoursV && candidates.length > 0) {
        let bestIdx = -1;
        let bestScore = -1;

        // Find best candidate with current penalties
        for (let i = 0; i < candidates.length; i++) {
            const p = candidates[i];

            // 1. Topic Diversity Penalty
            // Decay factor: 0.96^n (4% penalty per existing occurrence of this tag)
            let topicPenalty = 1.0;
            if (p.relatedTopics && Array.isArray(p.relatedTopics)) {
                for (const tag of p.relatedTopics) {
                    const count = tagCounts[tag.name] || 0;
                    topicPenalty *= Math.pow(0.96, count);
                }
            }

            // 2. Difficulty Diversity Penalty
            // Decay factor: 0.92^n (8% penalty per existing occurrence of this difficulty)
            // Stronger penalty to force distribution
            const diffCount = difficultyCounts[p.difficulty] || 0;
            const diffPenalty = Math.pow(0.95, diffCount);

            const effectiveScore = p.score * topicPenalty * diffPenalty;

            if (effectiveScore > bestScore) {
                bestScore = effectiveScore;
                bestIdx = i;
            }
        }

        if (bestIdx === -1) break; // Should not happen if candidates !empty

        const selected = candidates[bestIdx];

        // APPLY EXPERIENCE MULTIPLIER TO DURATION
        // We update the duration on the object itself so it flows through to the UI/Schedule
        const adjustedDuration = Math.ceil(selected.duration * timeMultiplier);

        // Check if it fits (greedy approach for packing)
        // Note: strictly speaking, solving Knapsack is better, but greedy is fine for this volume
        // We only add if it fits remaining budget or if we are very early (to ensure at least something)

        // Slight modification: If it doesn't fit, we remove it and try next best? 
        // Or we just stop? Let's try to skip if it doesn't fit but keep looking.
        if (currentTotalTime + adjustedDuration <= totalHoursV) {
            // Update the problem object with new duration
            const pWithAdjustedTime = { ...selected, duration: adjustedDuration };

            finalSelection.push(pWithAdjustedTime);
            currentTotalTime += adjustedDuration;

            // Update Topic penalties
            if (selected.relatedTopics && Array.isArray(selected.relatedTopics)) {
                for (const tag of selected.relatedTopics) {
                    tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
                }
            }

            // Update Difficulty penalties
            difficultyCounts[selected.difficulty] = (difficultyCounts[selected.difficulty] || 0) + 1;
        }

        // Remove from candidates regardless (either selected or didn't fit)
        // Optimization: swap-remove
        candidates[bestIdx] = candidates[candidates.length - 1];
        candidates.pop();
    }

    // Now organize `finalSelection` into weeks with Difficulty Progression
    // Sort selection by Difficulty Weight (Very Easy -> Very Hard)
    finalSelection.sort((a, b) => getDifficultyWeight(a.difficulty) - getDifficultyWeight(b.difficulty));

    // Distribution:
    // Simply chunk strictly by time (Week 1 fills up, then Week 2...)
    // Since we sorted by difficulty, Week 1 will naturally have the easiest problems.

    const schedule = [];
    let problemIndex = 0;

    for (let w = 1; w <= weeks; w++) {
        const weekProblems = [];
        let weekTime = 0;
        const weekLimit = hoursPerWeek * 60;

        while (problemIndex < finalSelection.length) {
            const p = finalSelection[problemIndex];
            if (weekTime + p.duration <= weekLimit) {
                weekProblems.push(p);
                weekTime += p.duration;
                problemIndex++;
            } else {
                // Week full
                break;
            }
        }

        // Add week even if empty (user might have set huge duration)
        if (weekProblems.length > 0 || w <= weeks) {
            schedule.push({
                weekNum: w,
                problems: weekProblems,
                time: weekTime
            });
        }
    }

    return schedule;
}
