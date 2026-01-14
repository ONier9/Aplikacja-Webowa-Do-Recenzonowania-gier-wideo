'use client';

import { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/context/ModalContext';

interface GameLogButtonProps {
  gameId: number;
  gameName: string;
}

export default function GameLogButton({ gameId, gameName }: GameLogButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { openLogin, openGameLogModal } = useModal();

  const handleClick = async () => {
    if (!user) {
      openLogin();
      return;
    }

    setIsLoading(true);
    try {
      openGameLogModal(gameId, gameName);
    } catch (error) {
      console.error('Failed to open game log modal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : ( 
        <PlusCircle className="w-4 h-4" />
      )}
      Log Play
    </button>
  );
}