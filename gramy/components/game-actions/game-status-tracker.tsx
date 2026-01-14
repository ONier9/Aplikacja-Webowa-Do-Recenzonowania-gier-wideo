'use client';

import { useState, useTransition } from 'react';
import { Clock, Play, Check, X, Pause } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/context/ModalContext';
import { setGameStatus, removeGameStatus } from '@/actions/games/status';
import { GameStatus } from '@/types/games';

interface GameStatusTrackerProps {
  gameId: number;
  initialStatus?: GameStatus | null;
}

const statusConfig = {
  want_to_play: {
    label: 'Want to Play',
    icon: Clock,
    color: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-blue-400'
  },
  playing: {
    label: 'Playing',
    icon: Play,
    color: 'bg-green-600 hover:bg-green-700',
    textColor: 'text-green-400'
  },
  completed: {
    label: 'Completed',
    icon: Check,
    color: 'bg-purple-600 hover:bg-purple-700',
    textColor: 'text-purple-400'
  },
  dropped: {
    label: 'Dropped',
    icon: X,
    color: 'bg-red-600 hover:bg-red-700',
    textColor: 'text-red-400'
  },
  on_hold: {
    label: 'On Hold',
    icon: Pause,
    color: 'bg-yellow-600 hover:bg-yellow-700',
    textColor: 'text-yellow-400'
  }
} as const;

function isValidStatusKey(status: string | null | undefined): status is keyof typeof statusConfig {
  return status !== null && status !== undefined && status in statusConfig;
}

export default function GameStatusTracker({ 
  gameId, 
  initialStatus = null
}: GameStatusTrackerProps) {
  const validatedInitialStatus = isValidStatusKey(initialStatus) ? initialStatus : null;
  const [currentStatus, setCurrentStatus] = useState<GameStatus | null>(validatedInitialStatus);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { user } = useAuth();
  const { openLogin } = useModal();

  const handleStatusChange = async (status: GameStatus | null) => {
    if (!user) {
      openLogin();
      return;
    }

    setIsOpen(false);

    const previousStatus = currentStatus;
    setCurrentStatus(status);

    startTransition(async () => {
      try {
        const result = status === null 
          ? await removeGameStatus(gameId)
          : await setGameStatus(gameId, status);
        
        if (!result.success) {
          setCurrentStatus(previousStatus);
          console.error('Failed to update status:', result.error);
        }
      } catch (error) {
        setCurrentStatus(previousStatus);
        console.error('Failed to update status:', error);
      }
    });
  };

  const CurrentIcon = isValidStatusKey(currentStatus) ? statusConfig[currentStatus].icon : Clock;
  const currentLabel = isValidStatusKey(currentStatus) ? statusConfig[currentStatus].label : 'Add to Library';
  const currentColor = isValidStatusKey(currentStatus) ? statusConfig[currentStatus].color : 'bg-gray-700 hover:bg-gray-600';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
          isValidStatusKey(currentStatus)
            ? `${currentColor} text-white` 
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <CurrentIcon className="w-4 h-4" />
        {currentLabel}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 min-w-[200px] overflow-hidden">
            {Object.entries(statusConfig).map(([status, config]) => {
              const Icon = config.icon;
              const isActive = currentStatus === status;
              
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status as GameStatus)}
                  disabled={isPending}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                    isActive 
                      ? 'bg-gray-700' 
                      : 'hover:bg-gray-750'
                  } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${config.textColor}`} />
                  <span className="text-white text-sm">{config.label}</span>
                  {isActive && (
                    <Check className="w-4 h-4 ml-auto text-green-500" />
                  )}
                </button>
              );
            })}

            {currentStatus && (
              <>
                <div className="border-t border-gray-700" />
                <button
                  onClick={() => handleStatusChange(null)}
                  disabled={isPending}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-750 transition-colors text-gray-400 hover:text-white ${
                    isPending ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm">Remove Status</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}