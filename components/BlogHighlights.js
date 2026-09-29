'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, BookOpen, Loader2 } from 'lucide-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import { getClientJson } from '@/lib/client-fetch';

export default function BlogHighlights() {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await getClientJson('/api/blogs');
        if (data.success) {
          setAllPosts(data.data);
        }
      } catch (error) {
        console.error('Error loading blog highlights:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  function handleImageError(id) {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  }

  const featured = allPosts[0];
  const rest = allPosts.slice(1, 3);
  return (
<section id="blogs" className="section-padding bg-base-100">
      <Container>
        <div className="mb-10 text-center sm:mb-14">
          <h2 className="mb-4 text-[2rem] font-bold tracking-[-0.04em] text-primary sm:text-4xl lg:text-5xl">
            Blogs
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-primary/70">
            Rescue stories, medical updates, feeding drives, adoption news, and community moments from LAHIT.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : allPosts.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-primary/20 bg-primary/5 p-10 text-center text-primary/60">
            No blogs published yet.
          </div>
        ) : (
          <div className="space-y-8">
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="group overflow-hidden rounded-[1.75rem] border border-primary/10 bg-base-200 shadow-[0_14px_40px_rgba(11,51,36,0.06)] lg:grid lg:grid-cols-[1.15fr_0.85fr]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-primary/8 lg:aspect-auto">
                  {featured.coverImage && !imageErrors[featured._id] ? (
                    <Image
                      src={featured.coverImage}
                      alt={featured.title}
                      fill
                      sizes="(max-width: 1023px) 100vw, 55vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={() => handleImageError(featured._id)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-16 w-16 text-primary/25" />
                    </div>
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.1em] text-primary">
                    {featured.category || 'Field Note'}
                  </span>
                </div>
                <div className="p-6 lg:flex lg:flex-col lg:justify-center lg:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary/45">
                    {new Date(featured.createdAt).toLocaleDateString()}
                  </p>
                  <h3 className="mt-3 text-2xl font-black tracking-[-0.045em] text-primary sm:text-3xl lg:text-4xl">
                    {featured.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-primary/58 sm:line-clamp-4">
                    {featured.excerpt}
                  </p>
                  <span className="mt-6 flex items-center justify-between border-t border-primary/10 pt-5 text-sm font-bold text-primary">
                    Read blog
                    <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                {rest.map((post) => (
                  <Link
                    key={post._id}
                    href={`/blog/${post.slug}`}
                    className="group overflow-hidden rounded-[1.75rem] border border-primary/10 bg-base-200 shadow-[0_14px_40px_rgba(11,51,36,0.06)] transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-primary/8">
                      {post.coverImage && !imageErrors[post._id] ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={() => handleImageError(post._id)}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-10 w-10 text-primary/25" />
                        </div>
                      )}
                      <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.1em] text-primary">
                        {post.category || 'Field Note'}
                      </span>
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary/45">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                      <h3 className="mt-3 text-2xl font-black tracking-[-0.045em] text-primary">
                        {post.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-primary/58">
                        {post.excerpt}
                      </p>
                      <span className="mt-6 flex items-center justify-between border-t border-primary/10 pt-5 text-sm font-bold text-primary">
                        Read blog
                        <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && allPosts.length > 0 && (
          <div className="mt-12 text-center">
            <Button href="/blog" variant="outline" size="lg" icon={ArrowUpRight}>
              View More
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
