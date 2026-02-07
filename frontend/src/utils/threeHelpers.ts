import * as THREE from 'three';

/**
 * Creates a procedural brick texture for the building
 */
export const createBrickTexture = (): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get 2D context');
  }

  // Background (mortar)
  ctx.fillStyle = '#8b7d6b';
  ctx.fillRect(0, 0, 256, 256);

  // Brick parameters
  const brickWidth = 64;
  const brickHeight = 32;
  const mortarWidth = 4;

  // Draw bricks
  ctx.fillStyle = '#b8856a';
  
  for (let y = 0; y < 256; y += brickHeight + mortarWidth) {
    const offset = (y / (brickHeight + mortarWidth)) % 2 === 0 ? 0 : brickWidth / 2;
    
    for (let x = -brickWidth; x < 256; x += brickWidth + mortarWidth) {
      const brickX = x + offset;
      ctx.fillRect(brickX, y, brickWidth, brickHeight);
      
      // Add some variation to bricks
      const variation = Math.random() * 20 - 10;
      ctx.fillStyle = `rgb(${184 + variation}, ${133 + variation}, ${106 + variation})`;
      ctx.fillRect(brickX, y, brickWidth, brickHeight);
      ctx.fillStyle = '#b8856a';
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  
  return texture;
};

/**
 * Creates a simple cloud mesh with multiple spheres
 */
export const createCloud = (scale: number = 1): THREE.Group => {
  const cloudGroup = new THREE.Group();
  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    flatShading: true,
  });

  // Create multiple spheres for a fluffy cloud effect
  const sphereCount = 3 + Math.floor(Math.random() * 3);
  
  for (let i = 0; i < sphereCount; i++) {
    const sphereGeometry = new THREE.SphereGeometry(
      0.3 + Math.random() * 0.3,
      6,
      6
    );
    const sphere = new THREE.Mesh(sphereGeometry, cloudMaterial);
    
    sphere.position.set(
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.5
    );
    
    cloudGroup.add(sphere);
  }

  cloudGroup.scale.setScalar(scale);
  
  return cloudGroup;
};
