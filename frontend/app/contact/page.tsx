import React from 'react';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Get in touch
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Have questions about the project?
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    <div className="space-y-6">

                        {/* Email */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Email</h3>
                            <div className="mt-1 flex items-center">
                                <span className="text-indigo-600 text-lg">samiralam7005@gmaill.com</span>
                            </div>
                        </div>

                        {/* GitHub */}
                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-sm font-medium text-gray-500">GitHub</h3>
                            <div className="mt-1">
                                <a href="https://github.com/samiralam04" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500 flex items-center">
                                    github.com/samiralam04
                                </a>
                            </div>
                        </div>


                        {/* Optional Form */}
                        <div className="border-t border-gray-100 pt-6">
                            <p className="text-xs text-gray-400 italic">
                                * This is a demo contact page. No real messages are sent.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
