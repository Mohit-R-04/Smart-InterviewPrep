// Simple caching helper for AI recommendations
export function getCachedAIRecommendations(config) {
    try {
        const cached = localStorage.getItem('grind_ai_cache');
        if (!cached) return null;

        const { configHash, recommendations, timestamp } = JSON.parse(cached);
        const currentHash = JSON.stringify({
            companies: config.selectedCompanies,
            topics: config.selectedTopics,
            weeks: config.weeks,
            hours: config.hoursPerWeek
        });

        // Cache valid for 24 hours and same config
        const isValid = configHash === currentHash && (Date.now() - timestamp < 24 * 60 * 60 * 1000);

        return isValid ? recommendations : null;
    } catch (e) {
        return null;
    }
}

export function cacheAIRecommendations(config, recommendations) {
    try {
        const configHash = JSON.stringify({
            companies: config.selectedCompanies,
            topics: config.selectedTopics,
            weeks: config.weeks,
            hours: config.hoursPerWeek
        });

        localStorage.setItem('grind_ai_cache', JSON.stringify({
            configHash,
            recommendations,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.error('Failed to cache AI recommendations:', e);
    }
}
