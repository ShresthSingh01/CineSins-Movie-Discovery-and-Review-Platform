'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Movie, UserStats, UserProfile } from '../lib/types';
import { safeLocalStorage } from '../lib/storage';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';
import { normalizeMovieData, computeUserAnalytics, computeHiddenScores } from '../lib/movieUtils';
import { eventStore } from '../lib/eventStore';

interface MovieContextType {
    reviews: any[];
    watchlist: Movie[];
    allMovies: Movie[];
    cinemaDNA: UserStats | null;
    isLoading: boolean;
    saveReview: (review: any) => Promise<void>;
    removeReview: (id: string) => void;
    toggleWatchlist: (movie: Movie) => Promise<boolean>;
    searchMovies: (query: string) => Promise<Movie[]>;
    getHiddenGems: () => Movie[];
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function MovieProvider({ children }: { children: ReactNode }) {
    const { token, activeProfile } = useAuth();
    const [reviews, setReviews] = useState<any[]>([]);
    const [watchlist, setWatchlist] = useState<Movie[]>([]);
    const [allMovies, setAllMovies] = useState<Movie[]>([]);
    const [cinemaDNA, setCinemaDNA] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Context Keys
    const profilePrefix = activeProfile ? `${activeProfile.id}_` : '';

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Load persisted data
        const storedMovies = safeLocalStorage.getItem('allMovies');
        if (storedMovies) setAllMovies(JSON.parse(storedMovies));

        if (activeProfile) {
            const storedReviews = safeLocalStorage.getItem(`${profilePrefix}reviews`);
            const storedWatchlist = safeLocalStorage.getItem(`${profilePrefix}watchlist`);
            const storedDNA = safeLocalStorage.getItem(`${profilePrefix}cinemaDNA`);

            if (storedReviews) setReviews(JSON.parse(storedReviews));
            if (storedWatchlist) setWatchlist(JSON.parse(storedWatchlist));
            if (storedDNA) setCinemaDNA(JSON.parse(storedDNA));
        }

        setIsLoading(false);
    }, [activeProfile, profilePrefix]);

    // Update Cinema DNA whenever reviews or movies change
    useEffect(() => {
        if (activeProfile && reviews.length >= 0) {
            const dna = computeUserAnalytics(reviews, allMovies);
            setCinemaDNA(dna);
            safeLocalStorage.setItem(`${profilePrefix}cinemaDNA`, JSON.stringify(dna));
        }
    }, [reviews, allMovies, activeProfile, profilePrefix]);

    const saveReview = async (review: any) => {
        const newReviews = [...reviews];
        const index = newReviews.findIndex(r => r.id === review.id);
        if (index > -1) newReviews[index] = review;
        else newReviews.unshift(review);

        setReviews(newReviews);
        safeLocalStorage.setItem(`${profilePrefix}reviews`, JSON.stringify(newReviews));

        if (token && activeProfile) {
            try {
                await fetch(`${BASE_URL}/actions/${activeProfile.id}/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ movieId: review.id, rating: review.rating, reviewText: review.text })
                });
            } catch (err) { console.error("Sync review failed", err); }
        }

        const movie = allMovies.find(m => m.id === review.id);
        eventStore.logEvent('review', review.id, movie?.metrics || null);
    };

    const removeReview = (id: string) => {
        const newReviews = reviews.filter(r => r.id !== id);
        setReviews(newReviews);
        safeLocalStorage.setItem(`${profilePrefix}reviews`, JSON.stringify(newReviews));
    };

    const toggleWatchlist = async (movie: Movie) => {
        const normalized = normalizeMovieData(movie);
        let newWl = [...watchlist];
        const index = newWl.findIndex(m => m.id === normalized.id);
        let added = false;

        if (index > -1) {
            newWl.splice(index, 1);
            added = false;
        } else {
            newWl.unshift(normalized);
            added = true;
        }

        setWatchlist(newWl);
        safeLocalStorage.setItem(`${profilePrefix}watchlist`, JSON.stringify(newWl));

        if (token && activeProfile) {
            try {
                await fetch(`${BASE_URL}/actions/${activeProfile.id}/watchlist`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ movieId: normalized.id })
                });
            } catch (err) { console.error("Sync watchlist failed", err); }
        }

        if (added) {
            eventStore.logEvent('watchlist-add', normalized.id, normalized.metrics || null);
        }

        return added;
    };

    const searchMovies = async (query: string) => {
        const results = await api.searchMovies(query);
        const normalized = results.map((m: any) => normalizeMovieData(m));

        // Save new movies to allMovies pool
        const newAll = [...allMovies];
        normalized.forEach((m: Movie) => {
            if (!newAll.find(ex => ex.id === m.id)) newAll.push(m);
        });
        setAllMovies(newAll);
        safeLocalStorage.setItem('allMovies', JSON.stringify(newAll));

        return normalized;
    };

    const getHiddenGems = () => {
        const scored = computeHiddenScores(allMovies);
        return scored.sort((a, b) => (b.hiddenScore || 0) - (a.hiddenScore || 0)).slice(0, 20);
    };

    return (
        <MovieContext.Provider value={{
            reviews, watchlist, allMovies, cinemaDNA, isLoading,
            saveReview, removeReview, toggleWatchlist, searchMovies, getHiddenGems
        }}>
            {children}
        </MovieContext.Provider>
    );
}

export function useMovies() {
    const context = useContext(MovieContext);
    if (context === undefined) {
        throw new Error('useMovies must be used within a MovieProvider');
    }
    return context;
}
