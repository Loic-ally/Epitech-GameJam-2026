import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Float, 
  Sparkles, 
  Text
} from '@react-three/drei';
import { 
  EffectComposer, 
  Bloom, 
  Vignette,
  ChromaticAberration 
} from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { createBrickTexture } from '../utils/threeHelpers';

// --- Props & Interfaces ---
export interface FloatingIslandSceneProps {
  onFormVisible?: (visible: boolean) => void;
  onGameLaunch?: () => void;
  isBlurred?: boolean;
}

// --- Materials & Textures ---
const BrickMaterial = () => {
  const texture = useMemo(() => createBrickTexture(), []);
  return <meshStandardMaterial map={texture} color="#c8463a" roughness={0.6} />;
};

// --- Sub-Components ---
const IslandBase = () => {
  return (
    <group position={[0, -2, 0]}>
      {/* Main Rock - Single Truncated Inverted Cone */}
      <mesh castShadow receiveShadow position={[0, -1.8, 0]}>
         {/* args: [radiusTop, radiusBottom, height, radialSegments] */}
        <cylinderGeometry args={[5.2, 1.2, 4.5, 8]} />
        <meshStandardMaterial color="#6a5a4a" flatShading roughness={0.9} />
      </mesh>

      {/* Grass Top - Slightly larger than rock top */}
      <mesh receiveShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[5.4, 5.2, 0.4, 12]} />
        <meshStandardMaterial color="#49a36a" flatShading roughness={0.8} />
      </mesh>
      
      {/* Floating Debris Rocks */}
      {[...Array(6)].map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={2} floatIntensity={1}>
           <mesh 
            position={[
              Math.sin(i * 1.5) * 6, 
              Math.random() * 4 - 3, 
              Math.cos(i * 1.5) * 6
            ]} 
            scale={0.4 + Math.random() * 0.4}
            castShadow
          >
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial color="#5a4a3a" flatShading />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

const KM0Building = () => {
  // Centered position approx on top of the island
  // Adjusted to -1.3 to sit perfectly on the grass (which is at -2 + 0.7 = -1.3 world y)
  return (
    <group position={[0, -1.3, 0]}>
      {/* Main Body - Centered */}
      <mesh castShadow position={[0, 1.5, 0]}>
        <boxGeometry args={[4, 3, 3]} />
        <BrickMaterial />
      </mesh>

      {/* Windows on Front */}
      {[...Array(4)].map((_, i) => (
        <group key={`win-front-${i}`} position={[-1 + (i % 2) * 2, 1 + Math.floor(i / 2) * 1.2, 1.55]}>
             <mesh>
                <boxGeometry args={[0.8, 0.8, 0.1]} />
                <meshStandardMaterial color="#2d3436" roughness={0.2} metalness={0.8} />
             </mesh>
             <mesh position={[0, -0.1, 0.06]}>
                <boxGeometry args={[0.8, 0.2, 0.05]} />
                <meshStandardMaterial color="#a0d8ef" emissive="#a0d8ef" emissiveIntensity={0.8} />
             </mesh>
        </group>
      ))}
      
       {/* Windows on Back */}
       {[...Array(4)].map((_, i) => (
        <group key={`win-back-${i}`} position={[-1 + (i % 2) * 2, 1 + Math.floor(i / 2) * 1.2, -1.55]}>
             <mesh>
                <boxGeometry args={[0.8, 0.8, 0.1]} />
                <meshStandardMaterial color="#2d3436" roughness={0.2} metalness={0.8} />
             </mesh>
             <mesh position={[0, -0.1, 0.06]}>
                <boxGeometry args={[0.8, 0.2, 0.05]} />
                <meshStandardMaterial color="#a0d8ef" emissive="#a0d8ef" emissiveIntensity={0.8} />
             </mesh>
        </group>
      ))}

      {/* Taller Corner Tower (Spire) - Now relatively positioned */}
      <group position={[2.5, 2.5, 1.5]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 8, 1.5]} />
          <BrickMaterial />
        </mesh>
        {/* Spire Roof */}
        <mesh castShadow position={[0, 5.5, 0]} rotation={[0, Math.PI/4, 0]}>
           <coneGeometry args={[1.2, 3, 4]} />
           <meshStandardMaterial color="#2d3436" />
        </mesh>
        
        {/* KM0 Text Sign */}
        <group position={[0, 2, 0.8]}>
            <mesh position={[0, 0, 0]}>
                <planeGeometry args={[1.2, 0.8]} />
                <meshStandardMaterial color="#111" />
            </mesh>
            <Text 
                position={[0, 0, 0.01]} 
                fontSize={0.5} 
                color="#ff6b35"
                anchorX="center"
                anchorY="middle"
                font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
            >
                KM0
            </Text>
        </group>
      </group>

      {/* Base Trim */}
      <mesh castShadow position={[0, -0.1, 0]}>
         <boxGeometry args={[4.2, 0.2, 3.2]} />
         <meshStandardMaterial color="#555" />
      </mesh>
    </group>
  );
};

const StylizedCloud = ({ position, scale = 1 }: { position: [number, number, number], scale?: number }) => {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (group.current) {
        group.current.position.x += delta * 0.15; 
        if (group.current.position.x > 35) group.current.position.x = -35;
    }
  });

  return (
    <group ref={group} position={position} scale={scale}>
      {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[
             (Math.random() - 0.5) * 1.5,
             (Math.random() - 0.5) * 0.5,
             (Math.random() - 0.5) * 1
          ]}>
            <sphereGeometry args={[0.8 + Math.random() * 0.4, 16, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} flatShading />
          </mesh>
      ))}
    </group>
  );
};

