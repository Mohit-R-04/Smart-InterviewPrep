/**
 * AI-POWERED SMART SCHEDULER
 * 
 * Uses Gemini AI to generate intelligent, personalized schedules
 * Replaces the algorithmic scheduler with AI-driven recommendations
 */

export async function generateAISchedule(allProblems, config, geminiApiKey) {
    if (!geminiApiKey) {
        // Fallback to algorithmic scheduler
        return generateAlgorithmicSchedule(allProblems, config);
    }

    try {
        // Prepare problem data for AI
        const curatedProblems = allProblems.filter(p => p.isCurated);
        const topProblems = allProblems
            .filter(p => p.importanceScore)
            .sort((a, b) => (b.importanceScore || 0) - (a.importanceScore || 0))
            .slice(0, 100);

        // Get company-specific problems if companies selected
        let companyProblems = [];
        if (config.selectedCompanies.length > 0) {
            companyProblems = allProblems
                .filter(p => p.companies.some(c => config.selectedCompanies.includes(c)))
                .sort((a, b) => (b.importanceScore || 0) - (a.importanceScore || 0))
                .slice(0, 50);
        }

        // Get topic-specific problems if topics selected
        let topicProblems = [];
        if (config.selectedTopics && config.selectedTopics.length > 0) {
            topicProblems = allProblems
                .filter(p => p.relatedTopics.some(t => config.selectedTopics.includes(t.name)))
                .sort((a, b) => (b.importanceScore || 0) - (a.importanceScore || 0))
                .slice(0, 50);
        }

        // Combine and deduplicate
        const candidateProblems = Array.from(new Set([
            ...curatedProblems,
            ...topProblems,
            ...companyProblems,
            ...topicProblems
        ]));

        // Calculate time budget
        const totalMinutes = config.weeks * config.hoursPerWeek * 60;
        const avgProblemTime = 30; // minutes
        const targetProblemCount = Math.floor(totalMinutes / avgProblemTime);

        // Prepare AI prompt
        const prompt = `You are an expert technical interview coach creating a personalized study schedule.

USER PROFILE:
- Experience Level: ${config.experienceLevel}
- Duration: ${config.weeks} weeks
- Weekly Hours: ${config.hoursPerWeek} hours
- Total Time: ${totalMinutes} minutes (≈${targetProblemCount} problems)
- Target Companies: ${config.selectedCompanies.length > 0 ? config.selectedCompanies.join(', ') : 'General'}
- Focus Topics: ${config.selectedTopics?.length > 0 ? config.selectedTopics.join(', ') : 'All'}
- Selected Difficulties: ${config.selectedDifficulties.join(', ')}

AVAILABLE PROBLEMS (${candidateProblems.length} candidates):
${JSON.stringify(candidateProblems.slice(0, 200).map(p => ({
            id: p.id,
            title: p.title,
            difficulty: p.difficulty,
            duration: p.duration,
            companies: p.companies.slice(0, 3),
            topics: p.relatedTopics.map(t => t.name).slice(0, 2),
            importance: p.importanceScore || 50,
            isCurated: p.isCurated,
            curatedSource: p.curatedSource
        })), null, 2)}

TASK: Create an optimal ${config.weeks}-week study schedule.

REQUIREMENTS:
1. Select EXACTLY ${targetProblemCount} problems (no more, no less)
2. NO DUPLICATE PROBLEMS - each problem ID should appear only once
3. Distribute across ${config.weeks} weeks based on time budget
4. Progressive difficulty (easier problems in early weeks)
5. Prioritize:
   - Curated problems (Grind75, NeetCode150, Blind75)
   - High importance scores
   - Company-specific problems if companies selected
   - Topic diversity
6. Respect difficulty preferences: ${config.selectedDifficulties.join(', ')}
7. Consider experience level for time estimates

SCHEDULE FORMAT (JSON):
{
  "weeks": [
    {
      "weekNum": 1,
      "problems": [
        {
          "id": "1",
          "title": "Two Sum",
          "difficulty": "Easy",
          "duration": 15,
          "reason": "Fundamental hash table pattern"
        }
      ],
      "totalTime": 120,
      "focus": "Arrays & Hash Tables"
    }
  ],
  "summary": {
    "totalProblems": ${targetProblemCount},
    "byDifficulty": {"Easy": X, "Medium": Y, "Hard": Z},
    "keyPatterns": ["Pattern1", "Pattern2"],
    "studyTips": "Your personalized advice"
  }
}

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, just the JSON object.`;

        // Call Gemini API through serverless proxy (keeps API key secure)
        const response = await fetch('/.netlify/functions/gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            console.error('Gemini API error, falling back to algorithmic scheduler');
            return generateAlgorithmicSchedule(allProblems, config);
        }

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        // Parse JSON response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('Invalid AI response, falling back to algorithmic scheduler');
            return generateAlgorithmicSchedule(allProblems, config);
        }

        const aiSchedule = JSON.parse(jsonMatch[0]);

        // Enrich AI schedule with full problem data
        const enrichedSchedule = aiSchedule.weeks.map(week => ({
            ...week,
            problems: week.problems.map(p => {
                const fullProblem = allProblems.find(fp => fp.id === p.id);
                return fullProblem ? { ...fullProblem, aiReason: p.reason } : p;
            }).filter(p => p.url) // Remove any problems not found
        }));

        // Add metadata
        enrichedSchedule.forEach(week => {
            week.time = week.problems.reduce((sum, p) => sum + (p.duration || 30), 0);
        });

        return {
            schedule: enrichedSchedule,
            aiGenerated: true,
            summary: aiSchedule.summary
        };

    } catch (error) {
        console.error('AI scheduler error:', error);
        return generateAlgorithmicSchedule(allProblems, config);
    }
}

