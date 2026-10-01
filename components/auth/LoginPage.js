'use client';

import { useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { siteAssetUrl } from '@/lib/site-assets';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) setError('Invalid email or password.');
      else {
        const session = await getSession();
        router.push(session?.user?.role === 'volunteer' ? '/candidate/' : '/admin/');
        router.refresh();
      }
    } catch {
      setError('Unable to sign in right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-primary lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <Image src={siteAssetUrl('/images/rescue-hero-v2.webp')} alt="LAHIT animal rescue in Uttarakhand" fill priority className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(4,28,19,0.92),rgba(4,28,19,0.28))]" />
        <div className="relative z-10 flex items-center gap-3"><span className="relative h-12 w-12 overflow-hidden rounded-full border border-white/25 bg-white"><Image src={siteAssetUrl('/lahit.png')} alt="LAHIT" fill className="object-cover" /></span><span><strong className="block text-xl tracking-[-0.04em]">LAHIT</strong><small className="font-bold uppercase tracking-[0.18em] text-white/50">Mission control</small></span></div>
        <div className="relative z-10 max-w-2xl"><span className="eyebrow text-accent">For the people who act</span><h1 className="display-title mt-7 text-6xl uppercase xl:text-8xl">Every update moves a life forward.</h1><p className="mt-7 max-w-lg text-lg leading-relaxed text-white/68">Manage rescue requests, animal profiles, volunteers, donations and public impact from one connected workspace.</p></div>
      </section>

      <section className="flex items-center justify-center bg-[#f3f0e8] px-5 py-12 sm:px-10"><div className="w-full max-w-md">
        <div className="mb-10 flex items-center gap-3 lg:hidden"><span className="relative h-11 w-11 overflow-hidden rounded-full bg-white"><Image src={siteAssetUrl('/lahit.png')} alt="LAHIT" fill className="object-cover" /></span><strong className="text-xl tracking-[-0.04em] text-primary">LAHIT</strong></div>
        <span className="admin-eyebrow">Secure workspace</span><h2 className="text-4xl font-black tracking-[-0.055em] text-primary sm:text-5xl">Welcome back.</h2><p className="mt-3 text-primary/52">Sign in to access your LAHIT workspace.</p>
        {error && <div className="mt-7 rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm font-semibold text-error">{error}</div>}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5"><label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-primary/55">Email</span><span className="relative block"><Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/35" /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-14 w-full rounded-2xl border border-primary/15 bg-white pr-4 pl-12 text-primary outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-primary/8" placeholder="you@example.com" required /></span></label><label className="block"><span className="mb-2 block text-xs font-black uppercase tracking-[0.1em] text-primary/55">Password</span><span className="relative block"><Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/35" /><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-14 w-full rounded-2xl border border-primary/15 bg-white pr-12 pl-12 text-primary outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-primary/8" placeholder="Enter your password" required /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></span></label><button type="submit" disabled={loading} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 font-bold text-white transition-colors hover:bg-[#164a36] disabled:opacity-50"><ShieldCheck className="h-5 w-5" /> {loading ? 'Signing in…' : 'Continue to workspace'}</button></form>
        <Link href="/admin/forgot/" className="mt-5 inline-flex text-sm font-bold text-primary/55 hover:text-primary">Forgot your password?</Link><Link href="/" className="mt-8 inline-flex text-sm font-bold text-primary/55 hover:text-primary">← Back to homepage</Link>
      </div></section>
    </main>
  );
}
