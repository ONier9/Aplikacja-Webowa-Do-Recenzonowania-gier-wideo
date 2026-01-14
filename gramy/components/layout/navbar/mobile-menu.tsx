import Link from "next/link";
import { X, Shield, Search, User, LogOut, LogIn, UserPlus } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { GameSuggestion } from "@/types";

interface MobileMenuProps {
  user: SupabaseUser | null;
  username: string | null;
  searchQuery: string;
  suggestions: GameSuggestion[];
  isAdmin?: boolean;
  onClose: () => void;
  onSignOut: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSuggestionClick: (suggestion: GameSuggestion) => void;
}

export function MobileMenu({
  user,
  username,
  searchQuery,
  suggestions,
  isAdmin = false,
  onClose,
  onSignOut,
  onOpenLogin,
  onOpenRegister,
  onSearchChange,
  onSearchSubmit,
  onSuggestionClick,
}: MobileMenuProps) {
  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 md:hidden">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-gradient-to-r from-gray-900 to-gray-800">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
            Gromy
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-all"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-2">
              Search
            </h3>
            <form onSubmit={onSearchSubmit} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Find a game..."
                  className="w-full bg-gray-800/50 border border-gray-700 text-white pl-12 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder:text-gray-500"
                />
              </div>

              {suggestions.length > 0 && (
                <div className="mt-2 bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden shadow-xl">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.igdb_id}
                      type="button"
                      onClick={() => {
                        onSuggestionClick(suggestion);
                        onClose();
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-teal-600/20 transition-colors text-white border-b border-gray-700/50 last:border-b-0"
                    >
                      <div className="font-medium">{suggestion.name}</div>
                    </button>
                  ))}
                </div>
              )}

              <Link
                href="/search"
                onClick={onClose}
                className="inline-block mt-2 ml-2 text-xs text-gray-400 hover:text-teal-400 transition-colors"
              >
                Advanced search →
              </Link>
            </form>
          </div>

          <div className="space-y-3">
            {user && username ? (
              <>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-2">
                  Account
                </h3>
                
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/30 text-purple-300 hover:border-purple-500/50 hover:from-purple-500/20 hover:to-purple-600/20 transition-all"
                  >
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Admin Console</span>
                  </Link>
                )}
                
                <Link
                  href={`/profile/${username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 text-white hover:bg-gray-700/50 hover:border-gray-600 transition-all"
                >
                  <User className="w-5 h-5 text-teal-400" />
                  <span className="font-medium">My Profile</span>
                </Link>

                <button
                  onClick={() => handleAction(onSignOut)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-2">
                  Get Started
                </h3>
                
                <button
                  onClick={() => handleAction(onOpenLogin)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-500 hover:to-teal-600 transition-all shadow-lg shadow-teal-600/20"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="font-medium">Login</span>
                </button>

                <button
                  onClick={() => handleAction(onOpenRegister)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg border-2 border-teal-600 text-teal-400 hover:bg-teal-600/10 hover:border-teal-500 transition-all"
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="font-medium">Register</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-800/50 bg-gradient-to-t from-gray-900 to-transparent">
          <p className="text-center text-xs text-gray-500">
            © 2024 Gromy. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}