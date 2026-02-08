import React, { useEffect, useState } from 'react';
import '../styles/InvocationAnimation.css';

interface LaptopInvocationAnimationProps {
  onAnimationComplete: () => void;
}

const CODE_LINES = [
  'Initializing Summoning Circle...',
  'Loading entities database...',
  'Preparing invocation ritual...',
  'Channeling mystical energies...',
  'PROGRESS_PLACEHOLDER',
  'AWAKENING COMPUTER SPIRIT...',
  'Powering systems...',
  'Memory check... OK',
  'Network online... OK',
  'Summoning complete!',
];

export default function LaptopInvocationAnimation({
  onAnimationComplete,
}: LaptopInvocationAnimationProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [computerLifted, setComputerLifted] = useState(false);
  const [percent, setPercent] = useState(0);
  const [readyToProceed, setReadyToProceed] = useState(false);
  const [hasProceeding, setHasProceeding] = useState(false);

  useEffect(() => {
    // total animation must not exceed 5000ms
    const TOTAL_MS = 5000;
    const postPercentDelay = 700; // ms reserved after percent reaches 100 for final lines + lift

    const progressIndex = CODE_LINES.indexOf('PROGRESS_PLACEHOLDER');
    const staticInterval = 180; // ms per static line

    let mounted = true;
    const timeToShowStatic = progressIndex * staticInterval;

    // open the laptop early so the user sees it powering on at the start
    setTimeout(() => {
      if (!mounted) return;
      setComputerLifted(true);
    }, 80);

    // reveal static lines one by one
    for (let i = 1; i <= progressIndex; i++) {
      setTimeout(() => {
        if (!mounted) return;
        setVisibleLines(i);
      }, i * staticInterval);
    }

    const percentStart = timeToShowStatic + 20; // small offset
    const percentDuration = Math.max(200, TOTAL_MS - percentStart - postPercentDelay);

    // animate percent smoothly using requestAnimationFrame
    let raf = 0;
    const startTime = Date.now() + percentStart;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const p = Math.min(100, Math.max(0, Math.round((elapsed / percentDuration) * 100)));
      if (mounted) setPercent(p);
      if (elapsed < percentDuration) {
        raf = requestAnimationFrame(tick);
      } else {
        // ensure final state
        if (mounted) setPercent(100);
        // reveal remaining lines after short delay
        setTimeout(() => {
          if (!mounted) return;
          setVisibleLines(CODE_LINES.length);
          setComputerLifted(true);
          // when all final animations complete, allow the user to proceed by clicking the touchpad
          setTimeout(() => {
            if (!mounted) return;
            setReadyToProceed(true);
          }, 450);
        }, 220);
      }
    };

    const percentStarter = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, percentStart);

    return () => {
      mounted = false;
      clearTimeout(percentStarter);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [onAnimationComplete]);

  const renderLine = (line: string, idx: number) => {
    if (line === 'PROGRESS_PLACEHOLDER') {
      const blocks = Math.round((percent / 100) * 12);
      const filled = '█'.repeat(blocks);
      const empty = '░'.repeat(Math.max(0, 12 - blocks));
      return (
        <div key={idx} className="code-line">
          {filled}
          {empty} {percent}%
        </div>
      );
    }

    return (
      <div key={idx} className="code-line">
        {line}
      </div>
    );
  };

  return (
    <div className="invocation-animation laptop-screen-wrapper">
      <div className="animation-container">
        <div className={`laptop ${computerLifted ? 'opening' : ''}`}>
          {/* Laptop lid (upper part with display) */}
          <div className="laptop-lid">
            <div className="webcam" />
            <div className="lid-logo">●</div>
            <div className="laptop-display">
              <div className="display-bezel"></div>
              <div className="display-content">
                <div className="content-left">
                  {/* Telemetry on left side inside screen */}
                  <div className="telemetry-panel">
                    <div className="tele-item">
                      <div className="tele-label">CPU</div>
                      <div className="tele-bar">
                        <div className="tele-fill" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                    <div className="tele-item">
                      <div className="tele-label">NET</div>
                      <div className="tele-bar">
                        <div className="tele-fill" style={{ width: `${Math.round(percent * 0.6)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="content-center">
                  {/* Code display in center */}
                  <div className="code-panel">
                    {CODE_LINES.slice(0, visibleLines).map(renderLine)}
                    {visibleLines < CODE_LINES.length && <div className="cursor">▌</div>}
                  </div>
                </div>

                <div className="content-right">
                  {/* Terminal on right side */}
                  <div className="terminal-panel">
                    <div className="term-line">{percent < 100 ? '> SYNCH' : '> READY'}</div>
                    <div className="term-line small">{percent}%</div>
                    <div className="term-line">{computerLifted ? '> FRAME OK' : '> STANDBY'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Laptop base/keyboard */}
          <div className="laptop-base">
            <div className="base-bezel">
              <div className="keyboard-rows">
                <div className="key-row row-1">
                  {[...Array(13)].map((_, i) => (
                    <div key={`r1-${i}`} className="keyboard-key" style={{ animationDelay: `${0.38 + i * 0.02}s` }} />
                  ))}
                </div>
                <div className="key-row row-2">
                  {[...Array(13)].map((_, i) => (
                    <div key={`r2-${i}`} className="keyboard-key" style={{ animationDelay: `${0.62 + i * 0.02}s` }} />
                  ))}
                </div>
                <div className="key-row row-3">
                  {[...Array(9)].map((_, i) => (
                    <div key={`r3-${i}`} className="keyboard-key" style={{ animationDelay: `${0.86 + i * 0.02}s` }} />
                  ))}
                  <div className="keyboard-space" style={{ animationDelay: '1.1s' }} />
                </div>
              </div>
            </div>
            <div className="keyboard-area"></div>
            <div
              className={`touchpad ${readyToProceed ? 'ready' : ''}`}
              onClick={() => {
                if (!readyToProceed || hasProceeding) return;
                setHasProceeding(true);
                onAnimationComplete();
              }}
              role="button"
              aria-disabled={!readyToProceed}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
