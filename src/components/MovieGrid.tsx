'use client';

import React from 'react';
import { Movie } from '@/lib/types';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
    movies: Movie[];
    variant?: 'default' | 'decision' | 'gem';
    onMovieClick?: (movie: Movie) => void;
    emptyMessage?: string;
    className?: string;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
    movies,
    variant = 'default',
    onMovieClick,
    emptyMessage = "No movies found.",
    className = "movie-grid"
}) => {
    if (movies.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon"><i className="fas fa-film"></i></div>
                <p className="empty-text">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={className}>
            {movies.map((movie, index) => (
                <MovieCard
                    key={movie.id || movie.imdbID || index}
                    movie={movie}
                    index={index}
                    onClick={onMovieClick}
                />
            ))}
        </div>
    );
};
