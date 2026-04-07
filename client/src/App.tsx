// © 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
import React from 'react';
import { Router, Route, Switch, Redirect } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient.js';
import { useAuth } from './hooks/useAuth.js';
import { Layout } from './components/Layout.js';
import { LoginPage } from './pages/Login.js';
import { RegisterPage } from './pages/Register.js';
import { DashboardPage } from './pages/Dashboard.js';
import { GigListingsPage } from './pages/GigListings.js';
import { ContractsPage } from './pages/Contracts.js';
import { PaymentsPage } from './pages/Payments.js';
import { ReviewsPage } from './pages/Reviews.js';
import { PortfolioPage } from './pages/Portfolio.js';
import { SchedulePage } from './pages/Schedule.js';

function PrivateRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );
  if (!isAuthenticated) return <Redirect to="/login" />;
  return (
    <Layout>
      <Component {...rest} />
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Switch>
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/" component={DashboardPage} />
        <Route path="/giglistings" component={GigListingsPage} />
        <Route path="/contracts" component={ContractsPage} />
        <Route path="/payments" component={PaymentsPage} />
        <Route path="/reviews" component={ReviewsPage} />
        <Route path="/portfolio" component={PortfolioPage} />
        <Route path="/schedule" component={SchedulePage} />
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </Router>
    </QueryClientProvider>
  );
}
