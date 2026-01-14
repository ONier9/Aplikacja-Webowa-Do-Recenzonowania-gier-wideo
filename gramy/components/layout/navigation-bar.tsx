"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import { useModal } from "@/context/ModalContext";
import { SearchBar } from "./navbar/search-bar";
import { UserMenu } from "./navbar/user-menu";
import { MobileMenu } from "./navbar/mobile-menu";
import { GameSuggestion } from "@/types";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, username, loading, signOut } = useAuth();
  const { searchQuery, suggestions, setSearchQuery, clearSuggestions } =
    useSearchSuggestions();
  const { openRegister, openLogin } = useModal();
  const router = useRouter();

  useEffect(() => {
    console.log('[Navbar] Auth State:', { 
      user: user?.id, 
      username, 
      loading,
      isAdmin 
    });
  }, [user, username, loading, isAdmin]);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, banned")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error('[Navbar] Error checking admin status:', error);
          setIsAdmin(false);
          return;
        }

        setIsAdmin(profile?.role === "admin" && !profile?.banned);
      } catch (error) {
        console.error("[Navbar] Error checking admin status:", error);
        setIsAdmin(false);
      }
    }

    checkAdminStatus();
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      router.push(`/game/${suggestions[0].igdb_id}`);
      clearSuggestions();
    } else if (searchQuery.trim().length > 0) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      clearSuggestions();
    }
  };

  const handleSuggestionClick = (suggestion: GameSuggestion) => {
    router.push(`/game/${suggestion.igdb_id}`);
    clearSuggestions();
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('[Navbar] Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <nav className="bg-gradient-to-b from-black via-black/40 to-transparent w-full sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 max-w-screen-xl mx-auto md:px-8">
          <div className="py-3 md:py-5">
            <Link href="/">
              <h1 className="text-3xl font-bold text-teal-500">Gromy</h1>
            </Link>
          </div>
          <div className="text-gray-400">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gradient-to-b from-black via-black/40 to-transparent w-full sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 max-w-screen-xl mx-auto md:px-8">
        <div className="py-3 md:py-5">
          <Link href="/">
            <h1 className="text-3xl font-bold text-teal-500">Gromy</h1>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span className="font-medium">Admin</span>
            </Link>
          )}

          <UserMenu
            user={user}
            username={username}
            onSignOut={handleSignOut}
            onOpenLogin={openLogin}
            onOpenRegister={openRegister}
          />

          <SearchBar
            searchQuery={searchQuery}
            suggestions={suggestions}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearch}
            onSuggestionClick={handleSuggestionClick}
          />
        </div>

        <div className="md:hidden py-3">
          <button
            className="text-stone-300 outline-none p-2 rounded-md"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu />
          </button>
        </div>

        {isMenuOpen && (
          <MobileMenu
            user={user}
            username={username}
            searchQuery={searchQuery}
            suggestions={suggestions}
            isAdmin={isAdmin}
            onClose={() => setIsMenuOpen(false)}
            onSignOut={handleSignOut}
            onOpenLogin={openLogin}
            onOpenRegister={openRegister}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearch}
            onSuggestionClick={handleSuggestionClick}
          />
        )}
      </div>
    </nav>
  );
}