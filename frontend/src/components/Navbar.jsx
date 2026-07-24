import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, CheckCircle, Award, LayoutDashboard, Compass, ClipboardList } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const userName = localStorage.getItem('userName');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const dashboardPath = role === 'instructor' ? '/instructor' : '/student';

  const navLinks = [
    { name: 'Dashboard', path: dashboardPath, icon: LayoutDashboard },
    { name: 'Courses', path: '/courses', icon: Compass },
    { name: 'Assignments', path: '/assignments', icon: ClipboardList },
    { name: 'Certificate', path: '/certificate', icon: Award },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(dashboardPath)}>
        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-500/20">
          <BookOpen size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          LEARNIFY
        </span>
      </div>

      <div className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-indigo-400 bg-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon size={16} />
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        {userName && (
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-200">{userName}</span>
            <span className="text-xs text-slate-500 capitalize">{role}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/40 border border-slate-700 px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 transition-all duration-200"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
