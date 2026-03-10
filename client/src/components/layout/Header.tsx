import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <User size={16} />
          {user?.displayName}
        </div>
        <button
          onClick={logout}
          className="text-gray-400 hover:text-gray-600 p-1"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
