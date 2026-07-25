'use client';

import { useLocale } from 'next-intl';
import { useCeoAnatomyStore } from '@/store/useCeoAnatomyStore';
import { useEffect } from 'react';
import { CeoLayout } from '@/components/ceo/CeoLayout';

export default function CeoPage() {
  const locale = useLocale();
  const setLocale = useCeoAnatomyStore((s) => s.setLocale);

  useEffect(() => {
    setLocale(locale as 'en' | 'ar');
  }, [locale, setLocale]);

  return (
    <main className="h-screen w-screen overflow-hidden bg-gray-950">
      <CeoLayout />
    </main>
  );
}
