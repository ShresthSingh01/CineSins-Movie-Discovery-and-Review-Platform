"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/sections/Hero';
import { MovieCard } from '@/components/ui/MovieCard';
import { getTrendingMovies, Movie } from '@/services/movieService';
import { motion } from 'framer-motion';
import { Gavel, AlertTriangle, ShieldCheck, TrendingUp, Microscope, Sparkles, Book, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { syncService } from '@/services/syncService';
import { VerdictTicker } from '@/components/ui/VerdictTicker';
import { injectDemoData } from '@/lib/injectDemoData';

export default function Home() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start with demo state if in development
    injectDemoData();
    
    const fetchMovies = async () => {
      const data = await getTrendingMovies();
      setTrending(data);
      setLoading(false);
      
      // Trigger background sync of local findings to the global DB
      syncService.syncLocalVerdicts();
    };
    fetchMovies();
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-black">
      <Navbar />
      <main className="flex-1">
        <Hero />
        
        {/* Real-Time Community Ticker */}
        <VerdictTicker />

        {/* Forensic Feed Heading */}
        <section className="pt-32 pb-12 px-6 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-primary font-black tracking-widest text-[10px] uppercase mb-4">
              <Microscope className="w-4 h-4" /> THE FORENSIC FEED
            </div>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] font-display uppercase italic">
              WATCHING <span className="shimmer-text">NOW.</span>
            </h2>
          </div>
          <div className="flex flex-col items-end text-right">
            <div className="text-2xl font-black italic tracking-tighter text-white">Consensus Pending</div>
            <div className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mt-1">Live Evidence Streams</div>
          </div>
        </section>

        {/* Trending Grid */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-20">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] w-full bg-white/5 rounded-[32px] animate-pulse" />
              ))
            ) : (
              trending.map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} index={index} />
              ))
            )}
          </div>

          <div className="mt-20 text-center">
            <button className="glass px-12 py-5 rounded-2xl text-[10px] font-black tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all border border-white/10 group">
              Expand Database <TrendingUp className="inline-block ml-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* Forensic Lab Tools Section */}
        <section className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
          <div className="flex flex-col mb-20">
            <div className="flex items-center gap-2 text-primary font-black tracking-widest text-[10px] uppercase mb-4">
              <Sparkles className="w-4 h-4" /> THE FORENSIC ECOSYSTEM
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
              EQUIPPING THE <span className="shimmer-text">INVESTIGATOR.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              href="/oracle"
              icon={<Sparkles className="w-8 h-8" />}
              title="AI MOVIE FINDER"
              desc="Personalized movie matches based on your unique taste."
              tag="AI Finder"
            />
            <FeatureCard 
              href="/void"
              icon={<Search className="w-8 h-8" />}
              title="HALL OF SHAME"
              desc="The collective archive of movies that failed the audit."
              tag="Bad Movies"
            />
            <FeatureCard 
              href="/journal"
              icon={<Book className="w-8 h-8" />}
              title="MY MOVIE LOG"
              desc="Your history of reviews, reactions, and cinematic audits."
              tag="Personal"
            />
            <FeatureCard 
              href="/debates"
              icon={<Gavel className="w-8 h-8" />}
              title="COMMUNITY POLLS"
              desc="Vote on controversial movie sins with other users."
              tag="Social"
            />
          </div>
        </section>

        {/* Forensic Philosophy Section */}
        <section className="py-40 px-6 max-w-7xl mx-auto bg-transparent relative overflow-hidden">
          {/* Decorative Background Text */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[15rem] font-black text-white/[0.02] pointer-events-none select-none italic font-display -z-10 tracking-tighter">
            CINESINS.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-10 leading-[0.9] font-display">
                RATINGS ARE <br /><span className="text-primary italic">EXTINCT.</span>
              </h2>
              <p className="text-xl md:text-2xl text-white/60 leading-relaxed mb-12 uppercase tracking-tight">
                Stop boiling down cinematic masterpieces into meaningless stars. Score movies based on their forensic failures: plot-holes, logical lapses, and technical sins.
              </p>

              <div className="grid grid-cols-3 gap-8">
                <PhilosophyItem score="0-20" label="SINLESS" desc="Cinema Elite" color="text-primary" />
                <PhilosophyItem score="21-50" label="OFFENDER" desc="Minor Lapses" color="text-white/60" />
                <PhilosophyItem score="51+" label="CRIMINAL" desc="Void Bait" color="text-white/20" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-dark aspect-square rounded-[64px] border border-primary/20 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden group shadow-premium">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/20 transition-all duration-700" />
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/40 group-hover:scale-110 transition-transform shadow-premium">
                    <Gavel className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-4xl font-black mb-4 italic tracking-tighter">THE SIN ENGINE</h3>
                  <p className="text-white/40 text-sm font-bold uppercase tracking-widest max-w-[200px] mx-auto">Submit your first forensic note to begin.</p>
                </div>
                {/* Glowing Accent */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px] group-hover:bg-primary/40 transition-all" />
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="py-20 text-center border-t border-white/5 bg-void/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-10">
          <div className="text-3xl font-black tracking-[0.5em] text-white/20 uppercase font-display italic">CINESINS.</div>
          <nav className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-[10px] font-black tracking-widest uppercase text-white/40">
            <Link href="/about" className="hover:text-primary transition-colors">Audit Standards</Link>
            <Link href="/oracle" className="hover:text-primary transition-colors">AI Finder</Link>
            <Link href="/void" className="hover:text-primary transition-colors">Hall of Shame</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Data Privacy</Link>
          </nav>
          <div className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em]">
            &copy; 2026 CineSins Forensic Lab. All rights to criticism reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const FeatureCard = ({ href, icon, title, desc, tag }: { href: string, icon: React.ReactNode, title: string, desc: string, tag: string }) => (
  <Link href={href}>
    <div className="glass-dark p-10 rounded-[40px] border border-white/5 hover:border-primary/50 transition-all duration-500 group relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="px-3 py-1 bg-primary text-[8px] font-black uppercase tracking-widest rounded-full">{tag}</div>
      </div>
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-premium">
        {icon}
      </div>
      <h3 className="text-2xl font-black tracking-tighter mb-4 italic group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-white/40 font-bold leading-relaxed uppercase tracking-tighter mb-8 flex-1">{desc}</p>
      <div className="flex items-center gap-2 text-primary font-black text-[10px] tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
        Access Module <TrendingUp className="w-3 h-3" />
      </div>
      {/* Background Glow */}
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/20 transition-all" />
    </div>
  </Link>
);

const PhilosophyItem = ({ score, label, desc, color }: { score: string, label: string, desc: string, color: string }) => (
  <div className="flex flex-col group transition-transform hover:translate-y-[-5px]">
    <span className={cn("text-4xl font-black tracking-tighter leading-none mb-2", color)}>{score}</span>
    <span className="text-[10px] uppercase font-black text-white tracking-[0.2em]">{label}</span>
    <span className="text-[8px] uppercase font-bold text-white/20 tracking-[0.1em] mt-1">{desc}</span>
  </div>
);
