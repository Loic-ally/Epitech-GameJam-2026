import * as THREE from 'three';

export interface Player {
    id: string;
    displayName?: string;
    x: number;
    y: number;
    z: number;
    rotationY?: number;
    rotationX?: number;
    object: THREE.Group<THREE.Object3DEventMap>;
    label?: THREE.Sprite;
}
