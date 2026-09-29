'use client';

import { useEffect, useState } from 'react';
import { getClientJson } from '@/lib/client-fetch';

const fallback = {
  contactEmail: 'contact@lahit.org',
  contactPhone: '',
  address: 'Dehradun, Uttarakhand, India',
};

export default function LegalContactDetails({ variant = 'privacy' }) {
  const [settings, setSettings] = useState(fallback);

  useEffect(() => {
    getClientJson('/api/settings')
      .then((data) => {
        if (data.success) {
          setSettings({ ...fallback, ...data.data });
        }
      })
      .catch(() => {});
  }, []);

  const email = settings.contactEmail || fallback.contactEmail;
  const phone = settings.contactPhone || '';
  const address = settings.address || fallback.address;

  if (variant === 'terms') {
    return (
      <>
        <p>These terms are intended to be governed by the laws of India, subject to any mandatory rights available to you. Questions about these terms can be sent to <a className="font-semibold underline decoration-primary/25 underline-offset-4" href={`mailto:${email}`}>{email}</a>.</p>
        <p className="rounded-2xl bg-primary/[0.04] p-4 text-sm"><strong>Contact details:</strong> {email}{phone && <> · {phone}</>} · {address}</p>
      </>
    );
  }

  return (
    <>
      <p>Questions or privacy requests: <a className="font-semibold underline decoration-primary/25 underline-offset-4" href={`mailto:${email}`}>{email}</a>.</p>
      <p className="rounded-2xl bg-primary/[0.04] p-4 text-sm"><strong>Contact details:</strong> {email}{phone && <> · {phone}</>} · {address}</p>
    </>
  );
}
