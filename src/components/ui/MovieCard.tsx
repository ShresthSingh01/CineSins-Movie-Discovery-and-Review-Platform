"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, AlertTriangle, ShieldCheck, Eye } from 'lucide-react';
import { Movie } from '@/services/movieService';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { syncService } from '@/services/syncService';

interface MovieCardProps {
    movie: Movie;
    index?: number;
}

export const MovieCard = ({ movie, index = 0 }: MovieCardProps) => {
    const [consensus, setConsensus] = React.useState<{ agree: number, total: number, percentage?: number } | null>(null);
    const sinScore = movie.sinScore || 0;
    const isHighSin = sinScore > 300;

    React.useEffect(() => {
        const fetchConsensus = async () => {
            const data = await syncService.getCommunityConsensus(movie.id);
            setConsensus(data);
        };
        fetchConsensus();
    }, [movie.id]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: (index % 4) * 0.1 }}
            className="group relative"
        >
            <Link href={`/movie/${movie.id}`}>
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[32px] bg-secondary/30 border border-white/5 transition-all duration-700 group-hover:border-primary/50 group-hover:shadow-premium ring-offset-4 ring-offset-black group-hover:ring-1 ring-primary/20">

                    {/* Main Image */}
                    <Image
                        src={movie.poster}
                        alt={movie.title}
                        fill
                        className="object-cover transition-transform duration-[1500ms] group-hover:scale-110 group-hover:rotate-1"
                        unoptimized={true} // OMDb posters sometimes have domain issues with Next.js image optimization
                    />

                    {/* Floating Sin Badge */}
                    <div className={cn(
                        "absolute top-6 right-6 px-4 py-2 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase z-30 flex items-center gap-2 shadow-2xl backdrop-blur-md border animate-pulse",
                        isHighSin
                            ? "bg-primary/90 text-white border-primary-light/30"
                            : "bg-void/90 text-primary border-primary/30"
                    )}>
                        <AlertTriangle className="w-3 h-3" />
                        {sinScore} SINS
                    </div>

                    {/* Cinematic Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 z-10" />

                    {/* Hover Content */}
                    <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ y: 20 }}
                            whileHover={{ y: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-2">
                                <div className="h-[2px] w-8 bg-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Forensic Entry</span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black tracking-tighter text-white leading-[0.9] font-display mb-2">
                                    {movie.title.toUpperCase()}
                                </h3>
                                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                    {movie.Genre || 'Unknown Genre'} • {movie.Director || 'Unknown Director'}
                                </div>
                            </div>

                            <p className="text-sm font-medium text-white/70 line-clamp-4 leading-relaxed italic border-l-2 border-primary/30 pl-4 py-1">
                                {movie.oracleReason || movie.sinSentence || movie.plot || `Subject identified in the ${movie.year} cycle. High probability of cinematic deviation detected.`}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <div className="flex items-center gap-4 text-[10px] font-black tracking-widest text-white/40 uppercase">
                                    <span className="flex items-center gap-1 text-accent">
                                        <Star className="w-3 h-3 fill-accent" /> {movie.rating || 'N/A'}
                                    </span>
                                    <span>{movie.year}</span>
                                </div>
                                <div className="w-10 h-10 rounded-full glass flex items-center justify-center text-primary group/btn hover:bg-primary hover:text-white transition-all">
                                    <Eye size={16} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </Link>

            {/* Visual Indicator of Forensic Quality */}
            <div className="mt-6 flex items-center justify-between px-2">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] leading-none">Status</span>
                    <span className="text-xs font-black italic tracking-tighter text-white/60">
                        {consensus && consensus.total > 0 
                            ? `${consensus.percentage}% COMMUNITY AGREE` 
                            : 'Authenticating Evidence'}
                    </span>
                </div>
                <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={cn("w-1 h-3 rounded-full", i < 3 ? "bg-primary/40" : "bg-white/5")} />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
