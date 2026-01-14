"use client";

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mb-4" />
      <p className="text-gray-400 text-lg">Finding games for you...</p>
    </div>
  );
}
