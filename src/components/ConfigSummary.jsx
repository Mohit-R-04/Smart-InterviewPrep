import React from 'react';

export default function ConfigSummary({ config, onStartOver }) {
    // Helpers to format display text
    const companyCount = config.selectedCompanies.length;
    const companyText = companyCount === 0 ? "All Companies" :
        (companyCount > 8 ? `Top Tech + ${companyCount - 8} others` : // Approximation if they chose Top Tech
            (config.selectedCompanies.length + " Selected"));

    const topicCount = config.selectedTopics.length;
    const topicText = topicCount === 0 ? "All Topics" :
        (topicCount > 10 ? "Recommended Topics" : // Simple heuristic
            (config.selectedTopics.length + " Selected"));

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span>🎯</span> Your Strategy
            </h3>

            <div className="space-y-6">
                <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Experience Level</label>
                    <div className="text-base font-medium text-gray-900 dark:text-white capitalize bg-gray-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/50">
                        {config.experienceLevel}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Time Commitment</label>
                    <div className="text-base font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700/50 flex justify-between">
                        <span>{config.weeks} Weeks</span>
                        <span className="text-gray-400">|</span>
                        <span>{config.hoursPerWeek}h / week</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Focus Area</label>
                    <div className="space-y-3">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">🏢</span>
                                <span className="font-medium">Companies</span>
                            </div>
                            <div className="pl-7 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                {companyCount === 0
                                    ? "All Companies"
                                    : config.selectedCompanies.join(', ')}
                            </div>
                        </div>

                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">📚</span>
                                <span className="font-medium">Topics</span>
                            </div>
                            <div className="pl-7 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                {topicCount === 0
                                    ? "All Topics"
                                    : config.selectedTopics.join(', ')}
                            </div>
                        </div>

                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">⚖️</span>
                                <span className="font-medium">Difficulty</span>
                            </div>
                            <div className="pl-7 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                {config.selectedDifficulties.join(', ')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
