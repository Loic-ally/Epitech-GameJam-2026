# 3D Login Page with Three.js

A stunning 3D login page featuring a floating island with a brick building, cathedral spire, and animated clouds.

## Features

### Scene Components
- **Sky Blue Background**: Bright, welcoming atmosphere
- **Floating Island**: Low-poly base with realistic proportions
- **Brick Building**: Procedurally generated brick texture using canvas
- **Cathedral Spire**: Tall vertical prism with pyramid cap at building corner
- **Fluffy Clouds**: Animated sprite-based particle system

### Animations (GSAP)
1. **Continuous Rotation**: Island slowly rotates on Y-axis
2. **transitionToForm()**: 
   - Moves island to the left
   - Rotates camera for "scroll down" effect
   - Shows login/register form
3. **transitionToGame()**: 
   - Fades out UI
   - Centers island
   - Exponentially increases rotation speed (loading effect)

### Technical Features
- **PerspectiveCamera** with proper aspect ratio
- **OrbitControls** (zoom disabled, pan disabled)
- **MeshStandardMaterial** for realistic lighting
- **Responsive** with window resize handling
- **Separated concerns**: Three.js logic isolated from DOM events

## Usage

### Basic Implementation

```tsx
import { LoginScene3D } from './components/LoginScene3D';

function App() {
  const handleLoginSuccess = () => {
    // Navigate to your game or dashboard
    console.log('Transition to game!');
  };

  return <LoginScene3D onLoginSuccess={handleLoginSuccess} />;
}
```

### Testing the Component

You can test it by updating your App.tsx:

```tsx
import React from 'react';
import { LoginPage3D } from './pages/LoginPage3D';
import './App.css';

function App() {
  return (
    <div className="App">
      <LoginPage3D />
    </div>
  );
}

export default App;
```

### File Structure

```
frontend/src/components/LoginScene3D/
├── scene.ts              # Three.js scene logic
├── LoginScene3D.tsx      # React component
├── LoginScene3D.css      # Styles
└── index.ts              # Exports
```

## API Reference

### LoginScene Class

The core Three.js scene manager.

#### Constructor
```typescript
new LoginScene(container: HTMLDivElement)
```

#### Methods

**transitionToForm(callback: () => void)**
- Moves island to the left
- Rotates camera for cinematic effect
- Executes callback when complete

**transitionToGame(onComplete: () => void)**
- Returns island to center
- Increases rotation speed exponentially
- Fades out clouds
- Executes callback when complete

**dispose()**
- Cleans up Three.js resources
- Removes event listeners
- Stops animation loop

### LoginScene3D Component Props

```typescript
interface LoginScene3DProps {
  onLoginSuccess?: () => void;
}
```

## Customization

### Changing Colors

Edit `scene.ts`:

```typescript
// Sky color
this.scene.background = new THREE.Color(0x87CEEB);

// Island base color
const baseMaterial = new THREE.MeshStandardMaterial({
  color: 0x4a7c4e, // Change this
});

// Building brick color
ctx.fillStyle = '#8B4513'; // Base brick color
ctx.fillStyle = '#A0522D'; // Individual brick color
```

### Adjusting Animation Speed

```typescript
// Initial rotation speed
private islandRotationSpeed = 0.002; // Lower = slower

// Game launch rotation speed (in transitionToGame)
islandRotationSpeed: 0.2, // Higher = faster spin
```

### Modifying Island Geometry

```typescript
// Island base
const baseGeometry = new THREE.CylinderGeometry(4, 5, 2, 6);
// Parameters: topRadius, bottomRadius, height, radialSegments

// Building
const buildingGeometry = new THREE.BoxGeometry(3, 3, 3);
// Parameters: width, height, depth

// Spire
const spireGeometry = new THREE.BoxGeometry(0.6, 5, 0.6);
// Parameters: width, height, depth
```

### Adding More Clouds

Edit the cloud creation loop:

```typescript
for (let i = 0; i < 15; i++) { // Change count here
  // ... cloud creation code
}
```

## Performance Tips

1. **Reduce Cloud Count**: Fewer clouds = better performance
2. **Lower Pixel Ratio**: Change `Math.min(window.devicePixelRatio, 2)` to 1
3. **Simplify Geometry**: Reduce segments in CylinderGeometry
4. **Disable Damping**: Set `controls.enableDamping = false` for less CPU usage

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL support.

## Dependencies

```json
{
  "three": "^0.182.0",
  "@types/three": "^0.182.0",
  "gsap": "^3.x.x"
}
```

## Troubleshooting

### Black Screen
- Check browser console for WebGL errors
- Ensure container has width/height
- Verify Three.js is installed

### Form Not Appearing
- Check z-index in CSS
- Verify state updates in React DevTools
- Ensure animations complete

### Performance Issues
- Reduce cloud count
- Lower pixel ratio
- Simplify geometries
- Check for memory leaks with dispose()

## Future Enhancements

- [ ] Add water around the island
- [ ] Implement day/night cycle
- [ ] Add birds flying around
- [ ] Include sound effects
- [ ] Add more building details
- [ ] Implement fog for depth

## License

MIT
