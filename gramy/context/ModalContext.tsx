'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CreateCollectionData {
  gameId?: number;
  gameName?: string;
}

interface GameLogData {
  gameId: number;
  gameName: string;
}

interface ModalContextType {

  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  
  isRegisterOpen: boolean;
  openRegister: () => void;
  closeRegister: () => void;
  
  isCreateCollectionOpen: boolean;
  createCollectionData: CreateCollectionData | null;
  openCreateCollectionModal: (gameId?: number, gameName?: string) => void;
  closeCreateCollectionModal: () => void;
  
  isGameLogOpen: boolean;
  gameLogData: GameLogData | null;
  openGameLogModal: (gameId: number, gameName: string) => void;
  closeGameLogModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [createCollectionData, setCreateCollectionData] = useState<CreateCollectionData | null>(null);
  
  const [isGameLogOpen, setIsGameLogOpen] = useState(false);
  const [gameLogData, setGameLogData] = useState<GameLogData | null>(null);

  const openLogin = () => {
    setIsLoginOpen(true);
    setIsRegisterOpen(false); 
  };
  
  const closeLogin = () => setIsLoginOpen(false);

  const openRegister = () => {
    setIsRegisterOpen(true);
    setIsLoginOpen(false); 
  };
  
  const closeRegister = () => setIsRegisterOpen(false);

  const openCreateCollectionModal = (gameId?: number, gameName?: string) => {
    setCreateCollectionData({ gameId, gameName });
    setIsCreateCollectionOpen(true);
  };

  const closeCreateCollectionModal = () => {
    setIsCreateCollectionOpen(false);
    setCreateCollectionData(null);
  };

  const openGameLogModal = (gameId: number, gameName: string) => {
    setGameLogData({ gameId, gameName });
    setIsGameLogOpen(true);
  };

  const closeGameLogModal = () => {
    setIsGameLogOpen(false);
    setGameLogData(null);
  };

  return (
    <ModalContext.Provider
      value={{
        isLoginOpen,
        openLogin,
        closeLogin,
        
        isRegisterOpen,
        openRegister,
        closeRegister,
        
        isCreateCollectionOpen,
        createCollectionData,
        openCreateCollectionModal,
        closeCreateCollectionModal,
        
        isGameLogOpen,
        gameLogData,
        openGameLogModal,
        closeGameLogModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}