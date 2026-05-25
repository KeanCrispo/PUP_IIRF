import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient'; 
import * as faceapi from 'face-api.js';
import { v4 as uuidv4 } from 'uuid';
import { FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';

const MembersPage: React.FC = () => {
  const [name, setName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [registering, setRegistering] = useState(false);
  const [photosTaken, setPhotosTaken] = useState(0);
  const [members, setMembers] = useState<any[]>([]);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(''); // no Pi stream
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [search, setSearch] = useState('');
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editMemberId, setEditMemberId] = useState('');
  const [editPhoto, setEditPhoto] = useState<string>('');
  const [countdown, setCountdown] = useState<number | null>(null); // new: countdown state
  const videoRef = useRef<HTMLVideoElement>(null);
  const registeringRef = useRef(false); // new: allow cancellation of loop

  // Fetch available cameras
  useEffect(() => {
    async function getDevices() {
      if (
        typeof navigator !== "undefined" &&
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === "function" &&
        typeof navigator.mediaDevices.enumerateDevices === "function"
      ) {
        try {
          // prompt for permission to get device labels
          await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (err) {
          // Permission denied or no camera
        }
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
        setDevices(videoDevices);
        // default to first available camera if present
        setSelectedDeviceId(videoDevices[0]?.deviceId || '');
      }
    }
    getDevices();
  }, []);

  // Start webcam
  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      const constraints: MediaStreamConstraints = selectedDeviceId
        ? { video: { deviceId: selectedDeviceId } }
        : { video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    } catch (err) {
      console.error('Failed to start camera', err);
    }
  };

  // Capture a photo from the video
  const capturePhoto = (): string => {
    const video = videoRef.current;
    if (!video) return '';
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  };

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('date_added', { ascending: false });
    if (!error && data) setMembers(data);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Registration handler with 3s countdown before each capture
  const handleRegister = async () => {
    setRegistering(true);
    registeringRef.current = true;
    setPhotosTaken(0);
    setCountdown(null);

    await startCamera();

    // load model (ensure available)
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');

    let savedPhotos = 0;
    const images: string[] = [];

    while (savedPhotos < 10 && registeringRef.current) {
      // 3 second countdown
      for (let s = 3; s > 0; s--) {
        if (!registeringRef.current) break;
        setCountdown(s);
        // wait 1 second
        await new Promise(res => setTimeout(res, 1000));
      }
      if (!registeringRef.current) break;
      setCountdown(null);

      // capture & detect
      const photo = capturePhoto();
      const img = new window.Image();
      img.src = photo;
      await new Promise(res => (img.onload = res));
      const detections = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions());

      if (detections) {
        images.push(photo);
        savedPhotos++;
        setPhotosTaken(savedPhotos);
      } else {
        // no face found — optionally allow retry without incrementing savedPhotos
      }
      // small pause to avoid immediate next countdown edge cases
      await new Promise(res => setTimeout(res, 250));
    }

    // if registration wasn't cancelled and we have images, save
    if (registeringRef.current && images.length > 0) {
      await supabase.from('members').insert([
        {
          id: uuidv4(),
          name,
          member_id: memberId,
          profile_image: images[0],
          face_images: JSON.stringify(images),
        },
      ]);
      await fetchMembers();
      alert('Registration complete!');
    } else if (!registeringRef.current) {
      // cancelled
    }

    // cleanup
    setRegistering(false);
    registeringRef.current = false;
    setCountdown(null);
    setShowRegistration(false);
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setName('');
    setMemberId('');
    setPhotosTaken(0);
  };

  const handleCancelRegistration = () => {
    setRegistering(false);
    registeringRef.current = false;
    setCountdown(null);
    setPhotosTaken(0);
    setName('');
    setMemberId('');
    setShowRegistration(false);
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleShowProfile = (member: any) => {
    setSelectedMember(member);
  };

  const handleDeleteMember = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      await supabase.from('members').delete().eq('id', id);
      await fetchMembers();
    }
  };

  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditMemberId(member.member_id);
    setEditPhoto('');
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;
    await supabase
      .from('members')
      .update({
        name: editName,
        member_id: editMemberId,
        profile_image: editPhoto || editingMember.profile_image,
      })
      .eq('id', editingMember.id);
    setEditingMember(null);
    setEditPhoto('');
    await fetchMembers();
  };

  const filteredMembers = members.filter(
    member =>
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.member_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #e0e7ff 0%, #f5f6fa 100%)',
        fontFamily: 'Inter, sans-serif',
        gap: 32,
      }}
    >
      {/* Registration Modal: Only show when showRegistration is true */}
      {showRegistration && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.2)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={handleCancelRegistration}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(37,99,235,0.10)',
              padding: '40px 32px',
              width: 400,
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 24,
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ color: '#2563eb', fontWeight: 700, marginBottom: 8 }}>
              Face Registration
            </h2>
            <p style={{ color: '#6b7280', fontSize: 16, marginBottom: 8 }}>
              Register a new member by capturing 10 face photos. A 3s countdown will run before each capture.
            </p>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label style={{ fontWeight: 500, color: '#374151' }}>
                Name
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={registering}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    marginTop: 4,
                    fontSize: 16,
                    outline: 'none',
                  }}
                  placeholder="Enter full name"
                />
              </label>
              <label style={{ fontWeight: 500, color: '#374151' }}>
                ID
                <input
                  value={memberId}
                  onChange={e => setMemberId(e.target.value)}
                  disabled={registering}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    marginTop: 4,
                    fontSize: 16,
                    outline: 'none',
                  }}
                  placeholder="Enter member ID"
                />
              </label>
              <label style={{ fontWeight: 500, color: '#374151' }}>
                Camera
                <select
                  value={selectedDeviceId}
                  onChange={e => setSelectedDeviceId(e.target.value)}
                  disabled={registering || devices.length === 0}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #d1d5db',
                    marginTop: 4,
                    fontSize: 16,
                    outline: 'none',
                    background: '#f3f4f6',
                  }}
                >
                  {devices.length === 0 && <option value="">Default Camera</option>}
                  {devices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId}`}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={handleRegister}
                disabled={!name || !memberId || registering}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: 8,
                  background: registering ? '#93c5fd' : '#2563eb',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 18,
                  border: 'none',
                  cursor: registering ? 'not-allowed' : 'pointer',
                  boxShadow: registering ? 'none' : '0 2px 8px rgba(37,99,235,0.08)',
                  transition: 'background 0.2s',
                  marginBottom: 8,
                }}
              >
                {registering ? `Registering (${photosTaken}/10)...` : 'Start Registration'}
              </button>
              {registering && (
                <button
                  onClick={handleCancelRegistration}
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    borderRadius: 8,
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 18,
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: 8,
                    marginTop: 4,
                    boxShadow: '0 2px 8px rgba(239,68,68,0.08)',
                    transition: 'background 0.2s',
                  }}
                >
                  Cancel Registration
                </button>
              )}
              {registering && (
                <div style={{ width: '100%', marginTop: 8 }}>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: '#e5e7eb',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${(photosTaken / 10) * 100}%`,
                        height: '100%',
                        background: '#2563eb',
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                  <div style={{ textAlign: 'center', color: '#2563eb', fontWeight: 500, marginTop: 4 }}>
                    {photosTaken} / 10 photos captured
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop: 12, position: 'relative' }}>
              <video
                ref={videoRef}
                width={320}
                height={240}
                style={{
                  borderRadius: 12,
                  background: '#222',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  border: '2px solid #e5e7eb',
                }}
                autoPlay
                muted
              />
              {/* Countdown overlay */}
              {countdown !== null && (
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    fontSize: 48,
                    fontWeight: 700,
                    pointerEvents: 'none',
                  }}
                >
                  {countdown}
                </div>
              )}
            </div>
            {/* Close button in top right */}
            <button
              onClick={handleCancelRegistration}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'transparent',
                border: 'none',
                fontSize: 24,
                color: '#2563eb',
                cursor: 'pointer',
              }}
              title="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Members List and Add Member Button */}
      <div style={{ padding: '24px', background: '#f5f6fa', minHeight: '100vh', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              fontSize: 16,
              width: 260,
              marginRight: 16,
              outline: 'none',
            }}
          />
          <button
            onClick={() => setShowRegistration(show => !show)}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              background: '#22c55e',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(34,197,94,0.08)',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <FaUserPlus style={{ fontSize: 20 }} />
            {showRegistration ? 'Hide Registration' : 'Add Member'}
          </button>
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 32,
        }}>
          {filteredMembers.map(member => (
            <div
              key={member.id}
              style={{
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                padding: '18px 18px 16px 18px',
                width: 260,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: 16,
                position: 'relative',
              }}
            >
              <img
                src={member.profile_image}
                alt={member.name}
                style={{
                  width: '100%',
                  height: 140,
                  objectFit: 'cover',
                  borderRadius: 12,
                  marginBottom: 12,
                  background: '#e5e7eb',
                }}
              />
              <div style={{ fontWeight: 700, fontSize: 22, color: '#222', marginBottom: 2, textAlign: 'center' }}>
                {member.name}
              </div>
              <div style={{ fontSize: 15, color: '#6b7280', marginBottom: 12, textAlign: 'center' }}>
                {member.member_id}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 16px',
                    borderRadius: 8,
                    background: '#f3f4f6',
                    color: '#222',
                    fontWeight: 500,
                    fontSize: 16,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleEditMember(member)}
                >
                  <FaEdit style={{ fontSize: 18 }} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 16px',
                    borderRadius: 8,
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: 500,
                    fontSize: 16,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <FaTrash style={{ fontSize: 18 }} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Modal */}
      {selectedMember && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedMember(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 8px 32px rgba(37,99,235,0.10)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 320,
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ marginBottom: 16, color: '#2563eb' }}>{selectedMember.name}</h4>
            <img
              src={selectedMember.profile_image}
              alt={selectedMember.name}
              style={{
                width: 240,
                height: 240,
                objectFit: 'cover',
                borderRadius: 12,
                border: '2px solid #2563eb',
                marginBottom: 16,
              }}
            />
            <div style={{ color: '#6b7280', fontSize: 16 }}>ID: {selectedMember.member_id}</div>
            <button
              onClick={() => setSelectedMember(null)}
              style={{
                marginTop: 24,
                padding: '8px 24px',
                borderRadius: 8,
                background: '#2563eb',
                color: '#fff',
                fontWeight: 600,
                fontSize: 16,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setEditingMember(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 8px 32px rgba(37,99,235,0.10)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 320,
            }}
            onClick={e => e.stopPropagation()}
          >
            <h4 style={{ marginBottom: 16, color: '#2563eb' }}>Edit Member</h4>
            <label style={{ fontWeight: 500, color: '#374151', marginBottom: 8 }}>
              Name
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  marginTop: 4,
                  fontSize: 16,
                  outline: 'none',
                }}
              />
            </label>
            <label style={{ fontWeight: 500, color: '#374151', marginBottom: 8 }}>
              ID
              <input
                value={editMemberId}
                onChange={e => setEditMemberId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  marginTop: 4,
                  fontSize: 16,
                  outline: 'none',
                }}
              />
            </label>
            <img
              src={editPhoto || editingMember?.profile_image}
              alt="Profile Preview"
              style={{
                width: 180,
                height: 180,
                objectFit: 'cover',
                borderRadius: 12,
                border: '2px solid #2563eb',
                marginBottom: 16,
              }}
            />
            <label style={{ fontWeight: 500, color: '#374151', marginBottom: 8 }}>
              Update Photo
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = ev => setEditPhoto(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                style={{
                  width: '100%',
                  marginTop: 4,
                  fontSize: 16,
                }}
              />
            </label>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: '8px 24px',
                  borderRadius: 8,
                  background: '#2563eb',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 16,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
              <button
                onClick={() => setEditingMember(null)}
                style={{
                  padding: '8px 24px',
                  borderRadius: 8,
                  background: '#ef4444',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 16,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersPage;