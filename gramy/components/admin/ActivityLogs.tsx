"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Calendar, User, Shield, Activity } from "lucide-react";

interface LogEntry {
  id: number;
  user_id: string;
  performed_by: string | null;
  action: string;
  created_at: string;
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    
    if (error) {
      console.error("Error fetching logs:", error.message);
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Activity Logs</h2>
          <p className="text-gray-400 text-sm">
            Recent administrative actions and system events
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-400">Loading activity logs...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 hover:border-gray-600/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white mb-2">{log.action}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span className="truncate">User: {log.user_id.substring(0, 8)}...</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4" />
                      <span>
                        {log.performed_by 
                          ? `By: ${log.performed_by.substring(0, 8)}...` 
                          : "System"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(log.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
                <Activity className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium mb-1">No activity logs yet</p>
              <p className="text-gray-500 text-sm">
                Administrative actions will appear here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}