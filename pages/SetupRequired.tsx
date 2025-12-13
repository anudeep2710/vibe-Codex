import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Settings } from 'lucide-react';

export const SetupRequired: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-[#1a1f3a]/50 backdrop-blur-xl border border-[#2a2f4a] rounded-2xl p-8">
                <div className="flex items-start space-x-4 mb-6">
                    <div className="flex-shrink-0">
                        <AlertCircle className="w-12 h-12 text-yellow-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Supabase Configuration Required
                        </h1>
                        <p className="text-gray-400">
                            To use Vibe Code-X, you need to configure your Supabase credentials.
                        </p>
                    </div>
                </div>

                <div className="bg-[#0A0E27] border border-[#2a2f4a] rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                        <Settings className="w-5 h-5 text-[#00D4FF]" />
                        <span>Setup Steps</span>
                    </h2>

                    <ol className="space-y-4 text-gray-300">
                        <li className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-[#00D4FF]/20 text-[#00D4FF] rounded-full flex items-center justify-center text-sm font-bold">
                                1
                            </span>
                            <div>
                                <p className="font-medium">Add Supabase credentials to <code className="text-[#00D4FF] bg-[#00D4FF]/10 px-2 py-0.5 rounded">.env.local</code></p>
                                <pre className="mt-2 bg-black/30 p-3 rounded text-xs overflow-x-auto">
                                    {`VITE_SUPABASE_URL=https://uqiriunjbocbbyfergdk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
                                </pre>
                            </div>
                        </li>

                        <li className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-[#00D4FF]/20 text-[#00D4FF] rounded-full flex items-center justify-center text-sm font-bold">
                                2
                            </span>
                            <div>
                                <p className="font-medium">Run SQL schema in Supabase Dashboard</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Go to SQL Editor and run <code className="text-[#00D4FF] bg-[#00D4FF]/10 px-2 py-0.5 rounded">supabase_schema.sql</code>
                                </p>
                            </div>
                        </li>

                        <li className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-[#00D4FF]/20 text-[#00D4FF] rounded-full flex items-center justify-center text-sm font-bold">
                                3
                            </span>
                            <div>
                                <p className="font-medium">Restart the development server</p>
                                <pre className="mt-2 bg-black/30 p-3 rounded text-xs">
                                    npm run dev
                                </pre>
                            </div>
                        </li>
                    </ol>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-200 text-sm">
                        <strong>Note:</strong> The <code className="bg-yellow-500/20 px-2 py-0.5 rounded">.env.local</code> file is gitignored,
                        so you need to manually create/edit it in your project root.
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <a
                        href="https://supabase.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#00D4FF] hover:text-[#00FFD1] font-medium inline-flex items-center space-x-1"
                    >
                        <span>Don't have a Supabase account?</span>
                        <span>→</span>
                    </a>
                </div>
            </div>
        </div>
    );
};
