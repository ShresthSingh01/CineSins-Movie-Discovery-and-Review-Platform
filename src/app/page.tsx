'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { AuthGate } from '@/components/AuthGate';
import { MovieGrid } from '@/components/MovieGrid';
import { MovieModal } from '@/components/MovieModal';
import { DecisionModal } from '@/components/DecisionModal';
import { useMovies } from '@/context/MovieContext';
import { useAuth } from '@/context/AuthContext';
import { Movie } from '@/lib/types';
import { api } from '@/lib/api';
import { normalizeMovieData } from '@/lib/movieUtils';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { activeProfile } = useAuth();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (activeProfile) {
      router.push('/dashboard');
    }
  }, [activeProfile, router]);

  const [hasMounted, setHasMounted] = useState(false);
  const trendingLoaded = useRef(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const loadTrending = async () => {
      if (trendingLoaded.current) return;
      try {
        console.log("🔥 Loading landing trending movies...");
        const results = await api.fetchPopularMoviesBatch();
        const normalized = results.map((m: any) => normalizeMovieData(m)).filter((m: any): m is Movie => m !== null);

        if (normalized.length > 0) {
          setTrending(normalized);
          trendingLoaded.current = true;
          console.log(`🔥 Landing trending loaded: ${normalized.length} items`);
        }
      } catch (e) {
        console.error("Failed to load trending", e);
      } finally {
        setIsLoadingTrending(false);
      }
    };
    if (hasMounted && !trendingLoaded.current) loadTrending();
  }, [hasMounted]);

  return (
    <main className="min-h-screen">
      <AuthGate />
      <Header onOpenDecision={() => setIsDecisionOpen(true)} />
      <Hero />

      <section id="trending" className="container py-20">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 className="section-title" style={{ textAlign: 'left', margin: 0, fontSize: '2rem' }}>
              Trending <span style={{ color: '#a855f7' }}>Sins</span>
            </h2>
            <p style={{ color: '#666', marginTop: '5px' }}>The most searched masterpieces in the last 24 hours.</p>
          </div>
        </div>

        {isLoadingTrending ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><div className="loader"></div></div>
        ) : (
          <MovieGrid
            movies={trending.slice(0, 10)}
            onMovieClick={(m: any) => setSelectedMovie(m)}
          />
        )}
      </section>

      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />

      <DecisionModal
        isOpen={isDecisionOpen}
        onClose={() => setIsDecisionOpen(false)}
      />

      {/* Ambient Glow Cursor */}
      <div className="cursor-glow" id="cursor-glow"></div>
    </main>
  );
}
