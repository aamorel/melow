interface PlaybackIconProps {
  state: 'play' | 'pause';
  className?: string;
}

export function PlaybackIcon({ state, className = '' }: PlaybackIconProps) {
  if (state === 'pause') {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={className}
        fill="currentColor"
      >
        <rect x="6" y="5" width="4.5" height="14" rx="1.5" />
        <rect x="13.5" y="5" width="4.5" height="14" rx="1.5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M7.5 5.5c0-0.9 0.98-1.46 1.76-1l9.2 5.8c0.7 0.44 0.7 1.46 0 1.9l-9.2 5.8c-0.78 0.46-1.76-0.1-1.76-1z" />
    </svg>
  );
}
