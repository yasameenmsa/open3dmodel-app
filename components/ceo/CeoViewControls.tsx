'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useCeoAnatomyStore } from '@/store/useCeoAnatomyStore';
import type { ViewPreset } from '@/types/anatomy';

export function CeoViewControls() {
  const t = useTranslations();
  const locale = useLocale();
  const setView = useCeoAnatomyStore((s) => s.setView);
  const resetView = useCeoAnatomyStore((s) => s.resetView);
  const zoomBy = useCeoAnatomyStore((s) => s.zoomBy);

  const presets: { id: ViewPreset; labelEn: string; labelAr: string }[] = [
    { id: 'front', labelEn: 'Front', labelAr: 'أمام' },
    { id: 'back', labelEn: 'Back', labelAr: 'خلف' },
    { id: 'right', labelEn: 'Right', labelAr: 'يمين' },
    { id: 'left', labelEn: 'Left', labelAr: 'يسار' },
    { id: 'top', labelEn: 'Top', labelAr: 'أعلى' },
    { id: 'iso', labelEn: 'Iso 3D', labelAr: 'مائل' },
  ];

  return (
    <>
      {/* Top Floating Preset Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 bg-gray-900/80 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl z-20 max-w-[calc(100vw-2rem)] overflow-x-auto">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => setView(p.id)}
            className="px-2.5 py-1 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap"
          >
            {locale === 'ar' ? p.labelAr : p.labelEn}
          </button>
        ))}
        <div className="w-px h-4 bg-white/20 mx-1" />
        <button
          onClick={resetView}
          className="px-2.5 py-1 text-xs font-medium text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors whitespace-nowrap"
        >
          {locale === 'ar' ? 'إعادة ضبط' : 'Reset View'}
        </button>
      </div>

      {/* Bottom Floating Quick Zoom Toolbar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/80 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl z-20">
        <button
          onClick={() => zoomBy(0.8)}
          className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <div className="w-px h-4 bg-white/20" />
        <button
          onClick={() => zoomBy(1.2)}
          className="w-8 h-8 flex items-center justify-center text-sm font-bold text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
          title="Zoom Out"
        >
          -
        </button>
      </div>
    </>
  );
}
