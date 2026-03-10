"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X, Microscope, Star, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Movie, searchMovies } from '@/services/movieService';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const SearchOverlay = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim()) {
                setLoading(true);
                const data = await searchMovies(query);
                setResults(data.slice(0, 5));
                setLoading(false);
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-[40px] p-6 lg:p-20 overflow-y-auto"
                >
                    {/* Animated Background Text */}
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-black text-white/[0.01] pointer-events-none select-none italic font-display -z-10 tracking-tighter">
                        SCAN.
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center justify-between mb-24 pb-8 border-b border-white/5">
                            <div className="flex items-center gap-6 flex-1">
                                <Microscope className="text-primary w-10 h-10 animate-pulse" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="IDENTIFY CINEMA SUBJECT..."
                                    className="bg-transparent text-5xl lg:text-[7rem] font-black tracking-tighter text-white outline-none w-full placeholder:text-white/5 uppercase font-display italic"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={onClose}
                                className="w-16 h-16 glass rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all border border-white/10 group shadow-premium"
                            >
                                <X size={32} className="group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        <div className="space-y-12">
                            {loading ? (
                                <div className="flex items-center gap-4 text-primary font-black text-xs tracking-[0.5em] animate-shimmer italic bg-clip-text text-transparent bg-gradient-to-r from-primary to-white uppercase">
                                    Scanning forensic databases...
                                </div>
                            ) : results.length > 0 ? (
                                results.map((movie) => (
                                    <Link
                                        key={movie.id}
                                        href={`/movie/${movie.id}`}
                                        onClick={onClose}
                                        className="group flex flex-col md:flex-row md:items-center gap-10 p-10 rounded-[48px] border border-transparent hover:border-white/10 hover:bg-white/[0.02] transition-all relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                        <div className="relative w-32 aspect-[2/3] rounded-[24px] overflow-hidden flex-shrink-0 shadow-premium border border-white/10">
                                            <Image
                                                src={movie.poster}
                                                alt={movie.title}
                                                fill
                                                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                                unoptimized={true}
                                            />
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Evidence ID: #{movie.id}</span>
                                                <span className="h-[1px] w-12 bg-white/10" />
                                            </div>
                                            <h3 className="text-4xl lg:text-6xl font-black tracking-tighter text-white group-hover:text-primary transition-colors font-display italic leading-none uppercase">
                                                {movie.title}
                                            </h3>
                                            <div className="flex items-center gap-6 pt-2">
                                                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] italic">
                                                    Year of Sin: {movie.year}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 pr-4">
                                            <div className="text-primary font-black italic tracking-tighter text-6xl leading-none">
                                                {Math.floor(Math.random() * 99)}%
                                            </div>
                                            <span className="text-[8px] text-white/30 font-black uppercase tracking-[0.3em] leading-none">FORENSIC MATCH</span>
                                        </div>
                                    </Link>
                                ))
                            ) : query && !loading ? (
                                <div className="text-white/20 text-4xl font-black italic tracking-tighter uppercase font-display border-l-4 border-primary pl-10 h-32 flex items-center">
                                    Subject "{query}" has no record in the forensic archives.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <QuickLink icon={<ShieldCheck className="text-primary" />} label="THE VOID" desc="View most sinful films" />
                                    <QuickLink icon={<AlertTriangle className="text-accent" />} label="SIN DEBATES" desc="Resolve cinematic disputes" />
                                    <QuickLink icon={<SearchIcon className="text-white/40" />} label="THE ORACLE" desc="Find your frequency" />
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const QuickLink = ({ icon, label, desc }: { icon: React.ReactNode, label: string, desc: string }) => (
    <div className="glass p-8 rounded-[32px] border border-white/10 hover:border-white/20 transition-all cursor-default relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <div className="relative z-10">
            <div className="mb-4">{icon}</div>
            <div className="text-xl font-black italic tracking-tighter text-white uppercase">{label}</div>
            <div className="text-[9px] font-black uppercase tracking-widest text-white/20 mt-1">{desc}</div>
        </div>
    </div>
);
