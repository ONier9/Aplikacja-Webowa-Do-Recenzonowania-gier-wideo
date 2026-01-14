"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import debounce from "lodash.debounce";
import { validate as isValidUUID } from "uuid";

interface Profile {
  id: string;
  username: string;
  email: string;
  role: string;
  banned: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  const fetchUsers = async (query?: string) => {
    let builder = supabase.from("profiles").select("*");

    if (query) {
      const usernameQuery = `username.ilike.%${query}%`;
      const idQuery = isValidUUID(query) ? `id.eq.${query}` : null;

      if (idQuery) {
        builder = builder.or(`${usernameQuery},${idQuery}`);
      } else {
        builder = builder.ilike("username", `%${query}%`);
      }
    }

    const { data, error } = await builder;
    if (error) {
      console.error("Error fetching users:", error.message);
      setUsers([]);
      return;
    }
    setUsers(data || []);
  };

  const debouncedFetch = debounce((value: string) => {
    fetchUsers(value.trim());
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedFetch(value);
  };

  useEffect(() => {
    fetchUsers(); 
    return () => {
      debouncedFetch.cancel(); 
    };
  }, []);

  const toggleBan = async (user: Profile) => {
    try {
      const newBannedStatus = !user.banned;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ banned: newBannedStatus })
        .eq("id", user.id);

      if (updateError) throw updateError;

      const {
        data: { user: admin },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      const actionText = newBannedStatus
        ? `Banned user ${user.username} (${user.id})`
        : `Unbanned user ${user.username} (${user.id})`;

      const { error: logError } = await supabase.from("activity_logs").insert({
        user_id: user.id,
        performed_by: admin?.id || null,
        action: actionText,
      });

      if (logError) throw logError;

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, banned: newBannedStatus } : u))
      );
    } catch (err: any) {
      console.error("Error toggling ban:", err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by username or user ID..."
          className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded focus:ring-2 focus:ring-teal-500 outline-none"
        />
      </div>

      <table className="w-full text-left border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-4 py-2">Username</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Banned</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-gray-700">
              <td className="px-4 py-2">{u.username}</td>
              <td className="px-4 py-2">{u.email}</td>
              <td className="px-4 py-2">{u.role}</td>
              <td className="px-4 py-2">{u.banned ? "Yes" : "No"}</td>
              <td className="px-4 py-2">
                <button
                  className={`px-3 py-1 rounded text-white transition-colors ${
                    u.banned ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                  onClick={() => toggleBan(u)}
                >
                  {u.banned ? "Unban" : "Ban"}
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-center text-gray-400">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
