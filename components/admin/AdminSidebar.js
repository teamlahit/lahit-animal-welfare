'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Dog, FileText, Heart, Image as ImageIcon, LayoutDashboard, LogOut, PawPrint, Settings, Siren, User, Users, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

const menuGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/rescue-reports', label: 'Rescue inbox', icon: Siren },
      { href: '/admin/adoption-inquiries', label: 'Adoption inbox', icon: PawPrint },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/animals', label: 'Animals', icon: Dog },
      { href: '/admin/rescues', label: 'Rescue stories', icon: Heart },
      { href: '/admin/blogs', label: 'Blog', icon: FileText },
      { href: '/admin/media', label: 'Media library', icon: ImageIcon },
    ],
  },
  {
    label: 'Community & site',
    items: [
      { href: '/admin/volunteers', label: 'Volunteers', icon: Users },
      { href: '/admin/stats', label: 'Impact statistics', icon: BarChart3 },
      { href: '/admin/settings', label: 'Site settings', icon: Settings },
      { href: '/admin/profile', label: 'Profile', icon: User },
    ],
  },
];

export default function AdminSidebar({ open, onClose }) {
  const pathname = usePathname();
  const [newReportCount, setNewReportCount] = useState(0);
  const [newAdoptionCount, setNewAdoptionCount] = useState(0);

  const fetchReportCount = useCallback(async () => {
    try {
      const response = await fetch('/api/rescue-reports', { cache: 'no-store' });
      const data = await response.json();
      if (data.success) {
        setNewReportCount(data.data.filter((report) => report.status === 'new').length);
      }
    } catch {
      setNewReportCount(0);
    }
  }, []);

  const fetchAdoptionCount = useCallback(async () => {
    try {
      const response = await fetch('/api/adoption-inquiries', { cache: 'no-store' });
      const data = await response.json();
      if (data.success) setNewAdoptionCount(data.data.filter((inquiry) => inquiry.status === 'new').length);
    } catch {
      setNewAdoptionCount(0);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchReportCount, 0);
    const adoptionTimeoutId = window.setTimeout(fetchAdoptionCount, 0);
    window.addEventListener('rescue-reports-changed', fetchReportCount);
    window.addEventListener('adoption-inquiries-changed', fetchAdoptionCount);
    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(adoptionTimeoutId);
      window.removeEventListener('rescue-reports-changed', fetchReportCount);
      window.removeEventListener('adoption-inquiries-changed', fetchAdoptionCount);
    };
  }, [fetchAdoptionCount, fetchReportCount, pathname]);

  return (
    <>
      {open && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-primary/55 backdrop-blur-sm lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(280px,calc(100vw-1rem))] flex-col bg-primary text-white transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex min-h-24 items-center justify-between border-b border-white/10 px-6">
          <Link href="/admin" onClick={onClose} className="flex items-center gap-3">
            <span className="relative h-11 w-11 overflow-hidden rounded-full border border-white/20 bg-white">
              <Image src="/lahit.png" alt="LAHIT" fill className="object-cover" />
            </span>
            <span>
              <span className="block text-xl font-black tracking-[-0.04em]">LAHIT</span>
              <span className="block text-[0.58rem] font-bold uppercase tracking-[0.18em] text-white/48">Mission control</span>
            </span>
          </Link>
          <button type="button" onClick={onClose} aria-label="Close menu" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 lg:hidden"><X className="h-4 w-4" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          {menuGroups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="mb-2 px-3 text-[0.6rem] font-black uppercase tracking-[0.18em] text-white/35">{group.label}</p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link href={item.href} onClick={onClose} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${isActive ? 'bg-accent text-primary' : 'text-white/65 hover:bg-white/[0.07] hover:text-white'}`}>
                        <Icon className="h-[1.1rem] w-[1.1rem]" />
                        <span>{item.label}</span>
                        {item.href === '/admin/rescue-reports' && newReportCount > 0 && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[0.62rem] font-black text-white">
                            {newReportCount > 99 ? '99+' : newReportCount}
                          </span>
                        )}
                        {item.href === '/admin/adoption-inquiries' && newAdoptionCount > 0 && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[0.62rem] font-black text-white">
                            {newAdoptionCount > 99 ? '99+' : newAdoptionCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button onClick={() => signOut({ callbackUrl: '/' })} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white">
            <LogOut className="h-[1.1rem] w-[1.1rem]" /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
