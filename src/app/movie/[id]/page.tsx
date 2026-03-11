"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getMovieDetails, getForensicAnalysis } from '@/services/movieService';
import { Navbar } from '@/components/layout/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    ShieldAlert,
    Zap,
    ArrowRight,
    History,
    Star,
    Microscope,
    Gavel,
    ChevronDown,
    Share2,
    Bookmark,
    Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MovieDetail() {
    const { id } = useParams();
    const [movie, setMovie] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [forensics, setForensics] = useState<any>(null);
    const [verdicts, setVerdicts] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const fetchDetails = async () => {
            if (id) {
                const data = await getMovieDetails(id as string);
                setMovie(data);
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const runForensics = async () => {
        if (!movie) return;
        setAnalyzing(true);
        setVerdicts({});
        const report = await getForensicAnalysis(movie.Title, movie.Year, movie.Plot);
        setForensics(report);
        setAnalyzing(false);
    };

    const handleVerdict = (id: number, agreed: boolean) => {
        setVerdicts(prev => ({ ...prev, [id]: agreed }));
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-20">
            <Microscope className="w-20 h-20 text-primary animate-pulse mb-8" />
            <div className="text-primary font-black tracking-[0.5em] animate-shimmer italic bg-clip-text text-transparent bg-gradient-to-r from-primary to-white uppercase text-xs">
                Analyzing Forensic Cache...
            </div>
        </div>
    );

    if (!movie) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-20">
            <div className="text-primary font-black text-6xl italic tracking-tighter mb-4 uppercase">Forensic Evidence Lost.</div>
            <p className="text-white/40 mb-12 uppercase tracking-[0.2em] font-bold">The subject has been scrubbed from the archives.</p>
            <Link href="/" className="bg-white text-void px-10 py-4 rounded-2xl font-black tracking-widest uppercase text-xs hover:bg-primary hover:text-white transition-all">
                RETURN TO DATABASE
            </Link>
        </div>
    );

    const sinScore = forensics?.sinScore || 0;
    const breakdown = forensics?.breakdown || {};

    return (
        <div className="min-h-screen bg-background text-white pb-32">
            <Navbar />

            {/* Cinematic Hero Backdrop */}
            <div className="relative min-h-[90vh] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src={movie.Poster !== "N/A" ? movie.Poster : "/placeholder-movie.png"}
                        alt={movie.Title}
                        fill
                        className="object-cover scale-105 blur-sm opacity-40 grayscale group-hover:grayscale-0 transition-all duration-[2000ms]"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 min-h-full flex items-center pt-48 pb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row gap-16 items-center w-full"
                    >
                        {/* Poster Frame */}
                        <div className="relative w-full md:w-[350px] aspect-[2/3] flex-shrink-0 group">
                            <div className="absolute -inset-4 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative h-full w-full rounded-[48px] overflow-hidden border border-white/10 shadow-premium">
                                <Image
                                    src={movie.Poster !== "N/A" ? movie.Poster : "/placeholder-movie.png"}
                                    alt={movie.Title}
                                    fill
                                    className="object-cover"
                                    unoptimized={true}
                                />
                                <div className="absolute top-6 right-6 glass p-3 rounded-2xl border border-white/20 flex items-center gap-3">
                                    <Star className="text-accent fill-accent w-6 h-6 animate-pulse" />
                                    <div>
                                        <div className="text-4xl font-black italic tracking-tighter leading-none">{movie.imdbRating}</div>
                                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mt-1">IMDb Archive</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Title & Stats */}
                        <div className="flex-1 text-left">
                            <AnimatePresence mode="wait">
                                {!forensics ? (
                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        onClick={runForensics}
                                        disabled={analyzing}
                                        className="inline-flex items-center gap-3 px-6 py-3 bg-primary hover:bg-primary-dark rounded-full mb-8 font-black tracking-widest text-xs uppercase shadow-premium transition-all disabled:opacity-50"
                                    >
                                        <ShieldAlert size={16} className={cn(analyzing && "animate-spin")} />
                                        {analyzing ? "CALIBRATING FORENSIC TOOLS..." : "START FORENSIC AUDIT"}
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="inline-flex items-center gap-3 px-6 py-3 bg-accent text-void rounded-full mb-8 font-black tracking-widest text-xs uppercase shadow-premium"
                                    >
                                        <Zap size={16} /> AUDIT COMPLETE: #{movie.imdbID}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.9] font-display italic uppercase">
                                {movie.Title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-10 mb-10">
                                <HeroStat label="Release Cycle" value={movie.Year} />
                                <HeroStat label="Runtime Trace" value={movie.Runtime} />
                                <HeroStat label="Primary Genre" value={movie.Genre?.split(',')[0]} />
                            </div>

                            <p className="text-xl md:text-3xl text-white/60 leading-tight max-w-3xl font-medium uppercase font-display italic">
                                "{movie.Plot}"
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Forensic Detail Grid */}
            <AnimatePresence>
                {forensics && (
                    <motion.main
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-24 mt-32"
                    >
                        <div className="lg:col-span-2 space-y-32">
                            {/* Sin Score Breakdown */}
                            <section>
                                <div className="flex items-end justify-between mb-16 px-4 border-l-4 border-primary">
                                    <div>
                                        <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-2">Forensic Outcome</div>
                                        <h2 className="text-5xl font-black italic tracking-tighter uppercase font-display">THE SIN VERDICT.</h2>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-primary font-black text-7xl leading-none italic tracking-tighter">{sinScore}</span>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Total Sin Density</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                    <SinStat label="Plot Logics" value={breakdown.Plot} />
                                    <SinStat label="Human Error" value={breakdown.Acting} />
                                    <SinStat label="Tonal Drift" value={breakdown.Tone} />
                                    <SinStat label="Logic Gaps" value={breakdown.Logic} />
                                    <SinStat label="VFX Decay" value={breakdown.Technical} />
                                </div>
                            </section>

                            {/* The Sin Sentence */}
                            <section className="glass-dark p-20 rounded-[64px] border border-primary/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Microscope size={200} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-8">
                                        <Gavel className="text-primary w-8 h-8" />
                                        <span className="text-xs font-black uppercase tracking-[0.4em] text-primary">Official Summary</span>
                                    </div>
                                    <div className="text-4xl md:text-6xl font-black italic tracking-tighter text-white leading-[0.9] uppercase font-display">
                                        {forensics.sinSentence}
                                    </div>
                                </div>
                            </section>

                            {/* Evidence Locker: Interactive Crimes */}
                            <section className="space-y-12">
                                <div className="flex items-center gap-4 px-4 border-l-4 border-accent">
                                    <div>
                                        <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-2">Exhibit A, B, C</div>
                                        <h2 className="text-5xl font-black italic tracking-tighter uppercase font-display">THE EVIDENCE LOCKER.</h2>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {forensics.crimes?.map((crime: any) => (
                                        <motion.div
                                            key={crime.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="glass-dark p-10 rounded-[40px] border border-white/5 flex flex-col md:flex-row items-center gap-8 group hover:border-primary/30 transition-all"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={cn(
                                                        "text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest",
                                                        crime.severity === 'High' ? "bg-primary text-white" : "bg-white/10 text-white/60"
                                                    )}>
                                                        {crime.severity} SEVERITY
                                                    </span>
                                                    <span className="text-[10px] font-black text-primary uppercase italic tracking-widest">Charge #{crime.id}</span>
                                                </div>
                                                <p className="text-2xl font-black italic tracking-tighter text-white/90 uppercase font-display leading-tight">
                                                    {crime.description}
                                                </p>
                                            </div>

                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleVerdict(crime.id, true)}
                                                    className={cn(
                                                        "px-8 py-4 rounded-3xl font-black tracking-widest text-[10px] uppercase transition-all flex items-center gap-2",
                                                        verdicts[crime.id] === true
                                                            ? "bg-primary text-white scale-105 shadow-premium"
                                                            : "bg-white/5 text-white/40 hover:bg-white/10"
                                                    )}
                                                >
                                                    <Gavel size={14} /> INDICT
                                                </button>
                                                <button
                                                    onClick={() => handleVerdict(crime.id, false)}
                                                    className={cn(
                                                        "px-8 py-4 rounded-3xl font-black tracking-widest text-[10px] uppercase transition-all flex items-center gap-2",
                                                        verdicts[crime.id] === false
                                                            ? "bg-green-500 text-white scale-105 shadow-premium"
                                                            : "bg-white/5 text-white/40 hover:bg-white/10"
                                                    )}
                                                >
                                                    <ShieldAlert size={14} /> ACQUIT
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {Object.keys(verdicts).length === forensics.crimes?.length && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-primary/10 border border-primary/30 p-12 rounded-[56px] text-center"
                                    >
                                        <div className="text-primary font-black text-2xl mb-2 tracking-[0.2em] uppercase italic">Final Verdict Recorded</div>
                                        <p className="text-white/60 text-sm font-bold uppercase tracking-widest">
                                            Your evidence has been uploaded to the Forensic Deep-Chain.
                                        </p>
                                    </motion.div>
                                )}
                            </section>

                            {/* Save to History Effect */}
                            {(() => {
                                if (Object.keys(verdicts).length === (forensics.crimes?.length || 0) && Object.values(verdicts).some(v => v === true)) {
                                    if (typeof window !== 'undefined') {
                                        const deported = JSON.parse(localStorage.getItem('cinesins_deported') || '[]');
                                        if (!deported.find((m: any) => m.id === movie.imdbID)) {
                                            const entry = {
                                                id: movie.imdbID,
                                                title: movie.Title,
                                                year: movie.Year,
                                                poster: movie.Poster,
                                                sinScore: forensics.sinScore
                                            };
                                            localStorage.setItem('cinesins_deported', JSON.stringify([entry, ...deported].slice(0, 8)));
                                        }
                                    }
                                }
                                return null;
                            })()}
                        </div>

                        {/* Sidebar Intel */}
                        <div className="space-y-12">
                            <IntelBlock title="Director Trace" value={movie.Director} />
                            <IntelBlock title="Cast Evidence" value={movie.Actors} />
                            <IntelBlock title="Box Office Impact" value={movie.BoxOffice} />
                            <IntelBlock title="Critical Consensus" value={movie.Metascore + ' Metacritic'} />
                        </div>
                    </motion.main>
                )}
            </AnimatePresence>
        </div>
    );
}

const HeroStat = ({ label, value }: { label: string; value: string }) => (
    <div className="text-left">
        <div className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none italic font-display">{value}</div>
        <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-2">{label}</div>
    </div>
);

const SinStat = ({ label, value }: { label: string; value: number }) => (
    <div className="glass p-8 rounded-[40px] border border-white/5 hover:border-primary/30 transition-all group">
        <div className="text-4xl font-black text-white mb-2 group-hover:text-primary transition-colors italic tracking-tighter">{value}%</div>
        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">{label}</div>
    </div>
);

const IntelBlock = ({ title, value }: { title: string; value: string }) => (
    <div className="p-8 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors rounded-3xl">
        <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3 italic">{title}</div>
        <div className="text-lg font-bold text-white/70 uppercase tracking-tight">{value}</div>
    </div>
);
