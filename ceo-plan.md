# Anatomy3D — CEO Plan

> Interactive 3D Human Anatomy Viewer — Arabic + English
> Built with Next.js, React Three Fiber, Open3DModel data

---

## Vision

A bilingual (Arabic/English) 3D anatomy explorer that goes beyond reference — it teaches. Users click on muscles, bones, nerves, and ligaments in a photorealistic 3D model, explore clinical special tests with animated demonstrations, take quizzes by clicking on the correct anatomy, and share study views with colleagues. The first anatomy tool built natively for Arabic-speaking medical students.

**Why this exists:** Most anatomy viewers are English-only, lack clinical context, and treat the 3D model as a static display. Anatomy3D makes the model interactive, educational, and accessible to the 400M+ Arabic speakers in medicine.

---

## Decisions Log

| Decision | Choice | Rationale |
|---|---|---|
| 3D Model Source | Open3DModel (CC BY-SA) | Best muscle detail (699+ parts), includes nerves + ligaments, modular GLBs, actively maintained |
| Framework | Next.js App Router | SSR for SEO, App Router for layouts, native i18n routing |
| 3D Rendering | React Three Fiber + drei | React ecosystem, declarative 3D, same architecture as anatomy-3d-viewer reference |
| State Management | Zustand | Lightweight, same as reference, works with R3F |
| i18n | next-intl | Built for Next.js App Router, handles RTL, locale routing |
| RTL | CSS logical properties | margin-inline-start works for both LTR/RTL, no duplicate stylesheets |
| Styling | Tailwind CSS | Utility-first, dark mode, RTL support via logical properties |
| Components | Custom (no library) | Match the space-themed dark design exactly |
| Backend (v1) | Static JSON | No server needed. Clinical data as JSON, quizzes hardcoded |
| 3D Assets | Static in public/ | Bundle GLBs in Next.js public/, PWA caches them for offline |
| Deployment | GitHub Pages | Free, static export, works with Next.js export |
| Project Name | Anatomy3D | Simple, descriptive, bilingual |

---

## Tech Stack

```
Next.js 14+          — App Router, static export, image optimization
React 18              — UI framework
React Three Fiber     — 3D rendering (declarative Three.js)
@react-three/drei     — R3F helpers (OrbitControls, Html, Stars, Grid)
Three.js              — 3D engine (underlying R3F)
Zustand               — State management (3D + UI state)
next-intl             — i18n (Arabic/English, RTL, locale routing)
Tailwind CSS          — Styling (dark theme, logical properties)
TypeScript            — Type safety
```

---

## Data Model

### 3D Models (from Open3DModel)

| Model | GLB File | Coverage | Size (est.) |
|---|---|---|---|
| Skeleton | skeleton.glb | Full skeleton + skull | ~5-8MB |
| Upper Limb | upper-limb.glb | Bones + muscles + nerves + vessels | ~10-15MB |
| Lower Limb | lower-limb.glb | Bones + muscles + nerves + vessels | ~10-15MB |
| Thorax/Abdomen/Back | thorax-abdomen-back.glb | Muscles of trunk | ~5-8MB |
| Pelvis | pelvis.glb | Pelvic structures | ~3-5MB |
| **Total** | | | **~35-55MB** |

All models are Draco-compressed glTF (GLB). License: CC BY-SA — requires attribution.

### Anatomy Part Data Structure

```typescript
// Extended from anatomy-3d-viewer's types/anatomy.ts
interface AnatomyPart {
  id: string;
  // Bilingual names
  nameEn: string;
  nameAr: string;           // NEW: Arabic name
  nameLa?: string;          // Latin/TA2 term (from Open3DModel)
  // Classification
  category: 'skeleton' | 'muscle' | 'nerve' | 'ligament' | 'organ' | 'vessel';
  subcategory: string;
  region: BodyRegion;
  side: 'left' | 'right' | 'center';
  // Clinical data (E1 expansion)
  clinical?: {
    specialTests: SpecialTest[];
    commonPathologies: Pathology[];
    exercises: Exercise[];
    innervation?: string;    // For muscles
    bloodSupply?: string;    // For organs/bones
    insertion?: string;      // Muscle insertion points
    origin?: string;         // Muscle origin points
    action?: string;         // Muscle action
  };
  // 3D rendering
  meshId: string;            // Maps to GLB mesh name
  color?: string;            // Override category default
  isMajorPart: boolean;      // Show in "major only" label mode
  // Metadata
  descriptionEn: string;
  descriptionAr: string;
  wikiUrl?: string;          // Wikipedia link
  kenhubUrl?: string;        // Kenhub link
}

interface SpecialTest {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  musclesInvolved: string[]; // Part IDs
  positiveSignEn: string;
  positiveSignAr: string;
  videoUrl?: string;         // Optional demonstration video
  animationSteps?: AnimationStep[]; // 3D animation of the test
}

interface Pathology {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  musclesInvolved: string[];
  commonIn: string;          // e.g., "overhead athletes"
}

interface Exercise {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  musclesTargeted: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
```

