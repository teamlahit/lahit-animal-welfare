'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Dog, Heart, LogIn, Menu, Siren, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Container from './ui/Container';
import { siteAssetUrl } from '@/lib/site-assets';

const navLinks = [
  { name: 'Our impact', href: '/#about' },
  { name: 'Adopt', href: '/#adoption' },
  { name: 'Stories', href: '/#stories' },
  { name: 'Volunteer', href: '/#volunteer' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollFrame = useRef(null);
  const pathname = usePathname();
  const useSolidNav = isScrolled || pathname !== '/';

  function scrollToSection(href) {
    if (!href.startsWith('/#')) return false;
    if (pathname !== '/') return false;
    const id = href.replace('/#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      return true;
    }
    return false;
  }

  useEffect(() => {
    const handleScroll = () => {
      if (scrollFrame.current !== null) return;

      scrollFrame.current = window.requestAnimationFrame(() => {
        const nextIsScrolled = window.scrollY > 40;
        setIsScrolled((current) => current === nextIsScrolled ? current : nextIsScrolled);
        scrollFrame.current = null;
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollFrame.current !== null) window.cancelAnimationFrame(scrollFrame.current);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="mobile-site-header fixed top-0 z-50">
        <Container
          size="xl"
          className={`site-nav-container relative min-w-0 !px-3 py-2.5 sm:!px-5 rounded-full border transition-[background-color,border-color,box-shadow,color] duration-200 sm:backdrop-blur-xl ${
            useSolidNav
              ? 'border-primary/10 bg-base-100 text-primary shadow-[0_12px_36px_rgba(11,51,36,0.12)] sm:bg-base-100/95'
              : 'border-white/20 bg-primary/90 text-white sm:bg-primary/25'
          }`}
        >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="LAHIT home">
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/30 bg-white shadow-sm sm:h-10 sm:w-10">
            <Image src={siteAssetUrl('/lahit.png')} alt="" fill sizes="40px" className="object-cover" priority />
            </span>
            <span className="leading-none">
              <span className="block text-lg font-black tracking-[-0.04em]">LAHIT ANIMAL WELFARE GROUP</span>
              <span className={`mt-1 hidden text-[0.55rem] font-bold uppercase tracking-[0.17em] sm:block ${useSolidNav ? 'text-primary/55' : 'text-white/55'}`}>
                Animal welfare
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={(e) => scrollToSection(link.href)} className={`text-[0.78rem] font-bold transition-colors ${useSolidNav ? 'text-primary/70 hover:text-primary' : 'text-white/72 hover:text-white'}`}>
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link href="/login/" className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-all hover:-translate-y-0.5 ${useSolidNav ? 'border-primary/15 text-primary hover:bg-primary/5' : 'border-white/25 text-white hover:bg-white/10'}`}>
              <LogIn className="h-4 w-4" /> Log in
            </Link>
            <Link href="/#donate" className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-bold transition-all hover:-translate-y-0.5 ${useSolidNav ? 'bg-primary text-white hover:bg-[#164a36]' : 'bg-accent text-primary hover:bg-white'}`}>
              <Heart className="h-4 w-4" /> Donate <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            className={`flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full border transition-colors duration-200 lg:hidden ${useSolidNav ? 'border-primary/15 bg-primary text-white' : 'border-white/25 bg-white/10 text-white'}`}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              id="mobile-navigation"
              initial={{ opacity: 0, y: -8, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.99 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mobile-navigation-panel absolute inset-x-0 top-[calc(100%+0.55rem)] origin-top overflow-x-hidden overflow-y-auto overscroll-contain rounded-[1.5rem] border border-white/10 bg-primary p-2.5 text-white shadow-2xl lg:hidden"
            >
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} onClick={(e) => { scrollToSection(link.href); setIsMobileMenuOpen(false); }} className="flex touch-manipulation items-center justify-between rounded-2xl px-4 py-3 font-semibold transition-colors duration-150 hover:bg-white/10 active:bg-white/10">
                  {link.name}<ArrowUpRight className="h-4 w-4 text-white/45" />
                </Link>
              ))}
              <Link href="/login/" onClick={() => setIsMobileMenuOpen(false)} className="mt-1.5 flex touch-manipulation items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3.5 font-bold text-white">
                <LogIn className="h-4 w-4" /> Log in to your workspace
              </Link>
              <Link href="/#donate" onClick={() => setIsMobileMenuOpen(false)} className="mt-1.5 flex touch-manipulation items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3.5 font-bold text-primary">
                <Heart className="h-4 w-4" /> Donate to the mission
              </Link>
            </motion.nav>
          )}
        </AnimatePresence>
        </Container>
      </header>

      <nav aria-label="Quick actions" className={`mobile-action-bar fixed inset-x-0 bottom-0 z-50 border-t border-primary/10 bg-base-100 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-8px_28px_rgba(11,51,36,0.12)] transition-[transform,opacity] duration-200 sm:bg-base-100/95 sm:backdrop-blur-xl lg:hidden ${isMobileMenuOpen ? 'pointer-events-none translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-2">
          <Link href="/#emergency" className="flex min-h-12 touch-manipulation flex-col items-center justify-center gap-0.5 whitespace-nowrap rounded-2xl bg-secondary text-[0.65rem] font-black uppercase tracking-[0.06em] text-white">
            <Siren className="h-4 w-4" /> Report
          </Link>
          <Link href="/#adoption" className="flex min-h-12 touch-manipulation flex-col items-center justify-center gap-0.5 whitespace-nowrap rounded-2xl bg-primary/7 text-[0.65rem] font-black uppercase tracking-[0.06em] text-primary">
            <Dog className="h-4 w-4" /> Adopt
          </Link>
          <Link href="/#donate" className="flex min-h-12 touch-manipulation flex-col items-center justify-center gap-0.5 whitespace-nowrap rounded-2xl bg-accent text-[0.65rem] font-black uppercase tracking-[0.06em] text-primary">
            <Heart className="h-4 w-4" /> Donate
          </Link>
        </div>
      </nav>
    </>
  );
}
