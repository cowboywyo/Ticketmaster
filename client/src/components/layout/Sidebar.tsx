import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listProjects } from '../../api/projects';
import { Bug, LayoutDashboard, Plus, Settings, List, Columns3 } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Project } from '../../types';

interface SidebarProps {
  onCreateProject: () => void;
}

export function Sidebar({ onCreateProject }: SidebarProps) {
  const { projectId } = useParams();
  const { data: projects = [] } = useQuery<Project[]>({ queryKey: ['projects'], queryFn: listProjects });

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col h-full">
      <div className="p-4 flex items-center gap-2 border-b border-gray-700">
        <Bug className="text-indigo-400" size={24} />
        <span className="text-lg font-bold text-white">Ticketmaster</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-800 text-sm"
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        <div className="pt-4">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold uppercase text-gray-500">Projects</span>
            <button
              onClick={onCreateProject}
              className="text-gray-400 hover:text-white"
            >
              <Plus size={16} />
            </button>
          </div>
          {projects.map((project) => (
            <div key={project.id}>
              <div
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md',
                  projectId === project.id ? 'text-white bg-gray-800' : 'text-gray-400'
                )}
              >
                <span className="text-xs bg-gray-700 text-gray-300 rounded px-1 mr-2">
                  {project.key}
                </span>
                {project.name}
              </div>
              {projectId === project.id && (
                <div className="ml-4 mt-1 space-y-0.5">
                  <Link
                    to={`/projects/${project.id}/board`}
                    className="flex items-center gap-2 px-3 py-1 text-xs rounded hover:bg-gray-800"
                  >
                    <Columns3 size={14} /> Board
                  </Link>
                  <Link
                    to={`/projects/${project.id}/list`}
                    className="flex items-center gap-2 px-3 py-1 text-xs rounded hover:bg-gray-800"
                  >
                    <List size={14} /> List
                  </Link>
                  <Link
                    to={`/projects/${project.id}/settings`}
                    className="flex items-center gap-2 px-3 py-1 text-xs rounded hover:bg-gray-800"
                  >
                    <Settings size={14} /> Settings
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}
