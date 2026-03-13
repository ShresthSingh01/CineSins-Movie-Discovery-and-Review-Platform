"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Book, Clock, MessageSquare, Heart, Share2, MoreHorizontal, Plus, ShieldCheck, MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { syncService } from '@/services/syncService';
import Image from 'next/image';

const MOCK_JOURNAL_ENTRIES = [
    {
        id: 1,
        movieTitle: "Oppenheimer",
        posterPath: "https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjctZmY5Ni00NGRmLWFlY2UtYWRhZmRkZWU3ZDhhXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_SX300.jpg",
        date: "2 HOURS AGO",
        reactions: [
            { timestamp: "00:42:15", type: "Chills", note: "The silence before the blast is deafening." },
            { timestamp: "01:15:30", type: "Anxiety", note: "The interrogation scenes are perfectly edited." },
            { timestamp: "02:45:00", type: "Grief", note: "The final close-up of Cillian Murphy... cinema at its peak." }
        ],
        summary: "A masterclass in tension. The sound design is a sinless miracle.",
        likes: 124,
        comments: 18
    },
    {
        id: 2,
        movieTitle: "Interstellar",
        posterPath: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
        date: "YESTERDAY",
        reactions: [
            { timestamp: "01:22:00", type: "Awe", note: "Miller's Planet. That gargantuan wave." },
            { timestamp: "02:10:45", type: "Tears", note: "The messages from home. Cooper's breakdown." }
        ],
        summary: "Re-watched for the 10th time. The score still hits like a freight train.",
        likes: 89,
        comments: 5
    }
];

