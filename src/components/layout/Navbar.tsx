"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Search, Bell, User, Menu, X, Gavel, History, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchOverlay } from '@/components/ui/SearchOverlay';

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6",
                    isScrolled ? "py-4" : "py-8"
                )}
            >
                <div className={cn(
                    "max-w-7xl mx-auto flex items-center justify-between transition-all duration-500 rounded-[32px] px-8 py-4",
                    isScrolled ? "glass-dark shadow-premium border-primary/20" : "bg-transparent border-transparent"
                )}>
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-2xl shadow-premium group-hover:rotate-[15deg] transition-all duration-500 border border-primary/50">
                            <Film className="text-white w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tighter text-white leading-none group-hover:text-primary transition-colors">
                                CINESINS
                            </span>
                            <span className="text-[8px] font-black tracking-[0.4em] text-white/30 uppercase leading-none mt-1">
                                The Forensic Lab
                            </span>
                        </div>
                    </Link>

                    {/* Center Nav - Desktop */}
                    <div className="hidden lg:flex items-center gap-10">
                        <NavLink href="/oracle" icon={<Sparkles size={14} />}>Oracle</NavLink>
                        <NavLink href="/void" icon={<Search size={14} />}>The Void</NavLink>
                        <NavLink href="/debates" icon={<Gavel size={14} />}>Debates</NavLink>
                        <NavLink href="/time-machine" icon={<History size={14} />}>Timeline</NavLink>
                    </div>

                    {/* Right Actions - Desktop */}
                    <div className="hidden lg:flex items-center gap-6 border-l border-white/10 pl-10">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="text-white/40 hover:text-white transition-colors relative group"
                        >
                            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary group-hover:w-full transition-all" />
                        </button>
                        <button className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-2xl border border-white/5 transition-all text-xs font-black tracking-widest uppercase">
                            <User className="w-4 h-4 text-primary" /> Profile
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="lg:hidden w-12 h-12 glass flex items-center justify-center rounded-2xl text-white hover:text-primary transition-all"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
                            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            className="fixed inset-0 z-[-1] bg-black/90 pt-32 px-10 flex flex-col gap-8 md:hidden lg:hidden"
                        >
                            <MobileNavLink href="/" text="Home" />
                            <MobileNavLink href="/oracle" text="The Oracle" />
                            <MobileNavLink href="/void" text="The Void" />
                            <MobileNavLink href="/journal" text="Journal" />
                            <MobileNavLink href="/debates" text="Debates" />
                            <MobileNavLink href="/time-machine" text="Timeline" />
                            <div className="h-[1px] w-full bg-white/10 my-4" />
                            <button className="flex items-center gap-4 text-2xl font-black italic tracking-tighter text-primary">
                                <User size={24} /> PROFILE
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

const NavLink = ({ href, children, icon }: { href: string; children: React.ReactNode, icon: React.ReactNode }) => (
    <Link
        href={href}
        className="group flex flex-col pt-1"
    >
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
            <span className="text-primary/40 group-hover:text-primary transition-colors">{icon}</span>
            {children}
        </div>
        <span className="w-0 h-[3px] bg-primary group-hover:w-full transition-all duration-500 rounded-full mt-2" />
    </Link>
);

const MobileNavLink = ({ href, text }: { href: string; text: string }) => (
    <Link
        href={href}
        className="text-5xl font-black italic tracking-tighter text-white hover:text-primary transition-colors text-left uppercase"
    >
        {text}.
    </Link>
);
