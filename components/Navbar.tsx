import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Navbar: React.FC = () => {
    const { user, signOut } = useAuth();
    const [showUserMenu, setShowUserMenu] = React.useState(false);

    return (
        <nav className="bg-[#1a1f3a]/80 backdrop-blur-xl border-b border-[#2a2f4a] sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center space-x-2 group">
                        <Sparkles className="w-6 h-6 text-[#00D4FF] group-hover:rotate-12 transition-transform" />
                        <span className="text-xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#B24BF3] bg-clip-text text-transparent">
                            Vibe Code-X
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/dashboard"
                            className="text-gray-300 hover:text-[#00F5FF] transition-colors font-medium relative group"
                        >
                            Projects
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FF006E] to-[#00F5FF] group-hover:w-full transition-all duration-300"></span>
                        </Link>
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-3 bg-[#0A0E27] border border-[#2a2f4a] rounded-lg px-4 py-2 hover:border-[#00D4FF]/50 transition-all"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-[#00D4FF] to-[#B24BF3] rounded-full flex items-center justify-center text-white font-bold">
                                {user?.user_metadata?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm text-white hidden sm:block">
                                {user?.user_metadata?.name || user?.email?.split('@')[0]}
                            </span>
                        </button>

                        {/* Dropdown */}
                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-56 bg-[#1a1f3a] border border-[#2a2f4a] rounded-lg shadow-xl overflow-hidden z-20">
                                    <div className="px-4 py-3 border-b border-[#2a2f4a]">
                                        <p className="text-sm text-white font-medium">
                                            {user?.user_metadata?.name || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                    </div>

                                    <div className="py-1">
                                        <button className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2f4a] transition-colors">
                                            <User className="w-4 h-4" />
                                            <span>Profile</span>
                                        </button>
                                        <button className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2f4a] transition-colors">
                                            <Settings className="w-4 h-4" />
                                            <span>Settings</span>
                                        </button>
                                    </div>

                                    <div className="border-t border-[#2a2f4a] py-1">
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                signOut();
                                            }}
                                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-400 hover:bg-[#2a2f4a] transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
