import { Room } from '@colyseus/sdk';
import type React from 'react';
import { createContext, type ReactNode, useMemo, useState } from 'react';

export interface RoomContextType {
  room: Room<any, any> | null;
  setRoom: React.Dispatch<React.SetStateAction<Room<any, any> | null>>;
}

export const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [room, setRoom] = useState<Room<any, any> | null>(null);

  const contextValue = useMemo(
    () => ({
      room,
      setRoom,
    }),
    [room],
  );

  return <RoomContext.Provider value={contextValue}>{children}</RoomContext.Provider>;
};
