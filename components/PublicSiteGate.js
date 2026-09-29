'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Mail, Phone, Wrench } from 'lucide-react';
import { getClientJson } from '@/lib/client-fetch';

export default function PublicSiteGate({ children }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getClientJson('/api/settings')
      .then((data) => { if (data.success) setSettings(data.data); })
      .catch(() => {});
  }, []);

  if (!settings?.maintenanceMode) return children;

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-5 py-12 text-white">
      <div className="w-full max-w-xl text-center">
        <span className="relative mx-auto block h-20 w-20 overflow-hidden rounded-full border border-white/20 bg-white shadow-xl">
          <Image src="/lahit.png" alt="LAHIT" fill priority className="object-cover" />
        </span>
        <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-accent">
          <Wrench className="h-4 w-4" /> Brief maintenance
        </span>
        <h1 className="mt-6 text-4xl font-black tracking-[-0.055em] sm:text-6xl">We&apos;re improving the LAHIT website.</h1>
        <p className="mx-auto mt-5 max-w-lg leading-relaxed text-white/65">The public website will be back shortly. Animal rescue work continues during this update.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {settings.contactPhone && <a href={`tel:${settings.contactPhone}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-5 font-bold text-primary"><Phone className="h-4 w-4" /> Emergency call</a>}
          {settings.contactEmail && <a href={`mailto:${settings.contactEmail}`} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/20 px-5 font-bold text-white"><Mail className="h-4 w-4" /> Email LAHIT</a>}
        </div>
      </div>
    </main>
  );
}
