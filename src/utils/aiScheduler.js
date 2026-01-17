/**
 * AI-POWERED SMART RECOMMENDATION ENGINE
 * 
 * Uses Gemini AI to sugggest ADDITIONAL problems based on user targets.
 * This complements the algorithmic schedule rather than replacing it.
 */



export async function generateAIRecommendations(allProblems, config, geminiApiKey) {

    console.log('🤖 AI Recommendations: Starting...', {
        hasApiKey: !!geminiApiKey,
        companiesSelected: config.selectedCompanies?.length || 0,
        topicsSelected: config.selectedTopics?.length || 0
    });

    try {
        // Prepare context for AI (focus on company/topic match)
        let relevantProblems = [];

        // Prioritize Company > Topic > High Importance
        if (config.selectedCompanies.length > 0) {
            relevantProblems = allProblems.filter(p =>
                p.companies && p.companies.some(c => config.selectedCompanies.includes(c))
            );
            console.log(`📊 Filtered ${relevantProblems.length} problems by companies`);
        } else if (config.selectedTopics && config.selectedTopics.length > 0) {
            relevantProblems = allProblems.filter(p =>
                p.relatedTopics && p.relatedTopics.some(t => {
                    const topicName = typeof t === 'string' ? t : t.name;
                    return config.selectedTopics.includes(topicName);
                })
            );
            console.log(`📊 Filtered ${relevantProblems.length} problems by topics`);
        } else {
            // General high importance
            relevantProblems = allProblems.filter(p => p.importanceScore > 80);
            console.log(`📊 Filtered ${relevantProblems.length} high-importance problems`);
        }

        if (relevantProblems.length === 0) {
            console.warn('⚠️ No relevant problems found for AI analysis');
            return { recommendations: [], aiGenerated: false };
        }

        // Take top 150 candidates for AI to choose from
        const candidates = relevantProblems
            .sort((a, b) => (b.importanceScore || 0) - (a.importanceScore || 0))
            .slice(0, 150);

        console.log(`🎯 Sending ${candidates.length} candidates to AI`);

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
            console.log('🔑 Attempting direct API call...');
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });

                if (!response.ok) {
                    console.warn(`❌ Direct API call failed: ${response.status}`);
                    throw new Error('Direct API call failed');
                }
                data = await response.json();
                console.log('✅ Direct API call succeeded');
            } catch (e) {
                console.warn('⚠️ Direct API call failed, trying proxy...', e.message);
            }
        }

        // PROXY CALL (fallback or default)
        if (!data) {
            console.log('🔄 Attempting proxy call...');
            try {
                const response = await fetch('/.netlify/functions/gemini-proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt })
                });

                if (response.ok) {
                    data = await response.json();
                    console.log('✅ Proxy call succeeded');
                } else {
                    console.error(`❌ Proxy call failed: ${response.status}`);
                }
            } catch (e) {
                console.error('❌ Proxy call error:', e.message);
            }
        }

        // Validate response structure
        if (!data || !data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
            console.error('❌ Invalid AI response structure:', data);
            return { recommendations: [], aiGenerated: false };
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        console.log('📝 AI Response received, parsing...');

        // Parse JSON response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('❌ No JSON found in AI response');
            return { recommendations: [], aiGenerated: false };
        }

        const result = JSON.parse(jsonMatch[0]);
        console.log(`✨ AI suggested ${result.recommendations?.length || 0} problems`);

        // Enrich with full problem data
        const enrichedRecs = result.recommendations.map(r => {
            const original = allProblems.find(p => p.id === r.id);
            if (!original) {
                console.warn(`⚠️ Problem ${r.id} not found in database`);
            }
            return original ? { ...original, aiReason: r.reason } : null;
        }).filter(Boolean);

        console.log(`✅ AI Recommendations complete: ${enrichedRecs.length} problems enriched`);

        return {
            recommendations: enrichedRecs,
            aiGenerated: true
        };

    } catch (error) {
        console.error('❌ AI Recommendation error:', error);
        return { recommendations: [], aiGenerated: false };
    }
}

// Re-export for compatibility if needed elsewhere, but mainly we use the new function now

