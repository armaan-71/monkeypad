import React, { useState, useEffect, useRef } from "react";
import { themes } from "../constants/themes";

export default function CommandPalette({
  isOpen,
  onClose,
  activeTheme,
  setActiveTheme,
  previewTheme,
  setPreviewTheme,
  soundEnabled,
  setSoundEnabled,
  soundProfile,
  setSoundProfile,
  typewriterMode,
  setTypewriterMode,
  activeFont,
  setActiveFont,
  fontSize,
  setFontSize,
  text,
  setText,
  onOpenGoalModal,
  onResetGoal,
}) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const originalThemeRef = useRef(activeTheme);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // When palette opens, record the original theme to revert if user cancels
  useEffect(() => {
    if (isOpen) {
      originalThemeRef.current = activeTheme;
      setSearch("");
      setSelectedIndex(0);
      setPreviewTheme(null);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    } else {
      setPreviewTheme(null);
    }
  }, [isOpen]);

  // Handle global escape key
  useEffect(() => {
    const handleKeyDownGlobal = (e) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setPreviewTheme(null);
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDownGlobal);
    return () => window.removeEventListener("keydown", handleKeyDownGlobal);
  }, [isOpen, onClose, setPreviewTheme]);

  // Helper to render inline SVG icons matching Monkeytype categories
  const getIcon = (category) => {
    const style = { marginRight: "0.75rem", flexShrink: 0, width: "16px", height: "16px" };
    switch (category) {
      case "Theme":
        return (
          <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22C17.5 22 22 17.5 22 12A10 10 0 0 0 12 2C6.5 2 2 6.5 2 12c0 2.5 1.5 4.5 4 5h1a2 2 0 0 1 2 2v1a2 2 0 0 0 3 2z" />
            <circle cx="7.5" cy="10.5" r="1.2" fill="currentColor" />
            <circle cx="11.5" cy="7.5" r="1.2" fill="currentColor" />
            <circle cx="16.5" cy="9.5" r="1.2" fill="currentColor" />
          </svg>
        );
      case "Settings":
        return (
          <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        );
      case "Typography":
        return (
          <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        );
      case "Danger":
        return (
          <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
      case "Action":
      default:
        return (
          <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );
    }
  };

  // Order of commands: Tools and Settings first, then ALL 187 themes alphabetically
  const allCommands = [
    // 1. Settings & Actions
    {
      id: "toggle-sound",
      label: `Sound: ${soundEnabled ? "Disable" : "Enable"} Click Sounds`,
      searchTerms: "sound volume clicks audio settings toggle",
      category: "Settings",
      tag: soundEnabled ? "ON" : "OFF",
      action: () => setSoundEnabled(!soundEnabled),
    },
    {
      id: "sound-profile-mechanical",
      label: "Sound Profile: Mechanical Keyboard",
      category: "Settings",
      searchTerms: "sound profile mechanical switch keyboard clack clicks",
      tag: soundProfile === "mechanical" ? "active" : "select",
      action: () => setSoundProfile("mechanical"),
    },
    {
      id: "sound-profile-typewriter",
      label: "Sound Profile: Typewriter",
      category: "Settings",
      searchTerms: "sound profile typewriter vintage bell ding retro clicks",
      tag: soundProfile === "typewriter" ? "active" : "select",
      action: () => setSoundProfile("typewriter"),
    },
    {
      id: "sound-profile-bubble",
      label: "Sound Profile: Bubbly Pop",
      category: "Settings",
      searchTerms: "sound profile bubble pop squeak click soft clicks",
      tag: soundProfile === "bubble" ? "active" : "select",
      action: () => setSoundProfile("bubble"),
    },
    {
      id: "sound-profile-digital",
      label: "Sound Profile: Digital Tick",
      category: "Settings",
      searchTerms: "sound profile digital tick clean retro smartphone clicks",
      tag: soundProfile === "digital" ? "active" : "select",
      action: () => setSoundProfile("digital"),
    },
    {
      id: "toggle-typewriter",
      label: `Typewriter Mode: ${typewriterMode ? "Disable" : "Enable"} Centered Scrolling`,
      category: "Settings",
      searchTerms: "typewriter scroll focus layout settings toggle",
      tag: typewriterMode ? "ON" : "OFF",
      action: () => setTypewriterMode(!typewriterMode),
    },
    {
      id: "font-mono",
      label: "Font: Switch to Monospace (JetBrains Mono)",
      category: "Typography",
      searchTerms: "font family monospace jetbrains writing typography",
      tag: activeFont === "mono" ? "active" : "",
      action: () => setActiveFont("mono"),
    },
    {
      id: "font-sans",
      label: "Font: Switch to Sans-Serif (Lexend Deca)",
      category: "Typography",
      searchTerms: "font family sans lexend writing typography",
      tag: activeFont === "sans" ? "active" : "",
      action: () => setActiveFont("sans"),
    },
    {
      id: "font-serif",
      label: "Font: Switch to Serif (Lora)",
      category: "Typography",
      searchTerms: "font family serif lora writing typography",
      tag: activeFont === "serif" ? "active" : "",
      action: () => setActiveFont("serif"),
    },
    {
      id: "size-increase",
      label: "Font Size: Increase (S/M/L)",
      category: "Typography",
      searchTerms: "font size bigger larger increase typography",
      tag: fontSize <= 1.2 ? "S" : fontSize <= 1.6 ? "M" : "L",
      action: () => {
        const sizes = [1.2, 1.6, 2.0];
        const idx = sizes.indexOf(fontSize);
        const nextIdx = idx === -1 ? 1 : Math.min(sizes.length - 1, idx + 1);
        setFontSize(sizes[nextIdx]);
      },
    },
    {
      id: "size-decrease",
      label: "Font Size: Decrease (S/M/L)",
      category: "Typography",
      searchTerms: "font size smaller decrease typography",
      tag: fontSize <= 1.2 ? "S" : fontSize <= 1.6 ? "M" : "L",
      action: () => {
        const sizes = [1.2, 1.6, 2.0];
        const idx = sizes.indexOf(fontSize);
        const nextIdx = idx === -1 ? 1 : Math.max(0, idx - 1);
        setFontSize(sizes[nextIdx]);
      },
    },
    {
      id: "action-goal",
      label: "Goal: Set Word Count Target",
      category: "Action",
      searchTerms: "goal word target limit bar",
      tag: "goal",
      action: () => onOpenGoalModal(),
    },
    {
      id: "action-reset-goal",
      label: "Goal: Reset Word Count Target",
      category: "Action",
      searchTerms: "goal word target reset clear",
      tag: "goal",
      action: () => onResetGoal(),
    },
    {
      id: "action-copy",
      label: "Document: Copy All to Clipboard",
      category: "Action",
      searchTerms: "copy clipboard select document text",
      tag: "copy",
      action: () => {
        navigator.clipboard.writeText(text);
        alert("Text copied to clipboard!");
      },
    },
    {
      id: "action-download",
      label: "Document: Download as Text File (.txt)",
      category: "Action",
      searchTerms: "download file txt save backup document text",
      tag: "download",
      action: () => {
        const element = document.createElement("a");
        const file = new Blob([text], { type: "text/plain;charset=utf-8" });
        element.href = URL.createObjectURL(file);
        element.download = "monkeypad_scratchpad.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      },
    },
    {
      id: "action-clear",
      label: "Document: Clear Writing Canvas",
      category: "Danger",
      searchTerms: "clear reset delete canvas text writing document",
      tag: "reset",
      action: () => {
        if (confirm("Are you sure you want to clear your document? This cannot be undone.")) {
          setText("");
        }
      },
    },
    // 2. All 187 themes alphabetically
    ...themes.map((theme) => ({
      id: `theme-${theme.id}`,
      label: `Theme: ${theme.name}`,
      searchTerms: `theme ${theme.name} ${theme.id}`,
      category: "Theme",
      tag: theme.id === activeTheme.id ? "active" : "theme",
      themeData: theme,
      action: () => {
        setActiveTheme(theme);
        setPreviewTheme(null);
      },
    })),
  ];

  // Search filter matches query. If search is empty, displays all commands
  const getFilteredCommands = () => {
    if (!search.trim()) {
      return allCommands;
    }

    const query = search.toLowerCase().trim();
    return allCommands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query) ||
        (cmd.searchTerms && cmd.searchTerms.toLowerCase().includes(query))
    );
  };

  const filteredCommands = getFilteredCommands();

  // Trigger Live Theme Preview on Selected Index Changes
  useEffect(() => {
    if (!isOpen) return;
    const currentCmd = filteredCommands[selectedIndex];
    if (currentCmd && currentCmd.themeData) {
      setPreviewTheme(currentCmd.themeData);
    } else {
      setPreviewTheme(null);
    }
  }, [selectedIndex, filteredCommands, isOpen, setPreviewTheme]);

  if (!isOpen) return null;

  // Scroll list elements into view
  const scrollToSelected = (index) => {
    if (!listRef.current) return;
    const items = listRef.current.children;
    if (items[index]) {
      items[index].scrollIntoView({
        block: "nearest",
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = filteredCommands.length > 0 ? (prev + 1) % filteredCommands.length : 0;
        scrollToSelected(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next =
          filteredCommands.length > 0 ? (prev - 1 + filteredCommands.length) % filteredCommands.length : 0;
        scrollToSelected(next);
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    }
  };

  const handleOverlayClick = () => {
    setPreviewTheme(null);
    onClose();
  };

  return (
    <div className="palette-overlay" onClick={handleOverlayClick}>
      <div className="palette-box" onClick={(e) => e.stopPropagation()}>
        {/* Sleek Monkeytype input search */}
        <div className="palette-search-container">
          <span className="palette-search-icon" style={{ fontSize: "1.25rem", fontWeight: "bold", paddingRight: "0.4rem", color: "var(--main-color)" }}>
            &gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            className="palette-input"
            placeholder="type to search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Suggestion list */}
        {filteredCommands.length > 0 ? (
          <ul ref={listRef} className="palette-list">
            {filteredCommands.map((cmd, index) => (
              <li
                key={cmd.id}
                className={`palette-item ${selectedIndex === index ? "active" : ""}`}
                onMouseEnter={() => setSelectedIndex(index)}
                onClick={() => {
                  cmd.action();
                  onClose();
                }}
              >
                <div className="palette-item-content">
                  {getIcon(cmd.category)}
                  <span>{cmd.label}</span>
                </div>
                <span className="palette-item-tag">
                  {cmd.tag}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="palette-empty">No commands match your query.</div>
        )}
      </div>
    </div>
  );
}
