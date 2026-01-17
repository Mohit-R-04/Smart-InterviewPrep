import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';

export default function ScheduleView({ schedule, completed, setCompleted }) {
    const [celebratedWeeks, setCelebratedWeeks] = useState(new Set());
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [hasCelebratedCompletion, setHasCelebratedCompletion] = useState(false);

    // Confetti Effect for Week Completion
    useEffect(() => {
        schedule.forEach(week => {
            if (week.problems.length === 0) return;

            const doneCount = week.problems.filter(p => completed.has(p.id)).length;
            const isComplete = doneCount === week.problems.length;

            if (isComplete && !celebratedWeeks.has(week.weekNum)) {
                // Trigger confetti
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    zIndex: 2500
                });
                // Mark as celebrated
                setCelebratedWeeks(prev => new Set(prev).add(week.weekNum));
            }
        });
    }, [schedule, completed, celebratedWeeks]);

    const toggleComplete = (id) => {
        const newSet = new Set(completed);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setCompleted(newSet);
    };

    // UseMemo for stats
    const topicStats = React.useMemo(() => {
        const stats = {};
        schedule.forEach(week => {
            week.problems.forEach(p => {
                // Count all related topics if available
                if (p.relatedTopics && Array.isArray(p.relatedTopics) && p.relatedTopics.length > 0) {
                    p.relatedTopics.forEach(t => {
                        const name = t.name || t; // Handle object or string
                        stats[name] = (stats[name] || 0) + 1;
                    });
                } else {
                    // Fallback to primary topic
                    const t = p.topic || 'Misc';
                    stats[t] = (stats[t] || 0) + 1;
                }
            });
        });
        // Sort by count desc, filter out generic 'Algorithms' potentially if desired, 
        // but for now keep everything.
        return Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15); // Show top 15 to avoid clutter
    }, [schedule]);

    const globalStats = React.useMemo(() => {
        let total = 0;
        let solved = 0;
        const uniqueCompanies = new Set();

        schedule.forEach(week => {
            total += week.problems.length;
            const weekSolved = week.problems.filter(p => completed.has(p.id));
            solved += weekSolved.length;

            // Count unique companies for solved problems
            weekSolved.forEach(p => {
                p.companies.forEach(c => uniqueCompanies.add(c));
            });
        });
        return { total, solved, percent: total > 0 ? (solved / total) * 100 : 0, uniqueCompanies: uniqueCompanies.size };
    }, [schedule, completed]);

    // Global Completion Effect
    useEffect(() => {
        if (globalStats.percent === 100 && globalStats.total > 0 && !hasCelebratedCompletion) {
            setHasCelebratedCompletion(true);
            setShowCompletionModal(true);

            // Grand Finale Fireworks
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#FFD700', '#FFA500', '#FF4500'], // Gold/Orange/Red
                    zIndex: 2500
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#00BFFF', '#1E90FF', '#4169E1'], // Blues
                    zIndex: 2500
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [globalStats, hasCelebratedCompletion]);

    if (schedule.length === 0) {
        return <div className="text-center text-gray-500 mt-10">No problems found matching criteria.</div>;
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Sticky Stats Header - Adjusted with -mt-8/pt-8 to fill gap while preserving alignment */}
            <div
                className="sticky top-16 z-[999] -mx-4 px-4 pb-4 -mt-8 pt-8 shadow-sm transition-colors duration-300 dark:bg-slate-900 bg-gray-100"
            >
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm relative z-[999]">
                    {/* Topics */}
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider flex justify-between items-center">
                        <span>Topic Distribution</span>
                        <span className="text-blue-600 dark:text-blue-400">{globalStats.solved} / {globalStats.total} Solved</span>
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {topicStats.map(([topic, count]) => (
                            <span key={topic} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-600 flex items-center gap-2">
                                {topic}
                                <span className="bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-gray-700">{count}</span>
                            </span>
                        ))}
                    </div>

                    {/* Global Progress Bar */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                            <span>Total Progress</span>
                            <span>{Math.round(globalStats.percent)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${globalStats.percent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {schedule.map((week) => {
                const total = week.problems.length;
                const done = week.problems.filter(p => completed.has(p.id)).length;
                const progress = total > 0 ? (done / total) * 100 : 0;

                return (
                    <div key={week.weekNum} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md duration-300">
                        {/* Header */}
                        <div className="p-5 bg-slate-100 dark:bg-slate-700/60 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center border-l-4 border-l-blue-500">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Week {week.weekNum}</h3>
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-4">
                                <span>{Math.round(week.time / 60)}h estimated</span>
                                <div className="flex items-center gap-2 min-w-[100px]">
                                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}% ` }}></div>
                                    </div>
                                    <span className="tabular-nums">{done}/{total}</span>
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {week.problems.map(p => (
                                <div key={p.id} className={`p-4 transition-all duration-300 flex items-start gap-4 group ${completed.has(p.id)
                                    ? 'bg-gray-100 dark:bg-slate-800/80 opacity-60 grayscale'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                    }`}>
                                    {/* 1. Checkbox */}
                                    <label className="mt-1 relative flex items-center justify-center p-1 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={completed.has(p.id)}
                                            onChange={() => toggleComplete(p.id)}
                                            className="appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md checked:bg-blue-600 dark:checked:bg-blue-500 checked:border-transparent transition-all cursor-pointer"
                                        />
                                        {completed.has(p.id) && (
                                            <svg className="w-3.5 h-3.5 text-white absolute pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </label>

                                    {/* 2. Main Content (Ans + Tags) */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                            <a
                                                href={p.url || '#'}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`text-base font-semibold transition-colors truncate max-w-full ${completed.has(p.id)
                                                    ? 'text-gray-400 dark:text-gray-500 line-through'
                                                    : 'text-gray-900 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300'
                                                    }`}
                                            >
                                                {p.title}
                                            </a>
                                        </div>

                                        <div className="flex flex-wrap gap-3 text-xs items-center">
                                            <span className={`px-2.5 py-0.5 rounded-md font-medium border ${p.difficulty === 'Very Easy' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                                                p.difficulty === 'Easy' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800' :
                                                    p.difficulty === 'Medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800' :
                                                        p.difficulty === 'Hard' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800' :
                                                            'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800'
                                                }`}>{p.difficulty}</span>

                                            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 font-medium">
                                                <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {p.duration}m
                                            </span>

                                            {p.topic && <span className="text-gray-400 dark:text-gray-500 font-medium">• {p.topic}</span>}
                                        </div>
                                    </div>

                                    {/* 3. Meta Column (Video + Stats) */}
                                    <div className="flex items-center gap-4">
                                        {/* Video Thumbnail (Left of Stats) */}
                                        {p.videoUrl && (
                                            <a
                                                href={p.videoUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group/video relative block w-28 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700 shadow-sm hover:ring-2 ring-blue-500 transition-all"
                                                title={`Watch Solution: ${p.title}`}
                                            >
                                                {p.videoThumbnail && (
                                                    <img src={p.videoThumbnail} alt="Solution" className="w-full h-full object-cover opacity-90 group-hover/video:opacity-100 transition-opacity" />
                                                )}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/video:bg-transparent transition-colors">
                                                    <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm group-hover/video:scale-110 transition-transform">
                                                        <svg className="w-4 h-4 text-white fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                    </div>
                                                </div>
                                            </a>
                                        )}

                                        {/* Stats (Right) */}
                                        <div className="flex flex-col items-end gap-1">
                                            {/* Likes */}
                                            <div
                                                className="group/meta flex items-center gap-1.5 cursor-help"
                                                title="Number of people who like this question on LeetCode"
                                            >
                                                <span className="text-[10px] font-medium text-gray-400 group-hover/meta:text-gray-600 dark:text-gray-500 dark:group-hover/meta:text-gray-300 transition-colors">
                                                    {p.likes > 1000 ? `${(p.likes / 1000).toFixed(1)}k` : p.likes || 0}
                                                </span>
                                                <svg className="w-4 h-4 text-gray-300 group-hover/meta:text-gray-500 dark:text-gray-600 dark:group-hover/meta:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                                </svg>
                                            </div>

                                            {/* Company Count */}
                                            <div
                                                className="group/meta flex items-center gap-1.5 cursor-help"
                                                title={`This question has been asked by ${p.company_count || 0} number of companies`}
                                            >
                                                <span className="text-[10px] font-medium text-gray-400 group-hover/meta:text-gray-600 dark:text-gray-500 dark:group-hover/meta:text-gray-300 transition-colors">
                                                    {p.company_count || 0}
                                                </span>
                                                <svg className="w-4 h-4 text-gray-300 group-hover/meta:text-gray-500 dark:text-gray-600 dark:group-hover/meta:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-3m0 0h10m0 0v3m-10-3h10m-10 0v-2a2 2 0 012-2h6a2 2 0 012 2v2M9 7h1v1H9V7zm0 4h1v1H9v-1zm4-4h1v1h-1V7zm0 4h1v1h-1v-1z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Completion Summary Modal - Portaled to Body to avoid Z-Index wars with Sticky Header */}
            {showCompletionModal && createPortal(
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCompletionModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-700 animate-[fadeIn_0.5s_ease-out]">

                        {/* Trophy Icon */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/30 border-4 border-white dark:border-slate-800">
                            <span className="text-4xl">🏆</span>
                        </div>

                        <div className="mt-8 text-center space-y-2">
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500">Plan Completed!</h2>
                            <p className="text-gray-500 dark:text-gray-400">Incredible work. You've mastered the grind.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 mb-8">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{globalStats.total}</div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">Problems Solved</div>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl text-center">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{globalStats.uniqueCompanies}</div>
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">Companies Targeted</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center">Top Topics Mastered</h3>
                            <div className="flex flex-wrap justify-center gap-2">
                                {topicStats.slice(0, 5).map(([topic, count]) => (
                                    <span key={topic} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowCompletionModal(false)}
                            className="w-full mt-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Close & Celebrate
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
