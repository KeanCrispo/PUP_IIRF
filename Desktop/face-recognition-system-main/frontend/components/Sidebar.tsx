import { Button } from '@/components/ui/button';
import { Eye, BarChart3, Users, History, Bell, Settings, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageType } from './Dashboard';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { id: 'dashboard' as PageType, label: 'Dashboard', icon: BarChart3 },
  { id: 'history' as PageType, label: 'History', icon: History },
  { id: 'notifications' as PageType, label: 'Notifications', icon: Bell },
  { id: 'members' as PageType, label: 'Members', icon: Users },
  { id: 'settings' as PageType, label: 'Settings', icon: Settings },
];

export default function Sidebar({ currentPage, onPageChange, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <div className={cn(
      "bg-white shadow-lg transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className={cn("flex items-center space-x-3", collapsed && "justify-center")}>
          <div className="p-2 bg-blue-500 rounded-lg">
            <Eye className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-gray-900">FaceGuard</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-gray-500 hover:text-gray-700"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start space-x-3",
                collapsed && "justify-center px-2",
                isActive && "bg-blue-500 text-white hover:bg-blue-600"
              )}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}