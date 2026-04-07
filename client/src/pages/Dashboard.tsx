// © 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/queryClient.js';
import { useAuth } from '../hooks/useAuth.js';

export function DashboardPage() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['gig', 'dashboard', 'stats'],
    queryFn: () => apiFetch<any>('/api/gig/dashboard/stats'),
  });

  const { data: recentGigListings } = useQuery({
    queryKey: ['gig', 'gig_listings'],
    queryFn: () => apiFetch<any>('/api/gig/gig_listings?limit=5'),
  });

  const statData = stats?.data || {};

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.displayName || user?.username}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div className="stat-label">Gig Listings</div>
          <div className="stat-value">{statData.gig_listingsCount ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Skills</div>
          <div className="stat-value">{statData.skillsCount ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">NC Engine</div>
          <div className="stat-value text-green-400 text-xl">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Service</div>
          <div className="stat-value text-blue-400 text-lg">FluxWork</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title">Recent Gig Listings</h2>
          {recentGigListings?.data?.length ? (
            <div className="space-y-2">
              {recentGigListings?.data.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-300 text-sm">{item.name || `Item #${item.id}`}</span>
                  <span className="badge badge-info">{item.status || 'active'}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p className="empty-state-text">No gig listings yet</p>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="section-title">Omnivex NC Engine</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400 text-sm">Status</span>
              <span className="badge badge-success">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400 text-sm">Service</span>
              <span className="text-gray-200 text-sm font-medium">FluxWork</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400 text-sm">Platform</span>
              <span className="text-blue-400 text-sm">Omnivex Ecosystem</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400 text-sm">Version</span>
              <span className="text-gray-200 text-sm font-mono">1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
