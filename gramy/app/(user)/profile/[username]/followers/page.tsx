import { notFound } from "next/navigation";
import { userService } from "@/services/userService";
import { 
  getFollowers, 
  getFollowing, 
  getFollowStats 
} from "@/actions/followActions";
import FollowersPageClient from "./_FollowersPageClient";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function FollowersPage({ params }: PageProps) {
  const { username } = await params;
  
  const userProfile = await userService.getUserProfileByUsername(username);
  if (!userProfile) return notFound();

  const [followers, following, followStats] = await Promise.all([
    getFollowers(userProfile.id),
    getFollowing(userProfile.id),
    getFollowStats(userProfile.id),
  ]);

  return (
    <FollowersPageClient
      userProfile={userProfile}
      followers={followers}
      following={following}
      followStats={followStats}
    />
  );
}