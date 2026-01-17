import React from 'react';

export default function Footer() {
    return (
        <footer className="mt-20 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-900/50 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto px-6 py-12">
                <div className="flex flex-col xl:flex-row flex-wrap items-center justify-center gap-y-4 gap-x-5 lg:gap-x-8 text-sm font-medium text-gray-600 dark:text-gray-400">

                    {/* Section 1: YouTube Channel */}
                    <a
                        href="https://youtube.com/@nikoo28"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 hover:text-red-600 dark:hover:text-red-400 transition-colors group whitespace-nowrap"
                    >
                        <img
                            src="https://yt3.googleusercontent.com/Onk0pKlvF-v0DLwanvH0zyw_4XcQJ7BQUCcAKCnZ46oxP_peMAJt0XKG9ns6loBWLknjjMJBmw=s900-c-k-c0x00ffffff-no-rj"
                            alt="Nikoo28"
                            className="w-6 h-6 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-red-500/30 transition-all"
                        />
                        <span className="font-semibold">@nikoo28</span>
                    </a>

                    <div className="hidden xl:block w-px h-4 bg-gray-200 dark:bg-gray-700"></div>

                    {/* Section 2: Guide */}
                    <a
                        href="https://youtu.be/_EorYDcshuA"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
                    >
                        <span className="text-lg">📺</span>
                        <span>How to use the Smart Interview Grind</span>
                    </a>

                    <div className="hidden xl:block w-px h-4 bg-gray-200 dark:bg-gray-700"></div>

                    {/* Section 3: 1:1 Call */}
                    <a
                        href="https://topmate.io/nikoo28/1398815"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap"
                    >
                        <span className="text-lg">📞</span>
                        <span>Schedule a 1:1 call with me</span>
                    </a>

                    <div className="hidden xl:block w-px h-4 bg-gray-200 dark:bg-gray-700"></div>

                    {/* Section 4: Buy Coffee */}
                    <a
                        href="https://www.buymeacoffee.com/studyalgorithms"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap"
                    >
                        <span className="text-lg">☕</span>
                        <span>Buy me a coffee</span>
                    </a>

                    <div className="hidden xl:block w-px h-4 bg-gray-200 dark:bg-gray-700"></div>

                    {/* Section 5: GitHub Repo */}
                    <a
                        href="https://github.com/nikoo28/java-solutions"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                        <span>GitHub Solutions</span>
                    </a>

                </div>
            </div>
        </footer>
    );
}
