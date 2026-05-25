import React, { useState } from 'react';
import Sidebar, { PageType } from './Sidebar';
import DashboardPage from '../pages/DashboardPage';
import MembersPage from '../pages/MembersPage';
import HistoryPage from '../pages/HistoryPage';
import NotificationsPage from '../pages/NotificationsPage';
import SettingsPage from '../pages/SettingsPage';
import './Dashboard.css';

interface DashboardProps {
  currentUser: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout }) => {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getPageTitle = () => {
    const titles: Record<PageType, string> = {
      dashboard: 'Dashboard',
      members: 'Members',
      history: 'History',
      notifications: 'Notifications',
      settings: 'Settings',
    };
    return titles[currentPage];
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'members':
        return <MembersPage />;
      case 'history':
        return <HistoryPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="dashboard-root">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="main-content">
        <header className="header">
          <h1>{getPageTitle()}</h1>
          <div className="user-info">
            <span style={{ fontWeight: 600, marginRight: '12px' }}>{currentUser}</span>
            <button className="logout-btn" onClick={onLogout}>Logout</button>
          </div>
        </header>
        <main className="page-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;