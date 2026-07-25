import type { Category } from '../types/anatomy';

export interface CategoryMeta {
  id: Category;
  nameEn: string;
  nameAr: string;
  color: string;
  defaultVisible: boolean;
  order: number;
}

export const CATEGORIES: Record<Category, CategoryMeta> = {
  skeleton: {
    id: 'skeleton',
    nameEn: 'Skeleton',
    nameAr: 'الهيكل العظمي',
    color: '#e9e7e2',
    defaultVisible: true,
    order: 0,
  },
  muscle: {
    id: 'muscle',
    nameEn: 'Muscles',
    nameAr: 'العضلات',
    color: '#c0414f',
    defaultVisible: true,
    order: 1,
  },
  tendon: {
    id: 'tendon',
    nameEn: 'Tendons & Fascia',
    nameAr: 'الأوتار والغشاء',
    color: '#e8e0d8',
    defaultVisible: true,
    order: 2,
  },
  nerve: {
    id: 'nerve',
    nameEn: 'Nerves',
    nameAr: 'الأعصاب',
    color: '#b4c0e0',
    defaultVisible: true,
    order: 3,
  },
  ligament: {
    id: 'ligament',
    nameEn: 'Ligaments',
    nameAr: 'الأربطة',
    color: '#d4c8a0',
    defaultVisible: true,
    order: 4,
  },
  vessel: {
    id: 'vessel',
    nameEn: 'Blood Vessels',
    nameAr: 'الأوعية الدموية',
    color: '#cc3333',
    defaultVisible: true,
    order: 5,
  },
  organ: {
    id: 'organ',
    nameEn: 'Organs',
    nameAr: 'الأعضاء',
    color: '#d98c82',
    defaultVisible: true,
    order: 6,
  },
};

export const CATEGORY_LIST: CategoryMeta[] = Object.values(CATEGORIES).sort(
  (a, b) => a.order - b.order,
);

export const CATEGORY_FILTER_OPTIONS: { id: 'all' | Category; labelEn: string; labelAr: string }[] = [
  { id: 'all', labelEn: 'All', labelAr: 'الكل' },
  { id: 'skeleton', labelEn: 'Skeleton', labelAr: 'العظمي' },
  { id: 'muscle', labelEn: 'Muscles', labelAr: 'العضلات' },
  { id: 'tendon', labelEn: 'Tendons', labelAr: 'الأوتار' },
  { id: 'nerve', labelEn: 'Nerves', labelAr: 'الأعصاب' },
  { id: 'ligament', labelEn: 'Ligaments', labelAr: 'الأربطة' },
  { id: 'vessel', labelEn: 'Vessels', labelAr: 'الأوعية' },
  { id: 'organ', labelEn: 'Organs', labelAr: 'الأعضاء' },
];
