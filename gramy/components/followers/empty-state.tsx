import { Users } from "lucide-react";

interface EmptyStateProps {
  variant: "followers" | "following";
  username: string;
}

export function EmptyState({ variant, username }: EmptyStateProps) {
  const messages = {
    followers: {
      title: "No followers yet",
      description: `${username} doesn't have any followers yet.`,
    },
    following: {
      title: "No following yet",
      description: `${username} isn't following anyone yet.`,
    },
  };

  return (
    <div className="text-center py-16 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
      <Users className="h-16 w-16 mx-auto mb-4 text-gray-600" />
      <h3 className="text-xl font-semibold text-gray-400 mb-2">
        {messages[variant].title}
      </h3>
      <p className="text-gray-500">
        {messages[variant].description}
      </p>
    </div>
  );
}