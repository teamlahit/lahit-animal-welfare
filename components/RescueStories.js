'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Calendar, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import Container from './ui/Container';
import Card from './ui/Card';
import Button from './ui/Button';
import Image from 'next/image';
import Link from 'next/link';

function RescueCard({ story, index, featured = false }) {
  const isFeatured = featured;
  const [imgError, setImgError] = useState({ before: false, after: false });

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={isFeatured ? 'lg:col-span-2' : ''}
    >
      <Card hover={false} className={`rescue-story-card h-full group ${isFeatured ? 'lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:gap-5' : ''}`} padding="none">
        {/* Before/After Images */}
        <div className={`grid grid-cols-2 gap-1.5 p-3 sm:p-4 ${isFeatured ? 'lg:p-4' : ''}`}>
          <div className={`relative overflow-hidden rounded-xl ${isFeatured ? 'lg:aspect-[4/3]' : 'aspect-square'}`}>
            <div className="absolute top-2 left-2 z-10 rounded-full bg-primary/80 px-2 py-1 text-[0.6rem] font-black uppercase tracking-[0.1em] text-white backdrop-blur-sm">
              Before
            </div>
            {!imgError.before && story.beforeImage ? (
              <Image
                src={story.beforeImage}
                alt={`${story.name} before rescue`}
                fill
                sizes="(max-width: 639px) 48vw, (max-width: 1023px) 25vw, 28vw"
                className="rescue-story-image object-cover"
                onError={() => setImgError(prev => ({ ...prev, before: true }))}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-base-200 text-primary/40">
                <span className="text-xs font-semibold">Image unavailable</span>
              </div>
            )}
          </div>
          <div className={`relative overflow-hidden rounded-xl ${isFeatured ? 'lg:aspect-[4/3]' : 'aspect-square'}`}>
            <div className="absolute top-2 left-2 z-10 rounded-full bg-primary px-2 py-1 text-[0.6rem] font-black uppercase tracking-[0.1em] text-white backdrop-blur-sm">
              After
            </div>
            {!imgError.after && story.afterImage ? (
              <Image
                src={story.afterImage}
                alt={`${story.name} after recovery`}
                fill
                sizes="(max-width: 639px) 48vw, (max-width: 1023px) 25vw, 28vw"
                className="rescue-story-image object-cover"
                onError={() => setImgError(prev => ({ ...prev, after: true }))}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-base-200 text-primary/40">
                <span className="text-xs font-semibold">Image unavailable</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={`${isFeatured ? 'lg:flex lg:flex-col lg:justify-center lg:p-6' : ''} p-4 sm:p-6`}>
          {isFeatured && <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-[0.6rem] font-black uppercase tracking-[0.12em] text-primary">Featured rescue <span className="h-1.5 w-1.5 rounded-full bg-secondary" /></span>}
          <div className="flex items-center gap-4 mb-3 text-sm text-primary/60">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {story.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {story.date}
            </span>
          </div>

          <h3 className={`${isFeatured ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-xl'} mb-2 font-bold text-primary`}>
            Meet {story.name}
          </h3>
          <p className="text-primary/70 text-sm leading-relaxed mb-4">
            {story.story}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-base-300">
            <span className="badge badge-primary badge-outline">
              {story.type}
            </span>
            <Link href={`/rescues/${story._id}`} className="group/story flex items-center gap-2 text-sm font-bold text-primary">
              <span>Read Story</span>
              <span className="rescue-story-arrow flex h-8 w-8 items-center justify-center rounded-full border border-primary/15"><ArrowRight className="h-4 w-4" /></span>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function RescueStories() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const [rescues, setRescues] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRescues() {
      try {
        const res = await fetch('/api/rescues');
        const data = await res.json();
        if (data.success) {
          setRescues(data.data.slice(0, 2));
        } else {
          setError('Failed to load rescues');
        }
      } catch (err) {
        setError('Error loading rescues');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRescues();
    fetch('/api/blogs').then((res) => res.json()).then((data) => {
      if (data.success) setPosts(data.data.slice(0, 2));
    }).catch((err) => console.error('Error loading story updates:', err));
  }, []);

  return (
    <section id="stories" className="section-padding bg-base-200" ref={sectionRef}>
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="badge badge-secondary badge-outline badge-lg mb-4">
            Success Stories
          </span>
          <h2 className="mb-4 text-[2rem] font-bold tracking-[-0.04em] text-primary sm:text-4xl lg:text-5xl">
            Rescue & Community Stories
          </h2>
          <p className="text-lg text-primary/70 max-w-2xl mx-auto">
            Stories from our rescues, recovery work, medical care, feeding drives, and the community that makes it possible.
          </p>
        </motion.div>

        {/* Stories Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-primary/60">
            {error}
          </div>
        ) : rescues.length === 0 ? (
          <div className="text-center py-20 text-primary/60">
            No rescue stories available yet.
          </div>
        ) : (
          <div className="mb-10 grid gap-4 sm:mb-12 sm:gap-6 lg:grid-cols-2">
            {rescues.map((story, index) => (
              <RescueCard key={story._id || index} story={story} index={index} />
            ))}
          </div>
        )}

        {posts.length > 0 && (
          <div className="mt-12 border-t border-primary/10 pt-8 sm:mt-14 sm:pt-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="badge badge-secondary badge-outline mb-3">LAHIT updates</span>
                <h3 className="text-2xl font-bold tracking-[-0.04em] text-primary sm:text-3xl">Field notes & updates</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-primary/65">Follow the care, community work, and progress behind each rescue.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button href="/rescues" variant="outline" size="sm" icon={ArrowRight}>All rescue stories</Button>
                <Button href="/blog" variant="primary" size="sm" icon={ArrowRight}>All field updates</Button>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {posts.map((post) => (
                <Link key={post._id} href={`/blog/${post.slug}`} className="group flex min-w-0 overflow-hidden rounded-2xl border border-primary/10 bg-base-100 transition-transform hover:-translate-y-1">
                  <div className="relative hidden w-32 shrink-0 bg-primary/5 sm:block">
                    {post.coverImage ? <Image src={post.coverImage} alt={post.title} fill sizes="128px" className="object-cover" /> : <div className="flex h-full items-center justify-center"><BookOpen className="h-8 w-8 text-primary/25" /></div>}
                  </div>
                  <div className="min-w-0 p-5">
                    <span className="text-[0.65rem] font-black uppercase tracking-[0.1em] text-secondary">{post.category || 'General'}</span>
                    <h4 className="mt-2 text-xl font-bold text-primary">{post.title}</h4>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-primary/65">{post.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">Read update <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </Container>
    </section>
  );
}
