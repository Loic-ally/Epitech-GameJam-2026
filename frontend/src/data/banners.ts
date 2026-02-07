import type { Rarity } from '../Animation';
import type { Banner } from '../components/GachaPage';

export const GACHA_BANNERS: Banner[] = [
  {
    id: 'victor-ssj3',
    name: 'Victor SSJ3 — Père de l\'Univers',
    codename: 'Genèse Absolue',
    rarity: 'legendary' satisfies Rarity,
    element: 'Plasma Primordial',
    role: 'Créateur / Burst DPS',
    location: 'Nexus de la Création',
    accent: '#ff7b73',
    image: '/banners/victor.ssj3.jpg',
    description:
      'Avant le temps, avant l\'espace, il n\'y avait que Victor. D\'un seul cri, il brisa le silence éternel et le Big Bang naquit de sa colère. Chaque étoile est une étincelle de son aura SSJ3, chaque galaxie un écho de sa puissance. On dit que l\'univers tremble encore quand il transforme — car la réalité elle-même se souvient de son créateur. Ceux qui osent le défier affrontent la force qui a forgé les lois de la physique.',
    dropRates: { common: 70, rare: 22, epic: 6, legendary: 2 },
    featured: ['Victor', 'Fragment du Big Bang', 'Noyau de Genèse', 'Couronne Stellaire'],
    until: '07/03/2026',
  },
  {
    id: 'adam',
    name: 'Adam',
    codename: 'Premier Disciple',
    rarity: 'rare' satisfies Rarity,
    element: 'Terre',
    role: 'Off-tank',
    location: 'Monastère Suspendu',
    accent: '#d4b07a',
    image: '/banners/adam.lol.jpg',
    description:
      'Quand Victor forgea l\'univers, les débris de sa puissance formèrent les montagnes et les continents. Adam fut le premier être à émerger de cette roche primordiale, façonné par l\'écho du cri créateur. Élevé dans un monastère bâti sur un fragment du Nexus originel, il canalise le ki terrestre — un vestige direct de l\'énergie de la Genèse. Il est le gardien silencieux de l\'héritage du Père de l\'Univers.',
    dropRates: { common: 62, rare: 28, epic: 8, legendary: 2 },
    featured: ['Adam', 'Perle de Ki Originel', 'Brassards Lithiques', 'Fragment du Nexus'],
    until: '11/03/2026',
  },
];
