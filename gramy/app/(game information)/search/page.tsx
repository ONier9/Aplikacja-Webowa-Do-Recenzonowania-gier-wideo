'use client'
import { useState } from "react";
import { useAdvancedSearch } from "@/hooks/useAdvancedSearch";
import AdvancedSearchHeader from "@/components/search/advanced-search-header";
import ErrorAlert from "@/components/search/error-alert";
import SearchForm from "@/components/search/search-form";
import SearchResults from "@/components/search/search-results";

export default function AdvancedSearchPage() {
  const {
    genres,
    platforms,
    selectedGenres,
    selectedPlatforms,
    selectedCompanies,
    companySearch,
    companyResults,
    platformSearch,
    platformResults,
    games,
    totalCount,
    loading,
    error,
    setCompanySearch,
    setPlatformSearch,
    fetchGames,
    toggleGenre,
    addPlatform,
    addCompany,
    removeCompany,
    removePlatform,
  } = useAdvancedSearch();

  const [currentPage, setCurrentPage] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchGames(1);
    setCurrentPage(1);
  };

  const handlePageChange = async (page: number) => {
    await fetchGames(page);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasFilters =
    selectedGenres.length > 0 ||
    selectedPlatforms.length > 0 ||
    selectedCompanies.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AdvancedSearchHeader />
      {error && <ErrorAlert message={error} />}
<SearchForm
  loading={loading}
  hasFilters={hasFilters}
  platformSearch={platformSearch}
  setPlatformSearch={setPlatformSearch}
  platformResults={platformResults}
  addPlatform={addPlatform}
  selectedPlatforms={selectedPlatforms}
  removePlatform={removePlatform}
  companySearch={companySearch}
  setCompanySearch={setCompanySearch}
  companyResults={companyResults}
  addCompany={addCompany}
  selectedCompanies={selectedCompanies}
  removeCompany={removeCompany}
  genres={genres}
  selectedGenres={selectedGenres}
  toggleGenre={toggleGenre}
  onSubmit={handleSubmit}
  platforms={platforms}
/>
      <SearchResults
        games={games}
        totalCount={totalCount}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        loading={loading}
        hasFilters={hasFilters}
      />
    </div>
  );
}
