'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SinLine } from '@/components/SinLine';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { DecisionModal } from '@/components/DecisionModal';

export default function SinLinePage() {
    const { activeProfile, isLoading } = useAuth();
    const router = useRouter();
    const [isDecisionOpen, setIsDecisionOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !activeProfile) {
            router.push('/');
        }
    }, [activeProfile, isLoading, router]);

    if (isLoading || !activeProfile) return null;

    return (
        <main className="min-h-screen pb-20 pt-20">
            <Header onOpenDecision={() => setIsDecisionOpen(true)} />
            <SinLine />
            <DecisionModal isOpen={isDecisionOpen} onClose={() => setIsDecisionOpen(false)} />
        </main>
    );
}
