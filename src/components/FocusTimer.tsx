import React, { useState, useEffect } from 'react';
import { Play, Pause, Square } from 'lucide-react';

interface FocusTimerProps {
  initialMinutes: number;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ initialMinutes }) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const endSession = () => {
    setIsRunning(false);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = 100 - (timeLeft / (initialMinutes * 60)) * 100;

  return (
    <div className="glass" style={{ padding: '2rem', textAlign: 'center', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <h3 style={{ color: 'var(--wood-dark)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Focus Time</h3>
      
      <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 2rem' }}>
        {/* Progress Circle background */}
        <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="12" />
          <circle cx="100" cy="100" r="90" fill="none" stroke="var(--leaf-green)" strokeWidth="12" strokeDasharray="565" strokeDashoffset={`${565 - (565 * progress) / 100}`} style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem', fontWeight: 'bold', color: 'var(--wood-dark)'
        }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="btn-3d" onClick={toggleTimer} style={{ padding: '12px', minWidth: '60px' }}>
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button className="btn-3d" onClick={endSession} style={{ padding: '12px', minWidth: '60px', backgroundColor: '#e74c3c', boxShadow: '0 6px 0 #c0392b' }}>
          <Square size={24} />
        </button>
      </div>
    </div>
  );
};

export default FocusTimer;
