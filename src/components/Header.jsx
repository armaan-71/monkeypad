import React from "react";

export default function Header({
  soundEnabled,
  setSoundEnabled,
  typewriterMode,
  setTypewriterMode,
  activeFont,
  setActiveFont,
  fontSize,
  setFontSize,
  onResetDocument,
  isZenActive,
}) {
  const fonts = [
    { id: "mono", name: "Monospace", cssVar: "var(--font-mono)" },
    { id: "sans", name: "Sans-Serif", cssVar: "var(--font-sans)" },
    { id: "serif", name: "Serif", cssVar: "var(--font-serif)" },
  ];

  const cycleFont = () => {
    const currentIndex = fonts.findIndex((f) => f.id === activeFont);
    const nextIndex = (currentIndex + 1) % fonts.length;
    setActiveFont(fonts[nextIndex].id);
  };

  const cycleFontSize = () => {
    const sizes = [1.2, 1.6, 2.0];
    const currentIndex = sizes.indexOf(fontSize);
    const nextIndex = currentIndex === -1 ? 1 : (currentIndex + 1) % sizes.length;
    setFontSize(sizes[nextIndex]);
  };

  const getSizeLabel = () => {
    if (fontSize <= 1.2) return "s";
    if (fontSize <= 1.6) return "m";
    return "l";
  };

  const renderSizeIcon = () => {
    const label = getSizeLabel();
    switch (label) {
      case "s":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a4 4 0 0 0-4-4H10a4 4 0 0 0-4 4 4 4 0 0 0 4 4h4a4 4 0 0 1 4 4 4 4 0 0 1-4 4H10a4 4 0 0 1-4-4" />
          </svg>
        );
      case "m":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 20V4l6 10 6-10v16" />
          </svg>
        );
      case "l":
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 4v16h8" />
          </svg>
        );
    }
  };

  return (
    <header className={`zen-fade ${isZenActive ? "hidden" : ""}`}>
      <div className="logo-section" onClick={onResetDocument} title="Double-click to reset document">
        <span className="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
            <line x1="6" y1="8" x2="6" y2="8"></line>
            <line x1="10" y1="8" x2="10" y2="8"></line>
            <line x1="14" y1="8" x2="14" y2="8"></line>
            <line x1="18" y1="8" x2="18" y2="8"></line>
            <line x1="6" y1="12" x2="6" y2="12"></line>
            <line x1="10" y1="12" x2="10" y2="12"></line>
            <line x1="14" y1="12" x2="14" y2="12"></line>
            <line x1="18" y1="12" x2="18" y2="12"></line>
            <line x1="7" y1="16" x2="17" y2="16"></line>
          </svg>
        </span>
        <h1 className="logo-text">
          monkey<span>pad</span>
        </h1>
      </div>

      <div className="control-buttons">
        {/* Toggle Clicks */}
        <button
          className={`control-btn ${soundEnabled ? "active" : ""}`}
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={`Sound clicks: ${soundEnabled ? "ON" : "OFF"}`}
          data-tooltip={`Sound clicks: ${soundEnabled ? "ON" : "OFF"}`}
        >
          {soundEnabled ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          )}
        </button>

        {/* Typewriter Mode */}
        <button
          className={`control-btn ${typewriterMode ? "active" : ""}`}
          onClick={() => setTypewriterMode(!typewriterMode)}
          title={`Typewriter mode: ${typewriterMode ? "ON" : "OFF"}`}
          data-tooltip={`Typewriter mode: ${typewriterMode ? "ON" : "OFF"}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="9" x2="20" y2="9"></line>
            <line x1="4" y1="15" x2="20" y2="15"></line>
            <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
          </svg>
        </button>

        {/* Font Cycler */}
        <button
          className="control-btn"
          onClick={cycleFont}
          title={`Font family: ${activeFont}`}
          data-tooltip={`Font family: ${activeFont}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 7 4 4 20 4 20 7"></polyline>
            <line x1="9" y1="20" x2="15" y2="20"></line>
            <line x1="12" y1="4" x2="12" y2="20"></line>
          </svg>
        </button>

        {/* Font Size Cycler */}
        <button
          className="control-btn"
          onClick={cycleFontSize}
          title={`Font size: ${getSizeLabel().toUpperCase()} (${fontSize}rem)`}
          data-tooltip={`Font size: ${getSizeLabel().toUpperCase()} (${fontSize}rem)`}
        >
          {renderSizeIcon()}
        </button>
      </div>
    </header>
  );
}