// --- Scene Manager/Controller ---
const SceneController = ({ onFormVisible, onGameLaunch }: FloatingIslandSceneProps) => {
  const { camera } = useThree();
  const islandRef = useRef<THREE.Group>(null);
  
  // Track the state of our scene to handle rotation behaviors
  const sceneState = useRef<'start' | 'transitioning' | 'form' | 'game'>('start');

  useFrame((state, delta) => {
    if (islandRef.current) {
      if (sceneState.current === 'start') {
        // Normal idle speed - IMPROVED: Faster idle (0.2)
        islandRef.current.rotation.y += delta * 0.2; 
      } else if (sceneState.current === 'form') {
        // Slower rotation while in form view - IMPROVED: Faster form (0.1)
        islandRef.current.rotation.y += delta * 0.5;
      }
      // 'transitioning' and 'game' have no manual rotation (handled by GSAP or stopped)
    }
  });

  useEffect(() => {
    (window as any).__transitionToForm = () => {
      sceneState.current = 'transitioning';

      // 1. CAMERA STAYS STATIC (Just simple zoom)
      gsap.to(camera.position, {
        x: 0, 
        y: 6,
        z: 18, 
        duration: 1.5,
        ease: 'power2.inOut'
      });
      
      // 2. ISLAND MOVES & ROTATES WITH "LAUNCH" SPIN
      if (islandRef.current) {
        const currentRot = islandRef.current.rotation.y;
        
        // Calculate forward rotation needed to reach 0.5
        const twoPi = Math.PI * 2;
        let normalizedRot = currentRot % twoPi;
        if (normalizedRot < 0) normalizedRot += twoPi;

        // How much more do we need to turn to reach 0.5?
        let angleToTarget = 0.5 - normalizedRot;
        if (angleToTarget <= 0) angleToTarget += twoPi; 

        // Add exactly 1 extra full spin for the "launch" effect
        const spinAmount = angleToTarget + twoPi;
        const targetRot = currentRot + spinAmount;

        gsap.to(islandRef.current.rotation, {
          y: targetRot, 
          duration: 1.5,
          ease: 'power1.out', // Gentler ease that doesn't fully stop momentum before handling over
          onComplete: () => {
             if (islandRef.current) {
                 islandRef.current.rotation.y = islandRef.current.rotation.y % twoPi;
             }
             sceneState.current = 'form'; 
          }
        });
        
        // Move island to LEFT
        gsap.to(islandRef.current.position, {
          x: -6, 
          duration: 1.5,
          ease: 'power2.inOut'
        });
      }
      setTimeout(() => onFormVisible?.(true), 1000); // Trigger form slight earlier for sync
    };

    (window as any).__transitionToGame = () => {
      sceneState.current = 'transitioning';
      onFormVisible?.(false);
      
      if (islandRef.current) {
        // Fly island up
        gsap.to(islandRef.current.position, {
           x: 0,
           y: 20, 
           duration: 2.0,
           ease: 'power2.in'
        });
      }
      // Camera follows slightly
       gsap.to(camera.position, {
        x: 0,
        y: -5,
        z: 5,
        duration: 1.5,
        ease: 'power2.in',
        onComplete: () => {
          sceneState.current = 'game';
        }
      });
      setTimeout(() => onGameLaunch?.(), 1000);
    };

    return () => {
      delete (window as any).__transitionToForm;
      delete (window as any).__transitionToGame;
    };
  }, [camera, onFormVisible, onGameLaunch]);

  return (
    <group ref={islandRef}>
      <Float speed={2} rotationIntensity={0} floatIntensity={2} floatingRange={[-0.2, 0.2]}>
        <group>
          <IslandBase />
          <KM0Building />
        </group>
      </Float>
    </group>
  );
};

export const FloatingIslandScene: React.FC<FloatingIslandSceneProps> = (props) => {
    const skyColor = '#60a5fa'; 

    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        background: skyColor,
        transition: 'filter 0.8s ease',
        filter: props.isBlurred ? 'blur(5px)' : 'none'
      }}>
        <Canvas shadows camera={{ position: [0, 6, 22], fov: 42 }}>
          <color attach="background" args={[skyColor]} />
          <fog attach="fog" args={[skyColor, 20, 90]} />
          
          <ambientLight intensity={1.0} color="#ffffff" />
          <directionalLight 
            position={[50, 80, 40]} 
            intensity={2} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />
          <hemisphereLight args={['#fff', '#333', 0.8]} />

          <SceneController {...props} />
          
          {[...Array(15)].map((_, i) => (
             <StylizedCloud 
               key={i} 
               position={[
                 (Math.random() - 0.5) * 50, 
                 5 + Math.random() * 10, 
                 (Math.random() - 0.5) * 30 - 10
               ]} 
               scale={0.8 + Math.random() * 0.8}
             />
          ))}

          <EffectComposer enableNormalPass={false}>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={0.5} radius={0.4} />
            <Vignette eskil={false} offset={0.1} darkness={0.5} />
            <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
          </EffectComposer>
  
          {/* Controls - Disable autoRotate (we do it manually in SceneController) */}
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            maxPolarAngle={Math.PI / 2.1} 
            minPolarAngle={Math.PI / 4}
            autoRotate={false} 
          />
        </Canvas>
      </div>
    );
};
