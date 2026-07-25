'use client';

import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useCeoAnatomyStore } from '@/store/useCeoAnatomyStore';
import { CATEGORIES } from '@/data/categories';
import type { Category } from '@/types/anatomy';

export function CeoLabelRenderer() {
  const labelMode = useCeoAnatomyStore((s) => s.labelMode);
  const selectedId = useCeoAnatomyStore((s) => s.selectedPartId);
  const hoveredId = useCeoAnatomyStore((s) => s.hoveredPartId);
  const selectPart = useCeoAnatomyStore((s) => s.selectPart);
  const partAnchors = useCeoAnatomyStore((s) => s.partAnchors);
  const partCategories = useCeoAnatomyStore((s) => s.partCategories);
  const partDisplayNames = useCeoAnatomyStore((s) => s.partDisplayNames);
  const layerVisibility = useCeoAnatomyStore((s) => s.layerVisibility);

  const visibleLabels = useMemo(() => {
    if (labelMode === 'none') {
      if (selectedId && partAnchors[selectedId]) {
        const cat = partCategories[selectedId];
        if (cat && layerVisibility[cat]) {
          return [
            {
              id: selectedId,
              name: partDisplayNames[selectedId] || selectedId.replace(/_/g, ' '),
              anchor: partAnchors[selectedId],
              category: cat,
              isSelected: true,
            },
          ];
        }
      }
      return [];
    }

    const labels: {
      id: string;
      name: string;
      anchor: [number, number, number];
      category: Category;
      isSelected: boolean;
    }[] = [];

    for (const [partId, anchor] of Object.entries(partAnchors)) {
      const cat = partCategories[partId];
      if (!cat || !layerVisibility[cat]) continue;

      const isSelected = partId === selectedId;
      const isHovered = partId === hoveredId;

      if (isSelected || isHovered || labelMode === 'all') {
        labels.push({
          id: partId,
          name: partDisplayNames[partId] || partId.replace(/_/g, ' '),
          anchor,
          category: cat,
          isSelected,
        });
      }
    }

    return labels;
  }, [labelMode, selectedId, hoveredId, partAnchors, partCategories, partDisplayNames, layerVisibility]);

  return (
    <>
      {visibleLabels.map((label) => {
        const catMeta = CATEGORIES[label.category];
        const labelColor = label.isSelected
          ? 'bg-yellow-500/40 border-yellow-400 text-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.5)] font-semibold scale-105'
          : 'bg-gray-900/80 border-white/20 text-white/90 hover:bg-gray-800/90 hover:text-white';

        return (
          <Html
            key={label.id}
            position={label.anchor}
            center
            zIndexRange={[20, 0]}
            style={{ pointerEvents: 'auto' }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                selectPart(label.id, true);
              }}
              className={`px-2.5 py-1 text-xs rounded-full border backdrop-blur-md transition-all whitespace-nowrap flex items-center gap-1.5 ${labelColor}`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: catMeta?.color || '#fff' }}
              />
              {label.name}
            </button>
          </Html>
        );
      })}
    </>
  );
}
