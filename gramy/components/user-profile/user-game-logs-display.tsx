"use client";

import React, { useState } from 'react';
import { GameLogWithDetails } from "@/types/games";
import { updateGameLog, deleteGameLog } from '@/actions/games/logs';
import { Clock, Calendar, Gamepad2, Edit2, Trash2, Check, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';

interface UserGameLogsDisplayProps {
  logs: GameLogWithDetails[];
  isOwnProfile: boolean;
}

interface EditingLog {
  id: string;
  hours_played: number | null;
  notes: string | null;
  completed: boolean;
}

export default function UserGameLogsDisplay({ logs, isOwnProfile }: UserGameLogsDisplayProps) {
  const router = useRouter();
  const [editingLog, setEditingLog] = useState<EditingLog | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = (log: GameLogWithDetails) => {
    setEditingLog({
      id: log.id,
      hours_played: log.hours_played,
      notes: log.notes,
      completed: log.completed
    });
  };

  const handleCancelEdit = () => {
    setEditingLog(null);
  };

  const handleSaveEdit = async () => {
    if (!editingLog) return;

    setIsSaving(true);
    const result = await updateGameLog(editingLog.id, {
      hours_played: editingLog.hours_played,
      notes: editingLog.notes,
      completed: editingLog.completed
    });

    setIsSaving(false);

    if (result.success) {
      setEditingLog(null);
      router.refresh();
    } else {
      alert(result.error || 'Failed to update log');
    }
  };

  const handleDelete = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this log entry?')) return;

    setIsDeleting(logId);
    const result = await deleteGameLog(logId);
    setIsDeleting(null);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Failed to delete log');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
        <Gamepad2 className="h-12 w-12 mx-auto mb-3 opacity-30 text-gray-400" />
        <p className="text-gray-400">No gaming activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const isEditing = editingLog?.id === log.id;
        const isBeingDeleted = isDeleting === log.id;

        return (
          <div
            key={log.id}
            className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-4 hover:bg-gray-800/70 transition-colors"
          >
            <div className="flex gap-4">

              <Link
                href={`/game/${log.game_id}`}
                className="flex-shrink-0"
              >
                <div className="w-16 h-20 bg-gray-700 rounded overflow-hidden relative">
                  {log.game_cover ? (
                    <Image
                      src={log.game_cover}
                      alt={log.game_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gamepad2 className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <Link
                      href={`/game/${log.game_id}`}
                      className="text-lg font-semibold text-white hover:text-blue-400 transition-colors"
                    >
                      {log.game_name}
                    </Link>
                    {log.platform_name && (
                      <p className="text-sm text-gray-400 mt-1">
                        Platform: {log.platform_name}
                      </p>
                    )}
                  </div>

                  {isOwnProfile && !isEditing && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(log)}
                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Edit log"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(log.id)}
                        disabled={isBeingDeleted}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                        className="p-2 text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                        title="Save changes"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Gamepad2 className="w-4 h-4" />
                    <span>Played {log.play_count}x</span>
                  </div>
                  
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <input
                        type="number"
                        value={editingLog.hours_played || ''}
                        onChange={(e) => setEditingLog({
                          ...editingLog,
                          hours_played: e.target.value ? parseFloat(e.target.value) : null
                        })}
                        placeholder="Hours"
                        className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                        step="0.5"
                        min="0"
                      />
                      <span>hours</span>
                    </div>
                  ) : log.hours_played ? (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{log.hours_played.toFixed(1)}h played</span>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(log.started_at)}</span>
                  </div>

                  {isEditing ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingLog.completed}
                        onChange={(e) => setEditingLog({
                          ...editingLog,
                          completed: e.target.checked
                        })}
                        className="w-4 h-4"
                      />
                      <span className={editingLog.completed ? 'text-green-400' : ''}>
                        Completed
                      </span>
                    </label>
                  ) : log.completed && (
                    <span className="text-green-400">✓ Completed</span>
                  )}
                </div>

                {isEditing ? (
                  <textarea
                    value={editingLog.notes || ''}
                    onChange={(e) => setEditingLog({
                      ...editingLog,
                      notes: e.target.value
                    })}
                    placeholder="Add notes about your playthrough..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm resize-none"
                    rows={3}
                  />
                ) : log.notes && (
                  <p className="text-sm text-gray-300 mt-2 italic">
                    "{log.notes}"
                  </p>
                )}

                <div className="text-xs text-gray-500 mt-2">
                  Logged on {formatDate(log.created_at)}
                  {log.updated_at !== log.created_at && ' • Edited'}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}