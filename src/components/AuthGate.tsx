'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Logo } from './Logo';

export const AuthGate = () => {
    const { profiles, isLoading, switchProfile, createProfile, activeProfile, token, login, register } = useAuth();
    const [newName, setNewName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [authError, setAuthError] = useState('');

    if (isLoading) {
        return (
            <div className="auth-gate-loading" style={{
                position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: '#050508', zIndex: 999999
            }}>
                <div className="loader"></div>
            </div>
        );
    }

    if (activeProfile) return null;

    // Login/Register View if no token
    if (!token) {
        const handleAuth = async (e: React.FormEvent) => {
            e.preventDefault();
            setAuthError('');
            try {
                if (isRegistering) await register(email, password);
                else await login(email, password);
            } catch (err: any) {
                setAuthError(err.message || 'Authentication failed');
            }
        };

        return (
            <div id="auth-gate" style={{
                display: 'flex', position: 'fixed', inset: 0, alignItems: 'center',
                justifyContent: 'center', zIndex: 999999,
                background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, #050508 80%)',
                backdropFilter: 'blur(20px)'
            }}>
                <div style={{
                    maxWidth: '400px', width: '90%', padding: '40px', textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.1)', background: '#121214',
                    borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.8)'
                }}>
                    <Logo size={50} />
                    <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.8rem', margin: '20px 0', color: '#fff' }}>
                        {isRegistering ? 'Create Account' : 'Welcome Back'}
                    </h2>

                    <form onSubmit={handleAuth} style={{ textAlign: 'left' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: '#888', marginBottom: '5px', textTransform: 'uppercase' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #222', borderRadius: '8px', color: '#fff' }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: '#888', marginBottom: '5px', textTransform: 'uppercase' }}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '12px', background: '#000', border: '1px solid #222', borderRadius: '8px', color: '#fff' }}
                                required
                            />
                        </div>
                        {authError && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '15px' }}>{authError}</p>}

                        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontWeight: 'bold' }}>
                            {isRegistering ? 'Register' : 'Login'}
                        </button>
                    </form>

                    <p style={{ marginTop: '20px', color: '#888', fontSize: '0.9rem' }}>
                        {isRegistering ? 'Already have an account?' : "Don't have an account?"} {' '}
                        <span
                            onClick={() => setIsRegistering(!isRegistering)}
                            style={{ color: '#8b5cf6', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {isRegistering ? 'Login' : 'Register'}
                        </span>
                    </p>
                </div>
            </div>
        );
    }

    // Profile Selection View if logged in but no active profile
    return (
        <div id="auth-gate" style={{
            display: 'flex', position: 'fixed', inset: 0, alignItems: 'center',
            justifyContent: 'center', zIndex: 999999,
            background: 'radial-gradient(circle at center, rgba(184, 107, 62, 0.2) 0%, rgba(5, 5, 8, 0.98) 70%)',
            backdropFilter: 'blur(20px)'
        }}>
            <div style={{
                maxWidth: '500px', width: '90%', padding: '40px', textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.1)', background: '#121214',
                borderRadius: '20px', boxShadow: '0 30px 60px rgba(0,0,0,0.8)'
            }}>
                <Logo size={60} />
                <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '2rem', marginBottom: '30px', color: '#fff' }}>
                    Who is watching?
                </h2>

                <div id="profiles-list" style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '20px', marginBottom: '30px', maxHeight: '400px', overflowY: 'auto'
                }}>
                    {profiles.map(p => (
                        <div
                            key={p.id}
                            onClick={() => switchProfile(p.id)}
                            className="profile-item"
                            style={{ cursor: 'pointer', transition: '0.3s' }}
                        >
                            <img
                                src={p.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${p.name}`}
                                alt={p.name}
                                style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px', border: '2px solid transparent' }}
                                onMouseOver={(e) => (e.currentTarget as HTMLImageElement).style.borderColor = '#8b5cf6'}
                                onMouseOut={(e) => (e.currentTarget as HTMLImageElement).style.borderColor = 'transparent'}
                            />
                            <p style={{ color: '#fff', fontSize: '0.9rem' }}>{p.name}</p>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', textAlign: 'left' }}>
                    <p style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 700 }}>
                        Add New Profile
                    </p>
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter name"
                        style={{
                            width: '100%', padding: '14px', borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)',
                            color: '#fff', marginBottom: '12px'
                        }}
                    />
                    <button
                        onClick={() => { if (newName) createProfile(newName); setNewName(''); }}
                        style={{
                            width: '100%', padding: '14px', background: '#6d28d9', color: '#fff',
                            border: 'none', borderRadius: '8px', fontWeight: 800,
                            textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer'
                        }}
                    >
                        Create Profile
                    </button>
                </div>
            </div>
        </div>
    );
};
