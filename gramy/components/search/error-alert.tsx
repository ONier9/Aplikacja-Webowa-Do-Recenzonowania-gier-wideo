import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="text-red-500 font-semibold mb-1">Error</h3>
        <p className="text-red-400 text-sm">{message}</p>
      </div>
    </div>
  );
}
