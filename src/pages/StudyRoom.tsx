import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Copy, Users, User } from 'lucide-react';
import FocusTimer from '../components/FocusTimer';
import TaskChecklist from '../components/TaskChecklist';

const StudyRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const durationParam = queryParams.get('duration');
  const duration = durationParam ? parseInt(durationParam, 10) : 25;

  const isSolo = roomId?.startsWith('solo-');

  const copyRoomCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f4ecd8',
      backgroundImage: 'radial-gradient(circle at top right, #e3d3b4 0%, transparent 60%), radial-gradient(circle at bottom left, #d4ebd9 0%, transparent 60%)',
      padding: '2rem'
    }}>
      {/* Navigation */}
      <button 
        className="btn-3d" 
        style={{ padding: '8px 16px', marginBottom: '2rem' }}
        onClick={() => navigate('/library')}
      >
        <ArrowLeft size={20} /> Leave Room
      </button>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--wood-dark)', marginBottom: '0.5rem' }}>
              {isSolo ? 'Solo Focus Desk' : 'Group Study Room'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--leaf-green)', fontWeight: 'bold' }}>
              {isSolo ? <User size={20} /> : <Users size={20} />}
              {isSolo ? 'Just you' : '3 Friends Online'}
            </div>
          </div>
          
          {!isSolo && (
            <div className="glass" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 'bold', textTransform: 'uppercase' }}>Room Code</span>
                <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--text-dark)', letterSpacing: '2px' }}>
                  {roomId}
                </span>
              </div>
              <button 
                className="btn-3d secondary" 
                style={{ padding: '8px', borderRadius: '8px' }}
                onClick={copyRoomCode}
                title="Copy Room Code"
              >
                <Copy size={18} />
              </button>
              {copied && <span style={{ fontSize: '0.8rem', color: 'var(--leaf-green)', position: 'absolute', right: '1rem', top: '-1rem' }}>Copied!</span>}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <FocusTimer initialMinutes={duration} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <TaskChecklist />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyRoom;
