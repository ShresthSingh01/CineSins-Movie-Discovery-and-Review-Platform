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

                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-6xl md:text-[8rem] font-black tracking-tighter mb-12 leading-[0.85] font-display uppercase italic"
                >
                    ENTER THE <span className="shimmer-text">VOID.</span> <br />
                    <span className="text-4xl md:text-6xl tracking-widest text-white/40 not-italic">Find the frequency.</span>
                </motion.h1>

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
        </section>
    );
};

