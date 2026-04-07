// © 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth.js';

function NavLink({ to, label }: { to: string; label: string }) {
  const [location] = useLocation();
  const isActive = location === to || (to !== '/' && location.startsWith(to));
  return (
    <Link href={to}>
      <a className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
          : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
      }`}>
        {label}
      </a>
    </Link>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-800 gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{'F'}</span>
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="font-bold text-white text-sm truncate">FluxWork</div>
              <div className="text-xs text-gray-500 truncate">Work on Your Terms</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavLink to="/" label="Dashboard" />
          <NavLink to="/giglistings" label="GigListings" />
          <NavLink to="/contracts" label="Contracts" />
          <NavLink to="/payments" label="Payments" />
          <NavLink to="/reviews" label="Reviews" />
          <NavLink to="/portfolio" label="Portfolio" />
          <NavLink to="/schedule" label="Schedule" />
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-gray-800">
          {sidebarOpen && user && (
            <div className="mb-2 px-3 py-2 bg-gray-800 rounded-lg">
              <div className="text-sm font-medium text-gray-200 truncate">{user.displayName || user.username}</div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
          )}
          <button
            onClick={() => logout()}
            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            {sidebarOpen ? 'Sign Out' : '→'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-6 gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-gray-100 p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-900/50 text-blue-400 border border-blue-800 px-2 py-1 rounded-full">
              NC Engine Active
            </span>
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-300">
              {user?.username?.[0]?.toUpperCase() || '?'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
