import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CreateProjectModal } from '../projects/CreateProjectModal';

export function AppLayout() {
  const [showCreateProject, setShowCreateProject] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onCreateProject={() => setShowCreateProject(true)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <CreateProjectModal
        open={showCreateProject}
        onClose={() => setShowCreateProject(false)}
      />
    </div>
  );
}
