'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, BookOpen, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Container from '@/components/ui/Container';
import PublicSiteGate from '@/components/PublicSiteGate';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => { if (data.success) setPosts(data.data); })
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(posts.map((post) => post.category || 'General'))];
  const visiblePosts = activeCategory === 'All' ? posts : posts.filter((post) => (post.category || 'General') === activeCategory);

  function handleImageError(id) {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  }

  return (
    <PublicSiteGate><main className="public-page min-h-screen bg-base-200">
      <Navbar />
      <section className="bg-primary pt-32 pb-14 text-white sm:pt-40 sm:pb-20 lg:pt-48 lg:pb-28">
        <Container>
          <span className="eyebrow text-accent">LAHIT blogs</span>
          <h1 className="display-title mt-5 max-w-5xl text-[2.9rem] uppercase sm:mt-7 sm:text-8xl lg:text-9xl">Rescue, recovery and community.</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/62 sm:mt-8 sm:text-lg">Browse all LAHIT updates by category, including rescue stories, medical updates, feeding drives, adoption, and volunteer events.</p>
        </Container>
      </section>
      <section className="section-padding">
        <Container>
          {loading ? (
            <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="admin-empty bg-base-100"><BookOpen className="h-8 w-8" /><p>Blogs are coming soon.</p></div>
          ) : (
            <>
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {['All', ...categories].map((category) => (
                <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${activeCategory === category ? 'bg-primary text-white' : 'border border-primary/15 bg-base-100 text-primary hover:bg-primary/5'}`}>
                  {category}
                </button>
              ))}
            </div>
            {visiblePosts.length === 0 ? (
              <div className="admin-empty bg-base-100"><BookOpen className="h-8 w-8" /><p>No blogs in this category yet.</p></div>
            ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visiblePosts.map((post) => (
                <Link key={post._id} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-[1.75rem] border border-primary/10 bg-base-100 shadow-[0_14px_50px_rgba(11,51,36,0.06)]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-primary/8">
                    {post.coverImage && !imageErrors[post._id] ? (
                      <Image src={post.coverImage} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" onError={() => handleImageError(post._id)} />
                    ) : (
                      <div className="flex h-full items-center justify-center"><BookOpen className="h-10 w-10 text-primary/25" /></div>
                    )}
                    <span className="absolute top-4 left-4 rounded-full bg-accent px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.1em] text-primary">{post.category}</span>
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary/38">{new Date(post.createdAt).toLocaleDateString()}</p>
                    <h2 className="mt-3 text-2xl font-black tracking-[-0.045em] text-primary">{post.title}</h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-primary/58">{post.excerpt}</p>
                    <span className="mt-6 flex items-center justify-between border-t border-primary/10 pt-5 text-sm font-bold text-primary">Read blog <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              ))}
            </div>
            )}
            </>
          )}
        </Container>
      </section>
      <Footer />
    </main></PublicSiteGate>
  );
}
