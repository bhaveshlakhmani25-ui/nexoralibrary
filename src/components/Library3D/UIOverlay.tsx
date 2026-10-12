import { useEffect, useState } from 'react';
import { useGameStore } from '../../store';
import { LogOut, Volume2, VolumeX, BookOpen, Clock, Info, Pause, Play, X, Library } from 'lucide-react';
import { BookReader, CarryingChip, CatalogBrowser, ShelfBookCard, SpineHoverLabel } from './BookUI';

export const UIOverlay = () => {
  const { 
    nearTable, isSeated, setSeated, sessionState,
    timeRemaining, timerActive, setStudySession, tickTimer, toggleTimer, endSession,
    currentBook, startReading, setSessionState, catalogOpen, setCatalogOpen, shelfSelection, setShelfSelection,
    setJoystickVector, ambientSoundOn, setAmbientSound, triggerReset
  } = useGameStore();

  const [showHints, setShowHints] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const timer = setTimeout(() => setShowHints(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Handle E key and Escape. Escape closes the top-most panel first: the
  // catalogue, then a shelf card, then the open book, then stands up.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key.toLowerCase() === 'e' && nearTable !== null && !isSeated) {
        setSeated(true, nearTable.transform);
      }
      if (e.key === 'Escape') {
        if (catalogOpen) setCatalogOpen(false);
        else if (shelfSelection) setShelfSelection(null);
        else if (isSeated && sessionState === 'reading') setSessionState('choosing');
        else if (isSeated) endSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nearTable, isSeated, setSeated, endSession, catalogOpen, setCatalogOpen, shelfSelection, setShelfSelection, sessionState, setSessionState]);

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

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              style={{
                background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
                color: '#fff', cursor: 'pointer', padding: '8px 16px', borderRadius: '16px',
                backdropFilter: 'blur(4px)', textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                fontWeight: 'bold', fontSize: '0.9rem'
              }}
              onClick={() => triggerReset()}
            >
              Reset View
            </button>
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
          {isTouchDevice ? (
            <>
              <div style={{ fontSize: '0.9rem' }}>• Use the <strong style={{ color: '#ffdf85' }}>joystick</strong> to move.</div>
              <div style={{ fontSize: '0.9rem' }}>• Drag the screen to look around.</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '0.9rem' }}>• <strong style={{ color: '#ffdf85' }}>WASD</strong> to move, <strong style={{ color: '#ffdf85' }}>Space</strong> to jump, <strong style={{ color: '#ffdf85' }}>Shift</strong> to sprint.</div>
              <div style={{ fontSize: '0.9rem' }}>• Drag to look around, <strong style={{ color: '#ffdf85' }}>scroll</strong> to zoom.</div>
            </>
          )}
          <div style={{ fontSize: '0.9rem' }}>• Walk onto stairs to climb to the upper gallery.</div>
          <div style={{ fontSize: '0.9rem' }}>• Walk up to a seat and press <strong style={{ color: '#ffdf85' }}>E</strong> to sit.</div>
        </div>
      )}

      {/* Interaction Prompt (Standing) */}
      {/* Desktop uses the prompt floating above the seat; touch keeps a large button */}
      {nearTable !== null && !isSeated && isTouchDevice && (
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
              {currentBook ? (
                <button className="btn-3d secondary" style={{ padding: '6px' }} onClick={() => startReading()}>
                  Read “{currentBook.title.length > 28 ? `${currentBook.title.slice(0, 27)}…` : currentBook.title}”
                </button>
              ) : (
                <span style={{ fontSize: '0.85rem', color: '#555' }}>Pick a book from any shelf, or browse the catalogue.</span>
              )}
              <button className="btn-3d secondary" style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => setCatalogOpen(true)}>
                <Library size={16} /> {currentBook ? 'Change book' : 'Browse catalogue'}
              </button>
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

      {/* SEATED UI: Reading the chosen book */}
      {isSeated && sessionState === 'reading' && currentBook && (
        <BookReader book={currentBook} onClose={() => setSessionState('choosing')} />
      )}

      <SpineHoverLabel />
      <ShelfBookCard />
      <CarryingChip />
      {isSeated && <CatalogBrowser />}

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
