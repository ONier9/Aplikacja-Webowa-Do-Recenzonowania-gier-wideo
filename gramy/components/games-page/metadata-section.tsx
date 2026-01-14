"use client";

import Link from "next/link";

interface MetadataSectionProps {
  title: string;
  items: Array<{ igdb_id: number; name: string }>;
  basePath: string;
  colorClass: string;
  isMobile?: boolean;
}

export function MetadataSection({
  title,
  items,
  basePath,
  colorClass,
  isMobile = false,
}: MetadataSectionProps) {
  return (
    <div className={`mb-4 ${isMobile ? "text-center" : ""}`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {items.length > 0 ? (
        <div
          className={`flex flex-wrap gap-2 text-sm ${isMobile ? "justify-center" : ""}`}
        >
          {items.map((item) => (
            <Link
              key={item.igdb_id}
              href={`/${basePath}/${item.igdb_id}`}
              className={`${colorClass} px-2 py-1 rounded-full flex-shrink-0 hover:opacity-80 transition-colors`}
            >
              {item.name || `Unknown ${title}`}
            </Link>
          ))}
        </div>
      ) : (
        <p className={`text-gray-500 text-sm ${isMobile ? "text-center" : ""}`}>
          No {title.toLowerCase()} information
        </p>
      )}
    </div>
  );
}
