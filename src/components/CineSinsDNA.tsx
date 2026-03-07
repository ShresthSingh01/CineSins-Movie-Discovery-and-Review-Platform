'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMovies } from '@/context/MovieContext';

export const CineSinsDNA = () => {
    const { activeProfile } = useAuth();
    const { cinemaDNA, reviews } = useMovies();

    const stats = cinemaDNA || {
        moodTrend: 'Cinematic Explorer',
        favoriteGenre: 'Drama',
        avgRating: '0.0',
        avgEmotional: 50,
        avgCognitive: 50,
        avgComfort: 50
    };


    return (
        <section id="cinesins-dna" className="container py-10">
            <div className="mb-12">
                <h1 className="text-5xl font-black tracking-tight mb-2">
                    Cinema <span className="text-pink-500">DNA</span>
                </h1>
                <p className="text-slate-400 text-lg">Deconstructing your cinematic identity through pure data.</p>
            </div>

            <div className="hub-grid">
                {/* Archetype Card - Large */}
                <div className="overview-card md:col-span-2 lg:col-span-3">
                    <div className="overview-card-wrapper p-10 flex-between gap-10">
                        <div className="flex-1">
                            <span className="text-xs font-black uppercase tracking-widest text-pink-500 mb-2 block">Current Archetype</span>
                            <h2 className="text-6xl font-black mb-4 tracking-tighter">{stats.moodTrend}</h2>
                            <p className="text-slate-400 text-lg max-w-xl">
                                You prioritize atmospheric storytelling and emotional depth over raw action. Your patterns suggest a preference for <span className="text-white font-bold">{stats.favoriteGenre}</span> narratives.
                            </p>
                        </div>
                        <div className="relative shrink-0 hidden md:block">
                            <div className="absolute inset-0 bg-pink-500/20 blur-[50px] rounded-full"></div>
                            <img
                                src={activeProfile?.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${activeProfile?.name}`}
                                alt="Avatar"
                                className="w-40 h-40 rounded-full relative border-4 border-pink-500 shadow-2xl z-10"
                            />
                        </div>
                    </div>
                </div>

                {/* Metrics Bento Cells */}
                <div className="overview-card">
                    <div className="overview-card-wrapper">
                        <div>
                            <div className="card-icon-box" style={{ color: '#8b5cf6' }}>
                                <i className="fas fa-theater-masks"></i>
                            </div>
                            <h3 className="card-title">Favorite Genre</h3>
                            <h4 className="text-4xl font-black mt-2">{stats.favoriteGenre}</h4>
                        </div>
                        <div className="mt-6 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="overview-card">
                    <div className="overview-card-wrapper">
                        <div>
                            <div className="card-icon-box" style={{ color: '#eab308' }}>
                                <i className="fas fa-star"></i>
                            </div>
                            <h3 className="card-title">Avg. Confession</h3>
                            <h4 className="text-4xl font-black mt-2">{stats.avgRating} <span className="text-sm text-slate-500">/ 5.0</span></h4>
                        </div>
                        <div className="flex gap-1 mt-6">
                            {[1, 2, 0, 4, 5].map((s, i) => (
                                <div key={i} className={`h-1.5 flex-1 rounded-full ${i < Math.round(Number(stats.avgRating)) ? 'bg-amber-500' : 'bg-white/5'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SIN-LINE Activity Preview */}
                <div className="overview-card">
                    <div className="overview-card-wrapper">
                        <div>
                            <div className="card-icon-box" style={{ color: '#ef4444' }}>
                                <i className="fas fa-comment-alt"></i>
                            </div>
                            <h3 className="card-title">Total Verdicts</h3>
                            <h4 className="text-4xl font-black mt-2">{reviews?.length || 0}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-6 font-bold uppercase tracking-widest">Confessions Processed</p>
                    </div>
                </div>

                {/* Vibe Profile - Full Width */}
                <div className="overview-card md:col-span-2 lg:col-span-3">
                    <div className="overview-card-wrapper p-8">
                        <h3 className="text-xl font-black tracking-tight mb-8">Psychographic Vibe Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div>
                                <div className="flex-between mb-3">
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Emotional Intensity</span>
                                    <span className="text-sm font-black">{stats.avgEmotional}%</span>
                                </div>
                                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500" style={{ width: `${stats.avgEmotional}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex-between mb-3">
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Cognitive Load</span>
                                    <span className="text-sm font-black">{stats.avgCognitive}%</span>
                                </div>
                                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-teal-500" style={{ width: `${stats.avgCognitive}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex-between mb-3">
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Comfort Level</span>
                                    <span className="text-sm font-black">{stats.avgComfort}%</span>
                                </div>
                                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${stats.avgComfort}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
