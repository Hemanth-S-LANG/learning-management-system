import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSelector() {
  const { theme, currentTheme, changeTheme, themes } = useTheme();
  const [showThemes, setShowThemes] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowThemes(!showThemes)}
        style={{
          padding: '10px 20px',
          backgroundColor: theme.primary,
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        🎨 Theme: {themes[currentTheme].name}
      </button>

      {showThemes && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setShowThemes(false)}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '10px',
            backgroundColor: theme.cardBg,
            border: `2px solid ${theme.cardBorder}`,
            borderRadius: '8px',
            padding: '10px',
            boxShadow: `0 4px 12px ${theme.shadow}`,
            zIndex: 1000,
            minWidth: '200px'
          }}>
            {Object.keys(themes).map(themeName => (
              <button
                key={themeName}
                onClick={() => {
                  changeTheme(themeName);
                  setShowThemes(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '5px',
                  backgroundColor: currentTheme === themeName ? theme.primary : theme.inputBg,
                  color: currentTheme === themeName ? 'white' : theme.text,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textAlign: 'left',
                  fontWeight: currentTheme === themeName ? 'bold' : 'normal'
                }}
              >
                {currentTheme === themeName && '✓ '}{themes[themeName].name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

