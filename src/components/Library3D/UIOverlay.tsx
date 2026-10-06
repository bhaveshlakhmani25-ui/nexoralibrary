import { useEffect, useState } from 'react';
import { useGameStore } from '../../store';
import { LogOut, Volume2, VolumeX, BookOpen, Clock, Info, Pause, Play, X } from 'lucide-react';

export const UIOverlay = () => {
  const { 
    nearTable, isSeated, setSeated, sessionState,
    timeRemaining, timerActive, setStudySession, tickTimer, toggleTimer, endSession,
    bookCategory, setBookCategory,
    setJoystickVector, ambientSoundOn, setAmbientSound
  } = useGameStore();

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
      if (e.key.toLowerCase() === 'e' && nearTable !== null && !isSeated) {
        setSeated(true, nearTable.transform);
      }
      if (e.key === 'Escape' && isSeated) {
        endSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearTable, isSeated, setSeated, endSession]);

  // Timer Tick
  useEffect(() => {
    let interval: any;
    if (sessionState === 'studying' && timerActive && timeRemaining > 0) {
      interval = setInterval(() => tickTimer(), 1000);
    } else if (timeRemaining === 0 && sessionState === 'studying') {
      // Done
    }
    return () => clearInterval(interval);
  }, [sessionState, timerActive, timeRemaining, tickTimer]);

  const handleMobileInteraction = () => {
    if (nearTable !== null) {
      setSeated(true, nearTable.transform);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
      
      {/* Top Bar - Elegant */}
      {!isSeated && (
        <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', right: '1.5rem', display: 'flex', justifyContent: 'space-between', pointerEvents: 'auto', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)', margin: 0, fontFamily: 'Georgia, serif', letterSpacing: '1px' }}>
              Nexora Library
            </h1>
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
      )}

      {/* Hints (Fades out) */}
      {!isSeated && (
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
      )}

      {/* Interaction Prompt (Standing) */}
      {nearTable !== null && !isSeated && (
        <div style={{
          position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'auto'
        }}>
          <button className="btn-3d floating" onClick={handleMobileInteraction} style={{ fontSize: '1.1rem', padding: '12px 24px', borderRadius: '24px', backgroundColor: 'var(--wood-dark)' }}>
            Press <strong style={{ color: '#ffdf85', margin: '0 4px' }}>E</strong> to sit at table
          </button>
        </div>
      )}

      {/* Mobile D-Pad (only visible on touch devices, when standing) */}
      {isTouchDevice && !isSeated && (
        <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', pointerEvents: 'auto' }}>
          <button style={mobileBtnStyle} onPointerDown={() => setJoystickVector({ x: 0, y: 1 })} onPointerUp={() => setJoystickVector({ x: 0, y: 0 })}>W</button>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button style={mobileBtnStyle} onPointerDown={() => setJoystickVector({ x: -1, y: 0 })} onPointerUp={() => setJoystickVector({ x: 0, y: 0 })}>A</button>
            <button style={mobileBtnStyle} onPointerDown={() => setJoystickVector({ x: 0, y: -1 })} onPointerUp={() => setJoystickVector({ x: 0, y: 0 })}>S</button>
            <button style={mobileBtnStyle} onPointerDown={() => setJoystickVector({ x: 1, y: 0 })} onPointerUp={() => setJoystickVector({ x: 0, y: 0 })}>D</button>
          </div>
        </div>
      )}

      {/* SEATED UI: Choosing Mode */}
      {isSeated && sessionState === 'choosing' && (
        <div style={{ position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'auto', display: 'flex', gap: '1rem' }}>
          <div className="glass" style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', gap: '1rem', width: '250px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--leaf-dark)', margin: 0 }}>
              <Clock size={20} /> Study Mode
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[25, 50, 60, 90].map(m => (
                <button key={m} className="btn-3d" style={{ padding: '6px' }} onClick={() => setStudySession(m)}>{m}m</button>
              ))}
            </div>
          </div>

          <div className="glass" style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', gap: '1rem', width: '250px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--leaf-dark)', margin: 0 }}>
              <BookOpen size={20} /> Read Mode
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="btn-3d secondary" style={{ padding: '6px' }} onClick={() => setBookCategory('Fantasy')}>Fantasy</button>
              <button className="btn-3d secondary" style={{ padding: '6px' }} onClick={() => setBookCategory('Biography')}>Biography</button>
            </div>
          </div>
          
          <button className="btn-3d floating" style={{ alignSelf: 'center', backgroundColor: '#e74c3c', padding: '1rem' }} onClick={endSession}>
            <LogOut size={20} />
          </button>
        </div>
      )}

      {/* SEATED UI: Studying (Minimal Timer) */}
      {isSeated && sessionState === 'studying' && (
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'auto' }}>
          <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem 2rem', backgroundColor: 'rgba(255,255,255,0.9)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8rem', color: '#555', fontWeight: 'bold', textTransform: 'uppercase' }}>Focus Session</span>
              <span style={{ fontSize: '2rem', color: 'var(--wood-dark)', fontFamily: 'monospace', fontWeight: 'bold' }}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            
            <button className="btn-3d" style={{ padding: '12px', borderRadius: '50%', width: '50px', height: '50px' }} onClick={toggleTimer}>
              {timerActive ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button className="btn-3d" style={{ padding: '12px', borderRadius: '50%', width: '50px', height: '50px', backgroundColor: '#e74c3c' }} onClick={endSession}>
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* SEATED UI: Reading (Book Overlay) */}
      {isSeated && sessionState === 'reading' && bookCategory && (
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'auto', width: '80%', maxWidth: '800px', height: '80%' }}>
          <div className="glass" style={{ width: '100%', height: '100%', backgroundColor: 'rgba(253, 246, 227, 0.95)', padding: '3rem', overflowY: 'auto', display: 'flex', gap: '2rem' }}>
            <button onClick={endSession} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
              <X size={24} />
            </button>
            
            {/* Fake Book Pages */}
            <div style={{ flex: 1, borderRight: '1px solid #ddd', paddingRight: '2rem', fontFamily: 'Georgia, serif', color: '#2c3e50', lineHeight: 1.8 }}>
              <h2 style={{ marginBottom: '1.5rem' }}>{bookCategory} Chapter 1</h2>
              <p>The library smelled of old paper and rain. Students sat quietly in the soft glow of amber lamps, deeply immersed in their own worlds. Nexora was more than just a place to study; it was a sanctuary for the focused mind.</p>
              <p>Every wooden desk held a story, and every ticking timer was a promise of progress. As the dust motes danced in the sunlight, the silence felt heavy yet comforting.</p>
            </div>
            <div style={{ flex: 1, fontFamily: 'Georgia, serif', color: '#2c3e50', lineHeight: 1.8 }}>
              <p>It was here that the greatest ideas were born. Not in loud, chaotic halls, but in the quiet corners of the world, where one could sit down, open a book, and let the mind wander through the vast expanse of knowledge.</p>
              <p>The pages turned with a soft rustle, the only sound accompanying the distant tapping of a keyboard. This was the magic of the library. This was Nexora.</p>
            </div>
          </div>
        </div>
      )}

      {/* Sit/Drag Hint */}
      {isSeated && sessionState === 'choosing' && (
        <div style={{ position: 'absolute', top: '5rem', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', color: '#fff', textShadow: '0 2px 4px #000', fontSize: '1.2rem' }}>
          {isTouchDevice ? 'Swipe right side to look around' : 'Click & drag to look around'}
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
