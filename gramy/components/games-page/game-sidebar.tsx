import { GameCover } from "@/components/page-elements/game-cover";
import { MetadataSection } from "@/components/games-page/metadata-section";
import type { LinkedGenre, LinkedPlatform, LinkedCompany } from "@/types";

interface GameSidebarProps {
  coverUrl: string | null;
  name: string;
  genres: LinkedGenre[];
  platforms: LinkedPlatform[];
  companies: LinkedCompany[];
  isMobile?: boolean;
}

export default function GameSidebar({
  coverUrl,
  name,
  genres,
  platforms,
  companies,
  isMobile = false,
}: GameSidebarProps) {
  const content = (
    <>
      <GameCover coverUrl={coverUrl} name={name} />
      <MetadataSection
        title="Genres"
        items={genres}
        basePath="genre"
        colorClass="bg-blue-100 text-blue-800"
        isMobile={isMobile}
      />
      <MetadataSection
        title="Platforms"
        items={platforms}
        basePath="platform"
        colorClass="bg-green-100 text-green-800"
        isMobile={isMobile}
      />
      <MetadataSection
        title="Companies"
        items={companies}
        basePath="company"
        colorClass="bg-purple-100 text-purple-800"
        isMobile={isMobile}
      />
    </>
  );

  if (isMobile) {
    return (
      <div className="md:hidden mt-4 flex flex-col items-center">{content}</div>
    );
  }

  return (
    <div className="flex-shrink-0 w-full max-w-[180px] mx-auto md:w-[180px] md:mx-0 mb-8 md:mb-0">
      {content}
    </div>
  );
}
