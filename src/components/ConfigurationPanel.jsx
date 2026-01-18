import React, { useState, useMemo } from 'react';

export default function ConfigurationPanel({ config, setConfig, allProblems, filteredStats, dynamicCompanyCounts, dynamicTopicCounts }) {
    const [companySearch, setCompanySearch] = useState('');
    const [topicSearch, setTopicSearch] = useState('');
    const [activeTab, setActiveTab] = useState('companies'); // 'companies' or 'topics'

    // Extract unique companies & counts using dynamic data
    const companyOptions = useMemo(() => {
        // We use allProblems to get minimal list of NAMES, but use dynamic counts for sorting/display
        // Actually, we should probably only show options that have > 0 count OR show all but sort 0 to bottom?
        // Let's show all that exist in allProblems but use the dynamic count.

        const map = new Map();
        // Initialize with 0 for all known companies
        allProblems.forEach(p => {
            p.companies.forEach(c => map.set(c, 0));
        });

        // Update with dynamic counts
        if (dynamicCompanyCounts) {
            dynamicCompanyCounts.forEach((count, name) => {
                map.set(name, count);
            });
        }

        return Array.from(map.entries())
            .sort((a, b) => {
                const aSelected = config.selectedCompanies.includes(a[0]);
                const bSelected = config.selectedCompanies.includes(b[0]);
                if (aSelected && !bSelected) return -1;
                if (!aSelected && bSelected) return 1;
                return b[1] - a[1];
            })
            .map(([name, count]) => ({ name, count }));
    }, [allProblems, dynamicCompanyCounts, config.selectedCompanies]);

    // Extract unique topics & counts using dynamic data
    const topicOptions = useMemo(() => {
        const map = new Map();
        // Initialize with 0
        allProblems.forEach(p => {
            if (p.relatedTopics && Array.isArray(p.relatedTopics)) {
                p.relatedTopics.forEach(t => {
                    const name = t.name || t;
                    map.set(name, 0);
                });
            }
        });

        // Update with dynamic counts
        if (dynamicTopicCounts) {
            dynamicTopicCounts.forEach((count, name) => {
                map.set(name, count);
            });
        }

        return Array.from(map.entries())
            .sort((a, b) => {
                const aSelected = (config.selectedTopics || []).includes(a[0]);
                const bSelected = (config.selectedTopics || []).includes(b[0]);
                if (aSelected && !bSelected) return -1;
                if (!aSelected && bSelected) return 1;
                return b[1] - a[1];
            })
            .map(([name, count]) => ({ name, count }));
    }, [allProblems, dynamicTopicCounts, config.selectedTopics]);

    const filteredCompanies = companyOptions.filter(c =>
        c.name.toLowerCase().includes(companySearch.toLowerCase())
    );

    const filteredTopics = topicOptions.filter(t =>
        t.name.toLowerCase().includes(topicSearch.toLowerCase())
    );

    const toggleDifficulty = (diff) => {
        const current = config.selectedDifficulties;
        if (current.includes(diff)) {
            setConfig({ ...config, selectedDifficulties: current.filter(d => d !== diff) });
        } else {
            setConfig({ ...config, selectedDifficulties: [...current, diff] });
        }
    };

    const toggleCompany = (comp) => {
        const current = config.selectedCompanies;
        if (current.includes(comp)) {
            setConfig({ ...config, selectedCompanies: current.filter(c => c !== comp) });
        } else {
            setConfig({ ...config, selectedCompanies: [...current, comp] });
        }
    };

    const toggleTopic = (topic) => {
        // Handle undefined selectedTopics gracefully
        const current = config.selectedTopics || [];
        if (current.includes(topic)) {
            setConfig({ ...config, selectedTopics: current.filter(t => t !== topic) });
        } else {
            setConfig({ ...config, selectedTopics: [...current, topic] });
        }
    };

    return (
        <div className="lg:sticky lg:top-16 lg:-mt-8 lg:pt-8 lg:h-[calc(100vh-6rem)] z-[900]">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-8 flex flex-col lg:h-full transition-colors duration-300">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-4 shrink-0 tracking-tight">
                    Configuration
                </h2>

                {/* Experience Level */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Experience Level</label>
                    <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                        {['Beginner', 'Intermediate', 'Expert'].map(level => (
                            <button
                                key={level}
                                onClick={() => setConfig({ ...config, experienceLevel: level })}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${config.experienceLevel === level
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duration & Hours Sliders (unchanged) */}
                <div className="space-y-6">
                    <div>
                        <label className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            <span>Duration</span>
                            <span className="text-gray-900 dark:text-white font-bold">{config.weeks} Weeks</span>
                        </label>
                        <input
                            type="range"
                            min="1" max="20"
                            value={config.weeks}
                            onChange={(e) => setConfig({ ...config, weeks: parseInt(e.target.value) })}
                            className="w-full slider-modern text-blue-600 dark:text-blue-500"
                            style={{
                                background: `linear-gradient(to right, currentColor ${((config.weeks - 1) * 100) / 19}%, #e5e7eb ${((config.weeks - 1) * 100) / 19}%)`
                            }}
                        />
                    </div>
                    <div>
                        <label className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            <span>Weekly Hours</span>
                            <span className="text-gray-900 dark:text-white font-bold">{config.hoursPerWeek}h</span>
                        </label>
                        <input
                            type="range"
                            min="2" max="40"
                            value={config.hoursPerWeek}
                            onChange={(e) => setConfig({ ...config, hoursPerWeek: parseInt(e.target.value) })}
                            className="w-full slider-modern text-emerald-600 dark:text-emerald-500"
                            style={{
                                background: `linear-gradient(to right, currentColor ${((config.hoursPerWeek - 2) * 100) / 38}%, #e5e7eb ${((config.hoursPerWeek - 2) * 100) / 38}%)`
                            }}
                        />
                    </div>
                </div>

                {/* Difficulty */}
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Difficulty</label>
                    <div className="flex gap-2 flex-wrap mb-3">
                        {['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'].map(d => (
                            <button
                                key={d}
                                onClick={() => toggleDifficulty(d)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${config.selectedDifficulties.includes(d)
                                    ? d === 'Very Easy' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                        : d === 'Easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                                            : d === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                                                : d === 'Hard' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                                                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>

                    {/* Available Problems Summary Widget */}
                    {filteredStats && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-xs border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                                <div className="font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[10px]">Selected Pool</div>
                                <div className="font-bold text-gray-900 dark:text-white">
                                    {Object.entries(filteredStats)
                                        .filter(([diff]) => config.selectedDifficulties.includes(diff))
                                        .reduce((acc, [, count]) => acc + count, 0)} Total
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                {['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard']
                                    .filter(d => config.selectedDifficulties.includes(d))
                                    .map(lvl => (
                                        <div key={lvl} className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${lvl === 'Very Easy' ? 'bg-emerald-500' :
                                                lvl === 'Easy' ? 'bg-green-500' :
                                                    lvl === 'Medium' ? 'bg-yellow-500' :
                                                        lvl === 'Hard' ? 'bg-red-500' : 'bg-purple-500'
                                                }`}></div>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{lvl}: {filteredStats[lvl] || 0}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs for Companies / Topics */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex border-b border-gray-100 dark:border-gray-700 mb-3">
                        <button
                            onClick={() => setActiveTab('companies')}
                            className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'companies' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            Companies
                        </button>
                        <button
                            onClick={() => setActiveTab('topics')}
                            className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'topics' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            Topics
                        </button>
                    </div>

                    {activeTab === 'companies' ? (
                        <>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="Search companies..."
                                    value={companySearch}
                                    onChange={(e) => setCompanySearch(e.target.value)}
                                    className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent block p-2.5 transition-colors"
                                />
                                {config.selectedCompanies.length > 0 && (
                                    <button
                                        onClick={() => setConfig({ ...config, selectedCompanies: [] })}
                                        className="px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors whitespace-nowrap"
                                        title="Clear all selected companies"
                                    >
                                        Clear ({config.selectedCompanies.length})
                                    </button>
                                )}
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex-1 min-h-[200px] max-h-[50vh] overflow-y-auto p-2 custom-scrollbar">
                                {filteredCompanies.length === 0 && <div className="text-gray-400 text-xs text-center p-4">No matches found</div>}
                                {filteredCompanies.map(({ name, count }) => (
                                    <label key={name} className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer group transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={config.selectedCompanies.includes(name)}
                                            onChange={() => toggleCompany(name)}
                                            className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-0"
                                        />
                                        <div className="flex-1 flex justify-between text-base">
                                            <span className="text-gray-700 dark:text-gray-300 font-semibold group-hover:text-blue-600 dark:group-hover:text-white transition-colors">{name}</span>
                                            <span className="text-gray-400 text-sm bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md font-medium">{count}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="Search topics..."
                                    value={topicSearch}
                                    onChange={(e) => setTopicSearch(e.target.value)}
                                    className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent block p-2.5 transition-colors"
                                />
                                {(config.selectedTopics || []).length > 0 && (
                                    <button
                                        onClick={() => setConfig({ ...config, selectedTopics: [] })}
                                        className="px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors whitespace-nowrap"
                                        title="Clear all selected topics"
                                    >
                                        Clear ({(config.selectedTopics || []).length})
                                    </button>
                                )}
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex-1 min-h-[200px] max-h-[50vh] overflow-y-auto p-2 custom-scrollbar">
                                {filteredTopics.length === 0 && <div className="text-gray-400 text-xs text-center p-4">No matches found</div>}
                                {filteredTopics.map(({ name, count }) => (
                                    <label key={name} className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer group transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={(config.selectedTopics || []).includes(name)}
                                            onChange={() => toggleTopic(name)}
                                            className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-0"
                                        />
                                        <div className="flex-1 flex justify-between text-base">
                                            <span className="text-gray-700 dark:text-gray-300 font-semibold group-hover:text-blue-600 dark:group-hover:text-white transition-colors">{name}</span>
                                            <span className="text-gray-400 text-sm bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md font-medium">{count}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
