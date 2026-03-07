'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '@/lib/types';
import { api } from '@/lib/api';
import { normalizeMovieData, computeHiddenScores } from '@/lib/movieUtils';
import { MovieGrid } from './MovieGrid';
import { MovieModal } from './MovieModal';

export const HiddenGems = () => {
    const [gems, setGems] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    const [hasMounted, setHasMounted] = useState(false);
    const hasLoaded = useRef(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        const loadGems = async () => {
            if (hasLoaded.current) return;
            try {
                console.log("💎 Loading hidden gems...");
                const results = await api.fetchPopularMoviesBatch(); // Using popular as base for now
                let processed = results.map((m: any) => normalizeMovieData(m)).filter((m: any): m is Movie => m !== null);
                processed = computeHiddenScores(processed);
                // Sort by hidden score
                processed.sort((a: any, b: any) => (b.hiddenScore || 0) - (a.hiddenScore || 0));

                if (processed.length > 0) {
                    setGems(processed.slice(0, 8));
                    hasLoaded.current = true;
                    console.log(`💎 Hidden gems loaded: ${processed.length} items`);
                }
            } catch (e) {
                console.error("Failed to load gems", e);
            } finally {
                setIsLoading(false);
            }
        };
        if (hasMounted && !hasLoaded.current) loadGems();
    }, [hasMounted]);

    return (
        <section id="hidden-gems" className="container py-10">
            <div className="mb-12">
                <h1 className="text-5xl font-black tracking-tight mb-2">
                    Hidden <span className="text-amber-500">Gems</span>
                </h1>
                <p className="text-slate-400 text-lg">High-rated masterpieces with suspiciously low view counts. Real-time scanning active.</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-20">
                    <div className="loader"></div>
                </div>
            ) : (
                <MovieGrid
                    movies={gems}
                    onMovieClick={(m: any) => setSelectedMovie(m)}
                />
            )}

            <MovieModal
                movie={selectedMovie}
                onClose={() => setSelectedMovie(null)}
            />
        </section>
    );
};
