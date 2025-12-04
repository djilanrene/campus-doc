'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth
import { Credit, LogOut, Shield, Upload } from './Icons';

const Header: React.FC = () => { // No longer needs props, gets user from useAuth
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth(); // Get user and logout from useAuth

    const setView = (path: string) => {
        router.push(path);
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(user ? '/dashboard' : '/')}>
                    <div className="bg-brand-600 text-white p-1.5 rounded font-bold text-xl">CD</div>
                    <span className="font-bold text-slate-800 text-lg hidden sm:block">Campus Doc <span className="text-slate-400 font-normal text-sm">| FASEG</span></span>
                </div>

                <nav className="flex items-center gap-4">
                    {!user ? ( // Use actual user from useAuth
                        <>
                            <button onClick={() => setView('/connexion')} className="text-slate-600 hover:text-brand-600 font-medium text-sm">Se connecter</button>
                            <button onClick={() => setView('/inscription')} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors">S'inscire</button>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold" title="Vos crédits">
                                <Credit />
                                <span>{user.credits}</span>
                            </div>

                            {user.role === 'guardian' && ( // Use actual user role
                                <button
                                    onClick={() => setView('/moderation')}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/moderation' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-gray-100'}`}
                                >
                                    <Shield /> <span className="hidden sm:inline">Modération</span>
                                </button>
                            )}

                            <button
                                onClick={() => setView('/upload')}
                                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/upload' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-gray-100'}`}
                            >
                                <Upload /> <span className="hidden sm:inline">Contribuer</span>
                            </button>

                            <button onClick={logout} className="text-slate-400 hover:text-red-500 p-2" title="Déconnexion"> {/* Use actual logout */}
                                <LogOut />
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
