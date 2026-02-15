import { useEffect } from 'react';

interface PlaybackHotkeyOptions {
  enabled?: boolean;
  onTrigger: () => void;
  code?: string;
}

export function usePlaybackHotkey({
  enabled = true,
  onTrigger,
  code = 'Space',
}: PlaybackHotkeyOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code !== code) return;
      const target = event.target as HTMLElement | null;
      if (target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'BUTTON' ||
        target.isContentEditable
      )) {
        return;
      }

      event.preventDefault();
      onTrigger();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [code, enabled, onTrigger]);
}
