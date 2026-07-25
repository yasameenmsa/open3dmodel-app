'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { useCeoAnatomyStore } from '@/store/useCeoAnatomyStore';
import { CATEGORIES } from '@/data/categories';
import partInfo from '../../public/part-info.json';

interface PartInfo {
  descriptionEn?: string;
  descriptionAr?: string;
  functionEn?: string;
  functionAr?: string;
  wikiEn?: string;
  wikiAr?: string;
}

export function CeoInfoPanel() {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const selectedPartId = useCeoAnatomyStore((s) => s.selectedPartId);
  const partCategories = useCeoAnatomyStore((s) => s.partCategories);
  const partDisplayNames = useCeoAnatomyStore((s) => s.partDisplayNames);
  const partVisibility = useCeoAnatomyStore((s) => s.partVisibility);
  const focusPart = useCeoAnatomyStore((s) => s.focusPart);
  const displayMode = useCeoAnatomyStore((s) => s.displayMode);
  const setDisplayMode = useCeoAnatomyStore((s) => s.setDisplayMode);
  const setPartVisible = useCeoAnatomyStore((s) => s.setPartVisible);
  const info = useMemo(() => {
    if (!selectedPartId) return null;
    const name = partDisplayNames[selectedPartId];
    if (!name) return null;
    return (partInfo as Record<string, PartInfo>)[name] || null;
  }, [selectedPartId, partDisplayNames]);

  if (!selectedPartId) {
    return (
      <div className="absolute bottom-5 right-5 w-80 p-4 bg-gray-900/85 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl z-20" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-3 text-white/50">
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs font-medium">
            {locale === 'ar' ? 'انقر على أي جزء في النموذج لعرض تفاصيله وأدوات التحكم الحية.' : 'Click on any anatomical part in the 3D view to inspect details & live controls.'}
          </p>
        </div>
      </div>
    );
  }

  const displayName = partDisplayNames[selectedPartId] || selectedPartId
    .replace(/^[^_]+_/, '')
    .replace(/\.(r|l)$/i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const cat = partCategories[selectedPartId];
  const catMeta = cat ? CATEGORIES[cat] : null;
  const isVisible = partVisibility[selectedPartId] !== false;
  const description = locale === 'ar' ? (info?.descriptionAr || info?.descriptionEn) : info?.descriptionEn;
  const func = locale === 'ar' ? (info?.functionAr || info?.functionEn) : info?.functionEn;
  const wiki = locale === 'ar' ? (info?.wikiAr || info?.wikiEn) : info?.wikiEn;

  return (
    <div
      className="absolute bottom-5 right-5 w-80 max-h-[75vh] overflow-y-auto p-4 bg-gray-900/90 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl z-20 space-y-3"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Title & Badge */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white leading-tight">{displayName}</h3>
          {catMeta && (
            <span
              className="inline-block mt-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full border"
              style={{
                backgroundColor: catMeta.color + '22',
                color: catMeta.color,
                borderColor: catMeta.color + '55',
              }}
            >
              {locale === 'ar' ? catMeta.nameAr : catMeta.nameEn}
            </span>
          )}
        </div>
      </div>



      {/* Description & Function */}
      {description && (
        <p className="text-xs text-white/70 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5">
          {description}
        </p>
      )}

      {func && (
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-white/40">
            {locale === 'ar' ? 'الوظيفة الرئيسية' : 'Key Function'}
          </h4>
          <p className="text-xs text-white/60 leading-relaxed">{func}</p>
        </div>
      )}

      {wiki && (
        <a
          href={wiki}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-[11px] text-blue-400 hover:underline"
        >
          {locale === 'ar' ? 'المزيد في ويكيبيديا' : 'Read more on Wikipedia'} ↗
        </a>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-1.5 pt-1">
        <button
          onClick={() => focusPart(selectedPartId)}
          className="px-2.5 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium text-xs rounded-lg border border-blue-500/40 transition-colors text-center"
        >
          {locale === 'ar' ? 'تركيز' : 'Focus'}
        </button>
        <button
          onClick={() => setDisplayMode(displayMode === 'isolate' ? 'normal' : 'isolate')}
          className={`px-2.5 py-1.5 font-medium text-xs rounded-lg border transition-colors text-center ${
            displayMode === 'isolate'
              ? 'bg-amber-500/30 border-amber-400 text-amber-200'
              : 'bg-white/10 border-white/15 text-white/80 hover:bg-white/15'
          }`}
        >
          {displayMode === 'isolate' ? (locale === 'ar' ? 'إلغاء العزل' : 'Unisolate') : (locale === 'ar' ? 'عزل' : 'Isolate')}
        </button>
        <button
          onClick={() => {
            setPartVisible(selectedPartId, !isVisible);
            setDisplayMode('normal');
          }}
          className={`px-2.5 py-1.5 font-medium text-xs rounded-lg border transition-colors text-center ${
            !isVisible
              ? 'bg-red-500/20 border-red-500/40 text-red-300'
              : 'bg-white/10 border-white/15 text-white/80 hover:bg-white/15'
          }`}
        >
          {!isVisible ? (locale === 'ar' ? 'إظهار' : 'Show') : (locale === 'ar' ? 'إخفاء' : 'Hide')}
        </button>
      </div>
    </div>
  );
}
