export type EquipmentStatus = 'available' | 'assigned' | 'maintenance' | 'retired';
export type EquipmentCategory =
  | 'laptop'
  | 'desktop'
  | 'monitor'
  | 'keyboard'
  | 'mouse'
  | 'headset'
  | 'phone'
  | 'tablet'
  | 'other';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  brand: string;
  serialNumber: string;
  status: EquipmentStatus;
  assignedTo?: string; // user id
  purchaseDate: string;
  notes?: string;
}

export const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  laptop: 'Laptop',
  desktop: 'Desktop',
  monitor: 'Moniteur',
  keyboard: 'Clavier',
  mouse: 'Souris',
  headset: 'Casque',
  phone: 'Téléphone',
  tablet: 'Tablette',
  other: 'Autre',
};

export const CATEGORY_ICONS: Record<EquipmentCategory, string> = {
  laptop: '💻',
  desktop: '🖥️',
  monitor: '🖥️',
  keyboard: '⌨️',
  mouse: '🖱️',
  headset: '🎧',
  phone: '📱',
  tablet: '📋',
  other: '📦',
};
