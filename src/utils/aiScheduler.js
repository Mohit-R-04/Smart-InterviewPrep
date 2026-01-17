/**
 * AI-POWERED SMART RECOMMENDATION ENGINE
 * 
 * Uses Gemini AI to suggest ADDITIONAL problems based on user targets.
 * This complements the algorithmic schedule rather than replacing it.
 */


// Helper function to make a single AI request
async function makeSingleAIRequest(prompt, geminiApiKey) {
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

            if (response.ok) {
                data = await response.json();
                return data;
            }
        } catch (e) {
            console.warn('⚠️ Direct API call failed, trying proxy...', e.message);
        }
    }

    // PROXY CALL (fallback or default)
    const response = await fetch('/.netlify/functions/gemini-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
        throw new Error(`Proxy call failed: ${response.status}`);
    }

    const proxyData = await response.json();

    // Check for API errors
    if (proxyData.error) {
        const errorMsg = proxyData.error.message || 'Unknown API error';
        const errorCode = proxyData.error.code;

        if (errorCode === 429) {
            console.warn('⏳ AI quota exceeded.');
        } else {
            console.error(`❌ Gemini API error (${errorCode}):`, errorMsg);
        }
        throw new Error(errorMsg);
    }

    // Handle response format
    if (proxyData.candidates) {
        return proxyData;
    } else if (proxyData.body) {
        return typeof proxyData.body === 'string' ? JSON.parse(proxyData.body) : proxyData.body;
    }

    throw new Error('Unexpected proxy response format');
}

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

        // Take top candidates for AI to choose from
        const candidates = relevantProblems
            .sort((a, b) => (b.importanceScore || 0) - (a.importanceScore || 0))
            .slice(0, 150);

        console.log(`🎯 Sending ${candidates.length} candidates to AI`);

        // Calculate total recommendations needed: weeks * hoursPerWeek
        const totalRecommendations = (config.weeks || 4) * (config.hoursPerWeek || 6);
        console.log(`📝 Requesting ${totalRecommendations} AI recommendations`);

        // Make batched requests (max 8 per batch to avoid timeout)
        const batchSize = 8;
        const numBatches = Math.ceil(totalRecommendations / batchSize);
        console.log(`📦 Splitting into ${numBatches} batches (${batchSize} per batch)`);

        const allRecommendations = [];
        const usedIds = new Set(); // Track used IDs to avoid duplicates

        for (let batchNum = 0; batchNum < numBatches; batchNum++) {
            const batchCount = Math.min(batchSize, totalRecommendations - allRecommendations.length);
            console.log(`📤 Batch ${batchNum + 1}/${numBatches}: Requesting ${batchCount} problems`);

            // Filter out already recommended problems for this batch
            const availableCandidates = candidates.filter(p => !usedIds.has(p.id));

            if (availableCandidates.length === 0) {
                console.warn('⚠️ No more unique candidates available');
                break;
            }

            const prompt = `You are an expert technical interview coach. Recommend ${batchCount} "Hidden Gem" problems.

USER TARGETS:
- Companies: ${config.selectedCompanies.join(', ') || 'Top Tech'}
- Topics: ${config.selectedTopics?.join(', ') || 'Core CS'}
- Level: ${config.experienceLevel}

${usedIds.size > 0 ? `ALREADY RECOMMENDED (DO NOT REPEAT): ${Array.from(usedIds).join(', ')}\n` : ''}
CANDIDATES:
${JSON.stringify(availableCandidates.slice(0, 50).map(p => ({
                id: p.id,
                title: p.title,
                difficulty: p.difficulty,
                companies: p.companies.slice(0, 2)
            })), null, 2)}

Return ONLY valid JSON with exactly ${batchCount} unique problems:
{
  "recommendations": [
    {"id": "problem-id", "reason": "Why critical for ${config.selectedCompanies[0] || 'interviews'}"}
  ]
}`;

            try {
                const data = await makeSingleAIRequest(prompt, geminiApiKey);

                // Validate response
                if (!data?.candidates?.[0]?.content?.parts?.[0]) {
                    console.error(`❌ Batch ${batchNum + 1} invalid response`);
                    continue;
                }

                const aiResponse = data.candidates[0].content.parts[0].text;
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);

                if (!jsonMatch) {
                    console.error(`❌ Batch ${batchNum + 1} no JSON found`);
                    continue;
                }

                const result = JSON.parse(jsonMatch[0]);

                // Add unique recommendations
                for (const rec of result.recommendations || []) {
                    if (!usedIds.has(rec.id)) {
                        const original = allProblems.find(p => p.id === rec.id);
                        if (original) {
                            allRecommendations.push({ ...original, aiReason: rec.reason });
                            usedIds.add(rec.id);
                        }
                    }
                }

                console.log(`✅ Batch ${batchNum + 1} complete: ${allRecommendations.length} total recommendations`);

                // Small delay between batches to avoid rate limiting
                if (batchNum < numBatches - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

            } catch (error) {
                console.error(`❌ Batch ${batchNum + 1} failed:`, error.message);
                // Continue with next batch even if one fails
            }
        }

        console.log(`✅ AI Recommendations complete: ${allRecommendations.length} problems`);

        return {
            recommendations: allRecommendations,
            aiGenerated: allRecommendations.length > 0
        };

    } catch (error) {
        console.error('❌ AI Recommendation error:', error);
        return { recommendations: [], aiGenerated: false };
    }
}
