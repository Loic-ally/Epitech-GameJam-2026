import { useContext } from 'react';
import { RoomContext } from '../context/RoomContext';

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error("useRoom doit être utilisé à l'intérieur d'un RoomProvider");
  }
  return context;
};
