import React, { useState, useEffect } from 'react';

export default function DailyProblem() {
    const [dailyProblem, setDailyProblem] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch daily problem
        fetch(import.meta.env.BASE_URL + 'daily-problem.json')
            .then(res => res.json())
            .then(data => setDailyProblem(data))
            .catch(err => console.log('No daily problem found'));

        // Fetch metadata
        fetch(import.meta.env.BASE_URL + 'metadata.json')
            .then(res => res.json())
            .then(data => setMetadata(data))
            .catch(err => console.log('No metadata found'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg p-6 mb-6 animate-pulse">
                <div className="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-white/20 rounded w-2/3"></div>
            </div>
        );
    }

    if (!dailyProblem) {
        return null;
    }

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
            case 'Medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
            case 'Hard': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
            default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl shadow-2xl p-6 mb-6 text-white relative overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                            <span className="text-3xl">📅</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">Daily Challenge</h3>
                            <p className="text-white/80 text-sm">{formatDate(dailyProblem.date)}</p>
                        </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getDifficultyColor(dailyProblem.difficulty)} bg-opacity-90`}>
                        {dailyProblem.difficulty}
                    </span>
                </div>

                {/* Problem Title */}
                <div className="mb-4">
                    <h4 className="text-xl font-bold mb-2">
                        #{dailyProblem.id}. {dailyProblem.title}
                    </h4>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-white/70 text-xs mb-1">Likes</div>
                        <div className="text-2xl font-bold">{dailyProblem.likes?.toLocaleString() || 'N/A'}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-white/70 text-xs mb-1">Dislikes</div>
                        <div className="text-2xl font-bold">{dailyProblem.dislikes?.toLocaleString() || 'N/A'}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-white/70 text-xs mb-1">Acceptance</div>
                        <div className="text-2xl font-bold">{dailyProblem.acceptanceRate?.toFixed(1)}%</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="text-white/70 text-xs mb-1">Like Ratio</div>
                        <div className="text-2xl font-bold">
                            {((dailyProblem.likes / (dailyProblem.likes + dailyProblem.dislikes)) * 100).toFixed(0)}%
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <a
                    href={dailyProblem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-white text-purple-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-all text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    🚀 Solve Today's Challenge
                </a>

                {/* Last Updated */}
                {metadata && (
                    <div className="mt-4 text-center text-white/60 text-xs">
                        Data last updated: {new Date(metadata.lastUpdated).toLocaleString()}
                    </div>
                )}
            </div>
        </div>
    );
}
