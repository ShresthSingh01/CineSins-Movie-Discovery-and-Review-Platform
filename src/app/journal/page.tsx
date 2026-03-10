"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Book, Clock, MessageSquare, Heart, Share2, MoreHorizontal, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const MOCK_JOURNAL_ENTRIES = [
    {
        id: 1,
        movieTitle: "Oppenheimer",
        posterPath: "https://images.tmdb.org/t/p/w500/8GxvA9zLZio17SotmSltR16Nr42.jpg",
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
        posterPath: "https://images.tmdb.org/t/p/w500/gEU2QniE6E67vYvPa7pC6oR3Mmt.jpg",
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

    return (
        <div className="min-h-screen bg-background text-white flex flex-col pb-24">
            <Navbar />

            {/* Header */}
            <header className="pt-32 pb-12 px-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-primary font-black tracking-widest text-xs uppercase mb-3">
                            <Book className="w-4 h-4" /> THE DIRECTOR'S CUT
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
                            CINEMATIC <span className="shimmer leading-none">JOURNALS.</span>
                        </h1>
                    </div>

                    <div className="flex gap-2 bg-secondary/30 p-1.5 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setActiveTab('public')}
                            className={cn("px-6 py-2 rounded-xl text-sm font-black tracking-widest uppercase transition-all", activeTab === 'public' ? "bg-primary text-white" : "text-white/40 hover:text-white")}
                        >
                            The Collective
                        </button>
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={cn("px-6 py-2 rounded-xl text-sm font-black tracking-widest uppercase transition-all", activeTab === 'personal' ? "bg-primary text-white" : "text-white/40 hover:text-white")}
                        >
                            My Archives
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-12 w-full">

                {/* Feed */}
                <div className="lg:col-span-3 space-y-12">
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
                                        <div className="flex -space-x-2">
                                            {Array.from({ length: 3 }).map((_, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-void bg-secondary flex items-center justify-center text-[10px] font-bold">
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                            ))}
                                        </div>
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
                                    <button className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-red-500 transition-colors">
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
                </div>

                {/* Sidebar Stats / CTA */}
                <div className="space-y-12">
                    <button className="w-full bg-primary hover:bg-primary-dark text-white p-8 rounded-[32px] font-black text-xl italic tracking-tighter transition-all shadow-[0_20px_40px_rgba(192,57,43,0.3)] flex items-center justify-center gap-4 group">
                        <Plus className="group-hover:rotate-180 transition-transform duration-500" /> NEW ENTRY
                    </button>

                    <div className="glass p-8 rounded-[32px] border border-white/10">
                        <h3 className="text-[10px] font-black tracking-widest text-primary uppercase mb-6">Archive Statistics</h3>
                        <div className="space-y-6">
                            <StatItem label="Total Rewatch Hours" value="1,402" />
                            <StatItem label="Emotional Spikes" value="459" />
                            <StatItem label="Critical Verse" value="12k" />
                        </div>
                    </div>

                    <div className="glass-dark p-8 rounded-[32px] border border-accent/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-black tracking-tighter mb-2 italic">THE SIN REWARD</h3>
                            <p className="text-xs text-white/40 leading-relaxed uppercase tracking-widest font-bold">
                                Journaling increases your "Editor" rank. Verified editors gain access to "The Cut" featured feed.
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
