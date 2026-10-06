import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';

const ReadMode: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const getBookContent = () => {
    switch(categoryId) {
      case 'fantasy':
        return {
          title: 'The Dragon\'s Whisper',
          text: `In the ancient valley of Eldoria, where the mist clung to the silver pines, a secret lay dormant. For centuries, the villagers had told tales of the sky-beasts, creatures of scale and fire that once danced among the stars. \n\nElara closed her eyes, letting the cool wind brush her face. She held the small, iridescent scale she had found by the river. It was warm to the touch, humming with a faint, rhythmic energy. It was proof. The legends weren't just stories.`
        };
      case 'biography':
        return {
          title: 'Echoes of a Pioneer',
          text: `Born into a world that expected silence, she chose instead to roar. The early years were marked by relentless struggle, not against enemies, but against the suffocating expectations of her era. \n\n"To be the first," she later wrote in her diary, "is not a privilege. It is a terrifying necessity."`
        };
      case 'self-improvement':
      default:
        return {
          title: 'The Focus Habit',
          text: `Your attention is the most valuable currency you possess. Every day, countless forces compete for a fraction of it. \n\nThe true mastery of oneself begins not with doing more, but with choosing what to ignore. When we sit down to study, we are not just absorbing information; we are training the muscle of deep work.`
        };
    }
  };

  const book = getBookContent();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#2b231c', // dark cozy background
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative'
    }}>
      <button 
        className="btn-3d" 
        style={{ position: 'absolute', top: '2rem', left: '2rem', padding: '8px 16px', backgroundColor: '#5c483a', boxShadow: '0 6px 0 #3a2e25' }}
        onClick={() => navigate('/library')}
      >
        <ArrowLeft size={20} /> Back to Library
      </button>

      {/* Book container */}
      <div style={{
        display: 'flex',
        width: '100%', maxWidth: '800px',
        backgroundColor: 'var(--paper)',
        borderRadius: '8px 24px 24px 8px',
        boxShadow: 'inset 20px 0 30px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.4)',
        minHeight: '500px',
        position: 'relative'
      }}>
        
        {/* Book spine */}
        <div style={{
          width: '40px',
          background: 'linear-gradient(to right, #8b5a2b, #a66e38, #8b5a2b)',
          borderRadius: '8px 0 0 8px',
          borderRight: '2px solid rgba(0,0,0,0.2)'
        }} />

        {/* Page content */}
        <div style={{ flex: 1, padding: '3rem 4rem', position: 'relative' }}>
          {/* Bookmark */}
          <div style={{ position: 'absolute', top: '-10px', right: '40px', color: '#c0392b' }}>
            <Bookmark size={40} fill="#e74c3c" />
          </div>

          <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '2rem', fontFamily: 'Georgia, serif', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
            {book.title}
          </h2>
          
          <div style={{ 
            fontSize: '1.2rem', 
            lineHeight: 1.8, 
            color: '#34495e',
            fontFamily: 'Georgia, serif',
            whiteSpace: 'pre-wrap'
          }}>
            {book.text}
          </div>

          {/* Page controls */}
          <div style={{ position: 'absolute', bottom: '2rem', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 4rem' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }} onClick={() => setPage(Math.max(1, page - 1))}>
              <ChevronLeft size={32} />
            </button>
            <span style={{ color: '#888', fontSize: '1.1rem' }}>Page {page}</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }} onClick={() => setPage(page + 1)}>
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadMode;
