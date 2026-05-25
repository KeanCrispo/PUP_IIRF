import React, { useState, useEffect } from 'react';
import { Settings, Database, Save, Eye, EyeOff, AlertTriangle, Download } from 'lucide-react';
import { supabase } from '../supabaseClient';

const SETTINGS_ID = 1;

const SettingsPage: React.FC = () => {
  // Admin settings
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Data management
  const [autoDelete, setAutoDelete] = useState('Never');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  // System info
  const [memberCount, setMemberCount] = useState(0);
  const [detectionCount, setDetectionCount] = useState(0);
  const [storageUsed, setStorageUsed] = useState('...');
  const [lastBackup, setLastBackup] = useState('...');
  const [dbStatus, setDbStatus] = useState('Checking...');
  // Security question
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');

  // Fetch admin settings from "settings" table
  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('id', SETTINGS_ID)
        .single();
      if (data) {
        setAdminName(data.admin_name || '');
        setAdminEmail(data.admin_email || '');
        setAutoDelete(data.auto_delete || 'Never');
        setLastBackup(data.last_backup || 'Never');
        setSecurityQuestion(data.security_question || '');
        setSecurityAnswer(data.security_answer || '');
      }
    }
    fetchSettings();
  }, []);

  // Fetch system info
  useEffect(() => {
    async function fetchStats() {
      // Members
      const { count: memberCountRes } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });
      setMemberCount(memberCountRes || 0);

      // Detections
      const { count: detectionCountRes } = await supabase
        .from('detections')
        .select('*', { count: 'exact', head: true });
      setDetectionCount(detectionCountRes || 0);

      // Storage (simulate, or use Supabase Storage API if available)
      // If you use Supabase Storage, you can fetch bucket stats here.
      setStorageUsed('245 MB'); // Replace with actual logic if needed

      // DB status
      setDbStatus('Connected');
    }
    fetchStats();
  }, []);

  // Password match check
  useEffect(() => {
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
    } else {
      setPasswordError('');
    }
  }, [newPassword, confirmPassword]);

  // Email validation
  useEffect(() => {
    if (adminEmail && !/^\S+@\S+\.\S+$/.test(adminEmail)) {
      setEmailError('Invalid email address.');
    } else {
      setEmailError('');
    }
  }, [adminEmail]);

  // Save admin settings and security question/answer
  const handleSave = async () => {
    setMessage('');
    if (emailError) {
      setMessage('Please fix invalid email.');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setSaving(true);
    const updates: any = {
      admin_name: adminName,
      admin_email: adminEmail,
      auto_delete: autoDelete,
      security_question: securityQuestion,
      security_answer: securityAnswer,
    };
    if (newPassword) updates.admin_password = newPassword;
    const { error } = await supabase
      .from('settings')
      .update(updates)
      .eq('id', SETTINGS_ID);
    if (error) {
      setMessage('Failed to save settings.');
    } else {
      setMessage('Settings saved!');
    }
    setSaving(false);
  };

  // Manual clear history
  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all detection history? This action cannot be undone.')) {
      return;
    }
    const { error } = await supabase.from('detections').delete().neq('id', '');
    if (!error) {
      setMessage('Detection history cleared!');
      setDetectionCount(0);
    } else {
      setMessage('Failed to clear history.');
    }
  };

  // Backup all data
  const handleBackupAllData = async () => {
    setMessage('');
    setSaving(true);

    // Fetch all data from main tables
    const { data: members } = await supabase.from('members').select('*');
    const { data: detections } = await supabase.from('detections').select('*');
    const { data: settings } = await supabase.from('settings').select('*');

    const toCSV = (arr: any[], tableName: string) => {
      if (!arr || arr.length === 0) return `${tableName}: No data\n\n`;
      const headers = Object.keys(arr[0]);
      const rows = arr.map(obj => headers.map(h => `"${obj[h] ?? ''}"`).join(','));
      return `${tableName}\n${headers.join(',')}\n${rows.join('\n')}\n\n`;
    };

    const csvContent =
      toCSV(members ?? [], 'Members') +
      toCSV(detections ?? [], 'Detections') +
      toCSV(settings ?? [], 'Settings');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateString = `${yyyy}-${mm}-${dd}`;
    const filename = `Database Backup (${dateString}).csv`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Update last_backup in settings table
    const isoString = today.toISOString();
    await supabase
      .from('settings')
      .update({ last_backup: isoString })
      .eq('id', SETTINGS_ID);

    setLastBackup(isoString); // Update UI immediately
    setMessage('Backup downloaded!');
    setSaving(false);
  };

  return (
    <div
      style={{
        background: '#f7f8fa',
        minHeight: '100vh',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // center horizontally
        gap: 24,
      }}
    >
      {/* Admin Settings */}
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          padding: '24px',
          marginBottom: '0',
          width: '100%',
          maxWidth: '650px',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '20px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <Settings size={20} /> <span>Admin Settings</span>
        </div>
        <div style={{ marginBottom: '16px', maxWidth: 520, margin: '0 auto' }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px', textAlign: 'left' }}>Admin Name</label>
          <input
            type="text"
            placeholder="Enter Name"
            value={adminName}
            onChange={e => setAdminName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '16px',
            }}
          />
        </div>
        <div style={{ marginBottom: '16px', maxWidth: 520, margin: '0 auto' }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px', textAlign: 'left' }}>Admin Email</label>
          <input
            type="email"
            placeholder="Enter admin email"
            value={adminEmail}
            onChange={e => setAdminEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '16px',
            }}
          />
        </div>
        {emailError && (
          <div style={{ marginTop: '12px', color: '#ef4444', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            <AlertTriangle size={18} /> {emailError}
          </div>
        )}
        <div style={{ marginBottom: '16px', position: 'relative', maxWidth: 520, margin: '0 auto' }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px', textAlign: 'left' }}>New Password</label>
          <input
            type={showNewPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 40px 10px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '16px',
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: '12px',
              top: '38px',
              cursor: 'pointer',
              color: '#6b7280',
            }}
            onClick={() => setShowNewPassword(v => !v)}
            title={showNewPassword ? 'Hide password' : 'Show password'}
          >
            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>
        <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto 8px' }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px', textAlign: 'left' }}>Confirm Password</label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 40px 10px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '16px',
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: '12px',
              top: '38px',
              cursor: 'pointer',
              color: '#6b7280',
            }}
            onClick={() => setShowConfirmPassword(v => !v)}
            title={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>
        <div style={{ marginBottom: '16px', maxWidth: 520, margin: '0 auto' }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px', textAlign: 'left' }}>Security Question</label>
          <input
            type="text"
            placeholder="Enter security question"
            value={securityQuestion}
            onChange={e => setSecurityQuestion(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '16px',
            }}
          />
        </div>
        <div style={{ marginBottom: '8px', maxWidth: 520, margin: '0 auto' }}>
          <label style={{ fontWeight: 500, display: 'block', marginBottom: '6px', textAlign: 'left' }}>Security Answer</label>
          <input
            type="text"
            placeholder="Enter security answer"
            value={securityAnswer}
            onChange={e => setSecurityAnswer(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '16px',
            }}
          />
        </div>
        {passwordError && (
          <div style={{ marginTop: '12px', color: '#ef4444', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            <AlertTriangle size={18} /> {passwordError}
          </div>
        )}
        {message && (
          <div style={{ marginTop: '12px', color: message.includes('saved') ? '#22c55e' : '#ef4444', fontWeight: 500, textAlign: 'center' }}>
            {message}
          </div>
        )}
      </div>

      {/* Data Management */}
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          padding: '24px',
          width: '100%',
          maxWidth: '650px',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '20px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <Database size={20} /> <span>Data Management</span>
        </div>
        <div style={{ marginBottom: '12px', fontWeight: 500, textAlign: 'center' }}>Auto-delete History & Notifications</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <select
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '16px',
              width: '160px',
            }}
            value={autoDelete}
            onChange={e => setAutoDelete(e.target.value)}
          >
            <option value="Never">Never</option>
            <option value="7days">Every 7 days</option>
            <option value="30days">Every 30 days</option>
          </select>
          <button
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
            }}
            onClick={handleClearHistory}
          >
            Clear Detection History
          </button>
        </div>
      </div>

      {/* System Information */}
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          padding: '24px',
          width: '100%',
          maxWidth: '650px',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: '18px', marginBottom: '18px', textAlign: 'center' }}>System Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '16px', alignItems: 'center' }}>
          <div style={{ textAlign: 'left' }}>Version</div>
          <div style={{ textAlign: 'right' }}>1.0.0</div>

          <div style={{ textAlign: 'left' }}>Database Status</div>
          <div style={{ textAlign: 'right', color: '#22c55e', fontWeight: 600 }}>{dbStatus}</div>

          <div style={{ textAlign: 'left' }}>Last Backup</div>
          <div style={{ textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>
            {lastBackup && lastBackup !== 'Never' ? new Date(lastBackup).toLocaleString() : 'Never'}
          </div>

          <div style={{ textAlign: 'left' }}>Storage Used</div>
          <div style={{ textAlign: 'right', fontWeight: 600 }}>{storageUsed}</div>

          <div style={{ textAlign: 'left' }}>Total Members</div>
          <div style={{ textAlign: 'right', fontWeight: 600 }}>{memberCount}</div>

          <div style={{ textAlign: 'left' }}>Total Detections</div>
          <div style={{ textAlign: 'right', fontWeight: 600 }}>{detectionCount}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <button
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={handleBackupAllData}
            disabled={saving}
          >
            <Download size={20} />
            Backup All Data
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ width: '100%', maxWidth: '650px', display: 'flex', justifyContent: 'center' }}>
        <button
          style={{
            width: '100%',
            maxWidth: 420,
            background: '#222',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '14px 0',
            fontWeight: 600,
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;