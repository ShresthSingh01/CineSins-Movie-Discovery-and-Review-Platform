"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { getTrendingMovies, Movie } from '@/services/movieService';
import { MovieCard } from '@/components/ui/MovieCard';
import { History, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const DECADES = [
    { era: "1920s", title: "THE SILENT ROAR", description: "Where imagery spoke louder than words." },
    { era: "1940s", title: "NOIR & GOLD", description: "The golden age of shadows and stars." },
    { era: "1960s", title: "NEW WAVE", description: "Breaking the rules of the academy." },
    { era: "1970s", title: "CINE-REBELLION", description: "Gritty, real, and uncompromising." },
    { era: "1980s", title: "BLOCKBUSTER DAWN", description: "The birth of the cinematic spectacle." },
    { era: "1990s", title: "INDIE SURGE", description: "Voices from the fringe go mainstream." },
    { era: "2010s", title: "DIGITAL PEAK", description: "The era of the ultimate franchise." }
];

export default function TimeMachine() {
    const [selectedEra, setSelectedEra] = useState("1970s");
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchEraMovies = async () => {
            setLoading(true);
            // Mock filtering for demo (Phase 7 would use actual TMDB year filtering)
            const data = await getTrendingMovies();
            setMovies(data.slice(0, 10)); // Just 10 from trending for demo
            setLoading(false);
        };
        fetchEraMovies();
    }, [selectedEra]);

    return (
        <div className="min-h-screen bg-background text-white flex flex-col overflow-x-hidden">
            <Navbar />

            {/* Hero / Concept Header */}
            <section className="pt-32 pb-12 px-6 max-w-7xl mx-auto w-full text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center"
                >
                    <div className="flex items-center gap-2 text-accent font-black tracking-widest text-xs uppercase mb-4">
                        <History className="w-4 h-4" /> CHRONO-NAVIGATOR
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none italic uppercase mb-6">
                        TIME <span className="shimmer leading-none">MACHINE.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed font-bold uppercase tracking-widest italic">
                        Scrub through history. Witness the evolution of sin. Find the era that matches your frequency.
                    </p>
                </motion.div>
            </section>

            {/* Horizontal Timeline Scrubbers */}
            <section className="relative w-full py-12 border-y border-white/5 bg-void/50 overflow-hidden">
                <div
                    ref={scrollRef}
                    className="flex items-center gap-12 px-[10vw] overflow-x-auto no-scrollbar scroll-smooth p-10"
                >
                    {DECADES.map((d) => (
                        <button
                            key={d.era}
                            onClick={() => setSelectedEra(d.era)}
                            className={cn(
                                "flex-shrink-0 flex flex-col items-center text-center transition-all duration-500",
                                selectedEra === d.era ? "scale-125 opacity-100" : "scale-90 opacity-20 hover:opacity-50"
                            )}
                        >
                            <span className="text-4xl md:text-6xl font-black italic tracking-tighter text-white mb-2 leading-none">
                                {d.era}
                            </span>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest transition-colors",
                                selectedEra === d.era ? "text-primary" : "text-white"
                            )}>
                                {d.title}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Scrub Indicators */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-6 pointer-events-none opacity-20">
                    <ChevronLeft size={60} />
                    <ChevronRight size={60} />
                </div>
            </section>

            {/* Discovery Feed */}
            <main className="max-w-7xl mx-auto px-6 py-24 w-full">
                <div className="mb-16">
                    <h2 className="text-xs font-black tracking-[0.3em] text-white/20 uppercase mb-4 italic">Artifacts from the {selectedEra}</h2>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl md:text-5xl font-black tracking-tighter text-white max-w-2xl leading-tight">
                            {DECADES.find(d => d.era === selectedEra)?.description}
                        </p>
                        <div className="hidden md:flex flex-col items-end">
                            <div className="text-primary font-black text-4xl italic tracking-tighter leading-none">VINTAGE</div>
                            <span className="text-[10px] text-white/20 uppercase font-black tracking-widest mt-1">Dossier Quality</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
                    {loading ? (
                        Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-secondary/10 rounded-2xl animate-pulse" />
                        ))
                    ) : (
                        movies.map((movie, index) => (
                            <div key={movie.id} className="relative group">
                                <MovieCard movie={movie} index={index} />
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-[10px] font-black tracking-widest text-white/20 uppercase italic">
                                        Log #{4205 + index}
                                    </span>
                                    <Zap className="w-3 h-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Deep History CTA */}
                <section className="mt-40 p-20 glass-dark rounded-[64px] border border-primary/20 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                    <h3 className="text-3xl font-black tracking-tighter italic uppercase mb-6">Missing a timeline?</h3>
                    <p className="text-white/40 font-bold tracking-widest uppercase text-xs mb-8">
                        Our forensic team is currently restoring evidence from the pre-silent era (1888-1910).
                    </p>
                    <button className="bg-white text-void px-10 py-4 rounded-2xl font-black tracking-widest uppercase text-xs hover:bg-primary hover:text-white transition-all shadow-xl">
                        Request Restoration
                    </button>
                </section>
            </main>
        </div>
    );
}
