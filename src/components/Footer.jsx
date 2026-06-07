import React from "react";

export default function Footer({
  text,
  wpm,
  onOpenPalette,
  isZenActive,
  wordGoal,
}) {
  // Count words
  const getWordCount = () => {
    const cleanText = text.trim();
    if (!cleanText) return 0;
    return cleanText.split(/\s+/).length;
  };

  // Count characters
  const getCharCount = () => {
    return text.length;
  };

  // Count paragraphs
  const getParagraphCount = () => {
    const cleanText = text.trim();
    if (!cleanText) return 0;
    return cleanText.split(/\n+/).filter(p => p.trim().length > 0).length;
  };

  // Estimate reading time (Average 200 words per minute)
  const getReadingTime = () => {
    const words = getWordCount();
    if (words === 0) return "0 min read";
    const minutes = words / 200;
    if (minutes < 0.5) return "< 1 min read";
    return `${Math.ceil(minutes)} min read`;
  };

  const wordCount = getWordCount();
  const charCount = getCharCount();
  const paragraphCount = getParagraphCount();

  const isMac = typeof window !== "undefined" && /mac/i.test(navigator.userAgent || navigator.platform || "");

  return (
    <footer className={`zen-fade ${isZenActive ? "dimmed" : ""}`}>
      {/* Live Metrics */}
      <div className="metrics-section">
        <div className="metric-item">
          <span className="metric-value">{wordCount}</span>
          <span>{wordCount === 1 ? "word" : "words"}</span>
        </div>
        
        {wordGoal > 0 && (
          <div className="metric-item" style={{ color: "var(--main-color)" }}>
            <span className="metric-value">{wordCount}</span>
            <span>/ {wordGoal} goal</span>
          </div>
        )}

        <div className="metric-item">
          <span className="metric-value">{charCount}</span>
          <span>{charCount === 1 ? "char" : "chars"}</span>
        </div>

        <div className="metric-item">
          <span className="metric-value">{paragraphCount}</span>
          <span>{paragraphCount === 1 ? "paragraph" : "paragraphs"}</span>
        </div>

        <div className="metric-item">
          <span className="metric-value">{getReadingTime()}</span>
        </div>

        {wpm > 0 && (
          <div className="metric-item" style={{ borderLeft: "1px solid var(--sub-color)", paddingLeft: "1.5rem" }}>
            <span className="metric-value" style={{ color: "var(--main-color)" }}>{wpm}</span>
            <span>wpm</span>
          </div>
        )}
      </div>

      {/* Shortcut hint */}
      <div className="palette-hint" onClick={onOpenPalette} title={`Or press ${isMac ? "Cmd" : "Ctrl"}+Shift+P`}>
        <kbd>{isMac ? "cmd" : "ctrl"}</kbd> + <kbd>shift</kbd> + <kbd>p</kbd> to command palette
      </div>
    </footer>
  );
}
