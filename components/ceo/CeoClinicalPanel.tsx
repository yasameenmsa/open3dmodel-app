'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useCeoAnatomyStore } from '@/store/useCeoAnatomyStore';
import { SPECIAL_TESTS, PATHOLOGIES, EXERCISES } from '@/data/clinicalData';

export function CeoClinicalPanel() {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const activeTab = useCeoAnatomyStore((s) => s.activeClinicalTab);
  const setActiveTab = useCeoAnatomyStore((s) => s.setActiveClinicalTab);
  const activeTestId = useCeoAnatomyStore((s) => s.activeTestId);
  const setActiveTestId = useCeoAnatomyStore((s) => s.setActiveTestId);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTestCategory, setActiveTestCategory] = useState('All');

  return (
    <div
      className={`absolute top-5 left-5 bg-gray-900/90 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl z-20 transition-all ${
        isCollapsed ? 'w-44' : 'w-96'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Panel Header */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-xs font-bold text-white tracking-wide">
            {locale === 'ar' ? 'الجناح السريري والتقييم' : 'Clinical & Rehab Intelligence'}
          </h3>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-xs text-white/50 hover:text-white px-2 py-0.5 rounded-md hover:bg-white/10"
        >
          {isCollapsed ? '+' : '−'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-3.5 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Tabs */}
          <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('tests')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                activeTab === 'tests' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {locale === 'ar' ? 'الاختبارات' : 'Special Tests'}
            </button>
            <button
              onClick={() => setActiveTab('pathology')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                activeTab === 'pathology' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {locale === 'ar' ? 'الأمراض' : 'Pathologies'}
            </button>
            <button
              onClick={() => setActiveTab('exercises')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                activeTab === 'exercises' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {locale === 'ar' ? 'التمارين' : 'Rehab'}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'tests' && (
            <div className="space-y-3">
              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {['All', 'Shoulder', 'Elbow', 'Wrist/Hand', 'Hip', 'Knee', 'Ankle', 'Spine'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTestCategory(cat)}
                    className={`whitespace-nowrap px-3 py-1 text-[10px] font-bold rounded-full transition-colors border ${
                      activeTestCategory === cat
                        ? 'bg-blue-600/30 border-blue-400 text-white'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grouped Tests */}
              <div className="space-y-4">
                {Object.entries(
                  SPECIAL_TESTS
                    .filter((t) => activeTestCategory === 'All' || t.category === activeTestCategory)
                    .reduce((acc, test) => {
                      const group = test.subCategory || 'Other';
                      if (!acc[group]) acc[group] = [];
                      acc[group].push(test);
                      return acc;
                    }, {} as Record<string, typeof SPECIAL_TESTS>)
                ).map(([subCat, tests]) => (
                  <div key={subCat} className="space-y-2">
                    <h4 className="text-[10px] uppercase tracking-wider text-white/40 font-bold px-1 sticky top-0 bg-gray-900/90 py-1 backdrop-blur-md">
                      {subCat}
                    </h4>
                    {tests.map((test) => (
                      <div
                        key={test.id}
                        onClick={() => setActiveTestId(activeTestId === test.id ? null : test.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          activeTestId === test.id
                            ? 'bg-blue-600/30 border-blue-400 text-white shadow-lg'
                            : 'bg-white/5 border-white/5 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{locale === 'ar' ? test.nameAr : test.nameEn}</span>
                        </div>
                        {test.descriptionEn && (
                          <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
                            {locale === 'ar' ? test.descriptionAr : test.descriptionEn}
                          </p>
                        )}
                        {activeTestId === test.id && test.positiveSignEn && (
                          <div className="mt-2 pt-2 border-t border-white/10 text-[11px] space-y-1">
                            <div className="text-emerald-300 font-semibold">
                              {locale === 'ar' ? 'العلامة الإيجابية:' : 'Positive Sign:'}{' '}
                              <span className="font-normal text-white/80">
                                {locale === 'ar' ? test.positiveSignAr : test.positiveSignEn}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'pathology' && (
            <div className="space-y-2">
              {PATHOLOGIES.map((p) => (
                <div key={p.id} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-xs font-bold text-amber-300">{locale === 'ar' ? p.nameAr : p.nameEn}</span>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    {locale === 'ar' ? p.descriptionAr : p.descriptionEn}
                  </p>
                  <div className="text-[10px] text-white/40 pt-1">
                    {locale === 'ar' ? 'شائع في:' : 'Common in:'} {p.commonIn}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'exercises' && (
            <div className="space-y-2">
              {EXERCISES.map((ex) => (
                <div key={ex.id} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300">{locale === 'ar' ? ex.nameAr : ex.nameEn}</span>
                    <span className="text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full font-semibold capitalize">
                      {ex.difficulty}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    {locale === 'ar' ? ex.descriptionAr : ex.descriptionEn}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
