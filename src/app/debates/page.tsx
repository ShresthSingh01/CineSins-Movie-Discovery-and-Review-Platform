"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Gavel, MessageSquare, ThumbsUp, ThumbsDown, User, AlertCircle, ShieldCheck, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { syncService } from '@/services/syncService';
import { ConsensusLeaderboard } from '@/components/ui/ConsensusLeaderboard';
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
    const [polls, setPolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolls = async () => {
            const data = await syncService.getPolls();
            setPolls(data.length > 0 ? data : MOCK_DEBATES.map(d => ({...d, id: d.id.toString()})));
            setLoading(false);
        };
        fetchPolls();
    }, []);

    const handleVote = async (pollId: string, isPro: boolean) => {
        // Optimistic update
        setPolls(prev => prev.map(p => {
            if (p.id === pollId) {
                return {
                    ...p,
                    [isPro ? 'votes_pro' : 'votes_con']: (p[isPro ? 'votes_pro' : 'votes_con'] || 0) + 1,
                    participants: (p.participants || 0) + 1
                };
            }
            return p;
        }));

        await syncService.voteInPoll(pollId, isPro);
    };
    return (
        <div className="min-h-screen bg-background text-white flex flex-col pb-24">
            <Navbar />

            <header className="pt-32 pb-12 px-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-2 text-primary font-black tracking-widest text-xs uppercase mb-4">
                        <Gavel className="w-4 h-4" /> THE COMMUNITY COURT
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none italic uppercase mb-6">
                        COMMUNITY <span className="shimmer leading-none">POLLS.</span>
                    </h1>
                    <p className="text-xl text-white/40 max-w-3xl leading-relaxed font-bold uppercase tracking-widest italic">
                        Real arguments. Real votes. No filter. Join the discussion and cast your verdict.
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row gap-12">
                <div className="flex-1 space-y-12">
                {loading ? (
                    <div className="space-y-12">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="h-96 glass-dark animate-pulse rounded-[48px]" />
                        ))}
                    </div>
                ) : polls.map((debate) => (
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
                                    {debate.status || 'Active'}
                                </span>
                                <span className="text-white/20 text-xs font-bold uppercase tracking-widest">{(debate.participants || debate.votes_pro + debate.votes_con)} DEBATERS</span>
                            </div>
                            <h2 className="text-2xl text-white/40 font-black tracking-tighter uppercase mb-2 italic">{debate.movie_title || debate.movieTitle}</h2>
                            <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-none italic uppercase">
                                "{debate.claim}"
                            </h3>
                        </div>

                        {/* The Ring */}
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Pro Side */}
                            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5 hover:bg-green-500/5 transition-colors group">
                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-xs font-black text-green-500 uppercase tracking-widest italic">Agree</span>
                                    <div className="flex items-center gap-2">
                                        <ThumbsUp className="w-4 h-4 text-green-500" />
                                        <motion.span 
                                            key={debate.votes_pro || debate.votesPro}
                                            initial={{ scale: 1.5, color: '#22c55e' }}
                                            animate={{ scale: 1, color: '#fff' }}
                                            className="text-xl font-black italic"
                                        >
                                            {debate.votes_pro || debate.votesPro}
                                        </motion.span>
                                    </div>
                                </div>
                                <p className="text-xl text-white/80 leading-relaxed font-medium">
                                    {debate.pro}
                                </p>
                                <button 
                                    onClick={() => handleVote(debate.id.toString(), true)}
                                    className="mt-8 text-xs font-black tracking-widest uppercase border-b border-green-500/40 pb-1 text-green-500/60 hover:text-green-500 transition-colors"
                                >
                                    VOTE YES
                                </button>
                            </div>

                            {/* Con Side */}
                            <div className="p-8 md:p-12 hover:bg-primary/5 transition-colors group">
                                <div className="flex items-center justify-between mb-8">
                                    <span className="text-xs font-black text-primary uppercase tracking-widest italic">Disagree</span>
                                    <div className="flex items-center gap-2">
                                        <ThumbsDown className="w-4 h-4 text-primary" />
                                        <motion.span 
                                            key={debate.votes_con || debate.votesCon}
                                            initial={{ scale: 1.5, color: '#7000FF' }}
                                            animate={{ scale: 1, color: '#fff' }}
                                            className="text-xl font-black italic"
                                        >
                                            {debate.votes_con || debate.votesCon}
                                        </motion.span>
                                    </div>
                                </div>
                                <p className="text-xl text-white/80 leading-relaxed font-medium">
                                    {debate.con}
                                </p>
                                <button 
                                    onClick={() => handleVote(debate.id.toString(), false)}
                                    className="mt-8 text-xs font-black tracking-widest uppercase border-b border-primary/40 pb-1 text-primary/60 hover:text-primary transition-colors"
                                >
                                    VOTE NO
                                </button>
                            </div>
                        </div>

                        {/* Verdict Progress */}
                        <div className="px-8 py-4 bg-void/50 flex items-center gap-6">
                            <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden flex">
                                <div
                                    className="h-full bg-green-500 transition-all duration-500"
                                    style={{ width: `${((debate.votes_pro || debate.votesPro) / ((debate.votes_pro || debate.votesPro) + (debate.votes_con || debate.votesCon))) * 100}%` }}
                                />
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${((debate.votes_con || debate.votesCon) / ((debate.votes_pro || debate.votesPro) + (debate.votes_con || debate.votesCon))) * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20 whitespace-nowrap">
                                Public Consensus: {Math.round(((debate.votes_pro || debate.votesPro) / ((debate.votes_pro || debate.votesPro) + (debate.votes_con || debate.votesCon))) * 100)}% AGREE
                            </span>
                        </div>
                    </motion.div>
                ))}

                    <div className="text-center pt-12">
                        <button className="glass px-12 py-5 rounded-3xl text-xs font-black tracking-widest uppercase border border-white/10 hover:border-primary transition-all flex items-center gap-3 mx-auto">
                            <AlertCircle size={16} className="text-primary" /> START A NEW DISPUTE
                        </button>
                    </div>
                </div>

                <aside className="w-full lg:w-80 space-y-8">
                    <ConsensusLeaderboard />
                    
                    <div className="glass-dark p-8 rounded-[32px] border border-primary/20">
                        <h3 className="text-xs font-black tracking-widest text-white uppercase mb-4">Court Rules</h3>
                        <ul className="space-y-4">
                            <li className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">
                                <span className="text-primary mr-2">01.</span> Evidence must be cinematic, not personal.
                            </li>
                            <li className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">
                                <span className="text-primary mr-2">02.</span> One vote per critic per indictment.
                            </li>
                            <li className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">
                                <span className="text-primary mr-2">03.</span> Final verdicts are absolute within the timeline.
                            </li>
                        </ul>
                    </div>
                </aside>
            </main>
        </div>
    );
}
