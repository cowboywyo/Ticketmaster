import { useQuery } from '@tanstack/react-query';
import { listProjects } from '../api/projects';
import { Link } from 'react-router-dom';
import { FolderKanban, Users } from 'lucide-react';
import { Spinner } from '../components/ui/Spinner';
import type { Project } from '../types';

export function DashboardPage() {
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: listProjects,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h1>
      {projects.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FolderKanban className="mx-auto mb-3 text-gray-300" size={48} />
          <p className="text-lg font-medium">No projects yet</p>
          <p className="text-sm">Create your first project using the + button in the sidebar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}/board`}
              className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-100 text-indigo-700 rounded px-2 py-0.5 text-xs font-bold">
                  {project.key}
                </span>
                <h2 className="font-semibold text-gray-900">{project.name}</h2>
              </div>
              {project.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Users size={12} />
                {project.memberCount} {project.memberCount === 1 ? 'member' : 'members'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
