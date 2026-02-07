import * as THREE from 'three';

export interface Player {
    id: string;
    x: number;
    y: number;
    z: number;
    object: THREE.Group<THREE.Object3DEventMap>
}