### Translation Files (next-intl)

```json
// messages/en.json
{
  "nav": {
    "home": "Home",
    "explore": "Explore",
    "quizzes": "Quizzes",
    "progress": "My Progress"
  },
  "sidebar": {
    "layers": "Layers",
    "displayMode": "Display Mode",
    "labels": "Labels",
    "filter": "Filter",
    "partsList": "Parts List"
  },
  "layers": {
    "skeleton": "Skeleton",
    "muscles": "Muscles",
    "nerves": "Nerves",
    "ligaments": "Ligaments",
    "vessels": "Blood Vessels",
    "organs": "Organs"
  },
  "display": {
    "normal": "Normal",
    "emphasize": "Emphasize",
    "dim": "Dim",
    "isolate": "Isolate"
  },
  "labels": {
    "none": "None",
    "majorOnly": "Major Only",
    "all": "All"
  },
  "info": {
    "description": "Description",
    "keyFunctions": "Key Functions",
    "clinicalRelevance": "Clinical Relevance",
    "specialTests": "Special Tests",
    "relatedParts": "Related Parts",
    "focus": "Focus on this part",
    "isolate": "Isolate this part"
  },
  "quiz": {
    "findPart": "Find the {partName}",
    "correct": "Correct!",
    "incorrect": "Try again",
    "score": "Score: {correct}/{total}",
    "next": "Next Question"
  },
  "clinical": {
    "specialTest": "Special Test",
    "pathology": "Common Pathology",
    "exercise": "Exercise",
    "innervation": "Innervation",
    "origin": "Origin",
    "insertion": "Insertion",
    "action": "Action"
  }
}
```

```json
// messages/ar.json
{
  "nav": {
    "home": "الرئيسية",
    "explore": "استكشاف",
    "quizzes": "اختبارات",
    "progress": "تقدمي"
  },
  "sidebar": {
    "layers": "الطبقات",
    "displayMode": "وضع العرض",
    "labels": "التسميات",
    "filter": "التصفية",
    "partsList": "قسم الأجزاء"
  },
  "layers": {
    "skeleton": "الهيكل العظمي",
    "muscles": "العضلات",
    "nerves": "الأعصاب",
    "ligaments": "الأربطة",
    "vessels": "الأوعية الدموية",
    "organs": "الأعضاء"
  }
  // ... full Arabic translations
}
```

---

## Architecture

### Project Structure