// Fallback algorithmic scheduler (original logic)
function generateAlgorithmicSchedule(allProblems, config) {
    const { weeks, hoursPerWeek, selectedCompanies, selectedDifficulties, selectedTopics, experienceLevel } = config;
    const totalHoursV = weeks * hoursPerWeek * 60;

    // Experience Multiplier
    let timeMultiplier = 1.0;
    if (experienceLevel === 'Beginner') timeMultiplier = 1.5;
    else if (experienceLevel === 'Expert') timeMultiplier = 0.7;

    // 1. FILTERING
    let pool = allProblems.filter(p => {
        if (!selectedDifficulties.includes(p.difficulty)) return false;
        if (selectedCompanies.length > 0) {
            const hasCompany = p.companies.some(c => selectedCompanies.includes(c));
            if (!hasCompany) return false;
        }
        if (selectedTopics && selectedTopics.length > 0) {
            const pTags = (p.relatedTopics || []).map(t => t.name);
            const hasTopic = selectedTopics.some(t => pTags.includes(t));
            if (!hasTopic) return false;
        }
        return true;
    });

    // 2. SCORING & RANKING
    const maxCompanyCount = Math.max(...pool.map(p => p.company_count), 1);
    const maxLikes = Math.max(...pool.map(p => p.likes || 0), 1);

    pool = pool.map(p => {
        const normCompany = p.company_count / maxCompanyCount;
        const normLikes = (p.likes || 0) / maxLikes;

        let score = (normCompany * 0.7) + (normLikes * 0.3);

        // Curated boost
        if (p.isCurated) score *= 1.3;

        // Importance score boost
        if (p.importanceScore) score *= (1 + p.importanceScore / 200);

        // Difficulty weighting
        let diffWeight = 1.0;
        if (experienceLevel === 'Beginner') {
            if (p.difficulty === 'Very Easy' || p.difficulty === 'Easy') diffWeight = 3.0;
            else if (p.difficulty === 'Medium') diffWeight = 0.5;
            else diffWeight = 0.1;
        } else if (experienceLevel === 'Expert') {
            if (p.difficulty === 'Hard' || p.difficulty === 'Very Hard') diffWeight = 2.0;
            else if (p.difficulty === 'Medium') diffWeight = 1.0;
            else diffWeight = 0.5;
        }

        score *= diffWeight;
        return { ...p, score };
    });

    pool.sort((a, b) => b.score - a.score);

    // 3. SELECTION with diversity
    const finalSelection = [];
    let currentTotalTime = 0;
    const candidates = [...pool];
    const tagCounts = {};
    const difficultyCounts = {};
    const seenIds = new Set(); // Prevent duplicates

    while (currentTotalTime < totalHoursV && candidates.length > 0) {
        let bestIdx = -1;
        let bestScore = -1;

        for (let i = 0; i < candidates.length; i++) {
            const p = candidates[i];

            // Skip if already selected
            if (seenIds.has(p.id)) continue;

            let topicPenalty = 1.0;
            if (p.relatedTopics && Array.isArray(p.relatedTopics)) {
                for (const tag of p.relatedTopics) {
                    const count = tagCounts[tag.name] || 0;
                    topicPenalty *= Math.pow(0.96, count);
                }
            }

            const diffCount = difficultyCounts[p.difficulty] || 0;
            const diffPenalty = Math.pow(0.95, diffCount);

            const effectiveScore = p.score * topicPenalty * diffPenalty;

            if (effectiveScore > bestScore) {
                bestScore = effectiveScore;
                bestIdx = i;
            }
        }

        if (bestIdx === -1) break;

        const selected = candidates[bestIdx];
        const adjustedDuration = Math.ceil(selected.duration * timeMultiplier);

        if (currentTotalTime + adjustedDuration <= totalHoursV) {
            const pWithAdjustedTime = { ...selected, duration: adjustedDuration };
            finalSelection.push(pWithAdjustedTime);
            seenIds.add(selected.id);
            currentTotalTime += adjustedDuration;

            if (selected.relatedTopics && Array.isArray(selected.relatedTopics)) {
                for (const tag of selected.relatedTopics) {
                    tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
                }
            }

            difficultyCounts[selected.difficulty] = (difficultyCounts[selected.difficulty] || 0) + 1;
        }

        candidates[bestIdx] = candidates[candidates.length - 1];
        candidates.pop();
    }

    // 4. WEEKLY DISTRIBUTION
    finalSelection.sort((a, b) => getDifficultyWeight(a.difficulty) - getDifficultyWeight(b.difficulty));

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
                break;
            }
        }

        if (weekProblems.length > 0 || w <= weeks) {
            schedule.push({
                weekNum: w,
                problems: weekProblems,
                time: weekTime
            });
        }
    }

    return {
        schedule,
        aiGenerated: false
    };
}

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

export { generateAlgorithmicSchedule };
