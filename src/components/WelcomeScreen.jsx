import React from 'react';

export default function WelcomeScreen({ onStartWizard, onStartAdvanced }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                Your Dream Job Awaits.
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 text-center max-w-2xl mb-16">
                Create a personalized interview study plan that fits your schedule and targets.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* Option 1: Guided Approach */}
                <button
                    onClick={onStartWizard}
                    className="group relative p-8 rounded-3xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 text-left hover:-translate-y-1"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-9xl">🧙‍♂️</span>
                    </div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                            ✨
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Guided Approach</h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                            Answer a few simple questions. We'll build the perfect custom schedule for you automatically.
                        </p>
                    </div>
                </button>

                {/* Option 2: Advanced Approach */}
                <button
                    onClick={onStartAdvanced}
                    className="group relative p-8 rounded-3xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 text-left hover:-translate-y-1"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-9xl">⚡</span>
                    </div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                            🛠️
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Advanced Approach</h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                            Jump straight into the dashboard. Manually tweak every parameter, filter, and setting yourself.
                        </p>
                    </div>
                </button>
            </div>
        </div>
    );
}
