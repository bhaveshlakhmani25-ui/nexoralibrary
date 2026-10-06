import { useEffect, useState } from 'react';
import { useGameStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { LogOut, Volume2, VolumeX, BookOpen, Clock, Info } from 'lucide-react';

export const UIOverlay = () => {
  const { nearTableId, activeTableId, setActiveTable, setJoystickVector, ambientSoundOn, setAmbientSound } = useGameStore();
  const navigate = useNavigate();
  const [showHints, setShowHints] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const timer = setTimeout(() => setShowHints(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Handle E key and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e' && nearTableId !== null && activeTableId === null) {
        setActiveTable(nearTableId);
      }
      if (e.key === 'Escape' && activeTableId !== null) {
        setActiveTable(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearTableId, activeTableId, setActiveTable]);

  const handleMobileInteraction = () => {
    if (nearTableId !== null) {
      setActiveTable(nearTableId);
    }
  };

  const startStudySession = (duration: number) => {
    const roomId = `solo-${Date.now()}-${duration}`;
    navigate(`/study/${roomId}?duration=${duration}`);
  };

  const startReadMode = (category: string) => {
    navigate(`/read/${category}`);
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
      
      {/* Top Bar - Elegant */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', right: '1.5rem', display: 'flex', justifyContent: 'space-between', pointerEvents: 'auto', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)', margin: 0, fontFamily: 'Georgia, serif', letterSpacing: '1px' }}>
            Nexora Library
          </h1>
          <button 
            style={{ 
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', 
              color: '#fff', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }} 
            onClick={() => navigate('/')}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.6)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
          >
            <LogOut size={14} /> <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Leave</span>
          </button>
        </div>

        <button 
          style={{ 
            background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }} 
          onClick={() => setAmbientSound(!ambientSoundOn)}
        >
          {ambientSoundOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </div>

      {/* Hints (Fades out) */}
      <div style={{
        position: 'absolute', top: '5rem', left: '1.5rem', pointerEvents: 'none',
        opacity: showHints ? 1 : 0, transition: 'opacity 1s ease',
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: '1rem', borderRadius: '8px',
        color: '#fff', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffdf85', fontWeight: 'bold', marginBottom: '4px' }}>
          <Info size={18} /> Welcome to Nexora
        </div>
        <div style={{ fontSize: '0.9rem' }}>• Use <strong style={{ color: '#ffdf85' }}>WASD</strong> or <strong style={{ color: '#ffdf85' }}>Arrows</strong> to move.</div>
        <div style={{ fontSize: '0.9rem' }}>• Walk near a table to interact.</div>
      </div>

      {/* Minimap (simple CSS version) */}
      <div style={{
        position: 'absolute', bottom: '2rem', right: '2rem', width: '80px', height: '80px',
        borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.4)', pointerEvents: 'auto',
        border: '2px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ width: 8, height: 8, backgroundColor: '#ffdf85', borderRadius: '50%', boxShadow: '0 0 10px #ffdf85' }} title="You" />
        <span style={{ position: 'absolute', bottom: -24, fontSize: '0.7rem', color: '#aaa', textShadow: '1px 1px 2px #000', textTransform: 'uppercase', letterSpacing: '1px' }}>Map</span>
      </div>

      {/* Interaction Prompt */}
      {nearTableId !== null && activeTableId === null && (
        <div style={{
          position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'auto'
        }}>
          <button className="btn-3d floating" onClick={handleMobileInteraction} style={{ fontSize: '1.1rem', padding: '12px 24px', borderRadius: '24px', backgroundColor: 'var(--wood-dark)' }}>
            Press <strong style={{ color: '#ffdf85', margin: '0 4px' }}>E</strong> to use table
          </button>
        </div>
      )}

      {/* Floating Menu when Active */}
      {activeTableId !== null && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto'
        }}>
          <div className="glass" style={{ padding: '2rem', width: '90%', maxWidth: '550px', backgroundColor: 'rgba(255,255,255,0.85)' }}>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--wood-dark)', marginBottom: '1.5rem', textAlign: 'center', fontFamily: 'Georgia, serif' }}>
              Study Table {activeTableId}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              
              <div style={{ backgroundColor: 'rgba(255,255,255,0.5)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--leaf-dark)' }}>
                  <Clock size={20} /> Study Mode
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button className="btn-3d" style={{ padding: '8px', fontSize: '0.9rem' }} onClick={() => startStudySession(25)}>25m</button>
                  <button className="btn-3d" style={{ padding: '8px', fontSize: '0.9rem' }} onClick={() => startStudySession(50)}>50m</button>
                  <button className="btn-3d" style={{ padding: '8px', fontSize: '0.9rem' }} onClick={() => startStudySession(60)}>60m</button>
                  <button className="btn-3d" style={{ padding: '8px', fontSize: '0.9rem' }} onClick={() => startStudySession(90)}>90m</button>
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.5)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--leaf-dark)' }}>
                  <BookOpen size={20} /> Read Mode
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="btn-3d secondary" style={{ padding: '8px', fontSize: '0.9rem' }} onClick={() => startReadMode('fantasy')}>Fantasy</button>
                  <button className="btn-3d secondary" style={{ padding: '8px', fontSize: '0.9rem' }} onClick={() => startReadMode('biography')}>Biography</button>
                  <button className="btn-3d secondary" style={{ padding: '8px', fontSize: '0.9rem' }} onClick={() => startReadMode('self-improvement')}>Self Improvement</button>
                </div>
              </div>

            </div>

            <button className="btn-3d" style={{ width: '100%', marginTop: '1.5rem', backgroundColor: '#555', boxShadow: '0 6px 0 #333' }} onClick={() => setActiveTable(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Mobile D-Pad (only visible on touch devices) */}
      {isTouchDevice && activeTableId === null && (
        <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', pointerEvents: 'auto' }}>
          <button style={mobileBtnStyle} onPointerDown={() => setJoystickVector({ x: 0, y: 1 })} onPointerUp={() => setJoystickVector({ x: 0, y: 0 })}>W</button>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button style={mobileBtnStyle} onPointerDown={() => setJoystickVector({ x: -1, y: 0 })} onPointerUp={() => setJoystickVector({ x: 0, y: 0 })}>A</button>
            <button style={mobileBtnStyle} onPointerDown={() => setJoystickVector({ x: 0, y: -1 })} onPointerUp={() => setJoystickVector({ x: 0, y: 0 })}>S</button>
            <button style={mobileBtnStyle} onPointerDown={() => setJoystickVector({ x: 1, y: 0 })} onPointerUp={() => setJoystickVector({ x: 0, y: 0 })}>D</button>
          </div>
        </div>
      )}
    </div>
  );
};

const mobileBtnStyle = {
  width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)',
  border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem',
  backdropFilter: 'blur(8px)', cursor: 'pointer'
};
