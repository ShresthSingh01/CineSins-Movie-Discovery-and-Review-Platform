"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

import { getTrendingMovies, Movie } from '@/services/movieService';

export const Hero = () => {
    const [hotMovie, setHotMovie] = React.useState<Movie | null>(null);

    React.useEffect(() => {
        const fetchHot = async () => {
            const movies = await getTrendingMovies();
            if (movies && movies.length > 0) {
                setHotMovie(movies[0]);
            }
        };
        fetchHot();
    }, []);

    return (
        <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/hero-bg.png"
                    alt="Cinema Noir Background"
                    fill
                    className="object-cover scale-105 animate-slow-zoom opacity-60 grayscale hover:grayscale-0 transition-all duration-[3000ms]"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10" />
                {/* Cinematic Grain Overlay */}
                <div className="absolute inset-0 noise-bg z-20 pointer-events-none" />
            </div>

            <div className="relative z-30 max-w-7xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="inline-flex items-center gap-2 px-5 py-2 mb-8 glass rounded-full border border-primary/30 shadow-premium"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-2 rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="text-[10px] font-black tracking-[0.3em] text-white uppercase italic">
                        {hotMovie ? `Now Forensicating: ${hotMovie.title}` : "Initializing Forensic Stream..."}
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-6xl md:text-[10rem] font-black tracking-tighter mb-8 leading-[0.85] font-display"
                >
                    STOP WATCHING <br />
                    <span className="shimmer-text italic">ALGORITHMS.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="text-xl md:text-3xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed font-medium uppercase tracking-tight"
                >
                    CineSins is the high-court of cinema. We don't do stars. We do forensics. Reveal the sins, enter the void, and find your film's true frequency.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <button className="group relative bg-primary hover:bg-primary-dark text-white px-10 py-5 rounded-2xl font-black text-xl italic tracking-tighter transition-all flex items-center gap-3 overflow-hidden shadow-premium">
                        <span className="relative z-10 flex items-center gap-3">
                            ENTER THE VOID <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </button>

                    <button className="glass hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-black text-xl italic tracking-tighter transition-all flex items-center gap-3 border border-white/10 backdrop-blur-2xl">
                        CONSULT THE ORACLE
                    </button>
                </motion.div>
            </div>

            {/* Floating Elements / Stats */}
            <div className="absolute bottom-12 left-0 right-0 max-w-7xl mx-auto px-6 hidden lg:flex items-center justify-between border-t border-white/5 pt-12 z-30">
                <HeroStat label="Active Forensicators" value="124.5K" />
                <HeroStat label="Verified Sins" value="2.8M" />
                <HeroStat label="Consensus Rate" value="94.2%" />
                <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center bg-primary/10">
                        <ShieldAlert className="text-primary w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <div className="text-white font-black italic tracking-tighter">THE HIGH COURT</div>
                        <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none mt-1">Status: Operational</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const HeroStat = ({ label, value }: { label: string; value: string }) => (
    <div className="text-left group cursor-default">
        <div className="text-3xl font-black text-white group-hover:text-primary transition-colors tracking-tighter">{value}</div>
        <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</div>
    </div>
);
