import { FollowStats } from "@/actions/followActions";

interface TabNavigationProps {
  activeTab: "followers" | "following";
  onTabChange: (tab: "followers" | "following") => void;
  followStats: FollowStats;
}

export function TabNavigation({
  activeTab,
  onTabChange,
  followStats,
}: TabNavigationProps) {
  return (
    <div className="flex gap-2 mb-6 border-b border-gray-700">
      <button
        onClick={() => onTabChange("followers")}
        className={`px-6 py-3 font-medium transition-all ${
          activeTab === "followers"
            ? "text-purple-400 border-b-2 border-purple-400"
            : "text-gray-400 hover:text-gray-300"
        }`}
      >
        Followers
        <span className="ml-2 text-sm bg-gray-800 px-2 py-0.5 rounded-full">
          {followStats.followers}
        </span>
      </button>
      <button
        onClick={() => onTabChange("following")}
        className={`px-6 py-3 font-medium transition-all ${
          activeTab === "following"
            ? "text-purple-400 border-b-2 border-purple-400"
            : "text-gray-400 hover:text-gray-300"
        }`}
      >
        Following
        <span className="ml-2 text-sm bg-gray-800 px-2 py-0.5 rounded-full">
          {followStats.following}
        </span>
      </button>
    </div>
  );
}