export default function Journal() {
    const [activeTab, setActiveTab] = useState<'public' | 'personal'>('public');
    const [globalLogs, setGlobalLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGlobal = async () => {
            const logs = await syncService.getGlobalLogs(10);
            setGlobalLogs(logs);
            setLoading(false);
        };
        fetchGlobal();
    }, []);

    return (
        <div className="min-h-screen bg-background text-white flex flex-col pb-24">
            <Navbar />

            {/* Header */}
            <header className="pt-32 pb-12 px-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-primary font-black tracking-widest text-xs uppercase mb-3">
                            <Book className="w-4 h-4" /> RECENT AUDITS
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
                            MY MOVIE <span className="shimmer leading-none">LOGS.</span>
                        </h1>
                    </div>

                    <div className="flex gap-2 bg-secondary/30 p-1.5 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setActiveTab('public')}
                            className={cn("px-6 py-2 rounded-xl text-sm font-black tracking-widest uppercase transition-all", activeTab === 'public' ? "bg-primary text-white" : "text-white/40 hover:text-white")}
                        >
                            Public Feed
                        </button>
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={cn("px-6 py-2 rounded-xl text-sm font-black tracking-widest uppercase transition-all", activeTab === 'personal' ? "bg-primary text-white" : "text-white/40 hover:text-white")}
                        >
                            My Logs
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-12 w-full">

                {/* Feed */}
                <div className="lg:col-span-3 space-y-12">
                    <AnimatePresence mode="wait">
                        {activeTab === 'public' ? (
                            <motion.div
                                key="public"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-12"
                            >
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="h-64 glass-dark animate-pulse rounded-[40px]" />
                                    ))
                                ) : globalLogs.length > 0 ? (
                                    globalLogs.map((log, i) => (
                                        <motion.article
                                            key={log.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="glass-dark rounded-[40px] border border-white/5 overflow-hidden group"
                                        >
                                            <div className="p-8 flex flex-col md:flex-row gap-8">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <span className="text-primary font-black text-[10px] uppercase tracking-widest italic">Live Feed</span>
                                                        <span className="text-white/20">•</span>
                                                        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{new Date(log.created_at).toLocaleTimeString()}</span>
                                                    </div>
                                                    <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">CRITIC#{Math.floor(Math.random() * 9000) + 1000}</h2>
                                                    <p className="text-lg text-white/70 italic border-l-4 border-primary/40 pl-6 py-2">
                                                        Verified cinematic sin detected in <span className="text-white font-bold">{log.movie_title}</span>. 
                                                        The audit verdict is <span className="text-primary font-bold">ALIGNED</span> with community standards.
                                                    </p>
                                                    <div className="mt-8 flex items-center gap-6 text-[10px] font-black tracking-[0.3em] uppercase text-white/40">
                                                        <div className="flex items-center gap-2"><MapPin size={12} className="text-primary" /> Sector 7G</div>
                                                        <div className="flex items-center gap-2"><ShieldCheck size={12} className="text-primary" /> Forensic Verified</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.article>
                                    ))
                                ) : (
                                    <div className="py-32 text-center">
                                        <h3 className="text-2xl font-black text-white/10 uppercase tracking-[0.5em] italic">No Global Evidence Found</h3>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="personal"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-12"
                            >
                                {MOCK_JOURNAL_ENTRIES.map((entry) => (
                                    <motion.article
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="glass-dark rounded-[40px] border border-white/5 overflow-hidden group"
                                    >
                                        <div className="p-8 flex flex-col md:flex-row gap-8">
                                            {/* Movie Poster & Meta */}
                                            <div className="w-full md:w-48 flex-shrink-0">
                                                <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                                                    <Image src={entry.posterPath} alt={entry.movieTitle} fill className="object-cover" />
                                                </div>
                                                <div className="mt-4 flex items-center justify-between text-white/40 uppercase text-[10px] font-black tracking-widest">
                                                    <span>{entry.date}</span>
                                                    <button className="hover:text-primary"><MoreHorizontal size={16} /></button>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h2 className="text-3xl font-black tracking-tighter uppercase group-hover:text-primary transition-colors cursor-pointer">
                                                        {entry.movieTitle}
                                                    </h2>
                                                </div>

                                                <p className="text-lg text-white/70 italic leading-relaxed mb-8 border-l-4 border-primary/40 pl-6">
                                                    "{entry.summary}"
                                                </p>

                                                {/* Timestamp Timeline */}
                                                <div className="space-y-4">
                                                    <h3 className="text-[10px] font-black tracking-widest text-white/20 uppercase italic">Key Moment Reactions</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {entry.reactions.map((react, i) => (
                                                            <div key={i} className="glass p-4 rounded-2xl border border-white/5 hover:border-primary/30 transition-all cursor-crosshair group/item">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-xs font-black text-primary flex items-center gap-1 uppercase">
                                                                        <Clock size={10} /> {react.timestamp}
                                                                    </span>
                                                                    <span className="px-2 py-0.5 bg-secondary text-[8px] font-black tracking-widest uppercase rounded">
                                                                        {react.type}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-white/50 leading-snug">{react.note}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Footer */}
                                        <div className="bg-white/[0.02] px-8 py-4 flex items-center justify-between border-t border-white/5">
                                            <div className="flex gap-6">
                                                <button className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-primary transition-colors">
                                                    <Heart size={16} /> {entry.likes}
                                                </button>
                                                <button className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-primary transition-colors">
                                                    <MessageSquare size={16} /> {entry.comments}
                                                </button>
                                            </div>
                                            <button className="text-white/20 hover:text-white transition-colors">
                                                <Share2 size={16} />
                                            </button>
                                        </div>
                                    </motion.article>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar Stats / CTA */}
                <div className="space-y-12">
                    <button className="w-full bg-primary hover:bg-primary-dark text-white p-8 rounded-[32px] font-black text-xl italic tracking-tighter transition-all shadow-[0_20px_40px_rgba(112,0,255,0.3)] flex items-center justify-center gap-4 group">
                        <Plus className="group-hover:rotate-180 transition-transform duration-500" /> NEW ENTRY
                    </button>

                    <div className="glass p-8 rounded-[32px] border border-white/10">
                        <h3 className="text-[10px] font-black tracking-widest text-primary uppercase mb-6">Critic Profile</h3>
                        <div className="space-y-6">
                            <StatItem label="Forensic Rank" value={syncService.getUserReputation().rank} />
                            <StatItem label="Audit Points" value={`${syncService.getUserReputation().points} XP`} />
                            <StatItem label="Accuracy Rate" value="94%" />
                        </div>
                    </div>

                    <div className="glass-dark p-8 rounded-[32px] border border-accent/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-black tracking-tighter mb-2 italic">THE SIN REWARD</h3>
                            <p className="text-xs text-white/40 leading-relaxed uppercase tracking-widest font-bold">
                                Logging your rewatches increases your rank. Expert logs gain more visibility in the public feed.
                            </p>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Book size={60} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

const StatItem = ({ label, value }: { label: string, value: string }) => (
    <div className="flex flex-col">
        <span className="text-2xl font-black italic tracking-tighter">{value}</span>
        <span className="text-[9px] font-black uppercase tracking-widest text-white/20 mt-1">{label}</span>
    </div>
);
