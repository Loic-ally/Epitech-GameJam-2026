import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Rarity } from './Animation';
import { startImageOnlyInElement, type ImgTheme } from './themeEffects';
import './MultiPullAnimation.css';

export interface PullResult {
  rarity: Rarity;
  imgTheme: ImgTheme;
  imageSrc: string;
}

interface Props {
  pulls: PullResult[];
  onDone: () => void;
}

/* ══════════════════════════════════════
   PHASE 1 – CODE ON A LAPTOP
   ══════════════════════════════════════ */

const MULTI_CODE: string[] = [
  'import { GachaEngine } from "@gacha/core";',
  'import { CardPool, RarityTable } from "@gacha/data";',
  '',
  'const engine = new GachaEngine({ seed: Date.now() });',
  'const pool   = CardPool.load("banners/current");',
  '',
  'async function multiPull(count: number) {',
  '  const results: Card[] = [];',
  '',
  '  for (let i = 0; i < count; i++) {',
  '    const rarity = RarityTable.roll();',
  '    const card   = pool.pick(rarity);',
  '    results.push(card);',
  '    await render(card);',
  '  }',
  '',
  '  return results;',
  '}',
  '',
  'engine.on("pull", (card) => {',
  '  particles.burst(card.element);',
  '  sfx.play(card.rarity);',
  '});',
  '',
  '> INITIALIZING MULTI-PULL x10 …',
  '> LOADING CARD POOL ██████████ 100%',
  '> READY – DEPLOYING CARDS …',
];

const LINE_SPEED = 55;
const SLOW_SPEED = 320;
const POST_CODE_DELAY = 600;

function CodePhase({ onDone }: { onDone: () => void }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleLines >= MULTI_CODE.length) {
      const t = setTimeout(onDone, POST_CODE_DELAY);
      return () => clearTimeout(t);
    }
    const remaining = MULTI_CODE.length - visibleLines;
    const speed = remaining <= 3 ? SLOW_SPEED : LINE_SPEED;
    const t = setTimeout(() => setVisibleLines((v) => v + 1), speed);
    return () => clearTimeout(t);
  }, [visibleLines, onDone]);

  useEffect(() => {
    codeRef.current?.scrollTo({ top: codeRef.current.scrollHeight });
  }, [visibleLines]);

  return (
    <div className="mp-screen mp-code-phase">
      <div className="mp-scanline" />

      <div className="mp-laptop">
        <div className="mp-laptop-screen">
          <div className="mp-code-rain" ref={codeRef}>
            {MULTI_CODE.slice(0, visibleLines).map((line, i) => (
              <div
                key={i}
                className={`mp-code-line ${i === visibleLines - 1 ? 'mp-code-line--new' : ''}`}
              >
                <span className="mp-line-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="mp-line-text">{line}</span>
              </div>
            ))}
            <span className="mp-cursor">█</span>
          </div>
        </div>
        <div className="mp-laptop-base">
          <div className="mp-laptop-trackpad" />
        </div>
        <div className="mp-laptop-hinge" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   PHASE 2 – CARDS GRID
   ══════════════════════════════════════ */

const RARITY_GLOW: Record<Rarity, string> = {
  common: 'rgba(150,150,150,0.35)',
  rare: 'rgba(59,130,246,0.55)',
  epic: 'rgba(168,85,247,0.6)',
  legendary: 'rgba(250,204,21,0.65)',
};

function MiniCard({ pull, revealed }: { pull: PullResult; revealed: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    return startImageOnlyInElement(canvas, pull.imgTheme);
  }, [revealed, pull.imgTheme]);

  return (
    <div
      className={`mp-card mp-rarity-${pull.rarity} ${revealed ? 'mp-card--in' : ''}`}
      style={{ '--glow': RARITY_GLOW[pull.rarity] } as React.CSSProperties}
    >
      <canvas ref={canvasRef} className="mp-card-canvas" />
      {revealed && <img src={pull.imageSrc} alt="Pull" className="mp-card-img" />}
      <span className={`mp-badge mp-badge--${pull.rarity}`}>
        {pull.rarity.charAt(0).toUpperCase() + pull.rarity.slice(1)}
      </span>
    </div>
  );
}

function CardsPhase({ pulls, onDone }: { pulls: PullResult[]; onDone: () => void }) {
  const [revealedCount, setRevealedCount] = useState(0);
  const allRevealed = revealedCount >= pulls.length;

  const handleClick = useCallback(() => {
    if (allRevealed) return;
    setRevealedCount((c) => c + 1);
  }, [allRevealed]);

  /* First card reveals immediately */
  useEffect(() => {
    const t = setTimeout(() => setRevealedCount(1), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="mp-screen mp-cards-phase" onClick={handleClick}>
      <div className="mp-bg" />

      {!allRevealed && (
        <div className="mp-tap-hint">Clique pour révéler la carte suivante</div>
      )}

      <div className="mp-grid">
        {pulls.map((p, i) => (
          <MiniCard key={i} pull={p} revealed={i < revealedCount} />
        ))}
      </div>

      {allRevealed && (
        <button className="play mp-back" onClick={(e) => { e.stopPropagation(); onDone(); }}>
          Retour
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN – 2 phases
   ══════════════════════════════════════ */

export default function MultiPullAnimation({ pulls, onDone }: Props) {
  const [phase, setPhase] = useState<'code' | 'cards'>('code');

  if (phase === 'code') {
    return <CodePhase onDone={() => setPhase('cards')} />;
  }

  return <CardsPhase pulls={pulls} onDone={onDone} />;
}
