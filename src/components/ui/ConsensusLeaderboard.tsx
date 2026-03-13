"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, CheckCircle } from 'lucide-react';
import { syncService } from '@/services/syncService';

export const ConsensusLeaderboard = () => {
    const [leaders, setLeaders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaders = async () => {
            const polls = await syncService.getPolls();
            // Sort by consensus percentage (pro / total)
            const sorted = polls
                .map(p => ({
                    ...p,
                    percentage: Math.round(((p.votes_pro || p.votesPro) / ((p.votes_pro || p.votesPro) + (p.votes_con || p.votesCon))) * 100)
                }))
                .sort((a, b) => b.percentage - a.percentage)
                .slice(0, 5);
            
            setLeaders(sorted);
            setLoading(false);
        };
        fetchLeaders();
    }, []);

    if (loading) return <div className="h-64 glass animate-pulse rounded-3xl" />;
    if (leaders.length === 0) return null;

    return (
        <div className="glass p-8 rounded-[32px] border border-white/10 space-y-8">
            <div className="flex items-center gap-3 text-primary font-black tracking-widest text-[10px] uppercase">
                <TrendingUp size={14} /> GLOBAL CONSENSUS
            </div>

            <div className="space-y-6">
                {leaders.map((leader, i) => (
                    <div key={leader.id} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4">
                            <span className="text-xl font-black italic text-white/20 group-hover:text-primary transition-colors">0{i + 1}</span>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-tighter text-white/80 group-hover:text-white">{leader.movie_title || leader.movieTitle}</h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <CheckCircle size={10} className="text-green-500" />
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">United Verdict</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-black italic text-green-500">{leader.percentage}%</div>
                            <div className="text-[8px] font-black text-white/10 uppercase tracking-widest">Agreement</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-4 border-t border-white/5">
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] leading-relaxed">
                    Leaderboard updates in real-time based on community indictments.
                </p>
            </div>
        </div>
    );
};
