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
    
    // Draw brick pattern with some "Tech" vibes (blue lines? random squares?)
    ctx.fillStyle = '#0f172a'; // Dark blueish base
    ctx.fillRect(0, 0, 256, 256);
    
    // Draw grid lines (Tech theme)
    ctx.strokeStyle = '#3b82f6'; // Bright blue
    ctx.lineWidth = 2;
    
    // Grid
    const step = 32;
    ctx.beginPath();
    for(let i=0; i<=256; i+=step) {
        ctx.moveTo(i, 0); ctx.lineTo(i, 256);
        ctx.moveTo(0, i); ctx.lineTo(256, i);
    }
    ctx.stroke();

    // Random illuminated panels
    ctx.fillStyle = '#60a5fa'; // Light blue
    for(let i=0; i<10; i++) {
        const x = Math.floor(Math.random() * 8) * step;
        const y = Math.floor(Math.random() * 8) * step;
        ctx.fillRect(x + 2, y + 2, step - 4, step - 4);
    }
    
    const brickTexture = new THREE.CanvasTexture(canvas);
    brickTexture.wrapS = THREE.RepeatWrapping;
    brickTexture.wrapT = THREE.RepeatWrapping;
    
    const buildingMaterial = new THREE.MeshStandardMaterial({
      map: brickTexture,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.2
    });
    
    // Windows
    const windowGeometry = new THREE.PlaneGeometry(0.8, 1.2);
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x87CEEB,
        emissive: 0xffffff,
        emissiveIntensity: 0.5,
        side: THREE.DoubleSide
    });

    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 1.75; // Half of 3.5
    
    // Add windows to the building
    const frontWindows = new THREE.Group();
    // Front face (Z+)
    for(let x=-1.5; x<=1.5; x+=1.5) {
        const win = new THREE.Mesh(windowGeometry, windowMaterial);
        win.position.set(x, 0, 1.51); // Slightly in front
        frontWindows.add(win);
        
        // Add "Epitech" style flickering text/logo placeholder via simple colored quad?
        // Let's stick to windows for now.
    }
    
    // Add floating "E" logo
    const logoGroup = new THREE.Group();
    // Simple E shape using boxes
    const barMat = new THREE.MeshStandardMaterial({ color: 0x0066cc, emissive: 0x0066cc, emissiveIntensity: 0.8 });
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 0.2), barMat);
    vBar.position.x = -0.3;
    const hBar1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.2), barMat);
    hBar1.position.y = 0.4;
    const hBar2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.2), barMat);
    hBar2.position.y = 0;
    const hBar3 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.2), barMat);
    hBar3.position.y = -0.4;
    
    logoGroup.add(vBar, hBar1, hBar2, hBar3);
    logoGroup.position.set(0, 4.5, 0);
    
    // Animate logo bobbing
    this.animationId = requestAnimationFrame(this.animate); // Ensure loop continues

    // Add E-Logo to building or island
    building.add(frontWindows);
    this.islandGroup.add(building);
    this.islandGroup.add(logoGroup);
    (this as any).logoGroup = logoGroup; // Store reference for animation

    // Cathedral-style spire at one corner - Shorter
    const spireGeometry = new THREE.BoxGeometry(0.8, 2.5, 0.8);
    const spireMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Dark
      flatShading: true,
      roughness: 0.5,
      metalness: 0.5
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
    
    // Animate Logo if it exists
    if ((this as any).logoGroup) {
        (this as any).logoGroup.rotation.y -= 0.02;
        (this as any).logoGroup.position.y = 4.5 + Math.sin(Date.now() * 0.002) * 0.2;
    }

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
