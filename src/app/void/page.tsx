"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { MovieCard } from '@/components/ui/MovieCard';
import { getDetentionBlock, Movie } from '@/services/movieService';
import { motion } from 'framer-motion';
import { Ghost, ShieldAlert, AlertTriangle, Skull, History, TrendingDown, Microscope } from 'lucide-react';
import { cn } from '@/lib/utils';
import NextImage from 'next/image';

export default function TheVoid() {
    const [highSinMovies, setHighSinMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVoid = async () => {
            const movies = await getDetentionBlock();
            setHighSinMovies(movies);
            setLoading(false);
        };
        fetchVoid();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col pb-32">
            <Navbar />

            {/* Cinematic Header for The Void */}
            <header className="pt-40 pb-20 px-6 relative overflow-hidden text-center border-b border-primary/10">
                <div className="absolute inset-0 z-0 noise-bg opacity-30" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] -z-10" />

                <div className="relative z-10 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-3 text-primary font-black tracking-[0.5em] text-[10px] uppercase mb-8"
                    >
                        <Ghost className="w-5 h-5 animate-bounce" /> ACCESSING THE DETENTION BLOCK
                    </motion.div>

                    <h1 className="text-7xl md:text-[12rem] font-black tracking-tighter leading-[0.8] font-display uppercase italic mb-10 shimmer-text">
                        THE <span className="text-white">VOID.</span>
                    </h1>

                    <p className="text-xl md:text-3xl text-white/40 max-w-3xl mx-auto uppercase font-medium italic tracking-tight leading-relaxed">
                        Where cinematic crimes are archived for eternity. These artifacts have violated every law of narrative physics. Proceed with extreme skepticism.
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 w-full mt-32">
                {/* Hall of Shame Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32">
                    <VoidMetric icon={<ShieldAlert className="text-primary" />} value="8,402" label="DEPORTED ARTIFACTS" />
                    <VoidMetric icon={<Skull className="text-white/40" />} value="124K" label="CAREER CRIMINALS" />
                    <VoidMetric icon={<History className="text-accent" />} value="98%" label="PUBLIC DISREGARD" />
                </div>

                <div className="flex items-center justify-between mb-20">
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase font-display">THE HALL OF SHAME.</h2>
                    <div className="flex items-center gap-4 bg-primary/5 px-6 py-3 rounded-2xl border border-primary/20">
                        <TrendingDown className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Sorting by Sin Intensity</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-24">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="aspect-[2/3] w-full bg-white/5 rounded-[32px] animate-pulse" />
                        ))
                    ) : (
                        highSinMovies.map((movie, index) => (
                            <MovieCard key={movie.id} movie={movie} index={index} />
                        ))
                    )}
                </div>

                {/* Recently Deported Section */}
                {(() => {
                    if (typeof window !== 'undefined') {
                        const deported = JSON.parse(localStorage.getItem('cinesins_deported') || '[]');
                        if (deported.length > 0) {
                            return (
                                <section className="mt-40">
                                    <div className="flex items-center gap-4 mb-20 px-4 border-l-4 border-accent">
                                        <div>
                                            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-2">Your Indictment History</div>
                                            <h2 className="text-5xl font-black italic tracking-tighter uppercase font-display">RECENTLY DEPORTED.</h2>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
                                        {deported.map((m: any, i: number) => (
                                            <motion.div
                                                key={m.id}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 group"
                                            >
                                                <NextImage
                                                    src={m.poster}
                                                    alt={m.title}
                                                    fill
                                                    className="object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                    unoptimized={true}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                                <div className="absolute bottom-3 left-3 right-3 text-[8px] font-black text-white/40 uppercase truncate">
                                                    #{m.id}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>
                            );
                        }
                    }
                    return null;
                })()}

                {/* Anti-Recommendation Warning */}
                <section className="mt-40 glass-dark p-20 rounded-[64px] border border-primary/20 flex flex-col md:flex-row items-center gap-20 shadow-premium relative overflow-hidden">
                    <div className="absolute top-0 left-0 p-10 opacity-5 pointer-events-none">
                        <AlertTriangle size={300} />
                    </div>
                    <div className="w-40 h-40 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 border border-primary/30">
                        <Microscope className="w-20 h-20 text-primary animate-pulse" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase font-display mb-6 leading-none">FORENSIC WARNING.</h3>
                        <p className="text-xl text-white/60 uppercase font-medium tracking-tight mb-8">
                            The films listed in The Void are known to cause structural logic failure in viewers. If you decide to proceed, do so in a controlled environment.
                        </p>
                        <button className="bg-primary text-white px-10 py-5 rounded-2xl font-black italic tracking-tighter uppercase text-lg shadow-premium hover:bg-primary-dark transition-all">
                            REPORT A NEW SIN
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}

const VoidMetric = ({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) => (
    <div className="glass-dark p-12 rounded-[48px] border border-white/5 flex flex-col items-center text-center group hover:border-primary/40 transition-all duration-700">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:bg-primary/10 transition-colors">
            {icon}
        </div>
        <div className="text-5xl font-black italic tracking-tighter text-white mb-2">{value}</div>
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{label}</div>
    </div>
);
