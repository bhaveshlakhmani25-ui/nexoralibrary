import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Coffee } from 'lucide-react';

const Library: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // Isometric-ish grid of tables
  const tables = [
    { id: 1, top: '20%', left: '20%', active: false },
    { id: 2, top: '20%', left: '50%', active: true },
    { id: 3, top: '20%', left: '80%', active: false },
    { id: 4, top: '50%', left: '35%', active: false },
    { id: 5, top: '50%', left: '65%', active: false },
    { id: 6, top: '80%', left: '20%', active: false },
    { id: 7, top: '80%', left: '50%', active: false },
    { id: 8, top: '80%', left: '80%', active: false },
  ];

  const handleTableClick = (id: number) => {
    setSelectedTable(id);
  };

  const startStudySession = (duration: number) => {
    // We'll generate a random room ID for the solo session to reuse StudyRoom component
    const roomId = `solo-${Date.now()}-${duration}`;
    navigate(`/study/${roomId}?duration=${duration}`);
  };

  const startReadMode = (category: string) => {
    navigate(`/read/${category}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#2c3a31', // dark green carpet
      position: 'relative',
      padding: '2rem',
      overflow: 'hidden'
    }}>
      {/* Navigation */}
      <button 
        className="btn-3d" 
        style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10, padding: '8px 16px' }}
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={20} /> Back
      </button>

      {/* Library Title */}
      <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10, color: 'var(--wood-light)' }}>
        <h2 style={{ margin: 0, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>Main Reading Room</h2>
      </div>

      {/* Decorative Bookcases / Walls */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '40px',
        background: 'var(--wood-dark)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
      }} />

      {/* Tables Floor */}
      <div style={{
        position: 'absolute',
        top: '100px', left: '50%', transform: 'translateX(-50%)',
        width: '80%', height: 'calc(100vh - 150px)',
        border: '8px solid var(--wood-dark)',
        backgroundColor: '#4a6552',
        borderRadius: '16px',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3)',
      }}>
        
        {tables.map(table => (
          <div 
            key={table.id}
            onClick={() => handleTableClick(table.id)}
            className="lamp-glow"
            style={{
              position: 'absolute',
              top: table.top, left: table.left,
              transform: 'translate(-50%, -50%)',
              width: '120px', height: '80px',
              backgroundColor: 'var(--wood-light)',
              border: '6px solid var(--wood-base)',
              borderRadius: '8px',
              boxShadow: '10px 10px 20px rgba(0,0,0,0.4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s',
              zIndex: 5
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)'}
          >
            {table.active && (
              <div style={{
                position: 'absolute', top: -30, right: -10,
                background: '#ff6b6b', color: 'white',
                padding: '4px 8px', borderRadius: '12px',
                fontSize: '0.7rem', fontWeight: 'bold',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}>
                Occupied
              </div>
            )}
            <Coffee color="var(--wood-dark)" size={24} opacity={0.5} />
            
            {/* Chairs */}
            <div style={{ position: 'absolute', top: -20, width: 40, height: 20, backgroundColor: 'var(--wood-dark)', borderRadius: '10px 10px 0 0' }} />
            <div style={{ position: 'absolute', bottom: -20, width: 40, height: 20, backgroundColor: 'var(--wood-dark)', borderRadius: '0 0 10px 10px' }} />
          </div>
        ))}
      </div>

      {/* Action Modal */}
      {selectedTable && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="glass" style={{ padding: '2rem', width: '90%', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--wood-dark)', marginBottom: '1.5rem', textAlign: 'center' }}>
              Table {selectedTable}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.5)', padding: '1.5rem',
                borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem'
              }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--leaf-dark)' }}>
                  <Clock size={20} /> Study Mode
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#555' }}>Focus with a timer.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button className="btn-3d" style={{ padding: '8px', fontSize: '0.9rem' }} onClick={() => startStudySession(25)}>25m</button>
                  <button className="btn-3d" style={{ padding: '8px', fontSize: '0.9rem' }} onClick={() => startStudySession(50)}>50m</button>
                  <button className="btn-3d" style={{ padding: '8px', fontSize: '0.9rem' }} onClick={() => startStudySession(60)}>60m</button>
                  <button className="btn-3d" style={{ padding: '8px', fontSize: '0.9rem' }} onClick={() => startStudySession(90)}>90m</button>
                </div>
              </div>

              <div style={{
                backgroundColor: 'rgba(255,255,255,0.5)', padding: '1.5rem',
                borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem'
              }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--leaf-dark)' }}>
                  <BookOpen size={20} /> Read Mode
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#555' }}>Cozy up with a book.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="btn-3d secondary" style={{ padding: '8px', fontSize: '0.9rem' }} onClick={() => startReadMode('fantasy')}>Fantasy</button>
                  <button className="btn-3d secondary" style={{ padding: '8px', fontSize: '0.9rem' }} onClick={() => startReadMode('biography')}>Biography</button>
                  <button className="btn-3d secondary" style={{ padding: '8px', fontSize: '0.9rem' }} onClick={() => startReadMode('self-improvement')}>Self Improvement</button>
                </div>
              </div>

            </div>

            <button 
              className="btn-3d" 
              style={{ width: '100%', marginTop: '1.5rem', backgroundColor: '#888', boxShadow: '0 6px 0 #555' }}
              onClick={() => setSelectedTable(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Library;
