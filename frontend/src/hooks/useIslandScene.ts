import { useCallback, useState } from 'react';

export interface IslandSceneControls {
  isFormVisible: boolean;
  showForm: () => void;
  launchGame: () => void;
  setFormVisible: (visible: boolean) => void;
}

/**
 * Hook to manage the 3D Island Scene transitions
 */
export const useIslandScene = (): IslandSceneControls => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const showForm = useCallback(() => {
    // Call the global transition function exposed by the scene
    if ((window as any).__transitionToForm) {
      (window as any).__transitionToForm();
    }
  }, []);

  const launchGame = useCallback(() => {
    // Call the global transition function exposed by the scene
    if ((window as any).__transitionToGame) {
      (window as any).__transitionToGame();
    }
  }, []);

  return {
    isFormVisible,
    showForm,
    launchGame,
    setFormVisible: setIsFormVisible,
  };
};
