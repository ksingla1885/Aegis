import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Mindora Aegis — Comprehensive Anti-Cheat & Security Hook
 */
export function useAegisSecurity({
  testId,
  maxViolations = 3,
  onViolation,
  onAutoSubmit,
  enabled = true,
}) {
  const [securityState, setSecurityState] = useState({
    isActive: false,
    isFullscreen: false,
    isTabFocused: true,
    isDevToolsOpen: false,
    isMouseInBounds: true,
    violations: [],
    violationCount: 0,
    isLockedOut: false,
    lastWarningMessage: null,
  });

  const onViolationRef = useRef(onViolation);
  const onAutoSubmitRef = useRef(onAutoSubmit);
  const blurGraceTimerRef = useRef(null);
  const fullscreenGraceTimerRef = useRef(null);
  const devtoolsCheckIntervalRef = useRef(null);

  useEffect(() => {
    onViolationRef.current = onViolation;
    onAutoSubmitRef.current = onAutoSubmit;
  }, [onViolation, onAutoSubmit]);

  // Log a security violation
  const recordViolation = useCallback((type, message, severity = 'WARNING') => {
    const violation = {
      id: `viol-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      message,
      severity,
      timestamp: new Date().toLocaleTimeString(),
      isoTime: new Date().toISOString(),
    };

    setSecurityState((prev) => {
      const updatedViolations = [...prev.violations, violation];
      const newCount = prev.violationCount + 1;
      const isLockedOut = newCount >= maxViolations;

      if (onViolationRef.current) {
        onViolationRef.current(violation, newCount, isLockedOut);
      }

      if (isLockedOut && onAutoSubmitRef.current) {
        setTimeout(() => {
          if (onAutoSubmitRef.current) onAutoSubmitRef.current('MAX_VIOLATIONS_EXCEEDED');
        }, 800);
      }

      return {
        ...prev,
        violations: updatedViolations,
        violationCount: newCount,
        isLockedOut,
        lastWarningMessage: message,
      };
    });

    return violation;
  }, [maxViolations]);

  // 1. Enter Fullscreen Mode
  const requestFullscreenLock = useCallback(async () => {
    if (typeof window === 'undefined') return false;
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }
      setSecurityState((prev) => ({ ...prev, isFullscreen: true, isActive: true }));
      return true;
    } catch (err) {
      // Browser blocked automatic fullscreen without prior user gesture (e.g., on initial page render).
      // We set isFullscreen: false so the SecurityOverlay prompts candidate for a click gesture.
      // We DO NOT record an unfair security violation for standard browser permission policies.
      console.warn('Fullscreen entry requires user gesture prompt:', err);
      setSecurityState((prev) => ({ ...prev, isFullscreen: false }));
      return false;
    }
  }, []);

  // 2. Fullscreen Change Handler
  const handleFullscreenChange = useCallback(() => {
    if (!enabled) return;
    const isCurrentlyFS = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );

    setSecurityState((prev) => ({ ...prev, isFullscreen: isCurrentlyFS }));

    if (isCurrentlyFS) {
      if (fullscreenGraceTimerRef.current) {
        clearTimeout(fullscreenGraceTimerRef.current);
        fullscreenGraceTimerRef.current = null;
      }
    } else {
      if (fullscreenGraceTimerRef.current) return;
      fullscreenGraceTimerRef.current = setTimeout(() => {
        fullscreenGraceTimerRef.current = null;
        const stillNotFS = !(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
        );
        if (stillNotFS) {
          recordViolation('FULLSCREEN_EXITED', 'Fullscreen mode exited! Please return immediately.', 'HIGH');
        }
      }, 1500);
    }
  }, [enabled, recordViolation]);

  // 3. Tab Visibility & Window Blur Handler
  const handleVisibilityChange = useCallback(() => {
    if (!enabled) return;
    if (document.hidden) {
      setSecurityState((prev) => ({ ...prev, isTabFocused: false }));
      recordViolation('TAB_SWITCH_DETECTED', 'Navigating away from the active test tab is prohibited.', 'CRITICAL');
    } else {
      setSecurityState((prev) => ({ ...prev, isTabFocused: true }));
    }
  }, [enabled, recordViolation]);

  const handleWindowBlur = useCallback(() => {
    if (!enabled || document.hidden) return;
    if (blurGraceTimerRef.current) return;

    blurGraceTimerRef.current = setTimeout(() => {
      blurGraceTimerRef.current = null;
      if (!document.hidden) {
        setSecurityState((prev) => ({ ...prev, isTabFocused: false }));
        recordViolation('WINDOW_FOCUS_LOST', 'Window focus lost! Switching applications is flagged.', 'CRITICAL');
      }
    }, 600);
  }, [enabled, recordViolation]);

  const handleWindowFocus = useCallback(() => {
    if (blurGraceTimerRef.current) {
      clearTimeout(blurGraceTimerRef.current);
      blurGraceTimerRef.current = null;
    }
    setSecurityState((prev) => ({ ...prev, isTabFocused: true }));
  }, []);

  // 4. Keyboard Shortcuts Interception
  const handleKeyDown = useCallback((e) => {
    if (!enabled) return;
    const forbiddenKeys = ['F1', 'F5', 'F11', 'F12', 'Escape', 'PrintScreen'];
    const ctrlCombos = ['c', 'v', 'x', 's', 'p', 'a', 'u', 'i', 'j'];

    const isCtrlCombo = e.ctrlKey && ctrlCombos.includes(e.key.toLowerCase());
    const isCmdCombo = e.metaKey && ctrlCombos.includes(e.key.toLowerCase());
    const isAltTab = e.altKey && e.key === 'Tab';

    if (forbiddenKeys.includes(e.key) || isCtrlCombo || isCmdCombo || isAltTab) {
      e.preventDefault();
      e.stopPropagation();
      recordViolation('KEYBOARD_SHORTCUT_BLOCKED', `Prohibited key shortcut detected: ${e.key}`, 'MEDIUM');
    }
  }, [enabled, recordViolation]);

  // 5. Context Menu & Clipboard Blocking
  const handleContextMenu = useCallback((e) => {
    if (!enabled) return;
    e.preventDefault();
    recordViolation('CONTEXT_MENU_BLOCKED', 'Right-click context menu is disabled.', 'LOW');
  }, [enabled, recordViolation]);

  const handleCopyPaste = useCallback((e) => {
    if (!enabled) return;
    e.preventDefault();
    recordViolation('CLIPBOARD_ACTION_BLOCKED', 'Copy/Cut/Paste actions are disabled.', 'MEDIUM');
  }, [enabled, recordViolation]);

  // 6. Anti-DevTools & Window Geometry Monitoring
  const checkDevTools = useCallback(() => {
    if (!enabled) return;
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > threshold || heightDiff > threshold) {
      setSecurityState((prev) => {
        if (!prev.isDevToolsOpen) {
          recordViolation('DEVTOOLS_DETECTED', 'Developer Inspection Tools detected. Close inspect window!', 'CRITICAL');
        }
        return { ...prev, isDevToolsOpen: true };
      });
    } else {
      setSecurityState((prev) => ({ ...prev, isDevToolsOpen: false }));
    }
  }, [enabled, recordViolation]);

  // 7. Mouse Screen Edge Exit Detection
  const handleMouseLeave = useCallback((e) => {
    if (!enabled) return;
    if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
      setSecurityState((prev) => ({ ...prev, isMouseInBounds: false }));
      recordViolation('MOUSE_OUT_OF_BOUNDS', 'Mouse cursor moved out of active examination area.', 'LOW');
    }
  }, [enabled, recordViolation]);

  const handleMouseEnter = useCallback(() => {
    setSecurityState((prev) => ({ ...prev, isMouseInBounds: true }));
  }, []);

  // Set up listeners
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    devtoolsCheckIntervalRef.current = setInterval(checkDevTools, 2000);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);

      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);

      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);

      if (devtoolsCheckIntervalRef.current) clearInterval(devtoolsCheckIntervalRef.current);
    };
  }, [
    enabled,
    handleFullscreenChange,
    handleVisibilityChange,
    handleWindowBlur,
    handleWindowFocus,
    handleKeyDown,
    handleContextMenu,
    handleCopyPaste,
    checkDevTools,
    handleMouseLeave,
    handleMouseEnter,
  ]);

  return {
    ...securityState,
    requestFullscreenLock,
    recordViolation,
  };
}
