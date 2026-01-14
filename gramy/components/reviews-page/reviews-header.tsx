import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ReviewsHeaderProps {
  username: string;
  totalCount: number;
}

export function ReviewsHeader({ username, totalCount }: ReviewsHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href={`/profile/${username}`}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </Link>
      <h1 className="text-3xl font-bold text-white">
        {username}'s Reviews
      </h1>
      <p className="text-gray-400 mt-2">{totalCount} total reviews</p>
    </div>
  );
}