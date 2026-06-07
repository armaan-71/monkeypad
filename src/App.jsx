import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import WritingCanvas from "./components/WritingCanvas";
import CommandPalette from "./components/CommandPalette";
import Footer from "./components/Footer";
import { themes } from "./constants/themes";

export default function App() {
  // --- Persistent States from LocalStorage ---
  const [text, setText] = useState(() => {
    return localStorage.getItem("monkeypad_text") || "";
  });

  const [activeTheme, setActiveTheme] = useState(() => {
    const saved = localStorage.getItem("monkeypad_theme");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Verify theme still exists in our generated lists
        const exists = themes.find((t) => t.id === parsed.id);
        if (exists) return exists;
      } catch (e) {
        console.error("Error loading theme from storage", e);
      }
    }
    // Default to Carbon (id: "carbon" or the first element)
    const carbon = themes.find((t) => t.id === "carbon") || themes[0];
    return carbon;
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("monkeypad_sound");
    return saved !== null ? saved === "true" : true;
  });

  const [soundProfile, setSoundProfile] = useState(() => {
    return localStorage.getItem("monkeypad_soundprofile") || "mechanical";
  });

  const [typewriterMode, setTypewriterMode] = useState(() => {
    const saved = localStorage.getItem("monkeypad_typewriter");
    return saved === "true";
  });

  const [activeFont, setActiveFont] = useState(() => {
    return localStorage.getItem("monkeypad_font") || "mono";
  });

  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem("monkeypad_fontsize");
    const parsed = saved ? parseFloat(saved) : 1.6;
    if (parsed === 1.2 || parsed === 1.6 || parsed === 2.0) return parsed;
    return 1.6;
  });

  const [wordGoal, setWordGoal] = useState(() => {
    const saved = localStorage.getItem("monkeypad_wordgoal");
    return saved ? parseInt(saved, 10) : 0;
  });

  // --- UI Interactivity States ---
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState(null); // Live preview state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [isZenActive, setIsZenActive] = useState(false);
  const [wpm, setWpm] = useState(0);

  // --- Refs for Zen Mode & WPM tracking ---
  const zenTimeoutRef = useRef(null);
  const wpmTimeoutRef = useRef(null);
  const wpmIntervalRef = useRef(null);
  const sessionStartTimeRef = useRef(null);
  const sessionStartCharCountRef = useRef(null);
  const typingSessionActiveRef = useRef(false);

  // --- Sync Document Text to Storage ---
  useEffect(() => {
    localStorage.setItem("monkeypad_text", text);
  }, [text]);

  // --- Sync Settings to Storage ---
  useEffect(() => {
    localStorage.setItem("monkeypad_theme", JSON.stringify(activeTheme));
  }, [activeTheme]);

  useEffect(() => {
    localStorage.setItem("monkeypad_sound", String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("monkeypad_soundprofile", soundProfile);
  }, [soundProfile]);

  useEffect(() => {
    localStorage.setItem("monkeypad_typewriter", String(typewriterMode));
  }, [typewriterMode]);

  useEffect(() => {
    localStorage.setItem("monkeypad_font", activeFont);
  }, [activeFont]);

  useEffect(() => {
    localStorage.setItem("monkeypad_fontsize", String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("monkeypad_wordgoal", String(wordGoal));
  }, [wordGoal]);

  // --- Bind Active/Preview Theme Colors to CSS Variables ---
  useEffect(() => {
    // Apply previewTheme if the user is highlighting an option in the Command Palette
    const currentThemeData = previewTheme || activeTheme;
    const colors = currentThemeData.colors;
    const root = document.documentElement;

    root.style.setProperty("--bg-color", colors.bg);
    root.style.setProperty("--main-color", colors.main);
    root.style.setProperty("--caret-color", colors.caret);
    root.style.setProperty("--sub-color", colors.sub);
    root.style.setProperty("--text-color", colors.text);
    root.style.setProperty("--error-color", colors.error);

    // Robust hex converter to RGB format
    const hexToRgb = (hex) => {
      if (!hex) return "0, 0, 0";
      let cleanHex = hex.replace("#", "").trim();
      
      // Handle shorthand (e.g. "fff" to "ffffff")
      if (cleanHex.length === 3) {
        cleanHex = cleanHex.split("").map((c) => c + c).join("");
      }
      
      // Handle transparent formats or length offsets
      if (cleanHex.length > 6) {
        cleanHex = cleanHex.substring(0, 6);
      }

      const num = parseInt(cleanHex, 16);
      const r = (num >> 16) & 255;
      const g = (num >> 8) & 255;
      const b = num & 255;
      return isNaN(r) || isNaN(g) || isNaN(b) ? "0, 0, 0" : `${r}, ${g}, ${b}`;
    };

    root.style.setProperty("--main-color-rgb", hexToRgb(colors.main));
    root.style.setProperty("--sub-color-rgb", hexToRgb(colors.sub));
  }, [activeTheme, previewTheme]);

  // --- Global Keyboard Shortcuts ---
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      // Toggle Command Palette on 'Cmd/Ctrl + Shift + P'
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, []);

  // --- Zen Mode: Fade out UI when typing ---
  const handleTypingStart = () => {
    // Fade out elements immediately when typing starts
    setIsZenActive(true);

    // Reset Zen timeout
    if (zenTimeoutRef.current) clearTimeout(zenTimeoutRef.current);
    
    // Fade elements back in after 3 seconds of silence
    zenTimeoutRef.current = setTimeout(() => {
      setIsZenActive(false);
    }, 3000);

    // --- Start/Update WPM Session ---
    if (!typingSessionActiveRef.current) {
      typingSessionActiveRef.current = true;
      sessionStartTimeRef.current = Date.now();
      sessionStartCharCountRef.current = text.length;

      // Start calculating WPM periodically
      if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
      wpmIntervalRef.current = setInterval(calculateWPM, 1000);
    }

    // Reset session expiry timer (5 seconds of inactivity clears speed statistics)
    if (wpmTimeoutRef.current) clearTimeout(wpmTimeoutRef.current);
    wpmTimeoutRef.current = setTimeout(endWPMSession, 5000);
  };

  // --- Calculate Words Per Minute (WPM) ---
  const calculateWPM = () => {
    if (!sessionStartTimeRef.current) return;
    
    const elapsedMinutes = (Date.now() - sessionStartTimeRef.current) / 60000;
    if (elapsedMinutes < 0.02) return; // Prevent huge spikes in first second

    const currentChars = text.length;
    const typedChars = Math.max(0, currentChars - sessionStartCharCountRef.current);
    
    // Standard formula: WPM = (Characters / 5) / TimeInMinutes
    const wordsTyped = typedChars / 5;
    const computedWpm = Math.round(wordsTyped / elapsedMinutes);
    
    // Cap at reasonable limits
    setWpm(isNaN(computedWpm) || computedWpm < 0 ? 0 : Math.min(computedWpm, 350));
  };

  const endWPMSession = () => {
    typingSessionActiveRef.current = false;
    setWpm(0);
    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current);
      wpmIntervalRef.current = null;
    }
  };

  // Listen to mousemove globally to temporarily disable Zen fade
  useEffect(() => {
    const handleMouseMove = () => {
      setIsZenActive(false);
      // Reset Zen timeout if user is typing
      if (typingSessionActiveRef.current) {
        if (zenTimeoutRef.current) clearTimeout(zenTimeoutRef.current);
        zenTimeoutRef.current = setTimeout(() => {
          setIsZenActive(true);
        }, 3000);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (zenTimeoutRef.current) clearTimeout(zenTimeoutRef.current);
      if (wpmTimeoutRef.current) clearTimeout(wpmTimeoutRef.current);
      if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
    };
  }, []);

  // Recalculate WPM instantly on text input
  useEffect(() => {
    if (typingSessionActiveRef.current) {
      calculateWPM();
    }
  }, [text]);

  // Clean up typing goal
  const handleSaveGoal = () => {
    const val = parseInt(goalInput, 10);
    if (!isNaN(val) && val > 0) {
      setWordGoal(val);
      setIsGoalModalOpen(false);
    } else {
      alert("Please enter a valid positive number.");
    }
  };

  const handleResetGoal = () => {
    setWordGoal(0);
    setGoalInput("");
  };

  const handleResetDocument = () => {
    if (confirm("Are you sure you want to clear your current document? This cannot be undone.")) {
      setText("");
      endWPMSession();
    }
  };

  // Calculate Goal Progress
  const getWordCount = () => {
    const cleanText = text.trim();
    if (!cleanText) return 0;
    return cleanText.split(/\s+/).length;
  };

  const currentWords = getWordCount();
  const goalProgressPercentage = wordGoal > 0 ? Math.min(100, (currentWords / wordGoal) * 100) : 0;

  // Header display name uses previewTheme if active
  const displayTheme = previewTheme || activeTheme;

  return (
    <div className="app-container">
      {/* Target Progress Bar */}
      {wordGoal > 0 && (
        <div className="progress-bar-container" title={`Goal progress: ${currentWords}/${wordGoal} words`}>
          <div className="progress-bar" style={{ width: `${goalProgressPercentage}%` }} />
        </div>
      )}

      {/* Header Bar */}
      <Header
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        typewriterMode={typewriterMode}
        setTypewriterMode={setTypewriterMode}
        activeFont={activeFont}
        setActiveFont={setActiveFont}
        fontSize={fontSize}
        setFontSize={setFontSize}
        onResetDocument={handleResetDocument}
        isZenActive={isZenActive}
      />

       {/* Primary Writing Canvas */}
      <main style={{ flexGrow: 1, display: "flex", flexDirection: "column", width: "100%" }}>
        <WritingCanvas
          text={text}
          setText={setText}
          soundEnabled={soundEnabled}
          soundProfile={soundProfile}
          typewriterMode={typewriterMode}
          activeFont={activeFont}
          fontSize={fontSize}
          onTypingStart={handleTypingStart}
          onTypingEnd={endWPMSession}
          isZenActive={isZenActive}
          onCursorChange={() => {}}
        />
      </main>

      {/* Footer Status Panel */}
      <Footer
        text={text}
        wpm={wpm}
        onOpenPalette={() => setIsPaletteOpen(true)}
        isZenActive={isZenActive}
        wordGoal={wordGoal}
      />

      {/* Command Menu Modal */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        activeTheme={activeTheme}
        setActiveTheme={setActiveTheme}
        previewTheme={previewTheme}
        setPreviewTheme={setPreviewTheme}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        soundProfile={soundProfile}
        setSoundProfile={setSoundProfile}
        typewriterMode={typewriterMode}
        setTypewriterMode={setTypewriterMode}
        activeFont={activeFont}
        setActiveFont={setActiveFont}
        fontSize={fontSize}
        setFontSize={setFontSize}
        text={text}
        setText={setText}
        onOpenGoalModal={() => {
          setGoalInput(wordGoal > 0 ? String(wordGoal) : "");
          setIsGoalModalOpen(true);
        }}
        onResetGoal={handleResetGoal}
      />

      {/* Goal Setting Dialog Overlay */}
      {isGoalModalOpen && (
        <div className="goal-modal-overlay">
          <div className="goal-modal">
            <h3>Set Writing Target</h3>
            <p style={{ color: "var(--sub-color)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Define a custom word count goal to fill the progress bar at the top of the viewport.
            </p>
            <input
              type="number"
              className="goal-input"
              placeholder="e.g. 500"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveGoal();
              }}
              min="1"
              autoFocus
            />
            <div className="goal-buttons">
              <button className="btn-secondary" onClick={() => setIsGoalModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveGoal}>
                Set Target
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
