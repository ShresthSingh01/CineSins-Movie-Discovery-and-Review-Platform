'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { useAuth } from '@/context/AuthContext';

export const Header = ({ onOpenDecision }: { onOpenDecision?: () => void }) => {
    const pathname = usePathname();
    const { activeProfile, switchProfile, profiles, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const navItems = activeProfile ? [
        { label: 'Overview', href: '/dashboard', section: 'dashboard' },
        { label: 'Hidden Gems', href: '/dashboard/hidden-gems', section: 'hidden-gems' },
        { label: 'DNA', href: '/dashboard/dna', section: 'dna' },
        { label: 'Sin-Line', href: '/dashboard/sin-line', section: 'sinline' },
        { label: 'Watchlist', href: '/dashboard/watchlist', section: 'watchlist' },
    ] : [
        { label: 'Home', href: '/', section: 'home' },
        { label: 'Trending', href: '/#trending', section: 'trending' },
    ];

    return (
        <header id="header">
            <div className="container header-content">
                <Logo size={40} />

                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </button>

                <nav id="main-nav" className={isMenuOpen ? 'active' : ''}>
                    <ul>
                        {navItems.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className={pathname === item.href ? 'active' : ''}
                                    onClick={(e) => {
                                        if (item.section === 'decision-mode') {
                                            e.preventDefault();
                                            onOpenDecision?.();
                                        }
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="header-actions flex items-center gap-6">
                    <button
                        onClick={onOpenDecision}
                        className="nav-btn ripple-btn decide-glow"
                    >
                        <i className="fas fa-sparkles mr-2"></i> Decide
                    </button>

                    {activeProfile && (
                        <div className="profile-switcher-wrapper">
                            <button
                                className="profile-btn-premium"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                <img
                                    src={activeProfile.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${activeProfile.name}`}
                                    alt={activeProfile.name}
                                />
                            </button>

                            {isProfileOpen && (
                                <div className="profile-dropdown-premium">
                                    <div className="dropdown-header">
                                        <p className="font-bold text-white">{activeProfile.name}</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                                            {activeProfile.archetype || 'Discovering DNA...'}
                                        </p>
                                    </div>
                                    <div className="dropdown-body">
                                        {profiles.filter(p => p.id !== activeProfile.id).map(p => (
                                            <button
                                                key={p.id}
                                                className="dropdown-item"
                                                onClick={() => { switchProfile(p.id); setIsProfileOpen(false); }}
                                            >
                                                <i className="fas fa-user-circle mr-2 opacity-50"></i> {p.name}
                                            </button>
                                        ))}
                                        <button
                                            onClick={logout}
                                            className="dropdown-item logout-btn"
                                        >
                                            <i className="fas fa-sign-out-alt mr-2"></i> Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
