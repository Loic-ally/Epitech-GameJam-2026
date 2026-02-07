import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from "three";
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper.js';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { useRoom } from '../hooks/useRoom';
import { Callbacks } from '@colyseus/sdk';
import { Player } from '../types/player.type';
import { ROOMS, RoomRegion } from '../config/rooms.config';

const FPSGame: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const playersRef = useRef<Map<string, Player>>(new Map());
    const { room } = useRoom();
    const [currentRoom, setCurrentRoom] = useState<RoomRegion | null>(null);

    const createPlayerLabel = (name: string) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) return null;

        canvas.width = 512;
        canvas.height = 128;

        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.roundRect(0, 0, canvas.width, canvas.height, 20);
        context.fill();

        context.font = 'bold 48px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(name, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(2, 0.5, 1);
        sprite.position.y = 1.5; // Above player head
        return sprite;
    };

    const createPlayerModel = useCallback(async (scene: THREE.Scene, position: { x: number, y: number, z: number }, name?: string, isLocal: boolean = false) => {
        const loader = new GLTFLoader().setPath('./models/gltf/');

        return new Promise<THREE.Group>((resolve) => {
            loader.load('Player.glb', function(gltf: GLTF) {
                const playerClone = gltf.scene.clone();
                playerClone.position.set(position.x, position.y, position.z);

                if (!isLocal && name) {
                    const label = createPlayerLabel(name);
                    if (label) {
                        playerClone.add(label);
                    }
                }

                const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());

                gltf.scene.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        const color = (child.material as THREE.MeshStandardMaterial).color;

                        if (color.r > 0.5 && color.g > 0.5 && color.b > 0.5) {
                            (child.material as THREE.MeshStandardMaterial).color.set(randomColor);
                        }
                    }
                });

                scene.add(playerClone);
                resolve(playerClone);
            })
        });
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;

        const players = playersRef.current;
        const container = containerRef.current;
        const clock = new THREE.Clock();

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0x88ccee);
        scene.fog = new THREE.Fog(0x88ccee, 0, 50);

        const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.rotation.order = 'YXZ';
        camera.rotation.y = Math.PI;

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

        const GRAVITY = 50;

        const STEPS_PER_FRAME = 5;

        const worldOctree = new Octree();

        const playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);

        const spawnPos = { x: 1.7, y: 0.7, z: -9.97 };

        const setSpawn = (pos: { x: number, y: number, z: number }) => {
            playerCollider.start.set(pos.x, pos.y, pos.z);
            playerCollider.end.set(pos.x, pos.y + 0.65, pos.z);
        };

        setSpawn(spawnPos);

        const playerVelocity = new THREE.Vector3();
        const playerDirection = new THREE.Vector3();

        let playerOnFloor = false;
        const keyStates: { [key: string]: boolean } = {};

        const sendMovement = () => {
            const player = players.get(room?.sessionId as string);

            if (room && player) {
                room.send("move", {
                    x: player.x,
                    y: player.y,
                    z: player.z,
                    rotationY: camera.rotation.y
                });
            }
        };

        const onKeyDown = (event: KeyboardEvent) => {
            keyStates[event.code] = true;
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
            const player = players.get(room?.sessionId as string);

            if (!playerOnFloor) {
                playerVelocity.y -= GRAVITY * deltaTime;
                damping *= 0.1;
            }

            playerVelocity.addScaledVector(playerVelocity, damping);

            const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
            playerCollider.translate(deltaPosition);

            playerCollisions();

            if (player) {
                players.set(room?.sessionId as string, {
                    ...player,
                    x: playerCollider.end.x,
                    y: playerCollider.end.y,
                    z: playerCollider.end.z,
                });
                if (player.object) {
                    player.object.position.set(playerCollider.end.x, playerCollider.end.y, playerCollider.end.z);
                    // Hide local player model to avoid seeing inside own head
                    player.object.visible = false;
                }
            }

            sendMovement();

            camera.position.copy(playerCollider.end);
        }

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
                setSpawn(spawnPos);
                camera.position.copy(playerCollider.end);
                camera.rotation.set(0, Math.PI, 0);
                if (room) {
                    room.send("move", spawnPos);
                }
            }
        }

        let localCurrentRoomId: string | null = null;

        function checkRoomRegion() {
            const pos = playerCollider.end;
            let foundRoom: RoomRegion | null = null;

            for (const r of ROOMS) {
                if (pos.x >= r.minX && pos.x <= r.maxX &&
                    pos.z >= r.minZ && pos.z <= r.maxZ &&
                    pos.y >= r.minY && pos.y <= r.maxY) {
                    foundRoom = r;
                    break;
                }
            }

            if ((foundRoom?.id || null) !== localCurrentRoomId) {
                localCurrentRoomId = foundRoom?.id || null;
                setCurrentRoom(foundRoom);
            }
        }

        function animate() {
            const frameDelta = clock.getDelta();
            const deltaTime = Math.min(0.05, frameDelta) / STEPS_PER_FRAME;

            for (let i = 0; i < STEPS_PER_FRAME; i++) {
                controls(deltaTime);
                updatePlayer(deltaTime);
                teleportPlayerIfOob();
                checkRoomRegion();
            }

            players.forEach((player, sessionId) => {
                if (sessionId === room?.sessionId) return;
                if (!player.object) return;

                const lerpFactor = Math.min(5, 10 * frameDelta);
                player.object.position.lerp(new THREE.Vector3(player.x, player.y, player.z), lerpFactor);
                player.object.rotation.y = THREE.MathUtils.lerp(player.object.rotation.y, player.rotationY || 0, lerpFactor);
            });

            renderer.render(scene, camera);
            stats.update();
        }

        renderer.setAnimationLoop(animate);

        let playersCallback: any | null = null;

        if (room) {
            const callbacks = Callbacks.get(room as any) as any;

            callbacks.onAdd("players", async (entity: any, sessionId: string) => {
                if (players.get(sessionId)) {
                    return;
                }

                const isLocal = sessionId === room.sessionId;
                const model = await createPlayerModel(scene, { x: entity.x, y: entity.y, z: entity.z }, entity.displayName, isLocal);

                if (model) {
                    model.rotation.y = entity.rotationY || 0;
                }

                players.set(sessionId, {
                    id: sessionId,
                    displayName: entity.displayName,
                    x: entity.x,
                    y: entity.y,
                    z: entity.z,
                    rotationY: entity.rotationY || 0,
                    object: model!
                });

                callbacks.listen(entity as any, "x", (currentPos: number) => {
                    const player = players.get(sessionId);
                    if (player) {
                        player.x = currentPos;
                    }
                });

                callbacks.listen(entity as any, "y", (currentPos: number) => {
                    const player = players.get(sessionId);
                    if (player) {
                        player.y = currentPos;
                    }
                });

                callbacks.listen(entity as any, "z", (currentPos: number) => {
                    const player = players.get(sessionId);
                    if (player) {
                        player.z = currentPos;
                    }
                });

                callbacks.listen(entity as any, "rotationY", (currentRotation: number) => {
                    const player = players.get(sessionId);
                    if (player) {
                        player.rotationY = currentRotation;
                    }
                });
            });

            callbacks.onRemove("players", (_entity: any, sessionId: string) => {
                const player = players.get(sessionId);
                if (player && player.object) {
                    scene.remove(player.object);
                }
                players.delete(sessionId);
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
            scene.clear();
            if (playersCallback) {
                playersCallback();
            }
        };
    }, [createPlayerModel, room]);

    return (
        <div ref={containerRef} id="container">
            <div id="info" style={{ position: 'absolute', top: '10px', width: '100%', textAlign: 'center', zIndex: 100, display: 'block', color: 'white' }}>
                <b>EPIGang</b><br />
                MOUSE to look around<br />
                ZQSD to move and SPACE to jump
                {currentRoom && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '5px' }}>
                        <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{currentRoom.name}</div>
                        <div style={{ fontSize: '0.9em', fontStyle: 'italic' }}>{currentRoom.description}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FPSGame;
