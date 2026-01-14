export const shortenSummary = (
  summary: string | null | undefined,
  wordLimit: number
): string => {
  if (!summary) return "No summary available";
  const words = summary.split(" ");
  if (words.length <= wordLimit) {
    return summary;
  }
  return words.slice(0, wordLimit).join(" ") + "...";
};