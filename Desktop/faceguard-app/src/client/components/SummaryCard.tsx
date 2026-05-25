import React from 'react';

interface SummaryCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  bg?: string;
  color?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, value, label, bg = '#fff', color = '#222' }) => (
  <div
    style={{
      background: bg,
      borderRadius: 16,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      padding: '24px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      marginBottom: 16,
      minWidth: 220,
    }}
  >
    <div>{icon}</div>
    <div>
      <div style={{ fontWeight: 700, fontSize: 32, color }}>{value}</div>
      <div style={{ fontSize: 16, color: '#6b7280', fontWeight: 500 }}>{label}</div>
    </div>
  </div>
);

export default SummaryCard;