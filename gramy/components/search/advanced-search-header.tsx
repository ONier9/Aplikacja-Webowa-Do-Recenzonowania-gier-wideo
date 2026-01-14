import { SlidersHorizontal } from "lucide-react";

export default function AdvancedSearchHeader() {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/10 rounded-full mb-4">
        <SlidersHorizontal className="w-8 h-8 text-teal-500" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-2">Advanced Game Search</h1>
      <p className="text-gray-400 text-lg">
        Filter games by platforms, companies, and genres
      </p>
    </div>
  );
}
