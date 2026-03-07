'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../lib/types';
import { safeLocalStorage } from '../lib/storage';

interface AuthContextType {
    token: string | null;
    activeProfile: UserProfile | null;
    profiles: UserProfile[];
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (email: string, pass: string) => Promise<void>;
    logout: () => void;
    switchProfile: (id: string) => Promise<void>;
    createProfile: (name: string) => Promise<UserProfile | null>;
    refreshProfiles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = safeLocalStorage.getItem('cinesins_token');
        const storedActiveProfileId = safeLocalStorage.getItem('cinesins_active_profile');
        const storedProfiles = safeLocalStorage.getItem('cinesins_profiles');

        if (storedToken) setToken(storedToken);
        if (storedProfiles) setProfiles(JSON.parse(storedProfiles));

        if (storedActiveProfileId && storedProfiles) {
            const profs = JSON.parse(storedProfiles);
            const active = profs.find((p: UserProfile) => p.id === storedActiveProfileId);
            if (active) setActiveProfile(active);
        }

        setIsLoading(false);
    }, []);

    const refreshProfiles = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${BASE_URL}/profiles`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const mapped = data.map((p: any) => ({ ...p, id: p._id }));
                setProfiles(mapped);
                safeLocalStorage.setItem('cinesins_profiles', JSON.stringify(mapped));
            }
        } catch (e) {
            console.error("Failed to refresh profiles", e);
        }
    };

    const login = async (email: string, pass: string) => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass })
        });
        if (!res.ok) throw new Error("Login failed");
        const data = await res.json();
        setToken(data.token);
        safeLocalStorage.setItem('cinesins_token', data.token);
        await refreshProfiles();
    };

    const register = async (email: string, pass: string) => {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass })
        });
        if (!res.ok) throw new Error("Registration failed");
        await login(email, pass);
    };

    const logout = () => {
        setToken(null);
        setActiveProfile(null);
        safeLocalStorage.removeItem('cinesins_token');
        safeLocalStorage.removeItem('cinesins_active_profile');
        // We might want to clear other profile-specific data too
    };

    const switchProfile = async (id: string) => {
        const profile = profiles.find(p => p.id === id);
        if (profile) {
            setActiveProfile(profile);
            safeLocalStorage.setItem('cinesins_active_profile', id);

            // Sync profile data (Watchlist, Reviews)
            if (token) {
                try {
                    const wlRes = await fetch(`${BASE_URL}/actions/${id}/watchlist`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (wlRes.ok) {
                        const wlData = await wlRes.json();
                        const formattedWl = wlData.map((d: any) => ({ ...d.movieId, id: d.movieId._id }));
                        safeLocalStorage.setItem(`${id}_watchlist`, JSON.stringify(formattedWl));
                    }

                    const revRes = await fetch(`${BASE_URL}/actions/${id}/reviews`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (revRes.ok) {
                        const revData = await revRes.json();
                        const formattedRev = revData.map((d: any) => ({
                            id: d.movieId._id || d.movieId,
                            rating: d.rating,
                            text: d.reviewText,
                            title: d.movieId.title,
                            poster: d.movieId.poster,
                            date: d.createdAt
                        }));
                        safeLocalStorage.setItem(`${id}_reviews`, JSON.stringify(formattedRev));
                    }
                } catch (e) {
                    console.error("Profile sync failed", e);
                }
            }
        }
    };

    const createProfile = async (name: string) => {
        if (!token) return null;
        const res = await fetch(`${BASE_URL}/profiles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name })
        });
        if (res.ok) {
            await refreshProfiles();
            // The newest profile should be in the updated profiles list
            // Logic to find and return it could be added if needed
            return null;
        }
        return null;
    };

    return (
        <AuthContext.Provider value={{
            token, activeProfile, profiles, isLoading,
            login, register, logout, switchProfile, createProfile, refreshProfiles
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
