'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, Calendar, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/context/ModalContext';
import { useRouter } from 'next/navigation';

export default function GameLogModal() {
  const router = useRouter();
  const { 
    isGameLogOpen, 
    closeGameLogModal, 
    gameLogData,
    openLogin 
  } = useModal();

  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    playCount: 1,
    hoursPlayed: '',
    platformId: '',
    notes: '',
    completed: false,
    startedAt: '',
    completedAt: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isGameLogOpen) {
      setFormData({
        playCount: 1,
        hoursPlayed: '',
        platformId: '',
        notes: '',
        completed: false,
        startedAt: '',
        completedAt: '',
      });
      setError('');
    }
  }, [isGameLogOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      openLogin();
      return;
    }

    if (!gameLogData?.gameId) {
      setError('Game ID is missing');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/game-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: gameLogData.gameId,
          playCount: formData.playCount,
          hoursPlayed: formData.hoursPlayed ? parseFloat(formData.hoursPlayed) : null,
          platformId: formData.platformId ? parseInt(formData.platformId) : null,
          notes: formData.notes.trim() || null,
          completed: formData.completed,
          startedAt: formData.startedAt || null,
          completedAt: formData.completedAt || null,
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create game log');
      }

      closeGameLogModal();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create game log');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isGameLogOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full p-6 border border-gray-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Log Game Activity</h3>
            {gameLogData?.gameName && (
              <p className="text-sm text-gray-400 mt-1">
                {gameLogData.gameName}
              </p>
            )}
          </div>
          <button
            onClick={closeGameLogModal}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Play Count
              </label>
              <input
                type="number"
                min="1"
                value={formData.playCount}
                onChange={(e) => setFormData({ ...formData, playCount: parseInt(e.target.value) || 1 })}
                className="w-full bg-gray-950 text-white rounded-lg px-4 py-3 border border-gray-800 focus:border-emerald-500 focus:outline-none transition-colors"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Hours Played
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.hoursPlayed}
                onChange={(e) => setFormData({ ...formData, hoursPlayed: e.target.value })}
                placeholder="0.0"
                className="w-full bg-gray-950 text-white rounded-lg px-4 py-3 border border-gray-800 focus:border-emerald-500 focus:outline-none transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Started Date
              </label>
              <input
                type="date"
                value={formData.startedAt}
                onChange={(e) => setFormData({ ...formData, startedAt: e.target.value })}
                className="w-full bg-gray-950 text-white rounded-lg px-4 py-3 border border-gray-800 focus:border-emerald-500 focus:outline-none transition-colors"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Completed Date
              </label>
              <input
                type="date"
                value={formData.completedAt}
                onChange={(e) => setFormData({ ...formData, completedAt: e.target.value })}
                className="w-full bg-gray-950 text-white rounded-lg px-4 py-3 border border-gray-800 focus:border-emerald-500 focus:outline-none transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="completed"
              checked={formData.completed}
              onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
              className="w-5 h-5 bg-gray-950 border-gray-800 rounded focus:ring-emerald-500 focus:ring-2"
              disabled={isLoading}
            />
            <label htmlFor="completed" className="text-sm font-medium text-gray-300">
              Completed this game
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Notes <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any thoughts, achievements, or memories from this playthrough?"
              maxLength={1000}
              rows={4}
              className="w-full bg-gray-950 text-white rounded-lg px-4 py-3 border border-gray-800 focus:border-emerald-500 focus:outline-none resize-none transition-colors"
              disabled={isLoading}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {formData.notes.length}/1000
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeGameLogModal}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-900/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Log
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}