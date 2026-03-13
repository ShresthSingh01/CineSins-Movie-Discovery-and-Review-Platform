"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, TrendingUp, MapPin } from 'lucide-react';
import { syncService } from '@/services/syncService';

interface VerdictEvent {
    id: string;
    movie_id: string;
    movie_title: string;
    verdict: string;
    created_at: string;
}

export const VerdictTicker = () => {
    const [events, setEvents] = useState<VerdictEvent[]>([]);

    useEffect(() => {
        // Load initial events
        const loadInitial = async () => {
            const data = await syncService.getGlobalLogs(5);
            setEvents(data);
        };
        loadInitial();

        // Subscribe to real-time updates
        const subscription = syncService.subscribeToVerdicts((newEvent: VerdictEvent) => {
            setEvents(prev => [newEvent, ...prev].slice(0, 5));
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    if (events.length === 0) return null;

    return (
        <div className="w-full bg-primary/5 border-y border-primary/20 backdrop-blur-sm overflow-hidden py-3">
            <div className="max-w-7xl mx-auto px-6 flex items-center gap-6">
                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest whitespace-nowrap">
                    <TrendingUp className="w-3 h-3 animate-pulse" /> LIVE VERDICTS
                </div>
                
                <div className="flex-1 overflow-hidden relative">
                    <div className="flex gap-12 animate-marquee whitespace-nowrap">
                        {events.map((event, i) => (
                            <div key={event.id || i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/60">
                                <span className="text-white">CRITIC#{Math.floor(Math.random() * 9000) + 1000}</span> 
                                <span className="text-primary italic">AGREED</span> 
                                <span>WITH {event.movie_title} SINS</span>
                                <span className="text-white/20">•</span>
                            </div>
                        ))}
                        {/* Duplicate for seamless loop */}
                        {events.map((event, i) => (
                            <div key={`${event.id}-dup` || `dup-${i}`} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/60">
                                <span className="text-white">CRITIC#{Math.floor(Math.random() * 9000) + 1000}</span> 
                                <span className="text-primary italic">AGREED</span> 
                                <span>WITH {event.movie_title} SINS</span>
                                <span className="text-white/20">•</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                    display: flex;
                    width: max-content;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
};
