import React, { useRef, useEffect } from "react";
import { playClickSound } from "../utils/audio";

export default function WritingCanvas({
  text,
  setText,
  soundEnabled,
  soundProfile,
  typewriterMode,
  activeFont,
  fontSize,
  onTypingStart,
  onTypingEnd,
  isZenActive,
  onCursorChange,
}) {
  const textareaRef = useRef(null);
  const mirrorRef = useRef(null);
  const containerRef = useRef(null);

  // Auto focus editor on load
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Sync cursor details on mouseup or keyup
  const handleCursorSelection = () => {
    if (textareaRef.current) {
      onCursorChange({
        selectionStart: textareaRef.current.selectionStart,
        selectionEnd: textareaRef.current.selectionEnd,
      });
    }
  };

  // Typewriter Mode: Scroll text so that the line with the cursor is centered vertically
  const updateTypewriterScroll = () => {
    if (!typewriterMode || !textareaRef.current || !mirrorRef.current) return;

    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;
    const selectionEnd = textarea.selectionEnd;
    const textVal = textarea.value;

    // 1. Copy essential styles from textarea to mirror to ensure matching metrics
    const styles = window.getComputedStyle(textarea);
    mirror.style.width = styles.width;
    mirror.style.padding = styles.padding;
    mirror.style.fontSize = styles.fontSize;
    mirror.style.lineHeight = styles.lineHeight;
    mirror.style.fontFamily = styles.fontFamily;
    mirror.style.letterSpacing = styles.letterSpacing;

    // 2. Put text up to cursor in mirror, append a marker span
    const textUpToCursor = textVal.substring(0, selectionEnd);
    
    // Convert multiple spaces/newlines to HTML equivalent for proper tracking
    mirror.innerText = textUpToCursor;
    
    // Create and append cursor representation
    const marker = document.createElement("span");
    marker.textContent = "|";
    mirror.appendChild(marker);

    // 3. Measure scroll position of marker
    const markerOffsetTop = marker.offsetTop;
    const textareaHeight = textarea.clientHeight;
    const lineHeight = parseFloat(styles.lineHeight) || 24;

    // Determine target scroll top to keep active line centered
    const targetScrollTop = markerOffsetTop - textareaHeight / 2 + lineHeight / 2;

    // Scroll smoothly to keep alignment
    textarea.scrollTop = targetScrollTop;
  };

  // Sync typewriter scroll when text, window size, or typewriter mode status changes
  useEffect(() => {
    updateTypewriterScroll();
  }, [text, typewriterMode]);

  // Handle typing inputs
  const handleKeyDown = (e) => {
    // Play clicking sound if option is active
    if (soundEnabled) {
      // Use e.key to adjust pitch details inside audio generator
      playClickSound(e.key, soundProfile);
    }

    // Trigger typing callback for Zen mode visibility changes
    onTypingStart();

    // Support Tab key indentation inside textarea
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      const newText = val.substring(0, start) + "    " + val.substring(end);
      
      setText(newText);
      
      // Update cursor position after state changes
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
          handleCursorSelection();
        }
      }, 0);
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    onTypingStart();
  };

  // Determine font family styling to apply
  const getFontFamily = () => {
    switch (activeFont) {
      case "mono":
        return "var(--font-mono)";
      case "serif":
        return "var(--font-serif)";
      case "sans":
      default:
        return "var(--font-sans)";
    }
  };

  return (
    <div 
      className={`canvas-wrapper ${typewriterMode ? "typewriter-mode" : ""}`}
      ref={containerRef}
    >
      <div className="canvas-container">
        {/* Invisible scroll metric mirror for typewriter calculations */}
        <div ref={mirrorRef} className="mirror-container" aria-hidden="true" />
        
        {/* Actual editable writing canvas */}
        <textarea
          ref={textareaRef}
          className="writing-area"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleCursorSelection}
          onMouseUp={handleCursorSelection}
          onScroll={updateTypewriterScroll}
          placeholder="start typing..."
          spellCheck="false"
          style={{
            fontFamily: getFontFamily(),
            fontSize: `${fontSize}rem`,
            height: typewriterMode ? "60vh" : "65vh",
            overflowY: typewriterMode ? "hidden" : "auto",
          }}
        />
      </div>
    </div>
  );
}
