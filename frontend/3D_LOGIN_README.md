# 3D Login Page - Three.js Implementation

## Overview

This is a stunning 3D login page featuring a floating island with a cathedral-style building, implemented using Three.js and GSAP animations.

## Features

### 1. **Floating Island Scene**
- **Low-poly island base**: A cone-shaped base with grass top layer
- **Brick-textured building**: A rectangular building with procedurally generated brick texture
- **Cathedral spire**: A tall vertical prism with pyramid cap at one corner
- **Sky background**: Bright sky blue (#87CEEB)

### 2. **Fluffy Cloud System**
- Multiple cloud groups made of clustered spheres
- Gentle floating animation with natural drift
- Randomized positions and scales for variety

### 3. **GSAP Animations**

#### `transitionToForm()`
- Moves the island to the left of the screen
- Slightly rotates camera upward (scroll down effect)
- Fades in the login/register form
- Duration: 1.5 seconds with power2.inOut easing

#### `transitionToGame()`
- Fades out the authentication form
- Returns island to center position
- Exponentially increases rotation speed (loading/launch effect)
- Duration: 2 seconds with expo.in easing
- Triggers game authentication after animation

### 4. **Scene Controls**
- **OrbitControls**: Enabled with disabled zoom and pan
- **Rotation**: Continuous slow Y-axis rotation
- **Responsive**: Automatically adjusts to window resize

## File Structure

```
frontend/src/
├── components/
│   ├── FloatingIslandScene.tsx    # Main Three.js scene component
│   └── AuthForm.tsx                # Login/Register form
├── hooks/
│   └── useIslandScene.ts           # Custom hook for scene controls
├── utils/
│   └── threeHelpers.ts             # Texture and cloud generators
└── pages/
    └── AuthPage.tsx                # Main auth page with 3D integration
```

## Key Components

### FloatingIslandScene Component
Main Three.js scene implementation with:
- Scene setup with lighting (ambient + directional)
- Island group creation (base, grass, building, spire)
- Cloud particle system
- Animation loop
- Transition functions
- Window resize handler

### useIslandScene Hook
Manages scene state and transitions:
- `isFormVisible`: Boolean state for form visibility
- `showForm()`: Trigger transition to form
- `launchGame()`: Trigger game launch animation
- `setFormVisible()`: Manually control form visibility

### threeHelpers Utilities
- `createBrickTexture()`: Procedural brick texture generator
- `createCloud()`: Multi-sphere cloud generator

## Usage

The 3D scene automatically:
1. Loads with the island rotating slowly (2 seconds)
2. Transitions to show the auth form
3. On successful login/register, plays launch animation
4. Redirects to game after animation completes

## Technical Details

### Dependencies
- **three**: ^0.182.0 (3D rendering)
- **gsap**: Latest (smooth animations)
- **react**: ^19.2.4

### Performance
- Shadow mapping enabled (PCFSoftShadowMap)
- Anti-aliasing enabled
- Pixel ratio capped at 2 for performance
- Proper cleanup of geometries and materials

### Browser Support
Works on all modern browsers supporting WebGL.

## Customization

### Adjusting Island
Edit geometry and materials in [FloatingIslandScene.tsx](src/components/FloatingIslandScene.tsx#L83-L128):
- Base cone size
- Building dimensions
- Spire height
- Texture colors

### Animation Timing
Modify GSAP animations in transition functions:
- `transitionToForm()`: Lines 210-223
- `transitionToGame()`: Lines 225-250

### Cloud Behavior
Adjust cloud count and animation in:
- Cloud creation: Lines 140-157
- Cloud animation: Lines 171-185

## Credits

Built with ❤️ using Three.js, React, and GSAP for Epitech GameJam 2026.
