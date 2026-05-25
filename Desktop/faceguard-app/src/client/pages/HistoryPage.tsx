import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

import { supabase } from '../supabaseClient';

const HistoryPage: React.FC = () => {
  const [detections, setDetections] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // new: state for image viewer modal
  const [viewImageSrc, setViewImageSrc] = useState<string | null>(null);

  // Helper to normalize image srcs (handles data base64 without prefix and http/data urls)
  const getImageSrc = (d: any) => {
    if (!d?.image) return '';
    const img = String(d.image).trim();

    // already a data URL or absolute URL
    if (img.startsWith('data:') || img.startsWith('http')) return img;

    // looks like base64 without data: prefix (simple heuristic)
    const base64Candidate = img.replace(/\s+/g, '');
    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
    if (base64Regex.test(base64Candidate) && base64Candidate.length > 100) {
      // assume jpeg — change to png if your Pi sends png
      return `data:image/jpeg;base64,${base64Candidate}`;
    }

    // fallback: assume it's a storage path in Supabase. Replace 'YOUR_BUCKET' with your bucket name
    // If your table stores full public URLs, the earlier check would have returned it.
    // Uncomment and adjust the line below to generate a public URL from a known bucket:
    // const { publicURL } = supabase.storage.from('YOUR_BUCKET').getPublicUrl(img);
    // return publicURL || img;

    // otherwise return raw value (will likely fail and trigger onError)
    return img;
  };

  useEffect(() => {
    const fetchDetections = async () => {
      const { data, error } = await supabase
        .from('detections')
        .select('*')
        .order('timestamp', { ascending: false });
      if (!error && data) setDetections(data);
    };
    fetchDetections();
  }, []);

  // close modal with Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewImageSrc(null);
    };
    if (viewImageSrc) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewImageSrc]);

  const typeOptions = ['all', 'known', 'unknown'];

  // Filter by search and selected type
  const filteredDetections = detections.filter(d => {
    const matchesSearch = d.name?.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      selectedType === 'all' ||
      (d.type && d.type.toLowerCase() === selectedType);
    return matchesSearch && matchesType;
  });

  const handleExportCSV = () => {
    if (filteredDetections.length === 0) return;

    const headers = ['Name', 'Type', 'Timestamp', 'Image'];
    const rows = filteredDetections.map(d => [
      `"${d.name || ''}"`,
      `"${d.type || ''}"`,
      `"${d.timestamp ? new Date(d.timestamp).toLocaleString() : ''}"`,
      `"${d.image || ''}"`
    ]);
    const csvContent =
      headers.join(',') + '\n' +
      rows.map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Format date as YYYY-MM-DD
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateString = `${yyyy}-${mm}-${dd}`;

    const filename = `Detection History (${dateString}).csv`;

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh', padding: '32px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '100px', // Add gap between search and dropdown
          marginBottom: '24px',
        }}
      >
        <div style={{ position: 'relative', width: '300px', flexShrink: 0 }}>
          <input
            type="text"
            placeholder="Search Detections..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '10px 16px 10px 40px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '16px',
              width: '100%',
            }}
          />
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6b7280',
              pointerEvents: 'none',
            }}
          />
        </div>
        <select
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '16px',
            minWidth: '120px',
            flexShrink: 0,
          }}
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
        >
          {typeOptions.map(type => (
            <option key={type} value={type}>
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
        <button
          style={{
            background: '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 24px',
            fontWeight: 600,
            fontSize: '16px',
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
          onClick={handleExportCSV}
        >
          Export to CSV
        </button>
      </div>
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          padding: '32px',
          minHeight: '180px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '100%' }}>
          <div style={{ fontWeight: 600, fontSize: '20px', marginBottom: '24px' }}>
            Detection History
          </div>
          {filteredDetections.length === 0 ? (
            <div style={{ color: '#6b7280', fontSize: '18px', textAlign: 'center' }}>
              No detections found
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '10px', borderRadius: '8px 0 0 8px', textAlign: 'left' }}>Image</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetections.map((d, idx) => (
                  <tr key={d.id || idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px', verticalAlign: 'middle' }}>
                      {d.image ? (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <img
                            src={getImageSrc(d)}
                            alt="face"
                            style={{ width: 48, height: 48, borderRadius: '8px', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => setViewImageSrc(getImageSrc(d))}
                            onError={async (e) => {
                              // Log the problematic value to help debugging
                              console.warn('Image failed to load for detection:', d.id, d.image);

                              // Fallback placeholder (replace with your local placeholder path if desired)
                              (e.currentTarget as HTMLImageElement).src = '/placeholder-face.png';
                            }}
                          />
                          <button
                            onClick={() => setViewImageSrc(getImageSrc(d))}
                            style={{
                              marginLeft: 8,
                              padding: '6px 8px',
                              borderRadius: 6,
                              border: '1px solid #e5e7eb',
                              background: '#fff',
                              cursor: 'pointer',
                              fontSize: 13
                            }}
                          >
                            View
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#6b7280' }}>No image</span>
                      )}
                    </td>
                    <td style={{ padding: '10px' }}>{d.name}</td>
                    <td style={{ padding: '10px' }}>{d.type}</td>
                    <td style={{ padding: '10px' }}>{d.timestamp ? new Date(d.timestamp).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Image viewer modal */}
      {viewImageSrc && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setViewImageSrc(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%',
              padding: 12,
              borderRadius: 8,
              background: '#fff',
              boxShadow: '0 8px 40px rgba(0,0,0,0.3)'
            }}
          >
            <button
              onClick={() => setViewImageSrc(null)}
              aria-label="Close"
              style={{
                position: 'absolute',
                right: 8,
                top: 8,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: '6px 8px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
            <img
              src={viewImageSrc}
              alt="Detection view"
              style={{ display: 'block', maxWidth: '80vw', maxHeight: '80vh', borderRadius: 6 }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder-face.png'; }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;