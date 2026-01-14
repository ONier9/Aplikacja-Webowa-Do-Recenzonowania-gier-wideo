import { notFound } from "next/navigation";
import { getPlatformById, getGamesByPlatform } from "@/services/entities";
import { fetchEntityPage } from "@/utils/entity-page";
import EntityPage from "@/components/entities/entity-page";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function PlatformPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const result = await fetchEntityPage({
    id,
    searchParams: resolvedSearchParams,
    entityFetcher: getPlatformById,
    gamesFetcher: getGamesByPlatform,
  });

  if (result.notFound || !result.entity) {
    return notFound();
  }

  if (!result.pagination) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-red-500 text-xl">
            Failed to load pagination information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <EntityPage
      entityId={id}
      entityName={result.entity.name}
      entityDescription={result.entity.description || undefined}
      games={result.games}
      pagination={result.pagination}
      basePath="/platform"
    />
  );
}
