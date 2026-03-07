'use client';

import React, { useState } from 'react';
import { useMovies } from '@/context/MovieContext';

export const Hero = () => {
    const { searchMovies } = useMovies();
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsSearching(true);
        try {
            await searchMovies(query);
            // In a real app, we might scroll to results or navigate
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <section className="hero-section">
            {/* Ambient Glows */}
            <div className="hero-glow-1"></div>
            <div className="hero-glow-2"></div>

            <div className="container hero-container" style={{ paddingTop: '80px' }}>
                <div className="hero-flex-wrapper">

                    {/* Left Header & Search */}
                    <div className="hero-left-content">
                        <div className="ai-badge">
                            <span className="pulse-dot-container">
                                <span className="pulse-dot-ping"></span>
                                <span className="pulse-dot"></span>
                            </span>
                            AI-Powered Discovery Active
                        </div>

                        <h1 className="hero-title-text">
                            VIBE <br />
                            <span className="text-gradient-animate">CHECK.</span>
                        </h1>

                        <p className="hero-description">
                            Filter your cinematic feed by mood, aesthetic, or that weird specific feeling you have at 3 AM.
                        </p>

                        {/* Interactive AI Search Bar */}
                        <div className="hero-search-wrapper">
                            <div className="search-glow"></div>
                            <div className="search-bar-inner">
                                <div className="search-icon">
                                    <i className={`fas ${isSearching ? 'fa-spinner fa-spin' : 'fa-brain'}`}></i>
                                </div>
                                <div className="autocomplete-wrapper" style={{ flex: 1, minWidth: 0 }}>
                                    <input
                                        className="search-input"
                                        placeholder="Describe a mood or dream..."
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                                <button className="filter-btn">
                                    <i className="fas fa-sliders-h"></i>
                                </button>
                                <button onClick={handleSearch} disabled={isSearching} className="search-submit-btn">
                                    <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Vertical Feed (Trending Now) */}
                    <div className="hero-right-content">
                        {/* Trending content could go here in the future */}
                    </div>
                </div>
            </div>
        </section >
    );
};
