"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Sparkles, ChevronRight, Zap, Eye, Ghost, BrainCircuit, ShieldAlert, Microscope } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOracleRecommendation, searchMovies, getMovieDetails, Movie } from '@/services/movieService';
import { MovieCard } from '@/components/ui/MovieCard';

const QUESTION_POOL = [
    {
        id: 'freq',
        text: "IDENTIFY YOUR CURRENT FREQUENCY.",
        options: ["Chaotic", "Melancholy", "Electric", "Subdued"]
    },
    {
        id: 'dark',
        text: "SPECIFY DARKNESS TOLERANCE.",
        options: ["Pitch Black", "Gray Area", "High Contrast", "Sunset Only"]
    },
    {
        id: 'era',
        text: "ARCHIVE ERA PREFERENCE.",
        options: ["Modern Forensic", "Vintage Grain", "Golden Age", "Silent Void"]
    },
    {
        id: 'social',
        text: "SOCIAL CONSTELLATION.",
        options: ["Solo Descent", "Twin Flame", "The Collective", "Pure Silence"]
    },
    {
        id: 'moral',
        text: "MORAL COMPASS ALIGNMENT.",
        options: ["Pure Justice", "Chaotic Good", "Neutral Void", "Total Corruption"]
    },
    {
        id: 'narrative',
        text: "NARRATIVE GRAVITY.",
        options: ["Weightless", "Surface Level", "Deep Pressure", "Singularity"]
    },
    {
        id: 'aesthetic',
        text: "VISUAL SATURATION.",
        options: ["Neon Noir", "Gritty Analogue", "High Gloss", "Mono-Chrome"]
    },
    {
        id: 'logic',
        text: "DETECTIVE INTUITION.",
        options: ["Transparent", "Cluttered", "Maze-Like", "Unsolved"]
    }
];

export default function Oracle() {
    const [activeQuestions, setActiveQuestions] = useState<any[]>([]);
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<Movie[]>([]);

    useEffect(() => {
        // Select 4 random questions from the pool
        const shuffled = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
        setActiveQuestions(shuffled.slice(0, 4));
    }, []);

    const handleAnswer = (answer: string) => {
        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);
        if (step < activeQuestions.length - 1) {
            setStep(step + 1);
        } else if (activeQuestions.length > 0) {
            generateRecommendations(newAnswers);
        }
    };

    const generateRecommendations = async (finalAnswers: string[]) => {
        setLoading(true);
        setStep(step + 1);

        try {
            // Get history from localStorage
            let history: string[] = [];
            if (typeof window !== 'undefined') {
                const deported = JSON.parse(localStorage.getItem('cinesins_deported') || '[]');
                history = deported.map((m: any) => m.title);
            }

            // Get AI-curated recommendations based on mood and forensic history
            const recs = await getOracleRecommendation(finalAnswers, history);

            const movieResults = await Promise.all(
                recs.map(async (r: any) => {
                    const search = await searchMovies(r.title);
                    if (search.length > 0) {
                        const details = await getMovieDetails(search[0].id);
                        return {
                            id: details.imdbID,
                            title: details.Title,
                            year: details.Year,
                            poster: details.Poster !== "N/A" ? details.Poster : "/placeholder-movie.png",
                            type: details.Type,
                            rating: details.imdbRating
                        };
                    }
                    return null;
                })
            );

            setRecommendations(movieResults.filter((m): m is Movie => m !== null));
        } catch (error) {
            console.error("Oracle Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 opacity-20 noise-bg pointer-events-none" />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px] -z-10" />

            <main className="flex-1 flex flex-col items-center justify-center px-6 py-32 z-10 max-w-5xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    {activeQuestions.length > 0 && step < activeQuestions.length ? (
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            className="w-full text-center"
                        >
                            <div className="flex items-center justify-center gap-4 mb-16">
                                <div className="h-[1px] w-20 bg-primary/40" />
                                <span className="text-primary font-black tracking-[0.5em] text-[10px] uppercase italic">Sequence {step + 1}/{activeQuestions.length}</span>
                                <div className="h-[1px] w-20 bg-primary/40" />
                            </div>

                            <h2 className="text-6xl md:text-[8rem] font-black tracking-tighter leading-[0.85] font-display uppercase italic mb-20 shimmer-text">
                                {activeQuestions[step].text}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                {activeQuestions[step].options.map((option: string, i: number) => (
                                    <motion.button
                                        key={option}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAnswer(option)}
                                        className="glass-dark hover:bg-primary/10 hover:border-primary/50 text-3xl font-black italic tracking-tighter p-12 rounded-[48px] border border-white/5 transition-all flex items-center justify-between group"
                                    >
                                        <span>{option.toUpperCase()}</span>
                                        <ChevronRight className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" size={32} />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    ) : loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                        >
                            <div className="relative w-40 h-40 mx-auto mb-12">
                                <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" />
                                <Sparkles className="absolute inset-0 m-auto text-primary animate-pulse" size={64} />
                            </div>
                            <h2 className="text-3xl font-black tracking-[0.4em] uppercase italic text-white/40">Finding Your Matches...</h2>
                            <p className="mt-4 text-[10px] font-black tracking-[0.6em] text-primary/40 uppercase">Analyzing your cinematic frequency</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full space-y-24"
                        >
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-5 py-2 mb-8 glass rounded-full border border-primary/30 shadow-premium">
                                    <Zap size={12} className="text-primary" />
                                    <span className="text-[10px] font-black tracking-[0.3em] text-white uppercase italic">Calibration Successful</span>
                                </div>
                                <h2 className="text-6xl md:text-9xl font-black tracking-tighter italic uppercase font-display leading-none mb-4">YOUR <span className="shimmer-text">MATCHES.</span></h2>
                                <p className="text-white/40 font-bold uppercase tracking-widest text-sm italic">Movies aligned with your specific profile.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                                {recommendations.length > 0 ? (
                                    recommendations.map((movie, index) => (
                                        <MovieCard key={movie.id} movie={movie} index={index} />
                                    ))
                                ) : (
                                    <div className="col-span-full text-center text-white/20 text-2xl font-black italic uppercase tracking-widest py-20 border-y border-white/5">
                                        No artifacts survived the calibration loop.
                                    </div>
                                )}
                            </div>

                            <div className="text-center pt-12">
                                <button
                                    onClick={() => {
                                        setStep(0);
                                        setAnswers([]);
                                        setRecommendations([]);
                                        const shuffled = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
                                        setActiveQuestions(shuffled.slice(0, 4));
                                    }}
                                    className="text-xs font-black tracking-[0.5em] text-white/40 border-b border-primary/40 pb-2 hover:text-primary transition-colors uppercase italic"
                                >
                                    Restart AI Finder
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
