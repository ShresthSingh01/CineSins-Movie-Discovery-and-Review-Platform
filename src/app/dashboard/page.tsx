'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { MovieModal } from '@/components/MovieModal';
import { DecisionModal } from '@/components/DecisionModal';
import { useMovies } from '@/context/MovieContext';
import Link from 'next/link';
import { Movie } from '@/lib/types';
import { api } from '@/lib/api';
import { normalizeMovieData } from '@/lib/movieUtils';

export default function DashboardOverview() {
    const { activeProfile, isLoading } = useAuth();
    const { cinemaDNA, watchlist, reviews } = useMovies();
    const [allTrending, setAllTrending] = useState<Movie[]>([]);
    const [hasMounted, setHasMounted] = useState(false);
    const trendingLoaded = useRef(false);
    const router = useRouter();
    const [isDecisionOpen, setIsDecisionOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (!isLoading && !activeProfile && hasMounted) {
            router.push('/');
        }
    }, [activeProfile, isLoading, router, hasMounted]);

    useEffect(() => {
        const loadTrending = async () => {
            if (trendingLoaded.current) return;
            try {
                console.log("🎬 Loading dashboard trending movies...");
                const results = await api.fetchPopularMoviesBatch();
                const normalized = results.map((m: any) => normalizeMovieData(m)).filter((m: any): m is Movie => m !== null);
                if (normalized.length > 0) {
                    setAllTrending(normalized);
                    trendingLoaded.current = true;
                    console.log(`🎬 Dashboard trending loaded: ${normalized.length} items`);
                }
            } catch (e) {
                console.error("Dashboard trending load failed", e);
            }
        };
        if (activeProfile && !trendingLoaded.current) loadTrending();
    }, [activeProfile]);

    if (isLoading || !activeProfile || !hasMounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen pb-20 pt-20 bg-[#0a0a0c]">
            <Header onOpenDecision={() => setIsDecisionOpen(true)} />

            <div className="container py-10">
                <div className="mb-12">
                    <h1 className="text-5xl font-black tracking-tight mb-2">
                        System <span className="text-gradient-animate">Overview</span>
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Welcome back, <span className="text-white font-bold">{activeProfile.name}</span>. Your cinematic status is active.
                    </p>
                </div>

                <div className="hub-grid">
                    {/* Cinema DNA Card */}
                    <Link href="/dashboard/dna" className="overview-card">
                        <div className="overview-card-wrapper">
                            <div>
                                <div className="card-icon-box" style={{ color: '#a855f7' }}>
                                    <i className="fas fa-dna"></i>
                                </div>
                                <h3 className="card-title">Cinema DNA</h3>
                                <p className="card-desc">
                                    Current Archetype: <span className="text-white font-bold">{cinemaDNA?.moodTrend || 'Balanced'}</span>.
                                    Analysis of your recent viewing patterns.
                                </p>
                            </div>
                            <div className="card-link">
                                Analyze Now <i className="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    </Link>

                    {/* Hidden Gems Card */}
                    <Link href="/dashboard/hidden-gems" className="overview-card">
                        <div className="overview-card-wrapper">
                            <div>
                                <div className="card-icon-box" style={{ color: '#fbbf24' }}>
                                    <i className="fas fa-gem"></i>
                                </div>
                                <h3 className="card-title">Hidden Gems</h3>
                                <p className="card-desc">
                                    Real-time scanner active for high-rating, low-visibility masterpieces you might have missed.
                                </p>
                            </div>
                            <div className="card-link">
                                Discover <i className="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    </Link>

                    {/* The Sin-Line Card */}
                    <Link href="/dashboard/sin-line" className="overview-card">
                        <div className="overview-card-wrapper">
                            <div>
                                <div className="card-icon-box" style={{ color: '#ef4444' }}>
                                    <i className="fas fa-broadcast-tower"></i>
                                </div>
                                <h3 className="card-title">The Sin-Line</h3>
                                <p className="card-desc">
                                    See what the community is confessing right now. Join the feed and share your verdicts.
                                </p>
                            </div>
                            <div className="card-link">
                                Join Feed <i className="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    </Link>

                    {/* Your Scrapbook Card */}
                    <Link href="/dashboard/watchlist" className="overview-card">
                        <div className="overview-card-wrapper">
                            <div>
                                <div className="card-icon-box" style={{ color: '#3b82f6' }}>
                                    <i className="fas fa-folder-open"></i>
                                </div>
                                <h3 className="card-title">Your Scrapbook</h3>
                                <p className="card-desc">
                                    Managing <span className="text-white font-bold">{watchlist.length}</span> pinned sins and <span className="text-white font-bold">{reviews.length}</span> confessions.
                                </p>
                            </div>
                            <div className="card-link">
                                View Collection <i className="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Quick Discover Section */}
            <div className="container py-10 border-t border-white/5 mt-10">
                <div className="flex-between mb-8">
                    <h2 className="text-4xl font-black tracking-tight">
                        Live <span className="text-amber-500">Scanner</span>
                    </h2>
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Trending Now</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {allTrending.slice(0, 5).map((movie, i) => (
                        <div key={movie.id || (movie as any)._id || i} className="group relative" style={{ cursor: 'pointer' }} onClick={() => setSelectedMovie(movie)}>
                            <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 bg-[#121214] mb-3 transition-transform hover:scale-105 duration-500 shadow-lg">
                                <img src={movie.poster} className="w-full h-full object-cover" alt={movie.title} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">View Details</p>
                                </div>
                            </div>
                            <h4 className="text-sm font-bold truncate text-white mb-1">{movie.title}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{movie.year} • {movie.genres.split(',')[0]}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <Link href="/dashboard/hidden-gems" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                        View More Masterpieces &rarr;
                    </Link>
                </div>
            </div>

            <MovieModal
                movie={selectedMovie}
                onClose={() => setSelectedMovie(null)}
            />

            <DecisionModal
                isOpen={isDecisionOpen}
                onClose={() => setIsDecisionOpen(false)}
            />

            <div className="cursor-glow" id="cursor-glow"></div>
        </main>
    );
}
