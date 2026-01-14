import { notFound } from "next/navigation";
import GameGrid from "@/components/page-elements/game-grid";
import EntityHeader from "@/components/page-elements/entity-header";
import Pagination from "@/components/page-elements/pagination";
import { Game } from "@/types/";

interface EntityPageProps {
  entityId: string;
  entityName: string;
  entityDescription?: string;
  games: Game[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  basePath: "/company" | "/genre" | "/platform";
}

export default function EntityPage({
  entityId,
  entityName,
  entityDescription,
  games,
  pagination,
  basePath,
}: EntityPageProps) {
  if (!games || games.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <EntityHeader
          title={entityName}
          description={entityDescription}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
        />
        <div className="text-center py-12">
          <p className="text-gray-500 text-xl">
            No games found for this {basePath.slice(1)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <EntityHeader
        title={entityName}
        description={entityDescription}
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
      />

      <GameGrid games={games} />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        basePath={basePath}
        entityId={entityId}
      />
    </div>
  );
}