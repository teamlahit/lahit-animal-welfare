'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Dog, FileText, Heart, LayoutDashboard, LogOut, Menu, PawPrint, Send, Settings, Siren, User, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

const navItems = [
  { href: '/candidate/', label: 'Overview', icon: LayoutDashboard },
  { href: '/candidate/applications/', label: 'My applications', icon: PawPrint },
  { href: '/candidate/reports/', label: 'Rescue reports', icon: Siren },
  { href: '/candidate/profile/', label: 'My profile', icon: User },
];

function isCurrent(pathname, href) {
  return href === '/candidate/' ? pathname === '/candidate/' || pathname === '/candidate' : pathname.startsWith(href);
}

export default function CandidateShell({ children, user }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#ece9e1] lg:flex">
      {open && <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-primary/55 backdrop-blur-sm lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(272px,calc(100vw-1rem))] flex-col bg-primary text-white transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex min-h-24 items-center justify-between border-b border-white/10 px-6">
          <Link href="/candidate/" onClick={() => setOpen(false)} className="flex items-center gap-3">
            <span className="relative h-11 w-11 overflow-hidden rounded-full border border-white/20 bg-white"><Image src="/lahit.png" alt="LAHIT" fill className="object-cover" /></span>
            <span><span className="block text-xl font-black tracking-[-0.04em]">LAHIT</span><span className="block text-[0.58rem] font-bold uppercase tracking-[0.18em] text-white/45">Volunteer hub</span></span>
          </Link>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 lg:hidden"><X className="h-4 w-4" /></button>
        </div>

        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-white/40">Signed in as</p>
          <p className="mt-2 truncate font-bold">{user?.name || 'Volunteer'}</p>
          <p className="truncate text-xs text-white/50">{user?.email}</p>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[0.6rem] font-black uppercase tracking-[0.18em] text-white/35">Your workspace</p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return <li key={item.href}><Link href={item.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${isCurrent(pathname, item.href) ? 'bg-accent text-primary' : 'text-white/65 hover:bg-white/[0.07] hover:text-white'}`}><Icon className="h-[1.1rem] w-[1.1rem]" /><span>{item.label}</span></Link></li>;
            })}
          </ul>

          <p className="mb-3 mt-8 px-3 text-[0.6rem] font-black uppercase tracking-[0.18em] text-white/35">Quick actions</p>
          <ul className="space-y-1">
            <li><Link href="/animals/" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/65 transition-colors hover:bg-white/[0.07] hover:text-white"><Dog className="h-[1.1rem] w-[1.1rem]" /> Find an animal</Link></li>
            <li><Link href="/candidate/reports/new/" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/65 transition-colors hover:bg-white/[0.07] hover:text-white"><Send className="h-[1.1rem] w-[1.1rem]" /> Report an emergency</Link></li>
          </ul>
        </nav>

        <div className="border-t border-white/10 p-4">
          <button type="button" onClick={() => signOut({ callbackUrl: '/login/' })} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white"><LogOut className="h-[1.1rem] w-[1.1rem]" /> Sign out</button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:ml-[272px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-primary/10 bg-[#f8f6f0]/90 px-5 backdrop-blur sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => setOpen(true)} aria-label="Open navigation" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white lg:hidden"><Menu className="h-5 w-5" /></button><div className="min-w-0"><p className="truncate text-xs font-black uppercase tracking-[0.16em] text-secondary">Candidate workspace</p><h1 className="truncate text-lg font-black tracking-[-0.03em] text-primary sm:text-xl">Make every action count</h1></div></div>
          <Link href="/candidate/profile/" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-black text-white" aria-label="Open profile">{(user?.name || 'V').slice(0, 1).toUpperCase()}</Link>
        </header>
        <main className="mx-auto w-full max-w-[1280px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
