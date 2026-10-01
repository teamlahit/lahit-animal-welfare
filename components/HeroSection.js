'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Phone } from 'lucide-react';
import Image from 'next/image';
import Container from './ui/Container';
import Button from './ui/Button';
import { getClientJson } from '@/lib/client-fetch';

const heroSlides = [
  {
    src: '/images/rescue-hero-v2.webp',
    alt: 'A LAHIT volunteer caring for a rescued dog in Uttarakhand',
  },
  {
    src: '/images/rescue-hero-v3.webp',
    alt: 'Volunteers caring for rescued dogs in Uttarakhand',
  },
  {
    src: '/images/rescue-hero-v5.webp',
    alt: 'A veterinarian examining a rescued dog during a clinic check-up',
  },
  {
    src: '/images/rescue-hero-v6.webp',
    alt: 'Veterinary staff providing medical treatment to a rescued animal',
  },
];

export default function HeroSection() {
  const [stats, setStats] = useState({ animalsRescued: 0, volunteers: 0 });
  const [slides, setSlides] = useState(heroSlides);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    getClientJson('/api/stats')
      .then((data) => { if (data.success) setStats(data.data); })
      .catch(() => {});

    getClientJson('/api/media/homepage')
      .then((data) => {
        if (data.success && data.data.heroConfigured) {
          setSlides(data.data.hero.map((item) => ({
            src: item.url,
            alt: item.alt || 'LAHIT animal rescue',
          })));
          setCurrent(0);
        } else if (data.success && data.data.hero.length > 0) {
          setSlides(data.data.hero.map((item) => ({
            src: item.url,
            alt: item.alt || 'LAHIT animal rescue',
          })));
          setCurrent(0);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length === 0) return undefined;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  const heroStats = [
    { value: `${Number(stats.animalsRescued || 0).toLocaleString()}+`, label: 'lives rescued' },
    { value: `${Number(stats.volunteers || 0).toLocaleString()}+`, label: 'active volunteers' },
  ];
  return (
    <section id="home" className="relative h-[100dvh] min-h-0 max-h-[100dvh] overflow-hidden bg-primary text-white">
      <div className="absolute inset-0">
        {slides.length > 0 && <motion.div
          key={slides[current].src}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={slides[current].src}
            alt={slides[current].alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[72%_center] sm:object-[68%_center]"
          />
        </motion.div>}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,28,19,0.48)_0%,rgba(4,28,19,0.435)_38%,rgba(4,28,19,0.12)_72%,rgba(4,28,19,0.06)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(4,28,19,0.45)_0%,transparent_40%)]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#fff_0.7px,transparent_0.7px)] [background-size:7px_7px]" />
      <div className="hero-grid pointer-events-none absolute inset-0" />

      <Container className="hero-viewport-container relative z-10 flex h-full min-h-0 flex-col pt-28 pb-24 sm:pt-36 lg:pt-44 lg:pb-5">
        <div className="hero-main-content my-auto max-w-4xl py-8 sm:pb-16 lg:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="eyebrow mb-5 text-accent sm:mb-7"
          >
            Animal rescue · Uttarakhand
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.08 }}
            aria-label="Every life deserves a rescue."
            className="display-title hero-display-title max-w-4xl uppercase text-[3.15rem] min-[380px]:text-[3.55rem] sm:text-[5.7rem]"
          >
            {['Every life', 'deserves', 'a rescue.'].map((line, index) => (
              <span key={line} className="hero-title-line">
                <motion.span
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.75, delay: 0.16 + index * 0.11, ease: [0.22, 1, 0.36, 1] }}
                  className={index === 1 ? 'block text-accent' : 'block'}
                  aria-hidden="true"
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.25 }}
            className="mt-6 flex max-w-3xl flex-col gap-5 border-t border-white/25 pt-5 sm:mt-8 sm:gap-7 sm:pt-7 lg:flex-row lg:items-end lg:justify-between"
          >
            <p className="max-w-xl text-sm leading-relaxed text-white/78 sm:text-lg">
              LAHIT brings emergency rescue, treatment, feeding and adoption together—so animals in distress get a real second chance.
            </p>
            <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex sm:gap-3">
              <Button href="#emergency" variant="accent" size="lg" icon={Phone}>
                <span className="sm:hidden">Report</span><span className="hidden sm:inline">Report a rescue</span>
              </Button>
              <Button href="#donate" variant="accent" size="lg" icon={Heart}>
                Donate now
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.45 }}
          className="hero-impact-stats mt-12 border-t border-white/20 pt-5 sm:mt-16 sm:pt-6 lg:absolute lg:inset-x-10 lg:bottom-5 lg:mt-0"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <span className="eyebrow text-[0.64rem] text-white/55">Our impact</span>
          <div className="grid grid-cols-2 gap-5 sm:min-w-[24rem] sm:gap-8">
              {heroStats.map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-2 border-l border-white/20 pl-4 first:border-l-0 first:pl-0">
                  <p className="text-xl font-black tracking-[-0.06em] text-accent sm:text-3xl">{stat.value}</p>
                  <p className="text-[0.56rem] font-semibold uppercase leading-tight tracking-[0.08em] text-white/55 sm:max-w-20 sm:text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
