import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Sparkles, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const SignUp: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signUp } = useAuth();

    // Password strength checker
    const getPasswordStrength = (pwd: string) => {
        if (pwd.length === 0) return { strength: 0, label: '', color: '' };
        if (pwd.length < 6) return { strength: 1, label: 'Weak', color: 'text-red-500' };
        if (pwd.length < 10) return { strength: 2, label: 'Fair', color: 'text-yellow-500' };
        if (pwd.length >= 10 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
            return { strength: 3, label: 'Strong', color: 'text-green-500' };
        }
        return { strength: 2, label: 'Fair', color: 'text-yellow-500' };
    };

    const passwordStrength = getPasswordStrength(password);
    const passwordsMatch = password && confirmPassword && password === confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return;
        }

        if (!agreeToTerms) {
            return;
        }

        setLoading(true);

        const { error } = await signUp(email, password, name);

        if (!error) {
            navigate('/signin');
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

                {/* Sign Up Card */}
                <div className="bg-[#1a1f3a]/50 backdrop-blur-xl border border-[#2a2f4a] rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                    <p className="text-gray-400 mb-6">Join the coding revolution</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                    className="w-full bg-[#0A0E27] border border-[#2a2f4a] rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 transition-all"
                                />
                            </div>
                        </div>

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
                                    minLength={6}
                                    className="w-full bg-[#0A0E27] border border-[#2a2f4a] rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 transition-all"
                                />
                            </div>
                            {password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-400">Password strength</span>
                                        <span className={`text-xs font-semibold ${passwordStrength.color}`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="h-1 bg-[#0A0E27] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${passwordStrength.strength === 1
                                                    ? 'w-1/3 bg-red-500'
                                                    : passwordStrength.strength === 2
                                                        ? 'w-2/3 bg-yellow-500'
                                                        : 'w-full bg-green-500'
                                                }`}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-[#0A0E27] border border-[#2a2f4a] rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 transition-all"
                                />
                                {confirmPassword && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {passwordsMatch ? (
                                            <Check className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <X className="w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="flex items-start space-x-2">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreeToTerms}
                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-[#2a2f4a] bg-[#0A0E27] text-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-400">
                                I agree to the{' '}
                                <a href="#" className="text-[#00D4FF] hover:text-[#00FFD1]">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-[#00D4FF] hover:text-[#00FFD1]">
                                    Privacy Policy
                                </a>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !agreeToTerms || !passwordsMatch}
                            className="w-full bg-gradient-to-r from-[#00D4FF] to-[#B24BF3] text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <span>Create Account</span>
                            )}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <p className="mt-6 text-center text-gray-400">
                        Already have an account?{' '}
                        <Link
                            to="/signin"
                            className="text-[#00D4FF] hover:text-[#00FFD1] font-semibold transition-colors"
                        >
                            Sign In
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-gray-500 text-sm">
                    By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};
