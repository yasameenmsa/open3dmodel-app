import { create } from 'zustand';
import type {
  BodyOrientation,
  Category,
  CategoryFilter,
  CameraCommand,
  DisplayMode,
  LabelMode,
  Locale,
  SceneModelKey,
  ViewPreset,
} from '../types/anatomy';

type BoolMap = Record<string, boolean>;

export interface CeoAnatomyState {
  modelKey: SceneModelKey;
  layerVisibility: Record<Category, boolean>;
  partVisibility: BoolMap;
  selectedPartId: string | null;
  hoveredPartId: string | null;
  categoryFilter: CategoryFilter;
  searchQuery: string;
  labelMode: LabelMode;
  displayMode: DisplayMode;
  cameraCommand: { cmd: CameraCommand; nonce: number } | null;
  partAnchors: Record<string, [number, number, number]>;
  partCategories: Record<string, Category>;
  partDisplayNames: Record<string, string>;

  sceneReady: boolean;
  modelFit: { scale: number; position: [number, number, number]; rotationY: number } | null;
  locale: Locale;
  bodyOrientation: BodyOrientation;
  activeClinicalTab: 'overview' | 'tests' | 'pathology' | 'exercises';
  activeTestId: string | null;
  cameraState: {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
  };

  setModelKey: (key: SceneModelKey) => void;
  toggleLayer: (cat: Category) => void;
  setLayerVisible: (cat: Category, v: boolean) => void;
  togglePart: (id: string) => void;
  setPartVisible: (id: string, v: boolean) => void;
  selectPart: (id: string | null, focus?: boolean) => void;
  setHovered: (id: string | null) => void;
  setCategoryFilter: (f: CategoryFilter) => void;
  setSearchQuery: (q: string) => void;
  setLabelMode: (m: LabelMode) => void;
  setDisplayMode: (m: DisplayMode) => void;
  setLocale: (l: Locale) => void;
  setBodyOrientation: (o: BodyOrientation) => void;
  setView: (preset: ViewPreset) => void;
  focusPart: (id: string) => void;
  resetView: () => void;
  zoomBy: (factor: number) => void;
  resetAll: () => void;
  setPartAnchors: (anchors: Record<string, [number, number, number]>) => void;
  setPartCategories: (cats: Record<string, Category>) => void;
  setPartDisplayNames: (names: Record<string, string>) => void;

  setModelFit: (fit: { scale: number; position: [number, number, number]; rotationY: number }) => void;
  setCameraState: (s: { position: [number, number, number]; target: [number, number, number]; fov: number }) => void;
  setFov: (fov: number) => void;
  setActiveClinicalTab: (tab: 'overview' | 'tests' | 'pathology' | 'exercises') => void;
  setActiveTestId: (testId: string | null) => void;
}

const DEFAULT_LAYER_VISIBILITY: Record<Category, boolean> = {
  skeleton: true,
  muscle: true,
  tendon: true,
  nerve: true,
  ligament: true,
  vessel: true,
  organ: true,
};

let cameraNonce = 0;
function nextCamera(cmd: CameraCommand) {
  cameraNonce += 1;
  return { cmd, nonce: cameraNonce };
}

export const useCeoAnatomyStore = create<CeoAnatomyState>((set, get) => ({
  modelKey: 'full-anatomy',
  layerVisibility: DEFAULT_LAYER_VISIBILITY,
  partVisibility: {},
  selectedPartId: null,
  hoveredPartId: null,
  categoryFilter: 'all',
  searchQuery: '',
  labelMode: 'none',
  displayMode: 'normal',
  cameraCommand: null,
  partAnchors: {},
  partCategories: {},
  partDisplayNames: {},

  sceneReady: false,
  modelFit: null,
  locale: 'en',
  bodyOrientation: 'stand',
  activeClinicalTab: 'overview',
  activeTestId: null,
  cameraState: {
    position: [0, 0.1, 14.5],
    target: [0, 0.1, 0],
    fov: 45,
  },

  setModelKey: (key) =>
    set({
      modelKey: key,
      selectedPartId: null,
      hoveredPartId: null,
      partAnchors: {},
      partCategories: {},
      partDisplayNames: {},
      partVisibility: {},
      sceneReady: false,
    }),

  toggleLayer: (cat) =>
    set((s) => ({
      layerVisibility: { ...s.layerVisibility, [cat]: !s.layerVisibility[cat] },
    })),

  setLayerVisible: (cat, v) =>
    set((s) => ({
      layerVisibility: { ...s.layerVisibility, [cat]: v },
    })),

  togglePart: (id) =>
    set((s) => ({
      partVisibility: { ...s.partVisibility, [id]: !s.partVisibility[id] },
    })),

  setPartVisible: (id, v) =>
    set((s) => ({
      partVisibility: { ...s.partVisibility, [id]: v },
    })),

  selectPart: (id, focus = false) => {
    set({ selectedPartId: id });
    if (id && focus) get().focusPart(id);
  },

  setHovered: (id) => set({ hoveredPartId: id }),
  setCategoryFilter: (f) => set({ categoryFilter: f }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setLabelMode: (m) => set({ labelMode: m }),
  setDisplayMode: (m) => set({ displayMode: m }),
  setLocale: (l) => set({ locale: l }),
  setBodyOrientation: (o) => set({ bodyOrientation: o }),

  setView: (preset) => set({ cameraCommand: nextCamera({ type: 'preset', preset }) }),

  focusPart: (id) => {
    const state = get();
    const anchor = state.partAnchors[id];
    const target = anchor ?? [0, 0, 0];
    const distance = 3.5;
    set({ cameraCommand: nextCamera({ type: 'focus', target, distance }) });
  },

  resetView: () => set({ cameraCommand: nextCamera({ type: 'reset' }) }),
  zoomBy: (factor) => set({ cameraCommand: nextCamera({ type: 'zoom', factor }) }),

  resetAll: () =>
    set({
      modelKey: 'full-anatomy',
      layerVisibility: DEFAULT_LAYER_VISIBILITY,
      partVisibility: {},
      selectedPartId: null,
      hoveredPartId: null,
      categoryFilter: 'all',
      searchQuery: '',
      labelMode: 'none',
      displayMode: 'normal',
      bodyOrientation: 'stand',
      cameraState: {
        position: [0, 0.2, 6.5],
        target: [0, 0.2, 0],
        fov: 45,
      },
    }),

  setPartAnchors: (anchors) =>
    set((s) => ({ partAnchors: { ...s.partAnchors, ...anchors } })),

  setPartCategories: (cats) =>
    set((s) => ({ partCategories: { ...s.partCategories, ...cats } })),

  setPartDisplayNames: (names) =>
    set((s) => ({ partDisplayNames: { ...s.partDisplayNames, ...names } })),



  setModelFit: (fit) => set({ modelFit: fit, sceneReady: true }),

  setCameraState: (s) => set({ cameraState: s }),

  setFov: (fov) => set((s) => ({ cameraState: { ...s.cameraState, fov } })),

  setActiveClinicalTab: (tab) => set({ activeClinicalTab: tab }),
  setActiveTestId: (testId) => set({ activeTestId: testId }),
}));
