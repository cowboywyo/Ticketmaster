import { Navigate, Link } from 'react-router-dom';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth } from '../context/AuthContext';
import { Bug } from 'lucide-react';

export function RegisterPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Bug className="mx-auto text-indigo-600 mb-2" size={40} />
          <h1 className="text-2xl font-bold text-gray-900">Ticketmaster</h1>
          <p className="text-sm text-gray-500 mt-1">Create a new account</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <RegisterForm />
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
