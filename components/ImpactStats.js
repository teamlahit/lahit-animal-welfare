'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Heart, Home, Stethoscope, Utensils } from 'lucide-react';
import Container from './ui/Container';
import { getClientJson } from '@/lib/client-fetch';

const iconMap = { Heart, Utensils, Stethoscope, Home };
const marqueeLabels = ['Rescue', 'Recover', 'Rehome', 'Repeat',];

function AnimatedCounter({ value, suffix = '', start }) {
  const [count, setCount] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!start) return;

    const target = Math.max(0, Number(value) || 0);
    let frame;

    if (reduceMotion || target === 0) {
      frame = window.requestAnimationFrame(() => setCount(target));
      return () => window.cancelAnimationFrame(frame);
    }

    const duration = 1200;
    const startedAt = performance.now();

    const updateCount = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * easedProgress));

      if (progress < 1) frame = window.requestAnimationFrame(updateCount);
    };

    frame = window.requestAnimationFrame(updateCount);
    return () => window.cancelAnimationFrame(frame);
  }, [reduceMotion, start, value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function ImpactStats() {
  const [stats, setStats] = useState(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getClientJson('/api/stats');
        if (!data.success) throw new Error(data.error || 'Unable to load statistics');
        setStats(data.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({
          animalsRescued: 0,
          mealsServed: 0,
          treatments: 0,
          adoptions: 0,
          citiesCovered: 0,
          volunteers: 0,
          partnerVets: 0,
          yearsActive: 0,
        });
      }
    }
    fetchStats();
  }, []);

  const impactStats = [
    { id: 1, value: stats?.animalsRescued || 0, suffix: '+', label: 'Animals rescued', icon: 'Heart' },
    { id: 2, value: stats?.mealsServed || 0, suffix: '+', label: 'Meals served', icon: 'Utensils' },
    { id: 3, value: stats?.treatments || 0, suffix: '+', label: 'Treatments funded', icon: 'Stethoscope' },
    { id: 4, value: stats?.adoptions || 0, suffix: '+', label: 'Forever homes', icon: 'Home' },
  ];

  const summaryStats = [
    [stats?.citiesCovered ?? 0, 'Cities covered'],
    [stats?.volunteers ?? 0, 'Volunteers'],
    ...(Number(stats?.partnerVets) > 0 ? [[stats.partnerVets, 'Partner vets']] : []),
    [stats?.yearsActive ?? 0, 'Years active'],
  ];
  const summaryColumns = summaryStats.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

  return (
    <section id="about" className="section-padding overflow-hidden bg-base-100" ref={sectionRef}>
      <div className="impact-marquee mb-16 border-y border-primary/10 py-4 sm:mb-24" aria-hidden="true">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 24, ease: 'linear', repeat: Infinity }}
          className="impact-marquee-track flex w-max whitespace-nowrap text-[0.62rem] font-black uppercase tracking-[0.22em] text-primary/45 sm:text-xs"
        >
          {Array.from({ length: 5 }).map((_, groupIndex) => (
            <div key={groupIndex} className="impact-marquee-group flex shrink-0 items-center gap-7 pr-7 sm:gap-10 sm:pr-10">
              {marqueeLabels.map((label) => (
                <span key={`${groupIndex}-${label}`} className="inline-flex shrink-0 items-center gap-7 sm:gap-10">
                  {label}<span className="text-secondary">✳</span>
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
      <Container>
        <div className="grid gap-10 border-b border-primary/15 pb-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:pb-16">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <span className="eyebrow text-secondary">Built on action</span>
            <p className="mt-5 text-sm font-bold uppercase tracking-[0.12em] text-primary/45">Our impact / 2020—today</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.08 }}>
            <h2 className="display-title text-[2.75rem] uppercase text-primary sm:text-6xl lg:text-7xl">
              Compassion is only powerful when it <span className="text-secondary">moves.</span>
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4">
          {impactStats.map((stat, index) => {
            const Icon = iconMap[stat.icon];
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.12 + index * 0.08 }}
                className="group border-b border-primary/15 px-3 py-7 odd:border-r sm:px-7 lg:border-r lg:border-b-0 lg:py-12 lg:odd:border-r first:pl-0 last:border-r-0"
              >
                <div className="mb-6 flex items-center justify-between sm:mb-10">
                  <span className="text-xs font-black tracking-[0.16em] text-primary/35">0{index + 1}</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/15 transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="text-[1.7rem] font-black tracking-[-0.06em] text-primary min-[380px]:text-3xl sm:text-5xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} start={isInView} />
                </p>
                <p className="mt-2 text-[0.62rem] font-bold uppercase leading-tight tracking-[0.08em] text-primary/55 sm:mt-3 sm:text-sm">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 grid overflow-hidden rounded-[1.5rem] bg-primary text-white sm:mt-14 sm:rounded-[2rem] lg:grid-cols-2"
        >
          <div className="p-6 sm:p-12 lg:p-16">
            <span className="eyebrow text-accent">Why LAHIT exists</span>
            <h3 className="mt-5 max-w-2xl text-[1.75rem] font-black tracking-[-0.045em] sm:mt-7 sm:text-5xl">No animal should be left behind because help was too far away.</h3>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/68 sm:text-lg">
              Our volunteer network connects reports, field responders, medical care and adopters across Uttarakhand. One coordinated path from crisis to safety.
            </p>
            <a href="#help" className="mt-9 inline-flex items-center gap-2 border-b border-accent pb-1 text-sm font-bold text-accent transition-gap hover:gap-3">
              Find your way to help <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <div className={`grid grid-cols-2 border-t border-white/15 lg:border-t-0 lg:border-l ${summaryColumns}`}>
            {summaryStats.map(([value, label], index) => {
              const mobileLastColumn = (index + 1) % 2 === 0;
              const mobileLastRow = index >= summaryStats.length - (summaryStats.length % 2 === 0 ? 2 : 1);
              const desktopColumns = summaryStats.length === 3 ? 3 : 2;
              const desktopLastColumn = (index + 1) % desktopColumns === 0;
              const desktopLastRow = index >= summaryStats.length - desktopColumns;

              return (
              <div
                key={label}
                className={`flex min-h-28 flex-col justify-end border-r border-b border-white/15 p-5 sm:min-h-44 sm:p-8 ${mobileLastColumn ? 'border-r-0' : ''} ${mobileLastRow ? 'border-b-0' : ''} ${desktopLastColumn ? 'lg:border-r-0' : 'lg:border-r'} ${desktopLastRow ? 'lg:border-b-0' : 'lg:border-b'}`}
              >
                <p className="text-3xl font-black tracking-[-0.06em] text-accent sm:text-4xl">{value}+</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-white/55">{label}</p>
              </div>
              );
            })}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
