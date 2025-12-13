import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SignIn: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signIn } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await signIn(email, password);

        if (!error) {
            navigate('/dashboard');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] flex items-center justify-center p-4">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#00D4FF]/20 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-[#B24BF3]/20 rounded-full blur-[128px]"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-2 mb-4">
                        <Sparkles className="w-8 h-8 text-[#00D4FF]" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#B24BF3] bg-clip-text text-transparent">
                            Vibe Code-X
                        </h1>
                    </div>
                    <p className="text-gray-400">Code with Vibes, Execute with X-factor</p>
                </div>

                {/* Sign In Card */}
                <div className="bg-[#1a1f3a]/50 backdrop-blur-xl border border-[#2a2f4a] rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
                    <p className="text-gray-400 mb-6">Sign in to continue coding</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full bg-[#0A0E27] border border-[#2a2f4a] rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-[#0A0E27] border border-[#2a2f4a] rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-[#00D4FF] hover:text-[#00FFD1] transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#00D4FF] to-[#B24BF3] text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <p className="mt-6 text-center text-gray-400">
                        Don't have an account?{' '}
                        <Link
                            to="/signup"
                            className="text-[#00D4FF] hover:text-[#00FFD1] font-semibold transition-colors"
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-gray-500 text-sm">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};
