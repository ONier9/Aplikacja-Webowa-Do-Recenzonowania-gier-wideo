'use client';

import { useState, useTransition, useEffect } from 'react';
import { X, Check, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useModal } from '@/context/ModalContext';
import { useRouter } from 'next/navigation';
import { createCollection } from '@/actions/collections';
import { addGameToCollection } from '@/actions/collections';

export default function CreateCollectionModal() {
  const router = useRouter();
  const { 
    isCreateCollectionOpen, 
    closeCreateCollectionModal, 
    createCollectionData, 
    openLogin 
  } = useModal();

  const { user } = useAuth();
  
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isCreateCollectionOpen) {
      setFormData({ name: '', description: '', isPublic: true });
      setError('');
    }
  }, [isCreateCollectionOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Collection name is required');
      return;
    }

    if (!user) {
      openLogin();
      return;
    }

    startTransition(async () => {
      try {
        const result = await createCollection({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          isPublic: formData.isPublic
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to create collection');
        }

        if (createCollectionData?.gameId && result.data) {
          const addResult = await addGameToCollection(
            result.data.id,
            createCollectionData.gameId
          );

          if (!addResult.success) {
            throw new Error('Failed to add game to collection');
          }
        }

        closeCreateCollectionModal();
        router.refresh();
      } catch (err: any) {
        setError(err.message || 'Failed to create collection');
      }
    });
  };

  if (!isCreateCollectionOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 rounded-xl max-w-lg w-full p-6 border border-gray-700 shadow-2xl relative">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Create New Collection</h3>
            {createCollectionData?.gameName && (
              <p className="text-sm text-gray-400 mt-1">
                And add <span className="text-purple-400">{createCollectionData.gameName}</span> to it
              </p>
            )}
          </div>
          <button
            onClick={closeCreateCollectionModal}
            disabled={isPending}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Collection Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., RPGs, To Play Next..."
              maxLength={100}
              autoFocus
              className="w-full bg-gray-950 text-white rounded-lg px-4 py-3 border border-gray-800 focus:border-purple-500 focus:outline-none transition-colors"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this collection about?"
              maxLength={500}
              rows={3}
              className="w-full bg-gray-950 text-white rounded-lg px-4 py-3 border border-gray-800 focus:border-purple-500 focus:outline-none resize-none transition-colors"
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPublic: true })}
                disabled={isPending}
                className={`flex items-center justify-center gap-3 p-3 rounded-lg border transition-all ${
                  formData.isPublic
                    ? 'border-purple-500 bg-purple-500/10 text-white'
                    : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">Public</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPublic: false })}
                disabled={isPending}
                className={`flex items-center justify-center gap-3 p-3 rounded-lg border transition-all ${
                  !formData.isPublic
                    ? 'border-purple-500 bg-purple-500/10 text-white'
                    : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
                }`}
              >
                <EyeOff className="w-4 h-4" />
                <span className="text-sm font-medium">Private</span>
              </button>
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
              onClick={closeCreateCollectionModal}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !formData.name.trim()}
              className="flex-[2] bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple-900/20"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create Collection
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}