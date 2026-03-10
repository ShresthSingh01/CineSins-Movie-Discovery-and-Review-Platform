"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Gavel, MessageSquare, ThumbsUp, ThumbsDown, User, AlertCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const MOCK_DEBATES = [
    {
        id: 1,
        movieTitle: "The Dark Knight",
        claim: "THE SHIP SCENE WAS THE ONLY LOGICAL CHOICE.",
        pro: "It proves Joker's nihilism is wrong. Human nature is inherently good under pressure.",
        con: "It's a fairy-tale ending in a movie that tries too hard to be grounded in gritty reality.",
        votesPro: 4502,
        votesCon: 1204,
        status: "Active",
        participants: 120
    },
    {
        id: 2,
        movieTitle: "Inception",
        claim: "THE TOP KEPT SPINNING. IT WAS A DREAM.",
        pro: "The logic of the children's clothes and the ring proves Cobb never left the layer.",
        con: "The wobble is visible. Nolan uses the ambiguity as a sin in itself, but the physics hold.",
        votesPro: 8902,
        votesCon: 9104,
        status: "Verdict Pending",
        participants: 450
    }
];

export default function SinDebates() {
    return (
        <div className="min-h-screen bg-background text-white flex flex-col pb-24">
            <Navbar />

            <header className="pt-32 pb-12 px-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-2 text-primary font-black tracking-widest text-xs uppercase mb-4">
                        <Gavel className="w-4 h-4" /> THE HIGH COURT OF CINEMA
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none italic uppercase mb-6">
                        SIN <span className="shimmer leading-none">DEBATES.</span>
                    </h1>
                    <p className="text-xl text-white/40 max-w-3xl leading-relaxed font-bold uppercase tracking-widest italic">
                        Structured arguments. Brutal honesty. No emotional fluff. Enter the ring and prove your case.
                    </p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 w-full space-y-12">
                {MOCK_DEBATES.map((debate) => (
                    <motion.div
                        key={debate.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-dark rounded-[48px] border border-white/5 overflow-hidden flex flex-col"
                    >
                        {/* Debate Header */}
                        <div className="p-8 md:p-12 border-b border-white/5 bg-primary/5">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 bg-void text-primary rounded-full text-[10px] font-black tracking-widest uppercase border border-primary/40">
                                    {debate.status}
                                </span>
                                <span className="text-white/20 text-xs font-bold uppercase tracking-widest">{debate.participants} DEBATERS</span>
                            </div>
                            <h2 className="text-2xl text-white/40 font-black tracking-tighter uppercase mb-2 italic">{debate.movieTitle}</h2>
                            <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-none italic uppercase">
                                "{debate.claim}"
                            </h3>
                        </div>

                        {/* The Ring */}
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Pro Side */}
                            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5 hover:bg-green-500/5 transition-colors group">
                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-xs font-black text-green-500 uppercase tracking-widest italic">The Prosecution</span>
                                    <div className="flex items-center gap-2">
                                        <ThumbsUp className="w-4 h-4 text-green-500" />
                                        <span className="text-xl font-black italic">{debate.votesPro}</span>
                                    </div>
                                </div>
                                <p className="text-xl text-white/80 leading-relaxed font-medium">
                                    {debate.pro}
                                </p>
                                <button className="mt-8 text-xs font-black tracking-widest uppercase border-b border-green-500/40 pb-1 text-green-500/60 hover:text-green-500 transition-colors">
                                    SUPPORT CLAIM
                                </button>
                            </div>

                            {/* Con Side */}
                            <div className="p-8 md:p-12 hover:bg-primary/5 transition-colors group">
                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-xs font-black text-primary uppercase tracking-widest italic">The Defense</span>
                                    <div className="flex items-center gap-2">
                                        <ThumbsDown className="w-4 h-4 text-primary" />
                                        <span className="text-xl font-black italic">{debate.votesCon}</span>
                                    </div>
                                </div>
                                <p className="text-xl text-white/80 leading-relaxed font-medium">
                                    {debate.con}
                                </p>
                                <button className="mt-8 text-xs font-black tracking-widest uppercase border-b border-primary/40 pb-1 text-primary/60 hover:text-primary transition-colors">
                                    COUNTER CLAIM
                                </button>
                            </div>
                        </div>

                        {/* Verdict Progress */}
                        <div className="px-8 py-4 bg-void/50 flex items-center gap-6">
                            <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden flex">
                                <div
                                    className="h-full bg-green-500"
                                    style={{ width: `${(debate.votesPro / (debate.votesPro + debate.votesCon)) * 100}%` }}
                                />
                                <div
                                    className="h-full bg-primary"
                                    style={{ width: `${(debate.votesCon / (debate.votesPro + debate.votesCon)) * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20 whitespace-nowrap">
                                Public Consensus in Progress
                            </span>
                        </div>
                    </motion.div>
                ))}

                <div className="text-center pt-12">
                    <button className="glass px-12 py-5 rounded-3xl text-xs font-black tracking-widest uppercase border border-white/10 hover:border-primary transition-all flex items-center gap-3 mx-auto">
                        <AlertCircle size={16} className="text-primary" /> START A NEW DISPUTE
                    </button>
                </div>
            </main>
        </div>
    );
}
