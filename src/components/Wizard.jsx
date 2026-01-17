import React, { useState, useMemo } from 'react';

const PRESETS = {
    topTech: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Uber', 'Airbnb'],
    recommendedTopics: ['Array', 'String', 'Hash Table', 'Dynamic Programming', 'Tree', 'Graph', 'Linked List', 'Sorting']
};

export default function Wizard({ config: globalConfig, setConfig: setGlobalConfig, allProblems, onComplete, onCancel }) {
    // Local state to prevent App re-renders during slider movement
    const [config, setConfig] = useState(globalConfig);
    const [step, setStep] = useState(1);
    // Removed isAnimating state to fix flickering issue

    // Custom UI States
    const [showCustomCompanies, setShowCustomCompanies] = useState(false);
    const [companySearch, setCompanySearch] = useState('');

    const [showCustomTopics, setShowCustomTopics] = useState(false);
    const [topicSearch, setTopicSearch] = useState('');

    const [showCustomDifficulty, setShowCustomDifficulty] = useState(false);


    const handleGenerate = () => {
        setGlobalConfig(config); // Commit to parent/global state
        setStep(5); // Loading screen (Step 5 now)
        setTimeout(() => {
            onComplete();
        }, 2000);
    };

    const togglePreset = (type, value) => {
        if (type === 'companies') {
            if (value === 'all') {
                setConfig({ ...config, selectedCompanies: [] });
                setShowCustomCompanies(false);
            }
            if (value === 'topTech') {
                setConfig({ ...config, selectedCompanies: PRESETS.topTech });
                setShowCustomCompanies(false);
            }
            if (value === 'custom') {
                setShowCustomCompanies(true);
                // If switching to custom and nothing selected, maybe keep it empty (All) or specific?
                // Let's keep current selection to allow refining.
            }
        }
        if (type === 'topics') {
            if (value === 'all') {
                setConfig({ ...config, selectedTopics: [] });
                setShowCustomTopics(false);
            }
            if (value === 'recommended') {
                setConfig({ ...config, selectedTopics: PRESETS.recommendedTopics });
                setShowCustomTopics(false);
            }
            if (value === 'custom') {
                setShowCustomTopics(true);
            }
        }
        if (type === 'difficulty') {
            if (value === 'standard') {
                setConfig({ ...config, selectedDifficulties: ['Very Easy', 'Easy', 'Medium', 'Hard'] }); // All except Very Hard
                setShowCustomDifficulty(false);
            }
            if (value === 'custom') {
                setShowCustomDifficulty(true);
            }
        }
    };

    // Toggle Helpers for Custom Mode
    const toggleCompany = (comp) => {
        const current = config.selectedCompanies || [];
        if (current.includes(comp)) {
            setConfig({ ...config, selectedCompanies: current.filter(c => c !== comp) });
        } else {
            setConfig({ ...config, selectedCompanies: [...current, comp] });
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

    const toggleDifficulty = (diff) => {
        const current = config.selectedDifficulties || [];
        if (current.includes(diff)) {
            setConfig({ ...config, selectedDifficulties: current.filter(d => d !== diff) });
        } else {
            setConfig({ ...config, selectedDifficulties: [...current, diff] });
        }
    };

    // Data Extraction for Custom Lists
    const companyOptions = useMemo(() => {
        if (!allProblems) return [];
        const set = new Set();
        allProblems.forEach(p => p.companies.forEach(c => set.add(c)));
        return Array.from(set).sort();
    }, [allProblems]);

    const topicOptions = useMemo(() => {
        if (!allProblems) return [];
        const set = new Set();
        allProblems.forEach(p => (p.relatedTopics || []).forEach(t => set.add(t.name || t)));
        return Array.from(set).sort();
    }, [allProblems]);

    // Filter Helper: Sort selected items to top
    const getSortedResults = (allItems, selectedItems, query) => {
        return allItems
            .filter(item => item.toLowerCase().includes(query.toLowerCase()))
            .sort((a, b) => {
                const aSelected = selectedItems.includes(a);
                const bSelected = selectedItems.includes(b);
                if (aSelected && !bSelected) return -1;
                if (!aSelected && bSelected) return 1;
                return a.localeCompare(b);
            });
    };

    const filteredCompanies = getSortedResults(companyOptions, config.selectedCompanies, companySearch);
    const filteredTopics = getSortedResults(topicOptions, config.selectedTopics, topicSearch);

    // Navigation Helpers
    const handleNext = () => {
        setStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (onCancel) {
            // Step 1 Back action
            onCancel();
        }
    };

    // Active State Helpers
    const isTopTechSelected = !showCustomCompanies && config.selectedCompanies.length === PRESETS.topTech.length && PRESETS.topTech.every(c => config.selectedCompanies.includes(c));
    const isAllCompanies = !showCustomCompanies && config.selectedCompanies.length === 0;

    const isRecTopicsSelected = !showCustomTopics && config.selectedTopics.length === PRESETS.recommendedTopics.length && PRESETS.recommendedTopics.every(t => config.selectedTopics.includes(t));
    const isAllTopics = !showCustomTopics && config.selectedTopics.length === 0;

    const isStandardDifficulty = !showCustomDifficulty &&
        config.selectedDifficulties.length === 4 &&
        ['Very Easy', 'Easy', 'Medium', 'Hard'].every(d => config.selectedDifficulties.includes(d));


    return (
        <div className="max-w-4xl mx-auto py-12 px-4 min-h-[80vh] flex flex-col justify-center relative">

            {/* Step 5: Loading / Magic */}
            {step === 5 && (
                <div className="text-center animate-fade-in flex flex-col items-center">
                    <div className="relative mb-8">
                        {/* Sparkles */}
                        <div className="absolute -top-4 -right-4 text-4xl animate-pulse delay-75">✨</div>
                        <div className="absolute -bottom-2 -left-6 text-2xl animate-pulse delay-300">✨</div>
                        <div className="absolute top-1/2 -right-12 text-3xl animate-pulse delay-150">✨</div>

                        {/* Waving Wand */}
                        <div className="text-9xl animate-wave drop-shadow-2xl">
                            🪄
                        </div>
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Crafting your perfect schedule...
                    </h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400">
                        Analyzing thousands of problems to fit your time.
                    </p>
                </div>
            )}

            {step !== 5 && (
                <div className="transition-opacity duration-500 opacity-100">

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-4 mb-16 justify-center">
                        {[1, 2, 3, 4].map(i => (
                            <React.Fragment key={i}>
                                <div className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${step >= i ? 'bg-blue-600 scale-110 shadow-md' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                                {i < 4 && <div className={`w-12 h-1.5 rounded-full transition-all duration-300 ${step > i ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
                            </React.Fragment>
                        ))}
                    </div>

                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-12 text-center tracking-tight">
                        {step === 1 && "What's your experience level?"}
                        {step === 2 && "Which companies are you targeting?"}
                        {step === 3 && "Any specific topics to focus on?"}
                        {step === 4 && "What complexity level suits you?"}
                    </h2>

                    {/* STEP 1: BASICS */}
                    {step === 1 && (
                        <div className="space-y-12 animate-fade-in-up">
                            {/* Experience Level Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { level: 'Beginner', icon: '🌱', desc: 'I need to focus on the fundamentals first.' },
                                    { level: 'Intermediate', icon: '🚀', desc: 'I want standard interview preparation.' },
                                    { level: 'Expert', icon: '🧠', desc: 'Challenge me with hard problems.' }
                                ].map(({ level, icon, desc }) => (
                                    <button
                                        key={level}
                                        onClick={() => setConfig({ ...config, experienceLevel: level })}
                                        className={`relative group p-8 rounded-3xl border-2 transition-all duration-300 text-left h-full hover:-translate-y-2 hover:shadow-2xl ${config.experienceLevel === level
                                            ? 'border-blue-500 bg-white dark:bg-slate-800 shadow-xl ring-4 ring-blue-500/10'
                                            : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <div className={`text-6xl mb-6 transform transition-transform duration-300 group-hover:scale-110 ${config.experienceLevel === level ? 'scale-110' : ''}`}>
                                            {icon}
                                        </div>
                                        <h3 className={`text-2xl font-bold mb-3 ${config.experienceLevel === level ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                                            {level}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                                            {desc}
                                        </p>

                                        {/* Selection Checkmark Ring */}
                                        <div className={`absolute top-6 right-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${config.experienceLevel === level
                                            ? 'border-blue-500 bg-blue-500 text-white'
                                            : 'border-gray-200 dark:border-gray-700'
                                            }`}>
                                            {config.experienceLevel === level && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 space-y-8">
                                {/* Weeks */}
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Time until interview
                                        </label>
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                                            {config.weeks} <span className="text-lg font-medium text-gray-500">weeks</span>
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="20"
                                        value={config.weeks}
                                        onChange={(e) => setConfig({ ...config, weeks: parseInt(e.target.value) })}
                                        className="w-full slider-modern text-blue-600"
                                        style={{
                                            background: `linear-gradient(to right, currentColor ${((config.weeks - 1) * 100) / 19}%, #e5e7eb ${((config.weeks - 1) * 100) / 19}%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs font-medium text-gray-400 mt-2 px-1">
                                        <span>1 week</span>
                                        <span>20 weeks</span>
                                    </div>
                                </div>

                                {/* Hours */}
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Weekly commitment
                                        </label>
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                                            {config.hoursPerWeek} <span className="text-lg font-medium text-gray-500">hours</span>
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="2"
                                        max="40"
                                        value={config.hoursPerWeek}
                                        onChange={(e) => setConfig({ ...config, hoursPerWeek: parseInt(e.target.value) })}
                                        className="w-full slider-modern text-purple-600"
                                        style={{
                                            background: `linear-gradient(to right, currentColor ${((config.hoursPerWeek - 2) * 100) / 38}%, #e5e7eb ${((config.hoursPerWeek - 2) * 100) / 38}%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs font-medium text-gray-400 mt-2 px-1">
                                        <span>2 hours</span>
                                        <span>40 hours</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleBack}
                                    className="px-8 py-5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold text-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>←</span> Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="flex-1 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-xl hover:shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 group"
                                >
                                    Next Step <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </button>
                            </div>
                        </div>
                    )}


                    {/* STEP 2: COMPANIES */}
                    {step === 2 && (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 space-y-8 animate-fade-in-up">

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => togglePreset('companies', 'all')}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all ${isAllCompanies
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">🌍</div>
                                    <div className="font-bold text-gray-900 dark:text-white">All Companies</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Broad coverage.</div>
                                </button>

                                <button
                                    onClick={() => togglePreset('companies', 'topTech')}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all ${isTopTechSelected
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">🏢</div>
                                    <div className="font-bold text-gray-900 dark:text-white">Top Tech</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">FAANG & Big Tech.</div>
                                </button>

                                <button
                                    onClick={() => togglePreset('companies', 'custom')}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all ${showCustomCompanies
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">🎯</div>
                                    <div className="font-bold text-gray-900 dark:text-white">Let me choose</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hand-pick specific targets.</div>
                                </button>
                            </div>

                            {/* Custom Selection Area */}
                            {showCustomCompanies && (
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-6 animate-fade-in">
                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            placeholder="Search companies..."
                                            value={companySearch}
                                            onChange={(e) => setCompanySearch(e.target.value)}
                                            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        {config.selectedCompanies.length > 0 && (
                                            <button
                                                onClick={() => setConfig({ ...config, selectedCompanies: [] })}
                                                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors whitespace-nowrap"
                                            >
                                                Clear ({config.selectedCompanies.length})
                                            </button>
                                        )}
                                    </div>
                                    <div className="h-64 overflow-y-auto custom-scrollbar p-1 grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {filteredCompanies.map(c => (
                                            <label key={c} className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={config.selectedCompanies.includes(c)}
                                                    onChange={() => toggleCompany(c)}
                                                    className="w-4 h-4 text-blue-600 rounded bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{c}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="text-right text-xs text-gray-400 mt-2">
                                        {config.selectedCompanies.length} selected
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={handleBack}
                                    className="px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>←</span> Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                                >
                                    Next Step <span>→</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: TOPICS */}
                    {step === 3 && (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 space-y-8 animate-fade-in-up">

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => togglePreset('topics', 'all')}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all ${isAllTopics
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">📚</div>
                                    <div className="font-bold text-gray-900 dark:text-white">All Topics</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Everything included.</div>
                                </button>

                                <button
                                    onClick={() => togglePreset('topics', 'recommended')}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all ${isRecTopicsSelected
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">⭐</div>
                                    <div className="font-bold text-gray-900 dark:text-white">Recommended</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">High-yield patterns.</div>
                                </button>

                                <button
                                    onClick={() => togglePreset('topics', 'custom')}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all ${showCustomTopics
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">🧠</div>
                                    <div className="font-bold text-gray-900 dark:text-white">Let me choose</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Focus on specific areas.</div>
                                </button>
                            </div>

                            {/* Custom Selection Area */}
                            {showCustomTopics && (
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-6 animate-fade-in">
                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            placeholder="Search topics..."
                                            value={topicSearch}
                                            onChange={(e) => setTopicSearch(e.target.value)}
                                            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                        {config.selectedTopics.length > 0 && (
                                            <button
                                                onClick={() => setConfig({ ...config, selectedTopics: [] })}
                                                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors whitespace-nowrap"
                                            >
                                                Clear ({config.selectedTopics.length})
                                            </button>
                                        )}
                                    </div>
                                    <div className="h-64 overflow-y-auto custom-scrollbar p-1 grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {filteredTopics.map(t => (
                                            <label key={t} className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={config.selectedTopics.includes(t)}
                                                    onChange={() => toggleTopic(t)}
                                                    className="w-4 h-4 text-blue-600 rounded bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{t}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="text-right text-xs text-gray-400 mt-2">
                                        {config.selectedTopics.length} selected
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={handleBack}
                                    className="px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>←</span> Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                                >
                                    Next Step <span>→</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: DIFFICULTY */}
                    {step === 4 && (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 space-y-8 animate-fade-in-up">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => togglePreset('difficulty', 'standard')}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all ${isStandardDifficulty
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">⚖️</div>
                                    <div className="font-bold text-gray-900 dark:text-white">Standard Mix</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Everything except Very Hard.</div>
                                </button>

                                <button
                                    onClick={() => togglePreset('difficulty', 'custom')}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all ${showCustomDifficulty
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">🎛️</div>
                                    <div className="font-bold text-gray-900 dark:text-white">Let me choose</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select specific difficulties.</div>
                                </button>
                            </div>

                            {/* Custom Difficulty Selection */}
                            {showCustomDifficulty && (
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-6 animate-fade-in">
                                    <div className="space-y-3">
                                        {[
                                            { id: 'Very Easy', desc: 'Introduction to concepts.' },
                                            { id: 'Easy', desc: 'Good for warmups and confidence.' },
                                            { id: 'Medium', desc: 'The core of most interviews.' },
                                            { id: 'Hard', desc: 'Challenging edge cases.' },
                                            { id: 'Very Hard', desc: 'Deep algorithmic complexity.' }
                                        ].map(d => (
                                            <label key={d.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={config.selectedDifficulties.includes(d.id)}
                                                    onChange={() => toggleDifficulty(d.id)}
                                                    className="w-5 h-5 text-blue-600 rounded bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 focus:ring-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900 dark:text-white">{d.id}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{d.desc}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="text-right text-xs text-gray-400 mt-4">
                                        {config.selectedDifficulties.length} levels selected
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={handleBack}
                                    className="px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>←</span> Back
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                >
                                    <span>✨</span> Generate My Personal Strategy
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
