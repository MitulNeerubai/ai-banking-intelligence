export default function BackgroundLayer({ children }) {
  return (
    <div className="relative min-h-screen overflow-visible" style={{ backgroundColor: '#0f172a' }}>
      {/* Floating gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        {/* Purple orb - top right */}
        <div
          className="absolute rounded-full opacity-15"
          style={{
            width: '600px',
            height: '600px',
            top: '-100px',
            right: '-150px',
            background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Teal orb - bottom left */}
        <div
          className="absolute rounded-full opacity-12"
          style={{
            width: '500px',
            height: '500px',
            bottom: '50px',
            left: '-100px',
            background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Blue orb - center */}
        <div
          className="absolute rounded-full opacity-10"
          style={{
            width: '400px',
            height: '400px',
            top: '40%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Content layer */}
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
