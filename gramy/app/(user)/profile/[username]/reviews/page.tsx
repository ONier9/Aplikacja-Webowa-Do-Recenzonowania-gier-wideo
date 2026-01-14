import { notFound } from "next/navigation";
import { userService } from "@/services/userService";
import UserReviewsClient from "./_UserReviewsClient";

interface PageProps {
  params: { username: string };
  searchParams: { page?: string; sortBy?: string };
}

export default async function UserReviewsPage({ params, searchParams }: PageProps) {
  const { username } = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");
  const sortBy = (resolvedSearchParams.sortBy as "created_at" | "likes" | "rating") || "created_at";
  const pageSize = 10;

  const userProfile = await userService.getUserProfileByUsername(username);
  if (!userProfile) return notFound();

  const [reviews, totalCount] = await Promise.all([
    userService.getUserReviews(userProfile.id, page, pageSize, sortBy),
    userService.getUserReviewsCount(userProfile.id),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <UserReviewsClient
      userProfile={userProfile}
      reviews={reviews}
      totalCount={totalCount}
      currentPage={page}
      totalPages={totalPages}
      sortBy={sortBy}
    />
  );
}