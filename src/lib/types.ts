// src/lib/types.ts

export interface MovieMetrics {
    emotionalIntensity: number;
    cognitiveLoad: number;
    comfortScore: number;
}

export interface RegretRisk {
    score: number;
    label: 'Low' | 'Medium' | 'High';
    color: string;
    reason: string;
}

export interface Archetype {
    id: string;
    label: string;
    description: string;
    icon: string;
    traits: string[];
}

export interface UserStats {
    totalMoviesSaved: number;
    favoriteGenre: string;
    genreCounts: Record<string, number>;
    avgRating: string;
    totalReviews: number;
    top5Directors: string[];
    moodTrend: string;
    avgEmotional: number;
    avgCognitive: number;
    avgComfort: number;
    percentOlderDecades: number;
    hiddenGemAffinity: number;
    rewatchRate: number;
    archetype?: Archetype & { confidence: number; reasons: string[] };
}

export interface Movie {
    id: string;
    imdbID?: string;
    _id?: string;
    title: string;
    Title?: string;
    Year?: string;
    year?: string;
    poster: string;
    Poster?: string;
    genres: string;
    Genre?: string;
    director?: string;
    Director?: string;
    imdbRating?: string;
    imdbVotes?: string;
    runtime?: string;
    Runtime?: string;
    metrics?: MovieMetrics;
    plot?: string;
    Plot?: string;
    normalizedGenres?: string[];
    runtimeMin?: number;
    imdbRatingFloat?: number;
    imdbVotesInt?: number;
    hiddenScore?: number;
    regRisk?: RegretRisk;
    regionTags?: string[];
}

export interface DecisionOptions {
    mood?: 'Comfort' | 'Vibing' | 'Good' | 'Exciting' | 'Thoughtful' | 'auto';
    company?: 'Alone' | 'Family' | 'Couple' | 'Group' | 'auto';
    time?: string | number | 'auto';
    epsilon?: number;
    region?: string;
}

export interface UserProfile {
    id: string;
    name: string;
    avatar?: string;
    archetype?: any;
    dna?: UserStats;
}
