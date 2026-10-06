import { useEffect } from 'react';
import { useGameStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { LogOut, Volume2, VolumeX, BookOpen, Clock } from 'lucide-react';

export const UIOverlay = () => {
  const { nearTableId, activeTableId, setActiveTable, setJoystickVector, ambientSoundOn, setAmbientSound } = useGameStore();
  const navigate = useNavigate();

  // Handle E key
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
      
      {/* Top Bar */}
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem', display: 'flex', justifyContent: 'space-between', pointerEvents: 'auto' }}>
        <button className="btn-3d" style={{ padding: '8px 16px', backgroundColor: '#e74c3c', boxShadow: '0 4px 0 #c0392b' }} onClick={() => navigate('/')}>
          <LogOut size={20} /> Leave
        </button>
        <button className="btn-3d" style={{ padding: '8px', backgroundColor: 'var(--wood-dark)' }} onClick={() => setAmbientSound(!ambientSoundOn)}>
          {ambientSoundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* Minimap (simple CSS version) */}
      <div className="glass" style={{
        position: 'absolute', bottom: '2rem', right: '2rem', width: '100px', height: '100px',
        borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', pointerEvents: 'auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ width: 10, height: 10, backgroundColor: 'blue', borderRadius: '50%' }} title="You" />
        <span style={{ position: 'absolute', bottom: -20, fontSize: '0.8rem', color: '#fff', textShadow: '1px 1px 2px #000' }}>Minimap</span>
      </div>

      {/* Interaction Prompt */}
      {nearTableId !== null && activeTableId === null && (
        <div style={{
          position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'auto'
        }}>
          <button className="btn-3d floating" onClick={handleMobileInteraction} style={{ fontSize: '1.2rem', padding: '12px 24px' }}>
            Press E to use table
          </button>
        </div>
      )}

      {/* Floating Menu when Active */}
      {activeTableId !== null && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto'
        }}>
          <div className="glass" style={{ padding: '2rem', width: '90%', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.8rem', color: 'var(--wood-dark)', marginBottom: '1.5rem', textAlign: 'center' }}>
              Study Table {activeTableId}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              
              <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

              <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

            <button className="btn-3d" style={{ width: '100%', marginTop: '1.5rem', backgroundColor: '#888', boxShadow: '0 6px 0 #555' }} onClick={() => setActiveTable(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Simple Mobile D-Pad (only visible on mobile ideally, but we'll show it on bottom left if no table active) */}
      {activeTableId === null && (
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
  width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)',
  border: '2px solid rgba(255,255,255,0.5)', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem',
  backdropFilter: 'blur(4px)', cursor: 'pointer'
};