```
anatomy3d/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # i18n: /en/..., /ar/...
│   │   ├── layout.tsx            # Root layout with RTL support
│   │   ├── page.tsx              # Home page → 3D viewer
│   │   ├── explore/
│   │   │   └── page.tsx          # Explore page (region-based)
│   │   ├── quizzes/
│   │   │   └── page.tsx          # Quiz page
│   │   └── progress/
│   │       └── page.tsx          # Progress tracking
│   └── globals.css               # Tailwind + custom CSS
├── components/
│   ├── viewer/                   # 3D viewer components
│   │   ├── AnatomyScene.tsx      # R3F Canvas root
│   │   ├── AnatomyModel.tsx      # Model composition
│   │   ├── SkeletonModel.tsx     # Skeleton GLB loader
│   │   ├── MuscleModel.tsx       # Muscle GLB loader
│   │   ├── NerveModel.tsx        # Nerve GLB loader (NEW)
│   │   ├── LigamentModel.tsx     # Ligament GLB loader (NEW)
│   │   ├── VesselModel.tsx       # Blood vessel GLB loader (NEW)
│   │   ├── PartMesh.tsx          # Procedural primitives
│   │   ├── LabelRenderer.tsx     # Floating 3D labels
│   │   └── CameraController.tsx  # Camera animations
│   ├── ui/                       # UI components
│   │   ├── Layout.tsx            # App shell
│   │   ├── Sidebar.tsx           # Left/right panel
│   │   ├── InfoPanel.tsx         # Selected part details
│   │   ├── ClinicalPanel.tsx     # NEW: Clinical data display
│   │   ├── QuizPanel.tsx         # NEW: Quiz interface
│   │   ├── LanguageToggle.tsx    # AR/EN switch
│   │   ├── LayerToggle.tsx       # Category toggles
│   │   ├── DisplayModeToggle.tsx
│   │   ├── LabelModeToggle.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── RegionFilter.tsx
│   │   ├── SearchBox.tsx
│   │   ├── PartList.tsx
│   │   ├── Legend.tsx
│   │   └── ViewControls.tsx
│   └── providers/
│       └── LocaleProvider.tsx    # next-intl provider
├── data/
│   ├── anatomyParts.ts           # Master anatomy data
│   ├── clinicalData.ts           # NEW: Special tests, pathologies, exercises
│   ├── quizData.ts               # NEW: Quiz questions
│   ├── skeletonMap.ts            # Mesh-to-part mapping
│   ├── muscleMap.ts
│   ├── nerveMap.ts               # NEW: Nerve mesh mapping
│   ├── ligamentMap.ts            # NEW: Ligament mesh mapping
│   ├── categories.ts
│   └── regions.ts
├── lib/
│   ├── i18n.ts                   # next-intl config
│   ├── request.ts                # next-intl request config
│   └── utils.ts                  # Shared utilities
├── messages/
│   ├── en.json                   # English translations
│   └── ar.json                   # Arabic translations
├── public/
│   ├── models/
│   │   ├── skeleton.glb          # From Open3DModel
│   │   ├── upper-limb.glb
│   │   ├── lower-limb.glb
│   │   ├── thorax-abdomen-back.glb
│   │   └── pelvis.glb
│   └── draco/                    # Draco decoder
├── store/
│   └── useAnatomyStore.ts        # Zustand store
├── types/
│   └── anatomy.ts                # TypeScript types
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Key Architecture Patterns

**1. Client/Server Split**
The 3D viewer is entirely client-side. The layout, navigation, and SEO metadata are server-side. Pattern:

```tsx
// app/[locale]/page.tsx (server component)
import dynamic from 'next/dynamic';

const AnatomyViewer = dynamic(
  () => import('@/components/viewer/AnatomyScene'),
  { ssr: false }
);

