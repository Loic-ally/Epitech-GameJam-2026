import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

export class LoginScene {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private islandGroup!: THREE.Group;
  private clouds: THREE.Sprite[] = [];
  private animationId: number | null = null;
  private islandRotationSpeed = 0.002;

  constructor(private container: HTMLDivElement) {
    this.init();
    this.createIsland();
    this.createClouds();
    this.setupLights();
    this.setupResize();
    this.animate();
  }

  private init(): void {
    // Scene with sky blue background
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

    // Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 5, 15);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Controls (disable zooming)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
  }

  private createIsland(): void {
    this.islandGroup = new THREE.Group();

    // Low-poly island base - Bigger and smoother
    const baseGeometry = new THREE.CylinderGeometry(7, 8, 3, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a7c4e,
      flatShading: true,
      roughness: 0.8,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -1.5;
    this.islandGroup.add(base);

    // Brick-textured building - Rectangular shape
    const buildingGeometry = new THREE.BoxGeometry(5, 3.5, 3);
    
    // Create brick texture using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Draw brick pattern
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, 256, 256);
    
    ctx.fillStyle = '#A0522D';
    const brickWidth = 64;
    const brickHeight = 32;
    
    for (let y = 0; y < 256; y += brickHeight) {
      for (let x = 0; x < 256; x += brickWidth) {
        // Random slight color variation
        ctx.fillStyle = Math.random() > 0.5 ? '#A0522D' : '#964B26';
        const offset = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
        ctx.fillRect(x + offset, y, brickWidth - 4, brickHeight - 4);
      }
    }
    
    const brickTexture = new THREE.CanvasTexture(canvas);
    brickTexture.wrapS = THREE.RepeatWrapping;
    brickTexture.wrapT = THREE.RepeatWrapping;
    
    const buildingMaterial = new THREE.MeshStandardMaterial({
      map: brickTexture,
      roughness: 0.7,
    });
    
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 1.75; // Half of 3.5
    this.islandGroup.add(building);

    // Cathedral-style spire at one corner - Shorter
    const spireGeometry = new THREE.BoxGeometry(0.8, 2.5, 0.8);
    const spireMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a5a5a,
      flatShading: true,
    });
    const spire = new THREE.Mesh(spireGeometry, spireMaterial);
    // Position adjusted for new building size and spire height
    // Building width is 5 (x from -2.5 to 2.5), depth 3 (z from -1.5 to 1.5)
    // Place spire near corner x=1.8, z=1.0
    spire.position.set(1.8, 3.5 + 1.25 - 0.5, 1.0); // y = Top of building + half spire - overlap
    spire.position.y = 3.5; // Let's simplify: Building max Y = 3.5. Spire Base = 2.25.
    this.islandGroup.add(spire);

    // Spire cap (pyramid)
    const capGeometry = new THREE.ConeGeometry(0.7, 1.5, 4);
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      flatShading: true,
    });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.set(1.8, 3.5 + 1.25 + 0.75, 1.0); // SpireY + HalfSpire + HalfCap
    cap.rotation.y = Math.PI / 4;
    this.islandGroup.add(cap);
    
    // Add some vegetation
    this.addVegetation();

    this.scene.add(this.islandGroup);
  }

  private addVegetation(): void {
    const bushGeometry = new THREE.IcosahedronGeometry(0.6, 0);
    const bushMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228B22, 
      flatShading: true 
    });
    const treeTrunkGeo = new THREE.CylinderGeometry(0.1, 0.2, 1, 6);
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
    const treeLeavesGeo = new THREE.ConeGeometry(1, 2, 6);
    const treeLeavesMat = new THREE.MeshStandardMaterial({ color: 0x228B22, flatShading: true });

    // Add bushes randomly
    for(let i=0; i<8; i++) {
        const bush = new THREE.Mesh(bushGeometry, bushMaterial);
        const radius = 3 + Math.random() * 2;
        const angle = Math.random() * Math.PI * 2;
        bush.position.set(Math.cos(angle)*radius, 0.3, Math.sin(angle)*radius);
        bush.rotation.set(Math.random(), Math.random(), Math.random());
        this.islandGroup.add(bush);
    }
    
    // Add a couple of simplistic trees
    for(let i=0; i<3; i++) {
        const treeGroup = new THREE.Group();
        const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
        trunk.position.y = 0.5;
        const leaves = new THREE.Mesh(treeLeavesGeo, treeLeavesMat);
        leaves.position.y = 1.5;
        
        treeGroup.add(trunk);
        treeGroup.add(leaves);
        
        const radius = 4 + Math.random() * 1.5;
        const angle = Math.random() * Math.PI * 2;
        treeGroup.position.set(Math.cos(angle)*radius, 0, Math.sin(angle)*radius);
        
        // Don't put trees inside the building (approx check)
        if (Math.abs(treeGroup.position.x) > 3 || Math.abs(treeGroup.position.z) > 2) {
             this.islandGroup.add(treeGroup);
        }
    }
  }

  private createClouds(): void {
    const cloudTexture = this.createCloudTexture();
    const spriteMaterial = new THREE.SpriteMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.7,
    });

    // Create multiple clouds
    for (let i = 0; i < 15; i++) {
      const sprite = new THREE.Sprite(spriteMaterial.clone());
      
      // Random position in the sky
      sprite.position.set(
        (Math.random() - 0.5) * 40,
        Math.random() * 10 + 5,
        (Math.random() - 0.5) * 40
      );
      
      // Random scale
      const scale = Math.random() * 3 + 2;
      sprite.scale.set(scale, scale * 0.6, 1);
      
      // Store initial position for animation
      (sprite as any).userData = {
        initialX: sprite.position.x,
        speed: Math.random() * 0.01 + 0.005,
      };
      
      this.clouds.push(sprite);
      this.scene.add(sprite);
    }
  }

  private createCloudTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Create fluffy cloud shape
    ctx.fillStyle = 'white';
    ctx.beginPath();
    
    // Multiple overlapping circles for fluffy effect
    const circles = [
      { x: 40, y: 64, r: 20 },
      { x: 64, y: 64, r: 25 },
      { x: 88, y: 64, r: 20 },
      { x: 52, y: 50, r: 18 },
      { x: 76, y: 50, r: 18 },
    ];
    
    circles.forEach(circle => {
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
      ctx.fill();
    });

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  private setupLights(): void {
    // Hemisphere light for natural outdoor feeling
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    this.scene.add(hemisphereLight);

    // Directional light (sun) with warmer color
    const directionalLight = new THREE.DirectionalLight(0xffdfba, 1.2); 
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xb0e0e6, 0.4);
    fillLight.position.set(-5, 0, -5);
    this.scene.add(fillLight);
  }

  private setupResize(): void {
    window.addEventListener('resize', () => {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    // Rotate island slowly
    this.islandGroup.rotation.y += this.islandRotationSpeed;

    // Animate clouds
    this.clouds.forEach((cloud) => {
      cloud.position.x += cloud.userData.speed;
      
      // Reset cloud position when it goes too far
      if (cloud.position.x > 20) {
        cloud.position.x = -20;
      }
    });

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public transitionToForm(callback: () => void): void {
    // Disable controls during transition
    this.controls.enabled = false;

    const timeline = gsap.timeline({
      onComplete: () => {
        callback();
      },
    });

    // Move island to the left
    timeline.to(this.islandGroup.position, {
      x: -8,
      duration: 1.5,
      ease: 'power2.inOut',
    });

    // Slightly rotate and move camera for "scroll down" effect
    timeline.to(
      this.camera.position,
      {
        x: 3,
        y: 3,
        z: 12,
        duration: 1.5,
        ease: 'power2.inOut',
      },
      '<'
    );

    timeline.to(
      this.camera.rotation,
      {
        y: 0.3,
        duration: 1.5,
        ease: 'power2.inOut',
      },
      '<'
    );
  }

  public transitionToGame(onComplete: () => void): void {
    const timeline = gsap.timeline({
      onComplete,
    });

    // Move island back to center
    timeline.to(this.islandGroup.position, {
      x: 0,
      duration: 1,
      ease: 'power2.inOut',
    });

    // Reset camera
    timeline.to(
      this.camera.position,
      {
        x: 0,
        y: 5,
        z: 15,
        duration: 1,
        ease: 'power2.inOut',
      },
      '<'
    );

    timeline.to(
      this.camera.rotation,
      {
        y: 0,
        duration: 1,
        ease: 'power2.inOut',
      },
      '<'
    );

    // Exponentially increase rotation speed
    timeline.to(this, {
      islandRotationSpeed: 0.2,
      duration: 2,
      ease: 'expo.in',
    });

    // Fade out clouds
    this.clouds.forEach((cloud) => {
      timeline.to(
        cloud.material,
        {
          opacity: 0,
          duration: 1,
        },
        '<'
      );
    });
  }

  public dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.renderer.dispose();
    this.controls.dispose();
    
    // Clean up geometries and materials
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (object.material instanceof THREE.Material) {
          object.material.dispose();
        }
      }
    });
    
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
