'use client';

import React, { useState } from 'react';
import { useMovies } from '@/context/MovieContext';
import { MovieGrid } from './MovieGrid';
import { MovieModal } from './MovieModal';
import { Movie } from '@/lib/types';

export const Scrapbook = () => {
    const { watchlist, reviews, allMovies } = useMovies();
    const [activeTab, setActiveTab] = useState<'reviews' | 'watchlist'>('watchlist');
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    // Filter allMovies by the IDs in reviews/watchlist
    const reviewedMovies = allMovies.filter((m: any) => reviews.some((r: any) => r.id === m.id));
    const watchlistedMovies = allMovies.filter((m: any) => watchlist.some((w: any) => w.id === m.id));

    return (
        <section id="scrapbook" className="container py-10">
            <div className="mb-12">
                <h1 className="text-5xl font-black tracking-tight mb-6">
                    YOUR <span className="text-pink-500">SCRAPBOOK</span>
                </h1>

                <div className="flex gap-8 border-b border-white/5 pb-4">
                    <button
                        onClick={() => setActiveTab('watchlist')}
                        className={`text-sm font-black tracking-widest uppercase transition-all pb-4 relative ${activeTab === 'watchlist' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        Watchlist
                        {activeTab === 'watchlist' && (
                            <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-pink-500"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`text-sm font-black tracking-widest uppercase transition-all pb-4 relative ${activeTab === 'reviews' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        Confessions
                        {activeTab === 'reviews' && (
                            <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-pink-500"></div>
                        )}
                    </button>
                </div>
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'watchlist' ? (
                    <MovieGrid
                        movies={watchlistedMovies}
                        emptyMessage="Your watchlist is empty. Add some sins."
                        onMovieClick={(m) => setSelectedMovie(m)}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reviews.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No confessions yet. Start judging.</p>
                            </div>
                        ) : (
                            reviews.map((review: any) => (
                                <div key={review.id} className="overview-card-wrapper p-6 bg-[#121214] flex gap-6 hover:border-white/10 transition-colors cursor-pointer group" onClick={() => {
                                    const movie = allMovies.find((m: any) => m.id === review.id);
                                    if (movie) setSelectedMovie(movie);
                                }}>
                                    <div className="w-20 shrink-0 aspect-[2/3] overflow-hidden rounded-lg border border-white/5 group-hover:border-white/20 transition-colors">
                                        <img src={review.poster} alt={review.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                    </div>
                                    <div className="flex-1 py-1">
                                        <h4 className="font-black text-white text-lg leading-tight mb-2 group-hover:text-pink-500 transition-colors">{review.title}</h4>
                                        <div className="flex gap-1 mb-4 text-[10px] text-amber-500">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <i key={i} className={`${i < review.rating ? 'fas' : 'far'} fa-star`}></i>
                                            ))}
                                        </div>
                                        <p className="text-sm text-slate-400 font-medium italic leading-relaxed">"{review.text}"</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <MovieModal
                movie={selectedMovie}
                onClose={() => setSelectedMovie(null)}
            />
        </section>
    );
};
