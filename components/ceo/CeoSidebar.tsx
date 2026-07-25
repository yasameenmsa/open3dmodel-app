'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useCeoAnatomyStore } from '@/store/useCeoAnatomyStore';
import { OPEN3D_MODELS } from '@/data/open3dModels';
import { CATEGORY_LIST, CATEGORY_FILTER_OPTIONS } from '@/data/categories';
import { SPECIAL_TESTS, PATHOLOGIES, EXERCISES } from '@/data/clinicalData';
import type { DisplayMode, LabelMode, ViewPreset, SceneModelKey } from '@/types/anatomy';

interface CeoSidebarProps {
  onClose?: () => void;
}

export function CeoSidebar({ onClose }: CeoSidebarProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [clinicalOpen, setClinicalOpen] = useState(true);
  const [activeTestCategory, setActiveTestCategory] = useState('All');

  const activeClinicalTab = useCeoAnatomyStore((s) => s.activeClinicalTab);
  const setActiveClinicalTab = useCeoAnatomyStore((s) => s.setActiveClinicalTab);
  const activeTestId = useCeoAnatomyStore((s) => s.activeTestId);
  const setActiveTestId = useCeoAnatomyStore((s) => s.setActiveTestId);

  const modelKey = useCeoAnatomyStore((s) => s.modelKey);
  const setModelKey = useCeoAnatomyStore((s) => s.setModelKey);
  const layerVisibility = useCeoAnatomyStore((s) => s.layerVisibility);
  const toggleLayer = useCeoAnatomyStore((s) => s.toggleLayer);
  const displayMode = useCeoAnatomyStore((s) => s.displayMode);
  const setDisplayMode = useCeoAnatomyStore((s) => s.setDisplayMode);
  const labelMode = useCeoAnatomyStore((s) => s.labelMode);
  const setLabelMode = useCeoAnatomyStore((s) => s.setLabelMode);
  const categoryFilter = useCeoAnatomyStore((s) => s.categoryFilter);
  const setCategoryFilter = useCeoAnatomyStore((s) => s.setCategoryFilter);
  const searchQuery = useCeoAnatomyStore((s) => s.searchQuery);
  const setSearchQuery = useCeoAnatomyStore((s) => s.setSearchQuery);
  const resetAll = useCeoAnatomyStore((s) => s.resetAll);
  const setView = useCeoAnatomyStore((s) => s.setView);
  const resetView = useCeoAnatomyStore((s) => s.resetView);
  const setLocale = useCeoAnatomyStore((s) => s.setLocale);
  const bodyOrientation = useCeoAnatomyStore((s) => s.bodyOrientation);
  const setBodyOrientation = useCeoAnatomyStore((s) => s.setBodyOrientation);
  const cameraState = useCeoAnatomyStore((s) => s.cameraState);
  const setCameraState = useCeoAnatomyStore((s) => s.setCameraState);
  const setFov = useCeoAnatomyStore((s) => s.setFov);

  const toggleLocale = () => {
    const next = locale === 'en' ? 'ar' : 'en';
    setLocale(next);
    window.location.href = `/${next}/ceo`;
  };

  const displayModes: { id: DisplayMode; labelEn: string; labelAr: string }[] = [
    { id: 'normal', labelEn: 'Normal', labelAr: 'طبيعي' },
    { id: 'emphasize', labelEn: 'Emphasize', labelAr: 'تأكيد' },
    { id: 'dim', labelEn: 'Dim Others', labelAr: 'تعتيم' },
    { id: 'isolate', labelEn: 'Isolate', labelAr: 'عزل' },
  ];

  const labelModes: { id: LabelMode; labelEn: string; labelAr: string }[] = [
    { id: 'none', labelEn: 'None', labelAr: 'بدون' },
    { id: 'major', labelEn: 'Selected', labelAr: 'المحدد' },
    { id: 'all', labelEn: 'All Labels', labelAr: 'الجميع' },
  ];

  return (
    <aside
      className="w-80 h-full bg-gray-900/90 backdrop-blur-md border-r border-white/10 flex flex-col overflow-y-auto text-white"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Open3DModel /CEO
          </h1>
          <p className="text-[10px] text-white/50">Physiotherapy & Anatomy Suite</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLocale}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600/30 hover:bg-blue-500/40 text-blue-300 border border-blue-400/40 transition-colors"
          >
            {locale === 'en' ? 'عربي' : 'EN'}
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/60 lg:hidden">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Model Selector */}
      <div className="p-4 border-b border-white/10 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/50">
          {locale === 'ar' ? 'اختر مجسم Open3D' : 'Open3D Model Catalogue'}
        </h2>
        <div className="space-y-4">
          {Object.entries(
            OPEN3D_MODELS.reduce((acc, option) => {
              const region = option.region || 'Uncategorized';
              if (!acc[region]) acc[region] = [];
              acc[region].push(option);
              return acc;
            }, {} as Record<string, typeof OPEN3D_MODELS>)
          ).map(([region, options]) => (
            <div key={region} className="space-y-1.5">
              <h3 className="text-[10px] font-bold text-blue-300/70 uppercase tracking-wider px-1">
                {region}
              </h3>
              {options.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setModelKey(option.key)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                    modelKey === option.key
                      ? 'bg-blue-600/25 border-blue-500/60 shadow-lg text-white'
                      : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">
                    {locale === 'ar' ? option.labelAr : option.labelEn}
                  </div>
                  <div className="text-[10px] text-white/40 mt-0.5 line-clamp-1">
                    {locale === 'ar' ? option.descriptionAr : option.descriptionEn}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Anatomical Layers */}
      <div className="p-4 border-b border-white/10 space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/50">
          {locale === 'ar' ? 'الطبقات التشريحية' : 'Anatomical Layers'}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORY_LIST.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors border border-white/5"
            >
              <input
                type="checkbox"
                checked={layerVisibility[cat.id]}
                onChange={() => toggleLayer(cat.id)}
                className="w-3.5 h-3.5 rounded bg-black/40 border-white/20 text-blue-500 focus:ring-0"
              />
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-xs text-white/80 font-medium truncate">
                {locale === 'ar' ? cat.nameAr : cat.nameEn}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Clinical Suite & Assessment */}
      <div className="p-4 border-b border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              {locale === 'ar' ? 'الجناح السريري والتقييم' : 'Clinical & Rehab Suite'}
            </h2>
          </div>
          <button
            onClick={() => setClinicalOpen(!clinicalOpen)}
            className="text-xs text-white/60 hover:text-white px-2 py-0.5 rounded-md hover:bg-white/10"
          >
            {clinicalOpen ? '−' : '+'}
          </button>
        </div>

        {clinicalOpen && (
          <div className="space-y-3 pt-1">
            {/* Tabs */}
            <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveClinicalTab('tests')}
                className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-colors ${
                  activeClinicalTab === 'tests' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                {locale === 'ar' ? 'الاختبارات' : 'Tests'}
              </button>
              <button
                onClick={() => setActiveClinicalTab('pathology')}
                className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-colors ${
                  activeClinicalTab === 'pathology' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                {locale === 'ar' ? 'الأمراض' : 'Pathologies'}
              </button>
              <button
                onClick={() => setActiveClinicalTab('exercises')}
                className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-colors ${
                  activeClinicalTab === 'exercises' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                {locale === 'ar' ? 'التمارين' : 'Rehab'}
              </button>
            </div>

            {/* Special Tests Tab */}
            {activeClinicalTab === 'tests' && (
              <div className="space-y-3">
                {/* Category Filter */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/20">
                  {['All', 'Shoulder', 'Elbow', 'Wrist/Hand', 'Hip', 'Knee', 'Ankle', 'Spine'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveTestCategory(cat)}
                      className={`whitespace-nowrap px-2.5 py-0.5 text-[9px] font-bold rounded-full transition-colors border ${
                        activeTestCategory === cat
                          ? 'bg-blue-600/30 border-blue-400 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Tests List */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {SPECIAL_TESTS.filter(
                    (t) => activeTestCategory === 'All' || t.category === activeTestCategory
                  ).map((test) => (
                    <div
                      key={test.id}
                      onClick={() => setActiveTestId(activeTestId === test.id ? null : test.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        activeTestId === test.id
                          ? 'bg-blue-600/30 border-blue-400 text-white shadow-lg'
                          : 'bg-white/5 border-white/5 text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xs font-bold">{locale === 'ar' ? test.nameAr : test.nameEn}</div>
                      {test.descriptionEn && (
                        <p className="text-[10px] text-white/60 mt-0.5 leading-relaxed line-clamp-2">
                          {locale === 'ar' ? test.descriptionAr : test.descriptionEn}
                        </p>
                      )}
                      {activeTestId === test.id && test.positiveSignEn && (
                        <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[10px]">
                          <span className="text-emerald-300 font-semibold">
                            {locale === 'ar' ? 'العلامة الإيجابية:' : 'Positive Sign:'}{' '}
                          </span>
                          <span className="text-white/80">
                            {locale === 'ar' ? test.positiveSignAr : test.positiveSignEn}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pathologies Tab */}
            {activeClinicalTab === 'pathology' && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {PATHOLOGIES.map((p) => (
                  <div key={p.id} className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-xs font-bold text-amber-300">{locale === 'ar' ? p.nameAr : p.nameEn}</span>
                    <p className="text-[10px] text-white/60 leading-relaxed">
                      {locale === 'ar' ? p.descriptionAr : p.descriptionEn}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Exercises Tab */}
            {activeClinicalTab === 'exercises' && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {EXERCISES.map((ex) => (
                  <div key={ex.id} className="p-2.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-300">{locale === 'ar' ? ex.nameAr : ex.nameEn}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-semibold capitalize">
                        {ex.difficulty}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/60 leading-relaxed">
                      {locale === 'ar' ? ex.descriptionAr : ex.descriptionEn}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Display & Label Modes */}
      <div className="p-4 border-b border-white/10 space-y-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
            {locale === 'ar' ? 'نمط العرض' : 'Display Mode'}
          </h2>
          <div className="grid grid-cols-2 gap-1.5">
            {displayModes.map((m) => (
              <button
                key={m.id}
                onClick={() => setDisplayMode(m.id)}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors ${
                  displayMode === m.id
                    ? 'bg-blue-600/30 border-blue-400 text-blue-300'
                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {locale === 'ar' ? m.labelAr : m.labelEn}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
            {locale === 'ar' ? 'التسميات ثلاثية الأبعاد' : '3D Labels'}
          </h2>
          <div className="flex gap-1.5">
            {labelModes.map((m) => (
              <button
                key={m.id}
                onClick={() => setLabelMode(m.id)}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors ${
                  labelMode === m.id
                    ? 'bg-blue-600/30 border-blue-400 text-blue-300'
                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {locale === 'ar' ? m.labelAr : m.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="p-4 border-b border-white/10 space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/50">
          {locale === 'ar' ? 'بحث وتصفية' : 'Search & Filter'}
        </h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={locale === 'ar' ? 'ابحث عن جزء...' : 'Search anatomical part...'}
          className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
        />
        <div className="flex flex-wrap gap-1 pt-1">
          {CATEGORY_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setCategoryFilter(opt.id)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                categoryFilter === opt.id
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {locale === 'ar' ? opt.labelAr : opt.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Orientation & Reset All */}
      <div className="p-4 mt-auto space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => setBodyOrientation('stand')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
              bodyOrientation === 'stand'
                ? 'bg-blue-600/30 border-blue-400 text-blue-300'
                : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {locale === 'ar' ? 'وقوف' : 'Stand'}
          </button>
          <button
            onClick={() => setBodyOrientation('supine')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
              bodyOrientation === 'supine'
                ? 'bg-blue-600/30 border-blue-400 text-blue-300'
                : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {locale === 'ar' ? 'استلقاء' : 'Supine'}
          </button>
        </div>
        <button
          onClick={resetAll}
          className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 font-bold text-xs rounded-xl border border-red-500/30 transition-colors"
        >
          {locale === 'ar' ? 'إعادة ضبط كل شيء' : 'Reset Viewer Defaults'}
        </button>
      </div>
    </aside>
  );
}
