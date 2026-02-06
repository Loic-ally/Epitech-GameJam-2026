import React, { FormEvent } from 'react';
import { Room } from '@colyseus/sdk';

export interface LobbyPanelProps {
  userDisplay?: string;
  room: Room | null;
  isJoining: boolean;
  onJoin: (event: FormEvent<HTMLFormElement>) => void;
}

export const LobbyPanel: React.FC<LobbyPanelProps> = ({
  userDisplay,
  room,
  isJoining,
  onJoin,
}) => {
  return (
    <form className="form" onSubmit={onJoin}>
      <label>Lobby</label>
      <button type="submit" disabled={isJoining || !!room || !userDisplay}>
        {room ? 'Connecté' : isJoining ? 'Connexion...' : 'Rejoindre le lobby'}
      </button>
      {userDisplay && <p className="status">Joueur: {userDisplay}</p>}
    </form>
  );
};
