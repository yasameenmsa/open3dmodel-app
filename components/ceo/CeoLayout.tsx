'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { CeoSidebar } from '@/components/ceo/CeoSidebar';
import { CeoInfoPanel } from '@/components/ceo/CeoInfoPanel';
import { CeoViewControls } from '@/components/ceo/CeoViewControls';
import { CeoClinicalPanel } from '@/components/ceo/CeoClinicalPanel';

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
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-gray-950/90 backdrop-blur-md">
            <div className="text-center">
              <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
              <p className="text-sm font-semibold text-white/90">Preparing Open3D Executive Stage</p>
              <p className="mt-1 text-xs text-white/50">Loading high-resolution glTF models & shaders...</p>
            </div>
          </div>
        )}
        <CeoAnatomyScene onReady={() => setSceneReady(true)} />
        <CeoViewControls />
        <CeoClinicalPanel />
        <CeoInfoPanel />
      </main>
    </div>
  );
}
