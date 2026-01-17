import React, { useState, useCallback } from 'react';
import { LICENSE_HASH, LICENSE_SIZE } from '../constants/licenseHash';

export default function LicenseGate({ onUnlock }) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const validateFile = useCallback(async (file) => {
        setIsLoading(true);
        setError('');

        // 1. Basic Size Check (Optimization)
        // file.size isn't always exact due to filesystem block sizes, but 
        // generated file is exactly 1024 bytes. We allow small variance if needed, 
        // but here we can be strict since we generated it.
        if (file.size !== LICENSE_SIZE) {
            console.warn(`File size mismatch: ${file.size} vs ${LICENSE_SIZE}`);
            // We continue anyway to check hash, or fail early. Failing early is cleaner.
            setError(`Invalid license file (Size mismatch).`);
            setIsLoading(false);
            return;
        }

        try {
            // 2. Read as Binary
            const arrayBuffer = await file.arrayBuffer();

            // 3. Calculate Hash
            const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // 4. Validate
            if (hashHex === LICENSE_HASH) {
                setTimeout(() => {
                    // Pass the raw key buffer up to the app for decryption
                    onUnlock(arrayBuffer);
                    setIsLoading(false);
                }, 800);
            } else {
                setError('Invalid license key. Verification failed.');
                setIsLoading(false);
            }
        } catch (err) {
            console.error('License validation error', err);
            setError('Could not verify license file security.');
            setIsLoading(false);
        }
    }, [onUnlock]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateFile(e.dataTransfer.files[0]);
        }
    }, [validateFile]);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            validateFile(e.target.files[0]);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 transition-colors duration-300 px-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center transition-all duration-300">
                <div className="mb-6">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">🔐</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        License Required
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Please upload your <code>smart-interview.license</code> file to unlock the app.
                    </p>
                </div>

                <div
                    className={`
                        relative border-2 border-dashed rounded-xl p-8 mb-6 transition-all duration-300
                        ${isDragging
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400'
                        }
                        ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : ''}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept=".license,.txt,.key"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {isLoading ? (
                        <div className="flex flex-col items-center animate-pulse">
                            <span className="text-3xl mb-2">🪄</span>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">Verifying...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center pointer-events-none">
                            <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-300 font-medium">
                                Drag & Drop License Here
                            </span>
                            <span className="text-sm text-gray-400 mt-1">
                                or click to browse
                            </span>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4 animate-shake">
                        {error}
                    </div>
                )}

                <p className="text-xs text-gray-400 dark:text-gray-500">
                    Don't have a license? <a href="https://topmate.io/nikoo28/1865464" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-medium">Purchase Access Key</a>
                </p>
            </div>
        </div>
    );
}
