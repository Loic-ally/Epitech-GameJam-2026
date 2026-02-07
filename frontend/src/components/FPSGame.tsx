import React, { useEffect, useRef, useState } from 'react';
import * as THREE from "three";
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper.js';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { useRoom } from '../hooks/useRoom';
import { Callbacks, Room } from '@colyseus/sdk';
import { Player } from '../types/player.type';

const FPSGame: React.FC = () => {
    const [currentScene, setCurrentScene] = useState<THREE.Scene<THREE.Object3DEventMap>>()
    const containerRef = useRef<HTMLDivElement>(null);
    const { room } = useRoom();
    const players = new Map<string, Player>();

    const createPlayer = (position: { x: number, y: number, z: number }) => {
        const loader = new GLTFLoader().setPath('./models/gltf/');
        if (!currentScene)
            return;

        loader.load('Player.glb', function(gltf: GLTF) {
            const playerClone = gltf.scene.clone(); 

            playerClone.position.set(position.x, position.y, position.z);
            currentScene.add(playerClone);
            return () => currentScene.remove(playerClone);
        })
    };

    useEffect(() => {
        createPlayer({x: 0, y: 1, z: 0});
    }, [currentScene]);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const clock = new THREE.Clock();

        const scene = new THREE.Scene();
        setCurrentScene(scene);
        scene.background = new THREE.Color(0x88ccee);
        scene.fog = new THREE.Fog(0x88ccee, 0, 50);

        const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.rotation.order = 'YXZ';

        const fillLight1 = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
        fillLight1.position.set(2, 1, 1);
        scene.add(fillLight1);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
        directionalLight.position.set(-5, 25, -1);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.01;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.left = -30;
        directionalLight.shadow.camera.top = 30;
        directionalLight.shadow.camera.bottom = -30;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.radius = 4;
        directionalLight.shadow.bias = -0.00006;
        scene.add(directionalLight);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.VSMShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        container.appendChild(renderer.domElement);

        const stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        container.appendChild(stats.domElement);

        const GRAVITY = 30;

        const STEPS_PER_FRAME = 5;

        const worldOctree = new Octree();

        const playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);

        const playerVelocity = new THREE.Vector3();
        const playerDirection = new THREE.Vector3();

        let playerOnFloor = false;
        const keyStates: { [key: string]: boolean } = {};

        const onKeyDown = (event: KeyboardEvent) => {
            keyStates[event.code] = true;
            const player = players.get(room?.sessionId as string);

            if (room && player) {
                room.send("move", {
                    x: player.x,
                    y: player.y,
                    z: player.z
                });
            }
        };

        const onKeyUp = (event: KeyboardEvent) => {
            keyStates[event.code] = false;
        };

        const onMouseDown = () => {
            document.body.requestPointerLock();
        };

        const onMouseMove = (event: MouseEvent) => {
            if (document.pointerLockElement === document.body) {
                camera.rotation.y -= event.movementX / 500;
                camera.rotation.x -= event.movementY / 500;
            }
        };

        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        container.addEventListener('mousedown', onMouseDown);
        document.body.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', onWindowResize);

        function playerCollisions() {
            const result = worldOctree.capsuleIntersect(playerCollider);

            playerOnFloor = false;

            if (result) {
                playerOnFloor = result.normal.y > 0;

                if (!playerOnFloor) {
                    playerVelocity.addScaledVector(result.normal, -result.normal.dot(playerVelocity));
                }

                if (result.depth >= 1e-10) {
                    playerCollider.translate(result.normal.multiplyScalar(result.depth));
                }
            }
        }

        function updatePlayer(deltaTime: number) {
            let damping = Math.exp(-4 * deltaTime) - 1;

            if (!playerOnFloor) {
                playerVelocity.y -= GRAVITY * deltaTime;
                damping *= 0.1;
            }

            playerVelocity.addScaledVector(playerVelocity, damping);

            const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
            playerCollider.translate(deltaPosition);

            playerCollisions();

            camera.position.copy(playerCollider.end);
        }

        createPlayer({x: 0, y: 1, z: 0});

        function getForwardVector() {
            camera.getWorldDirection(playerDirection);
            playerDirection.y = 0;
            playerDirection.normalize();
            return playerDirection;
        }

        function getSideVector() {
            camera.getWorldDirection(playerDirection);
            playerDirection.y = 0;
            playerDirection.normalize();
            playerDirection.cross(camera.up);
            return playerDirection;
        }

        function controls(deltaTime: number) {
            const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);

            if (keyStates['KeyW']) {
                playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
            }

            if (keyStates['KeyS']) {
                playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
            }

            if (keyStates['KeyA']) {
                playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
            }

            if (keyStates['KeyD']) {
                playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
            }

            if (playerOnFloor) {
                if (keyStates['Space']) {
                    playerVelocity.y = 10;
                }
            }
        }

        const loader = new GLTFLoader().setPath('./models/gltf/');

        loader.load('Basic.glb', (gltf: GLTF) => {
            scene.add(gltf.scene);

            worldOctree.fromGraphNode(gltf.scene);

            gltf.scene.traverse((child: THREE.Object3D) => {
                if ((child as THREE.Mesh).isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    const mesh = child as THREE.Mesh;
                    if (mesh.material instanceof THREE.MeshStandardMaterial && mesh.material.map) {
                        mesh.material.map.anisotropy = 4;
                    }
                }
            });

            const helper = new OctreeHelper(worldOctree);
            helper.visible = false;
            scene.add(helper);

            const gui = new GUI({ width: 200 });
            gui.add({ debug: false }, 'debug')
                .onChange(function (value: boolean) {
                    helper.visible = value;
                });

            return () => {
                gui.destroy();
            }
        });

        function teleportPlayerIfOob() {
            if (camera.position.y <= -25) {
                playerCollider.start.set(0, 0.35, 0);
                playerCollider.end.set(0, 1, 0);
                playerCollider.radius = 0.35;
                camera.position.copy(playerCollider.end);
                camera.rotation.set(0, 0, 0);
            }
        }

        function animate() {
            const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

            for (let i = 0; i < STEPS_PER_FRAME; i++) {
                controls(deltaTime);
                updatePlayer(deltaTime);
                teleportPlayerIfOob();
            }

            renderer.render(scene, camera);
            stats.update();
        }

        renderer.setAnimationLoop(animate);

        if (room) {
            const callbacks = Callbacks.get(room);

            callbacks.onAdd("players", (entity, sessionId) => {
                players.set(sessionId as string, {
                    id: sessionId as string,
                    x: (entity as Player).x,
                    y: (entity as Player).y,
                    z: (entity as Player).z
                });

                callbacks.listen(entity, "x", (currentPos,  previousPosition) => {
                    const player = players.get(sessionId as string);

                    if (player) {
                        players.set(sessionId as string, {
                            ...player, x: currentPos as number,
                        });
                    }
                });

                callbacks.listen(entity, "y", (currentPos,  previousPosition) => {
                    const player = players.get(sessionId as string);

                    if (player) {
                        players.set(sessionId as string, {
                            ...player, y: currentPos as number,
                        });
                    }
                });

                callbacks.listen(entity, "z", (currentPos,  previousPosition) => {
                    const player = players.get(sessionId as string);

                    if (player) {
                        players.set(sessionId as string, {
                            ...player, z: currentPos as number,
                        });
                    }
                });
            });
        }

        return () => {
            renderer.setAnimationLoop(null);
            if (container) {
                container.removeChild(renderer.domElement);
                container.removeChild(stats.domElement);
            }

            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            container.removeEventListener('mousedown', onMouseDown);
            document.body.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', onWindowResize);

            renderer.dispose();
            scene.remove();
        };
    }, []);

    return (
        <div ref={containerRef} id="container">
            <div id="info" style={{ position: 'absolute', top: '10px', width: '100%', textAlign: 'center', zIndex: 100, display: 'block', color: 'white' }}>
                <b>EPIGang</b><br />
                MOUSE to look around<br />
                ZQSD to move and SPACE to jump
            </div>
        </div>
    );
};

export default FPSGame;
