"use client";

import ExpandableText from "./expandable-text";

interface EntityHeaderProps {
  title: string;
  description?: string | null;
  currentPage: number;
  totalPages: number;
  total: number;
}

export default function EntityHeader({
  title,
  description,
  currentPage,
  totalPages,
  total,
}: EntityHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      {description && (
        <div className="max-w-3xl mx-auto mb-4">
          <ExpandableText text={description} wordLimit={30} />
        </div>
      )}
      <p className="text-gray-600">
        Page {currentPage} of {totalPages} • {total} total games
      </p>
    </div>
  );
}
