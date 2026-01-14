"use client";

import { useState } from "react";
import UserManagement from "./UserManagement";
import ActivityLogs from "./ActivityLogs";
import { Shield, Users, ScrollText } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "logs">("users");

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm">Manage users and monitor activity</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-700/50">
            <button
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-all relative ${
                activeTab === "users"
                  ? "text-teal-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("users")}
            >
              <Users className="w-4 h-4" />
              User Management
              {activeTab === "users" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400" />
              )}
            </button>
            <button
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-all relative ${
                activeTab === "logs"
                  ? "text-teal-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("logs")}
            >
              <ScrollText className="w-4 h-4" />
              Activity Logs
              {activeTab === "logs" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          {activeTab === "users" && <UserManagement />}
          {activeTab === "logs" && <ActivityLogs />}
        </div>
      </div>
    </div>
  );
}