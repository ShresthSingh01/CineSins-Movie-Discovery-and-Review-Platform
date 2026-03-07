'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { safeLocalStorage } from '@/lib/storage';

interface Post {
    id: string;
    author: { name: string; avatar: string };
    timestamp: number;
    content: string;
    likes: number;
    comments: number;
}

export const SinLine = () => {
    const { activeProfile } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostContent, setNewPostContent] = useState('');

    useEffect(() => {
        const stored = safeLocalStorage.getItem('cinesins_sinline_posts');
        if (stored) {
            setPosts(JSON.parse(stored));
        } else {
            // Seed mock data
            const mockPosts = [
                {
                    id: "post_1",
                    author: { name: "CinePhile_99", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=CinePhile_99" },
                    timestamp: Date.now() - 7200000,
                    content: "Dune 2 is just Spicy Star Wars with better sound design. Fight me.",
                    likes: 42,
                    comments: 12
                },
                {
                    id: "post_2",
                    author: { name: "SarahsWatch", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=SarahsWatch" },
                    timestamp: Date.now() - 259200000,
                    content: "Saltburn: Masterpiece or Mess? 🛁",
                    likes: 134,
                    comments: 56
                }
            ];
            setPosts(mockPosts);
            safeLocalStorage.setItem('cinesins_sinline_posts', JSON.stringify(mockPosts));
        }
    }, []);

    const handlePost = () => {
        if (!newPostContent.trim() || !activeProfile) return;

        const post: Post = {
            id: `post_${Date.now()}`,
            author: {
                name: activeProfile.name,
                avatar: activeProfile.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${activeProfile.name}`
            },
            timestamp: Date.now(),
            content: newPostContent,
            likes: 0,
            comments: 0
        };

        const updated = [post, ...posts];
        setPosts(updated);
        safeLocalStorage.setItem('cinesins_sinline_posts', JSON.stringify(updated));
        setNewPostContent('');
    };

    return (
        <section id="sinline" className="container py-10">
            <div className="mb-12">
                <h1 className="text-5xl font-black tracking-tight mb-2">
                    THE <span className="text-gradient-animate">SIN-LINE</span>
                </h1>
                <p className="text-slate-400 text-lg">Where cinephiles confess their hottest takes. Join the feed.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    {/* Create Post */}
                    <div className="overview-card-wrapper p-8 bg-[#121214]">
                        <div className="flex gap-4">
                            <div className="shrink-0">
                                <img
                                    src={activeProfile?.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${activeProfile?.name || 'guest'}`}
                                    className="w-12 h-12 rounded-full border border-white/10"
                                    alt="Avatar"
                                />
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    placeholder="Drop a cinematic sin..."
                                    className="w-full bg-transparent border-none text-white text-lg outline-none placeholder:text-slate-600 min-h-[80px] resize-none mb-4"
                                />
                                <div className="flex-between">
                                    <div className="flex gap-4 text-slate-500 text-sm">
                                        <button className="hover:text-white transition-colors"><i className="far fa-image"></i></button>
                                        <button className="hover:text-white transition-colors"><i className="far fa-smile"></i></button>
                                    </div>
                                    <button
                                        onClick={handlePost}
                                        className="bg-white text-black font-black px-8 py-2.5 rounded-full text-sm hover:scale-105 transition-transform"
                                    >
                                        Post Confession
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feed */}
                    <div className="space-y-6">
                        {posts.map(post => (
                            <div key={post.id} className="overview-card-wrapper p-8 bg-[#121214] hover:border-white/10 transition-colors">
                                <div className="flex gap-4 mb-6">
                                    <img src={post.author.avatar} className="w-10 h-10 rounded-full border border-white/5" alt={post.author.name} />
                                    <div>
                                        <p className="font-black text-white">{post.author.name}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">
                                            {new Date(post.timestamp).toLocaleDateString()} • {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-lg leading-relaxed text-slate-200">{post.content}</p>
                                <div className="flex gap-8 mt-8 pt-6 border-t border-white/5 text-slate-500 text-sm font-bold">
                                    <button className="flex items-center gap-2 hover:text-white transition-colors">
                                        <i className="far fa-heart"></i> {post.likes}
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-white transition-colors">
                                        <i className="far fa-comment"></i> {post.comments}
                                    </button>
                                    <button className="flex items-center gap-2 hover:text-white transition-colors ml-auto">
                                        <i className="far fa-share-square"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    {/* Trending Sidebar */}
                    <div className="overview-card-wrapper p-8 bg-[#121214]">
                        <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white mb-6">
                            <i className="fas fa-fire text-amber-500"></i> Trending Sins
                        </h4>
                        <div className="space-y-6">
                            <div className="group cursor-pointer">
                                <p className="text-[10px] font-black uppercase text-slate-500 mb-1 group-hover:text-amber-500 transition-colors">1 • Movies • Trending</p>
                                <p className="font-bold text-white group-hover:underline">Dune: Part Two</p>
                            </div>
                            <div className="group cursor-pointer">
                                <p className="text-[10px] font-black uppercase text-slate-500 mb-1 group-hover:text-amber-500 transition-colors">2 • Discourse</p>
                                <p className="font-bold text-white group-hover:underline">"Overrated" Masterpieces</p>
                            </div>
                        </div>
                        <button className="w-full mt-8 py-3 rounded-xl border border-white/5 hover:bg-white/5 text-xs font-black uppercase tracking-widest transition-colors mb-2">
                            Explore All Topics
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
