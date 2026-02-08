import type React from 'react';
import type { DuelRequest } from '../types/battle.type';
import './BattleArena.css';

interface DuelPromptProps {
  nearbyPlayerName: string | null;
}

export const DuelPrompt: React.FC<DuelPromptProps> = ({ nearbyPlayerName }) => {
  if (!nearbyPlayerName) return null;

  return (
    <div className="duel-prompt">
      Press <kbd>E</kbd> to challenge <strong>{nearbyPlayerName}</strong> to a duel!
    </div>
  );
};

interface DuelRequestOverlayProps {
  request: DuelRequest;
  onAccept: () => void;
  onDecline: () => void;
}

export const DuelRequestOverlay: React.FC<DuelRequestOverlayProps> = ({
  request,
  onAccept,
  onDecline,
}) => {
  return (
    <div className="duel-request-overlay">
      <div className="duel-request-title">
        ⚔️ Duel Challenge!
      </div>
      <div>
        <strong>{request.challengerName}</strong> wants to battle you!
      </div>
      <div className="duel-request-buttons">
        <button type="button" className="duel-accept-btn" onClick={onAccept}>
          ✓ Accept
        </button>
        <button type="button" className="duel-decline-btn" onClick={onDecline}>
          ✕ Decline
        </button>
      </div>
    </div>
  );
};
