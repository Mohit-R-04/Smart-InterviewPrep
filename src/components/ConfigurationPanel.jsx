import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Debounce hook for search
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = React.useState(value);

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// Custom comparison function for React.memo
function arePropsEqual(prevProps, nextProps) {
    // Only re-render if these specific props change
    return (
        prevProps.config === nextProps.config &&
        prevProps.allProblems === nextProps.allProblems &&
        prevProps.dynamicCompanyCounts === nextProps.dynamicCompanyCounts &&
        prevProps.dynamicTopicCounts === nextProps.dynamicTopicCounts &&
        JSON.stringify(prevProps.filteredStats) === JSON.stringify(nextProps.filteredStats)
    );
}

// CollapsibleSection component - MUST be outside to prevent re-creation
const CollapsibleSection = ({ title, isOpen, setIsOpen, children, count }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors rounded-t-2xl"
        >
            <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">{title}</h3>
                {count !== undefined && (
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {count}
                    </span>
                )}
            </div>
            {isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
                <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
        </button>
        {isOpen && (
            <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-700">
                {children}
            </div>
        )}
    </div>
);

const ConfigurationPanel = React.memo(function ConfigurationPanel({ config, setConfig, allProblems, filteredStats, dynamicCompanyCounts, dynamicTopicCounts }) {
    const [companySearch, setCompanySearch] = useState('');
    const [topicSearch, setTopicSearch] = useState('');

    // Active search (only updated when search button is clicked)
    const [activeCompanySearch, setActiveCompanySearch] = useState('');
    const [activeTopicSearch, setActiveTopicSearch] = useState('');

    // Collapse states
    const [isConfigOpen, setIsConfigOpen] = useState(true);
    const [isCompaniesOpen, setIsCompaniesOpen] = useState(true);
    const [isTopicsOpen, setIsTopicsOpen] = useState(true);

    // Memoize the selected arrays to prevent reference changes
    const selectedCompanies = useMemo(() => config.selectedCompanies, [config.selectedCompanies]);
    const selectedTopics = useMemo(() => config.selectedTopics || [], [config.selectedTopics]);

    // Extract unique companies & counts using dynamic data
    const companyOptions = useMemo(() => {
        const map = new Map();
        allProblems.forEach(p => {
            p.companies.forEach(c => map.set(c, 0));
        });

        if (dynamicCompanyCounts) {
            dynamicCompanyCounts.forEach((count, name) => {
                map.set(name, count);
            });
        }

        return Array.from(map.entries())
            .sort((a, b) => {
                const aSelected = selectedCompanies.includes(a[0]);
                const bSelected = selectedCompanies.includes(b[0]);
                if (aSelected && !bSelected) return -1;
                if (!aSelected && bSelected) return 1;
                return b[1] - a[1];
            })
            .map(([name, count]) => ({ name, count }));
    }, [allProblems, dynamicCompanyCounts, selectedCompanies]);

    // Extract unique topics & counts using dynamic data
    const topicOptions = useMemo(() => {
        const map = new Map();
        allProblems.forEach(p => {
            if (p.relatedTopics && Array.isArray(p.relatedTopics)) {
                p.relatedTopics.forEach(t => {
                    const name = t.name || t;
                    map.set(name, 0);
                });
            }
        });

        if (dynamicTopicCounts) {
            dynamicTopicCounts.forEach((count, name) => {
                map.set(name, count);
            });
        }

        return Array.from(map.entries())
            .sort((a, b) => {
                const aSelected = selectedTopics.includes(a[0]);
                const bSelected = selectedTopics.includes(b[0]);
                if (aSelected && !bSelected) return -1;
                if (!aSelected && bSelected) return 1;
                return b[1] - a[1];
            })
            .map(([name, count]) => ({ name, count }));
    }, [allProblems, dynamicTopicCounts, selectedTopics]);

    // Filter based on ACTIVE search (only updates when button clicked)
    const filteredCompanies = useMemo(() => {
        if (!activeCompanySearch.trim()) return companyOptions;
        const search = activeCompanySearch.toLowerCase();
        return companyOptions.filter(({ name }) => name.toLowerCase().includes(search));
    }, [companyOptions, activeCompanySearch]);

    const filteredTopics = useMemo(() => {
        if (!activeTopicSearch.trim()) return topicOptions;
        const search = activeTopicSearch.toLowerCase();
        return topicOptions.filter(({ name }) => name.toLowerCase().includes(search));
    }, [topicOptions, activeTopicSearch]);

    // Handle search button clicks
    const handleCompanySearch = () => {
        setActiveCompanySearch(companySearch);
    };

    const handleTopicSearch = () => {
        setActiveTopicSearch(topicSearch);
    };

    // Handle Enter key
    const handleCompanyKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleCompanySearch();
        }
    };

    const handleTopicKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleTopicSearch();
        }
    };

    const toggleDifficulty = (difficulty) => {
        if (config.selectedDifficulties.includes(difficulty)) {
            setConfig({ ...config, selectedDifficulties: config.selectedDifficulties.filter(d => d !== difficulty) });
        } else {
            setConfig({ ...config, selectedDifficulties: [...config.selectedDifficulties, difficulty] });
        }
    };

    const toggleCompany = (company) => {
        if (config.selectedCompanies.includes(company)) {
            setConfig({ ...config, selectedCompanies: config.selectedCompanies.filter(c => c !== company) });
        } else {
            setConfig({ ...config, selectedCompanies: [...config.selectedCompanies, company] });
        }
    };

    const toggleTopic = (topic) => {
        const current = config.selectedTopics || [];
        if (current.includes(topic)) {
            setConfig({ ...config, selectedTopics: current.filter(t => t !== topic) });
        } else {
            setConfig({ ...config, selectedTopics: [...current, topic] });
        }
    };

    return (
        <div className="lg:sticky lg:top-16 lg:-mt-8 lg:pt-8 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto custom-scrollbar z-[900] space-y-4">
            {/* Main Configuration Section */}
            <CollapsibleSection title="Configuration" isOpen={isConfigOpen} setIsOpen={setIsConfigOpen}>
                <div className="space-y-4">
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

                    {/* Duration & Hours Sliders */}
                    <div className="space-y-4">
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
                </div>
            </CollapsibleSection>

            {/* Companies Section */}
            <CollapsibleSection
                title="Companies"
                isOpen={isCompaniesOpen}
                setIsOpen={setIsCompaniesOpen}
                count={config.selectedCompanies.length}
            >
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search companies..."
                            value={companySearch}
                            onChange={(e) => setCompanySearch(e.target.value)}
                            onKeyPress={handleCompanyKeyPress}
                            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent block p-2.5 transition-colors"
                        />
                        <button
                            onClick={handleCompanySearch}
                            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors whitespace-nowrap"
                            title="Search companies"
                        >
                            Search
                        </button>
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
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[300px] max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
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
                </div>
            </CollapsibleSection>

            {/* Topics Section */}
            <CollapsibleSection
                title="Topics"
                isOpen={isTopicsOpen}
                setIsOpen={setIsTopicsOpen}
                count={(config.selectedTopics || []).length}
            >
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search topics..."
                            value={topicSearch}
                            onChange={(e) => setTopicSearch(e.target.value)}
                            onKeyPress={handleTopicKeyPress}
                            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent block p-2.5 transition-colors"
                        />
                        <button
                            onClick={handleTopicSearch}
                            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors whitespace-nowrap"
                            title="Search topics"
                        >
                            Search
                        </button>
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
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[300px] max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
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
                </div>
            </CollapsibleSection>
        </div>
    );
}, arePropsEqual);

export default ConfigurationPanel;
