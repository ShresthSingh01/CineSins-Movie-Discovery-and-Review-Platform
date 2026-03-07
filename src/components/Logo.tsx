import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export const Logo = ({ size = 40 }: { size?: number }) => {
    const { activeProfile } = useAuth();
    const homeLink = activeProfile ? '/dashboard' : '/';

    return (
        <Link href={homeLink} className="logo-container" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-vibe" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <svg className="brand-logo" width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M75 25C75 10 30 15 30 35C30 55 70 45 70 70C70 90 25 85 25 75" stroke="url(#logo_grad_s)"
                        strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                        <linearGradient id="logo_grad_s" x1="25" y1="15" x2="75" y2="85" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#8b5cf6" />
                            <stop offset="1" stopColor="#db2777" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '0.9' }}>
                <div style={{ fontFamily: 'var(--font-outfit), sans-serif', fontWeight: 900, fontSize: `${size * 0.04}rem`, letterSpacing: '-1px', color: '#fff' }}>
                    CINE<span style={{ color: '#a855f7' }}>SINS</span>
                </div>
                <div style={{ fontSize: '0.55rem', color: '#888', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700, marginTop: '2px' }}>
                    GUILTY PLEASURES. UNMASKED.
                </div>
            </div>
        </Link>
    );
};
