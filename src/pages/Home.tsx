import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Play } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');

  const createGroupRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/study/${roomId}`);
  };

  const joinGroupRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      navigate(`/study/${joinCode.toUpperCase()}`);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'radial-gradient(circle at center, #f4ecd8 0%, #e3d3b4 100%)',
      padding: '2rem'
    }}>
      <div className="glass floating" style={{ padding: '3rem', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <h1 className="title-3d">Nexora</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--wood-dark)', marginBottom: '2.5rem', fontWeight: 500 }}>
          Study together. Focus anywhere.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          <button 
            className="btn-3d" 
            style={{ width: '100%', maxWidth: '300px', fontSize: '1.3rem', padding: '16px' }}
            onClick={() => navigate('/library')}
          >
            <BookOpen size={24} />
            Enter the Library
          </button>
          
          <button 
            className="btn-3d secondary" 
            style={{ width: '100%', maxWidth: '300px' }}
            onClick={createGroupRoom}
          >
            <Users size={20} />
            Create Group Room
          </button>

          <div style={{ width: '100%', maxWidth: '300px', height: '1px', backgroundColor: 'var(--wood-base)', margin: '1rem 0' }} />

          <form onSubmit={joinGroupRoom} style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '300px' }}>
            <input 
              type="text" 
              placeholder="Enter Room Code" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid var(--wood-base)',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '1rem'
              }}
            />
            <button type="submit" className="btn-3d" style={{ padding: '12px', minWidth: '48px' }}>
              <Play size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
