import { Star } from "lucide-react";

interface RatingDistribution {
  "0.5": number;
  "1.0": number;
  "1.5": number;
  "2.0": number;
  "2.5": number;
  "3.0": number;
  "3.5": number;
  "4.0": number;
  "4.5": number;
  "5.0": number;
}

interface CompactRatingCardProps {
  distribution: RatingDistribution;
  totalReviews: number;
  averageRating: string;
}

export default function CompactRatingCard({
  distribution,
  totalReviews,
  averageRating,
}: CompactRatingCardProps) {
  const ratings = ["5.0", "4.5", "4.0", "3.5", "3.0", "2.5", "2.0", "1.5", "1.0", "0.5"];
  const maxCount = Math.max(...Object.values(distribution));

  return (
    <div className="group bg-gradient-to-br from-yellow-900/40 via-yellow-800/20 to-gray-800/40 rounded-xl p-6 border border-yellow-700/30 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-400">Average Rating</h3>
        <Star className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform" />
      </div>
      <p className="text-3xl font-bold text-yellow-400 mb-3">{averageRating}</p>
      
      <div className="space-y-1">
        {ratings.map((rating) => {
          const count = distribution[rating as keyof RatingDistribution] || 0;
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-6">{rating}</span>
              <div className="flex-1 h-1.5 bg-gray-700/30 rounded-full overflow-hidden">
                {count > 0 && (
                  <div
                    className="h-full bg-yellow-400/80 rounded-full transition-all duration-300"
                    style={{ width: `${barWidth}%` }}
                  />
                )}
              </div>
              <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-500 mt-3">Out of 5 • {totalReviews} reviews</p>
    </div>
  );
}