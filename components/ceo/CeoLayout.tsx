'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { CeoSidebar } from '@/components/ceo/CeoSidebar';
import { CeoInfoPanel } from '@/components/ceo/CeoInfoPanel';
import { CeoViewControls } from '@/components/ceo/CeoViewControls';

const CeoAnatomyScene = dynamic(() => import('@/components/viewer/CeoAnatomyScene'), {
  ssr: false,
});

export function CeoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950">
      {/* Mobile Drawer Hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-gray-900/80 backdrop-blur-md border border-white/10 lg:hidden shadow-xl"
        aria-label="Open controls"
      >
        <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <CeoSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main 3D Stage */}
      <main className="flex-1 relative min-w-0 h-full overflow-hidden">
        {!sceneReady && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-gray-950/95 backdrop-blur-xl p-6">
            <div className="relative flex items-center justify-center mb-6">
              {/* Outer pulsing glow */}
              <div className="absolute w-28 h-28 rounded-full bg-blue-500/20 animate-ping" />
              <div className="absolute w-20 h-20 rounded-full bg-purple-500/30 animate-pulse" />
              {/* Central Spinner */}
              <div className="w-16 h-16 border-3 border-blue-400 border-t-transparent rounded-full animate-spin shadow-lg" />
            </div>

            <h2 className="text-xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent mb-1 text-center">
              Open3D Executive Anatomy Suite
            </h2>
            <p className="text-xs text-white/60 mb-6 text-center max-w-sm">
              Loading high-resolution 3D anatomical models & clinical anchors...
            </p>

            {/* Dedication Banner */}
            <div className="max-w-md w-full p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 shadow-2xl backdrop-blur-md text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                <span>💚</span>
                <span>تطبيق مجاني وسيظل مجانًا دائمًا</span>
              </div>
              <p className="text-sm font-semibold text-emerald-100 leading-relaxed">
                صدقة جارية عن روح الممرضة الفاضلة والحاجة حليمة العواودة
              </p>
              <p className="text-xs text-emerald-300/80 font-medium">
                دعواتكم لها بالرحمة والمغفرة 🤲
              </p>
            </div>
          </div>
        )}

        <CeoAnatomyScene onReady={() => setSceneReady(true)} />
        <CeoViewControls />
        <CeoInfoPanel />
      </main>
    </div>
  );
}
