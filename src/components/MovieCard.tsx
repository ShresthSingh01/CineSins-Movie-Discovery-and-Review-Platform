'use client';

import React, { useEffect, useRef } from 'react';
import { Movie } from '@/lib/types';
import { getHighResPoster } from '@/lib/movieUtils';
import gsap from 'gsap';

interface MovieCardProps {
    movie: Movie;
    variant?: 'default' | 'decision' | 'gem';
    index?: number;
    onClick?: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, variant = 'default', index, onClick }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    if (!movie) return null;
    const posterUrl = getHighResPoster(movie.poster || movie.Poster);

    useEffect(() => {
        if (!cardRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(cardRef.current,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    delay: (index || 0) * 0.05,
                    ease: 'power2.out',
                    overwrite: 'auto'
                }
            );
        }, cardRef);

        return () => ctx.revert();
    }, [index]);

    const handleMouseEnter = () => {
        if (!cardRef.current) return;
        gsap.to(cardRef.current.querySelector('.card-overlay'), {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power3.out'
        });
        gsap.to(cardRef.current.querySelector('img'), {
            scale: 1.1,
            duration: 0.6,
            ease: 'power2.out'
        });
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        gsap.to(cardRef.current.querySelector('.card-overlay'), {
            opacity: 0,
            y: 10,
            duration: 0.3,
            ease: 'power3.in'
        });
        gsap.to(cardRef.current.querySelector('img'), {
            scale: 1,
            duration: 0.5,
            ease: 'power2.inOut'
        });
    };

    const riskBadge = movie.regRisk && (
        <div className="regret-badge"
            style={{ background: movie.regRisk.color }}
            title={`Regret Risk: ${movie.regRisk.reason}`}>
            <i className="fas fa-exclamation-triangle"></i> {movie.regRisk.label} Risk
        </div>
    );

    return (
        <div
            ref={cardRef}
            className={`movie-card ${variant}-card`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onClick?.(movie)}
            style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
        >
            {riskBadge}
            <img
                src={posterUrl}
                alt={movie.title || movie.Title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            />

            <div className="card-overlay" style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                opacity: 0, transform: 'translateY(10px)',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: '20px', zIndex: 2
            }}>
                <div className="movie-info">
                    {variant === 'decision' && (
                        <span style={{
                            display: 'inline-block', padding: '4px 10px',
                            background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(219,39,119,0.2))',
                            borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800,
                            color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'
                        }}>
                            🕯️ Penance #{index !== undefined ? index + 1 : '?'}
                        </span>
                    )}
                    <h3>{movie.title || movie.Title}</h3>
                    <p className="movie-meta">
                        {movie.year || movie.Year} • IMDb: {movie.imdbRating || "N/A"}
                    </p>
                    <p className="plot-text" style={{
                        fontSize: '0.85rem', marginTop: '5px', opacity: 0.8,
                        lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                        {movie.plot || movie.Plot || movie.genres || "No description."}
                    </p>
                    <button className="review-btn btn-primary" style={{ marginTop: '15px', width: '100%' }}>
                        <i className="fas fa-search"></i> View Details
                    </button>
                </div>
            </div>
        </div>
    );
};
