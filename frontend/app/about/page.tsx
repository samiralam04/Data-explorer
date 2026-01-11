import React from 'react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header Section */}
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                        About <span className="text-indigo-600">Product Data Explorer</span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                        A full-stack demonstration of modern scraping, queue management, and data exploration.
                    </p>
                </div>

                {/* Project Description */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8 sm:p-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Overview</h2>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            This application is designed to scrape, structure, and explore product data from "World of Books".
                            It demonstrates a robust architecture handling asynchronous scraping jobs, distributed queues,
                            and persistent caching, all wrapped in a responsive, modern frontend.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div className="bg-indigo-50 p-6 rounded-lg">
                                <h3 className="font-semibold text-indigo-900 mb-2">Backend Power</h3>
                                <p className="text-sm text-indigo-700">Built with NestJS and Prisma, leveraging BullMQ for reliable job processing and Redis for queue management.</p>
                            </div>
                            <div className="bg-green-50 p-6 rounded-lg">
                                <h3 className="font-semibold text-green-900 mb-2">Frontend Experience</h3>
                                <p className="text-sm text-green-700">A fast, server-rendered Next.js application using Tailwind CSS for styling and React Query for efficient data fetching.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {['NestJS', 'TypeScript', 'Prisma', 'PostgreSQL', 'BullMQ', 'Redis', 'Next.js', 'Tailwind'].map((tech) => (
                        <div key={tech} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <span className="font-medium text-gray-700">{tech}</span>
                        </div>
                    ))}
                </div>

                {/* Ethical Scraping Note */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-yellow-800">Ethical Scraping Policy</h3>
                            <div className="mt-2 text-yellow-700">
                                <p>
                                    This project adheres to ethical scraping standards. We respect `robots.txt` policies,
                                    identify our bot via User-Agent, and implement rate limiting (TTL) to avoid overwhelming the target servers.
                                    Data is collected for educational and demonstration purposes only.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Developer Info */}
                <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Developer Info</h2>
                        <p className="text-gray-600 mt-2">Built by Samir Alam.</p>
                    </div>
                    <div className="flex space-x-4">
                        {/* Icons can act as links if real links are available */}
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                            Dev
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
