import React from 'react';
import { Eye, LayoutDashboard, Users, History, Bell, Settings } from 'lucide-react'; // Add lucide icons

export type PageType = 'dashboard' | 'members' | 'history' | 'notifications' | 'settings';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { key: 'members', label: 'Members', icon: <Users size={20} /> },
  { key: 'history', label: 'History', icon: <History size={20} /> },
  { key: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, collapsed, onToggleCollapse }) => (
  <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
    <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          background: '#2563eb',
          borderRadius: '12px',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Eye size={24} color="#fff" />
      </div>
      {!collapsed && <span style={{ fontWeight: 700, fontSize: '20px' }}>FaceGuard</span>}
    </div>
    <button className="sidebar-toggle" onClick={onToggleCollapse} aria-label="Toggle sidebar">
      <span className="hamburger">&#9776;</span>
    </button>
    <nav>
      <ul>
        {menuItems.map(item => (
          <li
            key={item.key}
            className={currentPage === item.key ? 'active' : ''}
            onClick={() => onPageChange(item.key as PageType)}
          >
            <span className="icon">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </li>
        ))}
      </ul>
    </nav>
  </aside>
);

export default Sidebar;