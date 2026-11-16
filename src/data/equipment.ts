import type { Equipment, EquipmentCategory } from './types';

/**
 * Catégories d'équipement, dans l'ordre d'affichage.
 * Un équipement dont la catégorie n'existe pas ici est rangé dans « Autres ».
 */
export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  { id: 'cardio', label: 'Cardio' },
  { id: 'musculation', label: 'Musculation' },
  { id: 'accessoires', label: 'Accessoires' },
];

/**
 * Équipement disponible dans l'app.
 *
 * Pour ajouter un équipement : ajoute une ligne ici, puis des exercices dans
 * `exercises.ts` dont le champ `equipment` contient son `id`. C'est tout :
 * l'interface et le générateur se mettent à jour tout seuls.
 *
 * ⚠️ Ne change pas l'`id` d'un équipement existant : il sert dans la sauvegarde locale.
 */
export const EQUIPMENT: Equipment[] = [
  { id: 'tapis-roulant', label: 'Tapis roulant', icon: '🏃', category: 'cardio' },
  { id: 'rameur', label: 'Rameur', icon: '🚣', category: 'cardio' },
  { id: 'velo-droit', label: 'Vélo stationnaire droit', icon: '🚲', category: 'cardio' },
  {
    id: 'multifonction',
    label: 'Appareil multifonction à charge guidée',
    icon: '⚙️',
    category: 'musculation',
  },
  { id: 'banc', label: 'Banc ajustable', icon: '🪑', category: 'musculation' },
  { id: 'halteres', label: 'Haltères de tout poids', icon: '🏋️', category: 'musculation' },
  { id: 'tapis-sol', label: 'Tapis de sol', icon: '🧘', category: 'accessoires' },
];
