/**
 * AI-POWERED SMART RECOMMENDATION ENGINE
 * 
 * Uses Gemini AI to sugggest ADDITIONAL problems based on user targets.
 * This complements the algorithmic schedule rather than replacing it.
 */

import { generateAlgorithmicSchedule } from './scheduler'; // Import for consistency, though we might not fallback to it here

export async function generateAIRecommendations(allProblems, config, geminiApiKey) {
    if (!geminiApiKey) {
        return { recommendations: [], aiGenerated: false };
    }

    try {
        // Prepare context for AI (focus on company/topic match)
        let relevantProblems = [];

        // Prioritize Company > Topic > High Importance
        if (config.selectedCompanies.length > 0) {
            relevantProblems = allProblems.filter(p =>
                p.companies.some(c => config.selectedCompanies.includes(c))
            );
        } else if (config.selectedTopics && config.selectedTopics.length > 0) {
            relevantProblems = allProblems.filter(p =>
                p.relatedTopics.some(t => config.selectedTopics.includes(t.name))
            );
        } else {
            // General high importance
            relevantProblems = allProblems.filter(p => p.importanceScore > 80);
        }

        // Take top 150 candidates for AI to choose from
        const candidates = relevantProblems
            .sort((a, b) => (b.importanceScore || 0) - (a.importanceScore || 0))
            .slice(0, 150);

        const prompt = `You are an expert technical interview coach. The user has a core study plan, but needs 3-5 "Hidden Gem" or "Key Insight" problems specific to their targets.

USER TARGETS:
- Companies: ${config.selectedCompanies.length > 0 ? config.selectedCompanies.join(', ') : 'General Top Tech'}
- Topics: ${config.selectedTopics?.length > 0 ? config.selectedTopics.join(', ') : 'All Core'}
- Level: ${config.experienceLevel}

CANDIDATE PROBLEMS (Select 3-5 that are most critical):
${JSON.stringify(candidates.slice(0, 50).map(p => ({
            id: p.id,
            title: p.title,
            difficulty: p.difficulty,
            companies: p.companies.slice(0, 3)
        })), null, 2)}

TASK: Recommend 3-5 specific problems that are highly relevant to the User Targets.
Return ONLY valid JSON:
{
  "recommendations": [
    {
      "id": "Problem ID",
      "reason": "Why this specific problem is critical for ${config.selectedCompanies[0] || 'interviewing'}."
    }
  ]
}

CRITICAL: Return ONLY valid JSON. No markdown.`;

        let data;

        // DIRECT API CALL (if key provided)
        if (typeof geminiApiKey === 'string' && geminiApiKey.length > 10) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });

                if (!response.ok) throw new Error('Direct API call failed');
                data = await response.json();
            } catch (e) {
                console.warn('Direct API call failed, trying proxy...', e);
            }
        }

        // PROXY CALL (fallback or default)
        if (!data) {
            const response = await fetch('/.netlify/functions/gemini-proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (response.ok) {
                data = await response.json();
            }
        }

        // Validate response structure
        if (!data || !data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
            return { recommendations: [], aiGenerated: false };
        }

        const aiResponse = data.candidates[0].content.parts[0].text;

        // Parse JSON response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { recommendations: [], aiGenerated: false };
        }

        const result = JSON.parse(jsonMatch[0]);

        // Enrich with full problem data
        const enrichedRecs = result.recommendations.map(r => {
            const original = allProblems.find(p => p.id === r.id);
            return original ? { ...original, aiReason: r.reason } : null;
        }).filter(Boolean);

        return {
            recommendations: enrichedRecs,
            aiGenerated: true
        };

    } catch (error) {
        console.error('AI Recommendation error:', error);
        return { recommendations: [], aiGenerated: false };
    }
}

// Re-export for compatibility if needed elsewhere, but mainly we use the new function now
export { generateAlgorithmicSchedule };
