export type Category = 'skeleton' | 'muscle' | 'tendon' | 'nerve' | 'ligament' | 'vessel' | 'organ';

export type Side = 'left' | 'right' | 'center';

export type Region =
  | 'head'
  | 'neck'
  | 'chest'
  | 'abdomen'
  | 'back'
  | 'pelvis'
  | 'arm'
  | 'leg';

export type LabelMode = 'none' | 'major' | 'all';

export type DisplayMode = 'normal' | 'emphasize' | 'dim' | 'isolate';

export type CategoryFilter = Category | 'all';

export type ViewPreset = 'front' | 'back' | 'left' | 'right' | 'top' | 'iso';

export type BodyOrientation = 'stand' | 'supine';

export type CameraCommand =
  | { type: 'preset'; preset: ViewPreset }
  | { type: 'reset' }
  | { type: 'focus'; target: [number, number, number]; distance?: number }
  | { type: 'zoom'; factor: number };

export type Locale = 'en' | 'ar';

export interface SpecialTest {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  musclesInvolved: string[];
  positiveSignEn: string;
  positiveSignAr: string;
  category: string;
  subCategory?: string;
}

export interface Pathology {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  musclesInvolved: string[];
  commonIn: string;
}

export interface Exercise {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  musclesTargeted: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export type SceneModelKey = string;

export interface ModelOption {
  key: SceneModelKey;
  region?: string;
  labelEn: string;
  labelAr: string;
  descriptionEn: string;
  descriptionAr: string;
  file: string;
}
