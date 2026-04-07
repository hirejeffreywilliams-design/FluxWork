// © 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
import React, { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '../hooks/useAuth.js';

export function RegisterPage() {
  const { register, isRegistering, registerError } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form);
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
          <p className="text-gray-400 mt-1">Create your account</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6">Get Started</h2>
          {registerError && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
              {registerError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Display Name</label>
              <input className="input" type="text" value={form.displayName}
                onChange={e => setForm(f => ({...f, displayName: e.target.value}) )} placeholder="Your name" />
            </div>
            <div>
              <label className="label">Username</label>
              <input className="input" type="text" value={form.username}
                onChange={e => setForm(f => ({...f, username: e.target.value}) )} placeholder="Choose a username" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email}
                onChange={e => setForm(f => ({...f, email: e.target.value}) )} placeholder="your@email.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={form.password}
                onChange={e => setForm(f => ({...f, password: e.target.value}) )} placeholder="Min 8 characters" required minLength={8} />
            </div>
            <button type="submit" disabled={isRegistering} className="btn-primary w-full justify-center flex">
              {isRegistering ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login"><a className="text-blue-400 hover:text-blue-300">Sign in</a></Link>
          </p>
        </div>
      </div>
    </div>
  );
}
