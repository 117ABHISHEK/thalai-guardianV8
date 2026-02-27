import { useState, useEffect } from 'react';

/**
 * PageLoader – shown while a lazy-loaded page chunk is being fetched.
 *
 * Key anti-flicker design decisions:
 *  1. Delayed mount: only renders (becomes visible) after 250ms.
 *     If the chunk loads faster than that, the user never sees this at all.
 *  2. Fade-in animation: smooth opacity transition instead of abrupt pop-in.
 *  3. Occupies the same height as the page so layout doesn't shift when it
 *     is replaced by the real content.
 */
const PageLoader = () => {
  // Start invisible, become visible after a short delay
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 250);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        background: 'transparent',
        // Delayed fade-in so fast loads show nothing at all
        opacity: visible ? 1 : 0,
        transition: 'opacity 300ms ease',
      }}
    >
      {/* Pulsing ring spinner */}
      <div style={{ position: 'relative', width: 52, height: 52 }}>
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#38bdf8',
            borderRightColor: '#818cf8',
            animation: 'tg-spin 900ms linear infinite',
          }}
        />
        <span
          style={{
            position: 'absolute',
            inset: '30%',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            animation: 'tg-pulse 900ms ease-in-out infinite alternate',
            boxShadow: '0 0 12px 2px #38bdf840',
          }}
        />
      </div>

      {/* Label */}
      <p
        style={{
          margin: 0,
          fontSize: '0.8rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          color: '#94a3b8',
          textTransform: 'uppercase',
          animation: 'tg-fade 1.4s ease-in-out infinite alternate',
        }}
      >
        Loading…
      </p>

      <style>{`
        @keyframes tg-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes tg-pulse {
          from { opacity: 0.4; transform: scale(0.75); }
          to   { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes tg-fade {
          from { opacity: 0.3; }
          to   { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
