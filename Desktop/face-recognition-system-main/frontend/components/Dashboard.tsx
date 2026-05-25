import { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import HistoryPage from './pages/HistoryPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DashboardProps {
  currentUser: string;
  onLogout: () => void;
}

export type PageType = 'dashboard' | 'members' | 'history' | 'notifications' | 'settings';

export default function Dashboard({ currentUser, onLogout }: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    onLogout();
    toast({
      title: "Success",
      description: "Logged out successfully!",
    });
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      members: 'Members',
      history: 'History',
      notifications: 'Notifications',
      settings: 'Settings'
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
        return <SettingsPage currentUser={currentUser} />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">{getPageTitle()}</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <User className="h-5 w-5 text-blue-500" />
              <span>{currentUser}</span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}