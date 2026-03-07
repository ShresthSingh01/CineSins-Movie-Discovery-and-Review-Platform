'use client';

import React, { useState, useEffect } from 'react';
import { Movie } from '@/lib/types';
import { useMovies } from '@/context/MovieContext';
import { getHighResPoster } from '@/lib/movieUtils';
import gsap from 'gsap';

interface MovieModalProps {
    movie: Movie | null;
    onClose: () => void;
}

export const MovieModal: React.FC<MovieModalProps> = ({ movie, onClose }) => {
    const { saveReview, toggleWatchlist, watchlist, reviews } = useMovies();
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isWatchlisted, setIsWatchlisted] = useState(false);
    const [fullMovie, setFullMovie] = useState<any>(null);
    const [isFetchingInfo, setIsFetchingInfo] = useState(false);

    useEffect(() => {
        if (movie) {
            setFullMovie(movie);
            const inWl = watchlist.some(m => m.id === movie.id);
            setIsWatchlisted(inWl);

            const existingReview = reviews.find(r => r.id === movie.id);
            if (existingReview) {
                setRating(existingReview.rating);
                setReviewText(existingReview.text);
            } else {
                setRating(0);
                setReviewText('');
            }

            // Fetch extra info if missing plot or specifically for this modal
            const fetchExtras = async () => {
                setIsFetchingInfo(true);
                try {
                    const res = await fetch(`http://localhost:5000/api/movies/${movie.id || (movie as any)._id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setFullMovie(data);
                    }
                } catch (e) {
                    console.error("Detaile fetch failed", e);
                } finally {
                    setIsFetchingInfo(false);
                }
            };
            fetchExtras();

            // Simple animation
            gsap.fromTo(".modal-content",
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
            );
        }
    }, [movie, watchlist, reviews]);

    if (!movie) return null;

    const handleSave = async () => {
        await saveReview({
            id: movie.id,
            title: movie.title || movie.Title,
            poster: movie.poster || movie.Poster,
            rating,
            text: reviewText,
            timestamp: Date.now()
        });
        onClose();
    };

    const handleToggleWl = async () => {
        const added = await toggleWatchlist(movie);
        setIsWatchlisted(added);
    };

    return (
        <div id="review-modal" className="modal active" style={{ display: 'flex' }}>
            <div className="modal-content" style={{ maxWidth: '1100px', width: '95%', padding: 0, overflow: 'hidden', display: 'flex', borderRadius: '20px', background: 'var(--cin-bg-800)', position: 'relative' }}>
                <button id="close-modal" onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 1000, background: 'rgba(0,0,0,0.8)', color: '#fff', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer' }}>
                    <i className="fas fa-times"></i>
                </button>

                <div className="modal-left" style={{ flex: '1', minHeight: '500px' }}>
                    <img src={getHighResPoster(movie.poster || movie.Poster)} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div className="modal-right" style={{ flex: '1.2', padding: '40px', overflowY: 'auto', maxHeight: '90vh', background: '#0c0c0e' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2 id="modal-title" style={{ fontSize: '2.8rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: '5px', lineHeight: 1.1 }}>{movie.title || movie.Title}</h2>
                            <div style={{ display: 'flex', gap: '15px', color: '#888', marginBottom: '25px', fontSize: '0.9rem', fontWeight: 600 }}>
                                <span>{movie.year || movie.Year}</span>
                                <span>{fullMovie?.runtime || fullMovie?.Runtime || 'N/A'}</span>
                                <span style={{ color: '#fbbf24' }}>★ {fullMovie?.imdbRating || movie.imdbRating || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
                        {(movie.genres || movie.Genre || "").split(',').map((g: string) => (
                            <span key={g} style={{ padding: '4px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', fontWeight: 700, color: '#aaa' }}>
                                {g.trim()}
                            </span>
                        ))}
                    </div>

                    <div style={{ marginBottom: '35px' }}>
                        <h4 style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '12px', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '2px', fontWeight: 800 }}>The Plot</h4>
                        <p id="modal-plot" style={{ lineHeight: '1.7', color: 'rgba(255,255,255,0.9)', fontSize: '1.05rem', fontWeight: 400 }}>
                            {isFetchingInfo ? "Decrypting full plot..." : (fullMovie?.plot || movie.plot || movie.Plot || "No plot summary available.")}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '40px' }}>
                        <div>
                            <h4 style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '1px', fontWeight: 800 }}>Director</h4>
                            <p style={{ color: '#fff', fontSize: '0.95rem' }}>{fullMovie?.director || fullMovie?.Director || 'Unknown'}</p>
                        </div>
                        <div>
                            <h4 style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '1px', fontWeight: 800 }}>Awards</h4>
                            <p style={{ color: '#fff', fontSize: '0.95rem' }}>{fullMovie?.awards || fullMovie?.Awards || 'None found'}</p>
                        </div>
                    </div>

                    <div className="review-section" style={{ background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h4 style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>QUICK CONFESSION</h4>
                            <div className="rating-stars" style={{ display: 'flex', gap: '5px' }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <i
                                        key={s}
                                        className={`fa-star ${rating >= s ? 'fas shadow-glow-yellow' : 'far opacity-30'}`}
                                        style={{ color: '#fbbf24', cursor: 'pointer', fontSize: '1.2rem' }}
                                        onClick={() => setRating(s)}
                                    ></i>
                                ))}
                            </div>
                        </div>

                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Type your verdict here..."
                            style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '18px', color: '#fff', minHeight: '100px', marginBottom: '20px', resize: 'none', fontSize: '0.95rem' }}
                        ></textarea>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button onClick={handleSave} className="btn-primary" style={{ flex: 1.5, padding: '15px', fontWeight: 900, borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Record Sin</button>
                            <button onClick={handleToggleWl} style={{ flex: 1, padding: '15px', background: isWatchlisted ? 'rgba(219, 39, 119, 0.15)' : 'transparent', border: '2px solid #db2777', color: '#db2777', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>
                                {isWatchlisted ? 'Pinned' : 'Pin to list'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
