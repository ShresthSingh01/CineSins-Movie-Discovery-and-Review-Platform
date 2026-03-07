'use client';

import React, { useState } from 'react';
import { useMovies } from '@/context/MovieContext';
import { useAuth } from '@/context/AuthContext';
import { Movie } from '@/lib/types';
import { MovieGrid } from './MovieGrid';
import { decisionEngine } from '@/lib/decisionEngine';

interface DecisionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({ isOpen, onClose }) => {
    const { activeProfile } = useAuth();
    const { allMovies } = useMovies();
    const [mood, setMood] = useState('any');
    const [time, setTime] = useState(120);
    const [company, setCompany] = useState('solo');
    const [recommendations, setRecommendations] = useState<Movie[]>([]);
    const [isThinking, setIsThinking] = useState(false);

    if (!isOpen) return null;

    const handleGetRecommendations = async () => {
        setIsThinking(true);
        try {
            const results = await decisionEngine({
                mood: mood as any,
                time,
                company: company as any,
                region: 'global' // Default
            }, allMovies);
            setRecommendations(results);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div id="decision-modal" className={`modal ${isOpen ? 'active' : ''}`} style={{ display: 'flex' }}>
            <div className="modal-content" style={{ maxWidth: '800px', width: '90%', background: 'var(--cin-bg-800)', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                <button id="close-decision-modal" onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}>
                    <i className="fas fa-times"></i>
                </button>

                <div style={{ padding: '40px' }}>
                    <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-playfair)', marginBottom: '10px' }}>Decision Mode</h2>
                    <p style={{ color: '#888', marginBottom: '30px' }}>Let the algorithm find your next cinematic sin.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div>
                            <label style={{ display: 'block', color: '#c4b5fd', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Current Mood</label>
                            <select value={mood} onChange={(e) => setMood(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}>
                                <option value="any">Any Mood</option>
                                <option value="happy">Happy & Light</option>
                                <option value="melancholy">Melancholy</option>
                                <option value="tense">Tense & Intense</option>
                                <option value="thoughtful">Thoughtful</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#c4b5fd', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Max Time (min)</label>
                            <input type="number" value={time} onChange={(e) => setTime(parseInt(e.target.value))} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#c4b5fd', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Company</label>
                            <select value={company} onChange={(e) => setCompany(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}>
                                <option value="solo">Solo</option>
                                <option value="friends">Friends</option>
                                <option value="partner">Partner</option>
                                <option value="family">Family</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleGetRecommendations}
                        disabled={isThinking}
                        className="btn-primary"
                        style={{ width: '100%', padding: '15px', fontWeight: 'bold', letterSpacing: '1px' }}
                    >
                        {isThinking ? <i className="fas fa-spinner fa-spin"></i> : 'GET RECOMMENDATIONS'}
                    </button>

                    <div style={{ marginTop: '40px' }}>
                        {recommendations.length > 0 && (
                            <MovieGrid movies={recommendations} variant="decision" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
