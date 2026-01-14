export function LoadingState() {
  return (
    <div className="max-w-xl mx-auto text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
      <p className="mt-4 text-gray-400">Loading account information...</p>
    </div>
  );
}