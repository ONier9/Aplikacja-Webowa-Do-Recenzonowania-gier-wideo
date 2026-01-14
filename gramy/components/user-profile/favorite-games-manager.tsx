"use client";

import { useState } from "react";
import { Star, X, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SearchBar } from "@/components/layout/navbar/search-bar";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { userService } from "@/services/userService";
import { supabase } from "@/services/supabaseClient";
import type { SimpleGame } from "@/types/game.types";

interface FavoriteGamesManagerProps {
  userId: string;
  initialTopFavorites: SimpleGame[];
  initialAllFavorites: SimpleGame[];
}

export default function FavoriteGamesManager({
  userId,
  initialTopFavorites,
  initialAllFavorites,
}: FavoriteGamesManagerProps) {
  const { user } = useAuth();
  const isOwnProfile = user?.id === userId;

  const [topFavorites, setTopFavorites] = useState<SimpleGame[]>(initialTopFavorites);
  const [allFavorites, setAllFavorites] = useState<SimpleGame[]>(initialAllFavorites);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { searchQuery, suggestions: searchSuggestions, setSearchQuery, clearSuggestions } =
    useSearchSuggestions();

  const handleSuggestionClick = async (game: any) => {
    setLoading(true);
    setError(null);

    try {
      await userService.favoriteGame(userId, game.igdb_id, false);
      const updatedFavorites = await userService.getUserAllFavorites(userId);
      setAllFavorites(updatedFavorites);
      clearSuggestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to favorite game");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTopFavorite = async (favoriteId: string) => {
    if (!isOwnProfile) return;

    setError(null);

    try {
      const isNowTop = await userService.toggleTopFavorite(userId, favoriteId);

      if (isNowTop && topFavorites.length < 5) {
        const favoriteToAdd = allFavorites.find((f) => f.favorite_id === favoriteId);
        if (favoriteToAdd) {
          setTopFavorites([...topFavorites, { ...favoriteToAdd, is_top_favorite: true }]);
        }
      } else {
        setTopFavorites(topFavorites.filter((f) => f.favorite_id !== favoriteId));
      }

      setAllFavorites(
        allFavorites.map((f) =>
          f.favorite_id === favoriteId ? { ...f, is_top_favorite: isNowTop } : f
        )
      );
    } catch (err: any) {
      setError(err.message || "Error updating favorites");
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    if (!isOwnProfile) return;

    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("user_favorite_games")
        .delete()
        .eq("id", favoriteId)
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      setTopFavorites(topFavorites.filter((f) => f.favorite_id !== favoriteId));
      setAllFavorites(allFavorites.filter((f) => f.favorite_id !== favoriteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove favorite");
    }
  };

  if (!isOwnProfile) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white mb-4">Top Favorite Games</h3>
        {topFavorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {topFavorites.map((game) => (
              <div key={game.favorite_id} className="relative group">
                <div className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden">
                  {game.cover_url && (
                    <img
                      src={game.cover_url}
                      alt={game.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <p className="text-sm text-white mt-2 text-center line-clamp-2">{game.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No top favorite games selected.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">My Top 5 Favorite Games</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
        >
          {isEditing ? "Done Editing" : "Edit Favorites"}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {topFavorites.map((game, index) => (
            <div key={game.favorite_id} className="relative group">
              <div className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden">
                {game.cover_url && (
                  <img
                    src={game.cover_url}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                )}
                {isEditing && (
                  <button
                    onClick={() => handleToggleTopFavorite(game.favorite_id!)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full transition-colors shadow-lg"
                    aria-label={`Remove ${game.name} from top favorites`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-white mt-2 text-center line-clamp-2">{game.name}</p>
              <div className="absolute -top-2 -left-2 bg-teal-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-lg">
                {index + 1}
              </div>
            </div>
          ))}

          {Array.from({ length: 5 - topFavorites.length }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="aspect-[3/4] bg-gray-800/30 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center"
            >
              <div className="text-center">
                <Plus className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Empty Slot</p>
              </div>
            </div>
          ))}
        </div>

        {isEditing && (
          <p className="text-sm text-gray-400 mt-4">
            {topFavorites.length}/5 games selected. Click the X to remove from top favorites.
          </p>
        )}
      </div>

      {isEditing && (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
          <h4 className="text-lg font-medium text-white mb-4">Add More Games</h4>

          <div className="mb-6">
            <SearchBar
              searchQuery={searchQuery}
              suggestions={searchSuggestions}
              onSearchChange={setSearchQuery}
              onSearchSubmit={(e) => e.preventDefault()}
              onSuggestionClick={handleSuggestionClick}
              className="mb-4"
            />
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Adding game...</span>
              </div>
            )}
          </div>

          <div>
            <h5 className="text-md font-medium text-gray-300 mb-3">
              All Your Favorites ({allFavorites.length})
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {allFavorites.map((game) => {
                const isTop = topFavorites.some((f) => f.favorite_id === game.favorite_id);
                const canAddToTop = topFavorites.length < 5;

                return (
                  <div key={game.favorite_id} className="relative group">
                    <div className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden">
                      {game.cover_url && (
                        <img
                          src={game.cover_url}
                          alt={game.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                        {isTop ? (
                          <button
                            onClick={() => handleToggleTopFavorite(game.favorite_id!)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                          >
                            Remove from Top
                          </button>
                        ) : canAddToTop ? (
                          <button
                            onClick={() => handleToggleTopFavorite(game.favorite_id!)}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                          >
                            Add to Top
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300 text-center px-2">
                            Top 5 limit reached
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-white truncate flex-1">{game.name}</p>
                      {isTop && <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 flex-shrink-0 ml-1" />}
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(game.favorite_id!)}
                      className="absolute top-1 right-1 bg-gray-900/90 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Remove ${game.name} from favorites`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
