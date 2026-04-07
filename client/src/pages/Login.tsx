// © 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
import React, { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '../hooks/useAuth.js';

export function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-blue-600 items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">F</span>
          </div>
          <h1 className="text-2xl font-bold text-white">FluxWork</h1>
          <p className="text-gray-400 mt-1">Work on Your Terms</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">Sign In</h2>
          {loginError && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
              {loginError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value })  )}
                placeholder="Enter your username"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }) )}
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn-primary w-full justify-center flex"
            >
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/register">
              <a className="text-blue-400 hover:text-blue-300">Create one</a>
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          © 2024-2026 Jeffrey W Williams LLC. Omnivex Ecosystem.
        </p>
      </div>
    </div>
  );
}
