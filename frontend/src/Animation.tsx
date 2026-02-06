import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Animation.css';

/* ── Rarity config ── */
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

interface RarityConfig {
  codeLines: string[];
  /** ms between each line */
  lineSpeed: number;
  /** ms for the last few dramatic lines */
  slowSpeed: number;
  /** CSS class added to the reveal for rarity-specific FX */
  fxClass: string;
}

const COMMON_CODE = [
  'const ctx = canvas.getContext("2d");',
  'ctx.fillStyle = "#111";',
  'ctx.fillRect(0, 0, w, h);',
  '',
  'function draw() {',
  '  requestAnimationFrame(draw);',
  '}',
  '',
  '> READY',
  '> LOADING ████ 100%',
  '> GO!',
];

const RARE_CODE = [
  'import { Engine, Scene } from "@babylonjs/core";',
  'const engine = new Engine(canvas, true);',
  'const scene = new Scene(engine);',
  '',
  'function createPlayer(name: string) {',
  '  const mesh = MeshBuilder.CreateBox(name, {size:1}, scene);',
  '  mesh.position = new Vector3(0, 0.5, 0);',
  '  return mesh;',
  '}',
  '',
  'class GameState extends Schema {',
  '  @type({ map: Player }) players = new MapSchema<Player>();',
  '  @type("number") round = 0;',
  '}',
  '',
  'room.onMessage("start", () => {',
  '  initScene();',
  '  engine.runRenderLoop(() => scene.render());',
  '});',
  '',
  '> SYSTEM READY',
  '> LOADING ASSETS ██████████ 100%',
  '> LAUNCHING...',
];

const EPIC_CODE = [
  ...RARE_CODE.slice(0, -3),
  '',
  'const light = new HemisphericLight("light", Vector3.Up(), scene);',
  'light.intensity = 0.9;',
  'const camera = new ArcRotateCamera("cam", 0, 1, 10, Vector3.Zero());',
  '',
  'export function loadLevel(n: number) {',
  '  const data = levels[n];',
  '  data.tiles.forEach((t) => spawnTile(t.x, t.y, t.type));',
  '  data.enemies.forEach((e) => spawnEnemy(e));',
  '}',
  '',
  'await assetManager.loadAll();',
  'physics.enable(scene, new CannonJSPlugin());',
  'inputManager.bind(KeyCode.SPACE, "jump");',
  'networkSync.start({ tickRate: 20 });',
  '',
  '> ALL SYSTEMS NOMINAL',
  '> LOADING ASSETS ██████████ 100%',
  '> DEPLOYING...',
];

const LEGENDARY_CODE = [
  ...EPIC_CODE.slice(0, -3),
  '',
  'socket.on("connect", (id) => {',
  '  players.set(id, createPlayer(id));',
  '  updateLeaderboard();',
  '});',
  '',
  'const postProcess = new SSAO2RenderingPipeline("ssao", scene, {',
  '  ssaoRatio: 0.5, blurRatio: 1,',
  '});',
  'const glow = new GlowLayer("glow", scene, { intensity: 0.6 });',
  '',
  'particleSystem.start();',
  'audioEngine.play("theme_legendary");',
  'shaderManager.compile("hologram.glsl");',
  '',
  '> ★ LEGENDARY ENTITY DETECTED ★',
  '> CORE OVERLOAD ████████████████ 100%',
  '> BRACE YOURSELF...',
];

const RARITY_MAP: Record<Rarity, RarityConfig> = {
  common: {
    codeLines: COMMON_CODE,
    lineSpeed: 60,
    slowSpeed: 250,
    fxClass: 'fx-common',
  },
  rare: {
    codeLines: RARE_CODE,
    lineSpeed: 50,
    slowSpeed: 300,
    fxClass: 'fx-rare',
  },
  epic: {
    codeLines: EPIC_CODE,
    lineSpeed: 45,
    slowSpeed: 350,
    fxClass: 'fx-epic',
  },
  legendary: {
    codeLines: LEGENDARY_CODE,
    lineSpeed: 38,
    slowSpeed: 400,
    fxClass: 'fx-legendary',
  },
};

