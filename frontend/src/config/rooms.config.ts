export interface RoomRegion {
    id: string;
    name: string;
    description: string;
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    minY: number;
    maxY: number;
}

export const ROOMS: RoomRegion[] = [
    {
        id: "Azeroth",
        name: "Salle Azeroth",
        description: "A mystical realm of magic.",
        minX: 17.35, maxX: 22.65,
        minZ: -14.65, maxZ: -4.17,
        minY: 0.6, maxY: 3.6
    },
    {
        id: "AFK",
        name: "Salle AFK",
        description: "Take a break, you deserve it.",
        minX: 17.52, maxX: 22.65,
        minZ: -3.22, maxZ: 2.0,
        minY: 0.6, maxY: 3.6
    },
    {
        id: "Cantina",
        name: "Salle Cantina",
        description: "Good food, good music, good vibes.",
        minX: 17.52, maxX: 22.65,
        minZ: 3.0, maxZ: 9.49,
        minY: 0.6, maxY: 3.6
    },
    {
        id: "Hub",
        name: "Salle Hub",
        description: "The central nexus of the station.",
        minX: 3.33, maxX: 9.65,
        minZ: 7.35, maxZ: 12.59,
        minY: 0.6, maxY: 3.6
    },
    {
        id: "Konoha",
        name: "Salle Konoha",
        description: "The village hidden in the leaves.",
        minX: -5.46, maxX: 2.38,
        minZ: 7.32, maxZ: 12.65,
        minY: 0.6, maxY: 3.6
    },
    {
        id: "Poudlard",
        name: "Salle Poudlard",
        description: "Where magic is taught and lived.",
        minX: -18.65, maxX: -6.57,
        minZ: 7.46, maxZ: 12.65,
        minY: 0.6, maxY: 3.6
    },
    {
        id: "Hyrule",
        name: "Salle Hyrule",
        description: "It's dangerous to go alone! Take this.",
        minX: -4.38, maxX: 2.15,
        minZ: -3.54, maxZ: 3.54,
        minY: 0.6, maxY: 3.6
    },
    {
        id: "TerreDuMilieu",
        name: "Salle Terre du Milieu",
        description: "Journey through Middle-earth.",
        minX: 5.35, maxX: 12.65,
        minZ: -3.65, maxZ: 3.53,
        minY: 0.6, maxY: 3.6
    },
    {
        id: "Bureau",
        name: "Salle Bureau",
        description: "Work, work, work.",
        minX: 4.34, maxX: 16.4,
        minZ: -14.62, maxZ: -7.46,
        minY: 0.6, maxY: 3.6
    },
    {
        id: "Hyrule",
        name: "Salle Hyrule",
        description: "It's dangerous to go alone! Take this.",
        minX: -4.38, maxX: 2.15,
        minZ: -3.54, maxZ: 3.54,
        minY: 0.6, maxY: 3.6
    },
    {
        id: "Lumiere",
        name: "Salle Lumière",
        description: "Everything the light touches.",
        minX: -5.72, maxX: -0.35,
        minZ: -12.65, maxZ: -7.47,
        minY: 0.6, maxY: 3.6
    },
    {
        id: "Pandora",
        name: "Salle Pandora",
        description: "A world beyond your imagination.",
        minX: -12.4, maxX: -6.67,
        minZ: -12.65, maxZ: -7.43,
        minY: 0.6, maxY: 3.6
    },
    {
        id: "Gotham",
        name: "Salle Gotham",
        description: "The city that never sleeps.",
        minX: -12.35, maxX: -5.33,
        minZ: -3.65, maxZ: 3.53,
        minY: 0.6, maxY: 3.6
    }
];
