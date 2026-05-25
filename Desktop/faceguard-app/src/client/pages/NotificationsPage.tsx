import React from 'react';
import { Bell } from 'lucide-react';

const NotificationsPage: React.FC = () => (
  <div style={{ background: '#f7f8fa', minHeight: '100vh', padding: '32px' }}>
    <div
      style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        padding: '32px',
        minHeight: '220px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%' }}>
        <div style={{ fontWeight: 600, fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={22} style={{ verticalAlign: 'middle' }} />
          Recent Notifications
        </div>
        <div style={{ color: '#6b7280', fontSize: '18px', textAlign: 'center', marginTop: '48px' }}>
          <Bell size={48} color="#cbd5e1" style={{ display: 'block', margin: '0 auto 12px auto' }} />
          No notifications yet
        </div>
      </div>
    </div>
  </div>
);

export default NotificationsPage;