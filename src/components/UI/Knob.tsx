import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface KnobProps {
  value: number;
  steps?: number;
  size?: 'sm' | 'md' | 'lg';
  onChange: (value: number) => void;
  ariaLabel: string;
  className?: string;
}

const MIN_ANGLE = -140;
const MAX_ANGLE = 140;
const ANGLE_RANGE = MAX_ANGLE - MIN_ANGLE;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const normalizeSteps = (steps: number) => Math.max(2, Math.round(steps));

const angleForValue = (value: number, steps: number) => {
  const clamped = clamp(value, 0, steps - 1);
  return MIN_ANGLE + (clamped / (steps - 1)) * ANGLE_RANGE;
};

const valueForAngle = (angle: number, steps: number) => {
  const clamped = clamp(angle, MIN_ANGLE, MAX_ANGLE);
  const ratio = (clamped - MIN_ANGLE) / ANGLE_RANGE;
  return clamp(Math.round(ratio * (steps - 1)), 0, steps - 1);
};

export function Knob({
  value,
  steps = 10,
  size = 'sm',
  onChange,
  ariaLabel,
  className = '',
}: KnobProps) {
  const stepCount = normalizeSteps(steps);
  const [isDragging, setIsDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const rotation = useMemo(() => angleForValue(value, stepCount), [value, stepCount]);

  const updateFromPointer = useCallback((clientX: number, clientY: number) => {
    const element = rootRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radians = Math.atan2(clientY - centerY, clientX - centerX);
    const degrees = (radians * 180) / Math.PI;
    const adjusted = degrees + 90;
    let normalized = ((adjusted + 360) % 360);
    if (normalized > 180) normalized -= 360;
    const nextValue = valueForAngle(normalized, stepCount);
    if (nextValue !== valueRef.current) {
      onChange(nextValue);
    }
  }, [onChange, stepCount]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    updateFromPointer(event.clientX, event.clientY);
  }, [updateFromPointer]);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateFromPointer(event.clientX, event.clientY);
  }, [isDragging, updateFromPointer]);

  const handlePointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    let nextValue = valueRef.current;
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        nextValue = clamp(valueRef.current + 1, 0, stepCount - 1);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        nextValue = clamp(valueRef.current - 1, 0, stepCount - 1);
        break;
      case 'Home':
        nextValue = 0;
        break;
      case 'End':
        nextValue = stepCount - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    if (nextValue !== valueRef.current) {
      onChange(nextValue);
    }
  }, [onChange, stepCount]);

  const sizeClass = {
    sm: 'knob-sm',
    md: 'knob-md',
    lg: 'knob-lg',
  }[size];

  return (
    <div
      ref={rootRef}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={stepCount - 1}
      aria-valuenow={value}
      aria-valuetext={`${value + 1} of ${stepCount}`}
      data-dragging={isDragging ? 'true' : 'false'}
      className={`knob-shell ${sizeClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      <div className="knob-ticks" aria-hidden="true">
        {Array.from({ length: stepCount }).map((_, index) => (
          <span
            key={index}
            className={`knob-tick ${index <= value ? 'is-active' : ''}`}
            style={{ '--knob-angle': `${angleForValue(index, stepCount)}deg` } as CSSProperties}
          />
        ))}
      </div>
      <div
        className="knob-face"
        style={{ '--knob-rotation': `${rotation}deg` } as CSSProperties}
      >
        <span className="knob-indicator" />
      </div>
    </div>
  );
}