export default function Home() {
  return (
    <main>
      <AnatomyViewer />
    </main>
  );
}
```

**2. i18n with next-intl**
```tsx
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({ children, params: { locale } }) {
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**3. Zustand Store (extended)**
```typescript
// store/useAnatomyStore.ts
interface AnatomyState {
  // Existing from reference
  layerVisibility: Record<Category, boolean>;
  partVisibility: Record<string, boolean>;
  selectedPartId: string | null;
  hoveredPartId: string | null;
  labelMode: LabelMode;
  displayMode: DisplayMode;
  cameraCommand: CameraCommand | null;
  partAnchors: Record<string, [number, number, number]>;
  modelFit: ModelFit | null;

  // NEW: Clinical layer
  activeSpecialTest: string | null;
  showClinicalPanel: boolean;

  // NEW: Quiz mode
  quizMode: boolean;
  currentQuiz: QuizQuestion | null;
  quizScore: { correct: number; total: number };

  // NEW: Locale
  locale: 'en' | 'ar';
}
```

**4. RTL Layout**
```tsx
// components/ui/Sidebar.tsx
// Uses CSS logical properties — automatically flips for RTL
<aside className="w-80 border-inline-start border-white/10 bg-gray-900/80">
  <div className="p-4">
    {/* Content flows correctly in both LTR and RTL */}
  </div>
</aside>
```

**5. 3D Label Rendering (bilingual)**
```tsx
// components/viewer/LabelRenderer.tsx
const label = locale === 'ar' ? part.nameAr : part.nameEn;
// Labels use drei <Html> component, positioned at partAnchors
// Text direction set by parent html dir attribute
```

---

## Feature Breakdown

### Phase 1 — Foundation (Week 1-2)

**Goal:** Working 3D viewer with Open3DModel data, Next.js, Arabic/English toggle.

| Task | Details | Est. |
|---|---|---|
| Project scaffolding | `npx create-next-app@latest anatomy3d --typescript --tailwind --app` | 10 min |
| Download Open3DModel GLBs | Download skeleton, upper-limb, lower-limb, thorax-abdomen-back, pelvis from anatomytool.org | 1-2 hours |
| Draco setup | Copy Draco decoder to public/draco/ | 5 min |
| Zustand store | Port from anatomy-3d-viewer, extend with locale state | 2-3 hours |
| Types | Port anatomy.ts, extend with nameAr, clinical fields | 1-2 hours |
| SkeletonModel | Port SkeletonModel.tsx, adapt to Next.js ("use client", dynamic import) | 3-4 hours |
| MuscleModel | Port MuscleModel.tsx, adapt GLB paths | 2-3 hours |
| NerveModel | NEW: Load nerve GLBs from Open3DModel, map mesh names to part IDs | 3-4 hours |
| LigamentModel | NEW: Load ligament GLBs | 2-3 hours |
| LabelRenderer | Port, add locale-aware name display | 2-3 hours |
| CameraController | Port as-is | 1-2 hours |
| Sidebar | Port, convert to Tailwind, add RTL logical properties | 3-4 hours |
| InfoPanel | Port, convert to Tailwind | 2-3 hours |
| i18n setup | Install next-intl, configure locale routing, create en.json/ar.json | 3-4 hours |
| LanguageToggle | AR/EN switch component | 1 hour |
| Static export config | Configure next.config.ts for GitHub Pages | 30 min |

**Deliverable:** Working 3D viewer on GitHub Pages with Arabic/English toggle, skeleton + muscles + nerves + ligaments visible.

### Phase 2 — Data & Polish (Week 3-4)

**Goal:** Full anatomy data with Arabic names, clinical data structure, polished UI.

| Task | Details | Est. |
|---|---|---|
| Anatomy parts data | Create anatomyParts.ts with 699+ parts, nameEn + nameAr for each | 1-2 weeks |
| Muscle map | Map Open3DModel muscle mesh names to part IDs | 1-2 days |
| Nerve map | Map nerve mesh names to part IDs | 1 day |
| Ligament map | Map ligament mesh names to part IDs | 1 day |
| Categories | Extend from 4 (skeleton/muscle/organ/skin) to 6 (+nerve/ligament/vessel) | 2-3 hours |
| Regions | Verify 8 regions work with Open3DModel data | 1-2 hours |
| Clinical data structure | Define clinicalData.ts schema, populate first 20 muscles | 2-3 days |
| Special tests data | Add 10-15 shoulder/knee special tests with muscle mappings | 2-3 days |
| UI polish | Match anatomy-3d-viewer's space theme (dark, glassmorphism, stars) | 2-3 days |
| Responsive design | Mobile-friendly sidebar (drawer), touch controls | 1-2 days |
| Search | Bilingual search (nameEn + nameAr) | 4-6 hours |
| View presets | Front/back/left/right/top/iso views | 2-3 hours |
| Attribution footer | CC BY-SA attribution for Open3DModel | 1 hour |

**Deliverable:** Complete anatomy viewer with all body parts labeled in Arabic and English, clinical data for shoulder/knee, polished dark UI.

### Phase 3 — Clinical Intelligence (Week 5-7)

**Goal:** Special tests with 3D animations, pathology overlays, exercise prescriptions.

| Task | Details | Est. |
|---|---|---|
| ClinicalPanel | New UI panel showing special tests, pathologies, exercises for selected part | 2-3 days |
| Special test animations | Animate camera + highlight muscles involved in each test | 1-2 weeks |
| Pathology overlays | Color-code muscles showing pathology (e.g., torn supraspinatus = red) | 2-3 days |
| Exercise data | Add 30+ exercises with muscle targeting | 3-4 days |
| Muscle activation heatmap | Color intensity = activation level during exercise | 2-3 days |
| Clinical search | Search by pathology, test name, not just anatomy name | 1 day |
| Arabic clinical terms | Medical terminology in Arabic (use TA2 Latin + Arabic medical terms) | 2-3 days |

**Deliverable:** Clinical reference tool. Click supraspinatus → see Hawkins-Kennedy test animation, common impingement pathologies, rehabilitation exercises.

### Phase 4 — Learning System (Week 8-9)

**Goal:** Quizzes, flashcards, progress tracking.

| Task | Details | Est. |
|---|---|---|
| Quiz engine | "Click on the [part]" — verify via raycasting | 2-3 days |
| Quiz types | Multiple choice, click-to-identify, fill-in (name → part) | 2-3 days |
| Quiz data | 200+ questions across all body regions | 3-4 days |
| Flashcards | 3D model preview + name + description, flip to reveal | 2 days |
| Progress tracking | LocalStorage-based progress per part (seen/quiz-passed/mastered) | 1-2 days |
| Quiz UI | Dedicated quiz page with score, streak, time | 1-2 days |
| Arabic quiz content | All quiz questions in Arabic | 2-3 days |

**Deliverable:** Study platform. Students quiz themselves, track progress, use flashcards for review.

### Phase 5 — Sharing & Advanced 3D (Week 10-12)

**Goal:** Shareable views, cross-section, measurements, PWA.

| Task | Details | Est. |
|---|---|---|
| Shareable URLs | Encode camera position + selected parts in URL hash | 1 day |
| Cross-section | Clip planes (X/Y/Z) to slice through the body | 3-4 days |
| Measurement tools | Distance between landmarks, angle measurement | 2-3 days |
| 3D annotations | Pin text notes on anatomy parts (stored in URL) | 2-3 days |
| Progressive transparency | Slider: skin → muscle → bone layered reveal | 1-2 days |
| PWA | Service worker for offline GLB caching, install prompt | 2-3 days |
| Performance | Lazy-load region GLBs, LOD, Web Worker for mesh processing | 2-3 days |

**Deliverable:** Full-featured anatomy platform with sharing, advanced 3D tools, offline support.

---

## Licensing

### Code License
MIT License — open source, no restrictions.

### 3D Model License
CC BY-SA 4.0 (Open3DModel / Z-Anatomy / BodyParts3D)
**Required attribution:**
```
3D models: Open3DModel (anatomytool.org/open3dmodel)
Based on BodyParts3D © DBCLS and Z-Anatomy by Gauthier Kervyn
Licensed under CC BY-SA 4.0
```

### What CC BY-SA Means for You
- **Share** — You can redistribute the models
- **Adapt** — You can modify, remix, build upon
- **Attribution** — You MUST give credit
- **ShareAlike** — Derivative works must use the same CC BY-SA license
- **Your code** stays MIT — only the 3D model data is CC BY-SA

---

## Open Questions

1. **Arabic anatomy names** — Do you have a source for Arabic anatomical terminology? TA2 (Terminologia Anatomica) is Latin-based. Arabic medical terminology exists but varies by region. Options:
   - Use English names + Arabic transliteration
   - Use a standardized Arabic anatomy glossary (e.g., from Arab League medical terminology)
   - Crowdsource from medical students

2. **GLB file sizes** — Open3DModel GLBs need to be downloaded and possibly Draco-compressed further for browser performance. Need to test actual file sizes.

3. **Mesh naming** — Open3DModel uses Latin anatomical terms (e.g., "Musculus deltoideus"). Need to map these to your part IDs. May need a Blender script to extract the hierarchy.

4. **Abdominal/neck muscles** — anatomy-3d-viewer noted these were missing from BodyParts3D. Open3DModel added thorax/abdomen/back muscles in March 2026 — verify coverage.

---

## Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Open3DModel GLBs too large for mobile | Slow load, data usage | Draco compression, lazy loading per region, CDN fallback |
| Arabic medical terminology inconsistent | Confusing for users | Use TA2 Latin + English + Arabic transliteration, accept community corrections |
| CC BY-SA viral license | May require derivative works to be CC BY-SA | Consult lawyer — code is MIT, only 3D data is CC BY-SA. Clear separation. |
| Three.js performance on low-end devices | Janky 3D rendering | LOD, reduced polygon counts, disable effects on low-end (detect via WebGL) |
| next-intl RTL edge cases | Broken layouts | Test every component in both LTR and RTL early. Use CSS logical properties consistently. |

---

## Success Metrics

| Metric | Target | How to Measure |
|---|---|---|
| Load time (3D viewer ready) | < 5s on 4G | Lighthouse, WebPageTest |
| GLB download size | < 50MB total | Network tab |
| Arabic/English toggle | < 100ms | Performance measurement |
| Quiz completion rate | > 70% | LocalStorage analytics |
| Mobile usability | Score 90+ | Lighthouse mobile |
| Attribution compliance | 100% | Manual check |

---

## GSTACK REVIEW REPORT

**Plan reviewed by:** CEO Review (Scope Expansion mode)
**Date:** 2026-07-24
**Decisions made:** 12 (foundation, i18n, RTL, backend, models, styling, components, hosting, name, deployment, features, scope)
**Expansions accepted:** 5/6 (E1 clinical, E2 learning, E4 sharing, E5 PWA, E6 advanced 3D — E3 AI cut)
**Scope mode:** SCOPE EXPANSION
**Estimated timeline:** 10-12 weeks part-time
**Status:** READY FOR IMPLEMENTATION
