'use client';

import { useEffect } from 'react';

export function SuppressWarnings() {
  useEffect(() => {
    const originalWarn = console.warn.bind(console);
    console.warn = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (msg.includes('THREE.Clock') && msg.includes('deprecated')) return;
      if (msg.includes('KHR_materials_pbrSpecularGlossiness')) return;
      originalWarn(...args);
    };
    return () => {
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
