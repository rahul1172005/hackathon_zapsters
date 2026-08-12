'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ParticipantSidebar } from '@/components/navigation/ParticipantSidebar';
import { TeamWorkspaceHeader } from '@/components/navigation/TeamWorkspaceHeader';
import { MOCK_TEAMS } from '@/lib/mockData';
import { TeamTask } from '@/types';
import { Plus } from 'lucide-react';

export default function TeamTasksPage() {
  const params = useParams();
  const teamId = params?.teamId as string;
  const team = MOCK_TEAMS.find((t) => t.id === teamId || t.slug === teamId) || MOCK_TEAMS[2];

  const [tasks, setTasks] = useState(team.tasks.length > 0 ? team.tasks : [
    { id: 'tk-1', title: 'Setup production infrastructure & telemetry pipeline', assignee: 'Team Lead', status: 'DONE' as const },
    { id: 'tk-2', title: 'Build frontend dashboard canvas and visual alerts', assignee: 'Frontend Eng', status: 'IN_PROGRESS' as const },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks([
      ...tasks,
      {
        id: `tk-${Date.now()}`,
        title: newTaskTitle,
        assignee: 'Team Member',
        status: 'IN_PROGRESS',
      },
    ]);
    setNewTaskTitle('');
    setIsAdding(false);
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(
      tasks.map((t: TeamTask) =>
        t.id === id
          ? { ...t, status: t.status === 'DONE' ? 'IN_PROGRESS' : 'DONE' }
          : t
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] dark:bg-[#0A0A0A] flex font-inter">
      <ParticipantSidebar />

      <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-y-auto pb-24 lg:pb-8">
        <TeamWorkspaceHeader team={team} />

        <div className="bg-[#FFFFFF] p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-geist font-bold text-[#111111]">Team Execution Tasks</h2>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2 bg-[#800000] hover:bg-[#660000] text-white text-xs font-inter font-bold uppercase rounded-full transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> {isAdding ? 'Cancel' : 'Add Task'}
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleAddTask} className="flex gap-2 font-inter text-xs">
              <input
                type="text"
                placeholder="Enter new task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 p-3 bg-[#F7F7F5] border border-[#E5E5E2] rounded-full outline-none focus:border-[#800000]"
                autoFocus
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#111111] text-white font-bold rounded-full hover:bg-[#222222]"
              >
                Save
              </button>
            </form>
          )}
        </div>

        <div className="bg-[#FFFFFF] p-6 rounded-3xl shadow-xs overflow-x-auto">
          <table className="w-full text-left font-inter text-xs border-separate border-spacing-y-2">
            <thead>
              <tr className="font-inter text-xs uppercase text-[#777777]">
                <th className="py-3 px-5">TASK DESCRIPTION</th>
                <th className="py-3 px-5">ASSIGNEE</th>
                <th className="py-3 px-5 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="font-inter">
              {tasks.map((t: TeamTask) => (
                <tr key={t.id} className="bg-[#F7F7F5] hover:bg-neutral-200/60 rounded-2xl transition-all">
                  <td className="py-3.5 px-5 font-bold text-[#111111] rounded-l-2xl">{t.title}</td>
                  <td className="py-3.5 px-5 font-inter text-[#777777]">{t.assignee}</td>
                  <td className="py-3.5 px-5 text-right rounded-r-2xl">
                    <button
                      onClick={() => toggleTaskStatus(t.id)}
                      className={`font-inter text-xs font-bold px-3 py-1 rounded-full cursor-pointer transition-colors ${
                        t.status === 'DONE' ? 'bg-[#800000] text-white' : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'
                      }`}
                    >
                      {t.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