/* ── Props ── */
interface AnimationProps {
  rarity: Rarity;
  imageSrc: string;
  onDone: () => void;
}

export default function Animation({ rarity, imageSrc, onDone }: AnimationProps) {
  const config = RARITY_MAP[rarity];
  const [phase, setPhase] = useState<'code' | 'reveal'>('code');
  const [visibleLines, setVisibleLines] = useState(0);
  const [showImage, setShowImage] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [lightnings, setLightnings] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const codeRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  /* ── Code rain ── */
  useEffect(() => {
    if (phase !== 'code') return;
    if (visibleLines >= config.codeLines.length) {
      const t = setTimeout(() => setPhase('reveal'), 500);
      return () => clearTimeout(t);
    }
    const remaining = config.codeLines.length - visibleLines;
    const speed = remaining <= 3 ? config.slowSpeed : config.lineSpeed;
    const t = setTimeout(() => setVisibleLines((v) => v + 1), speed);
    return () => clearTimeout(t);
  }, [phase, visibleLines, config]);

  /* Auto-scroll */
  useEffect(() => {
    codeRef.current?.scrollTo({ top: codeRef.current.scrollHeight });
  }, [visibleLines]);

  /* ── Reveal entrance ── */
  useEffect(() => {
    if (phase !== 'reveal') return;
    const t = setTimeout(() => {
      setShowImage(true);
      setTimeout(() => setImageReady(true), 50);
    }, 200);
    return () => clearTimeout(t);
  }, [phase]);

  /* ── Lightning FX (blue + yellow) ── */
  const spawnLightning = useCallback(() => {
    const colors = ['#3b82f6', '#facc15', '#60a5fa', '#fbbf24'];
    const bolt = {
      id: nextId.current++,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setLightnings((prev) => [...prev, bolt]);
    setTimeout(() => {
      setLightnings((prev) => prev.filter((l) => l.id !== bolt.id));
    }, 700);
  }, []);

  useEffect(() => {
    if (phase !== 'reveal') return;
    // spawn a few bolts on entry
    for (let i = 0; i < 6; i++) setTimeout(spawnLightning, i * 120);
    // then ongoing random bolts
    const iv = setInterval(spawnLightning, 350);
    const stop = setTimeout(() => clearInterval(iv), 3500);
    return () => {
      clearInterval(iv);
      clearTimeout(stop);
    };
  }, [phase, spawnLightning]);

  /* ── CODE PHASE ── */
  if (phase === 'code') {
    return (
      <div className="anim-screen">
        <div className="anim-scanline" />
        <div className="anim-code-rain" ref={codeRef}>
          {config.codeLines.slice(0, visibleLines).map((line, i) => (
            <div
              key={i}
              className={`anim-code-line ${i === visibleLines - 1 ? 'anim-code-line--new' : ''}`}
            >
              <span className="anim-line-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="anim-line-text">{line}</span>
            </div>
          ))}
          <span className="anim-cursor">█</span>
        </div>
      </div>
    );
  }

  /* ── REVEAL PHASE ── */
  return (
    <div className={`anim-screen anim-reveal-bg ${config.fxClass}`}>
      {/* Lightning bolts */}
      {lightnings.map((bolt) => (
        <div
          key={bolt.id}
          className="lightning-bolt"
          style={{
            left: `${bolt.x}%`,
            top: `${bolt.y}%`,
            background: `radial-gradient(circle, ${bolt.color}, transparent 70%)`,
            boxShadow: `0 0 40px 10px ${bolt.color}`,
          }}
        />
      ))}

      <div className={`anim-reveal-card ${imageReady ? 'anim-reveal-card--visible' : ''}`}>
        {showImage && (
          <img src={imageSrc} alt="Gacha reveal" className="anim-reveal-img" />
        )}
      </div>

      <button className="play anim-back" onClick={onDone}>
        Retour
      </button>
    </div>
  );
}
