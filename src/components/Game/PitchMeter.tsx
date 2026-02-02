import { motion } from 'framer-motion';
import type { Note } from '../../types/game';
import { midiToNote, noteNameToMidi } from '../../utils/intervals';

interface PitchMeterProps {
  centsOff: number | null;
  clarity: number;
  isActive: boolean;
  targetNote?: Note | null;
  toleranceCents?: number;
  maxCents?: number;
}

const ITEM_HEIGHT = 18;
const VIEWPORT_HEIGHT = 260;
const STEP_CENTS = 10;

export function PitchMeter({
  centsOff,
  clarity,
  isActive,
  targetNote = null,
  toleranceCents = 25,
  maxCents = 200,
}: PitchMeterProps) {
  const safeCents = typeof centsOff === 'number' ? centsOff : 0;
  const clamped = Math.max(-maxCents, Math.min(maxCents, safeCents));
  const inTune = typeof centsOff === 'number' && Math.abs(centsOff) <= toleranceCents;
  const showHalo = inTune && isActive;

  const values: number[] = [];
  for (let value = maxCents; value >= -maxCents; value -= STEP_CENTS) {
    values.push(value);
  }
  const zeroIndex = values.findIndex(value => value === 0);
  const baseOffset = VIEWPORT_HEIGHT / 2 - ITEM_HEIGHT / 2 - zeroIndex * ITEM_HEIGHT;
  const translateY = (clamped / STEP_CENTS) * ITEM_HEIGHT;
  const toleranceSteps = toleranceCents / STEP_CENTS;
  const toleranceHeight = toleranceSteps * ITEM_HEIGHT * 2;
  const targetMidi = targetNote ? noteNameToMidi(targetNote.note, targetNote.octave) : null;

  return (
    <div className="space-y-3">
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 transition-shadow duration-200 ${
          showHalo ? 'ring-2 ring-emerald-400/60 shadow-[0_0_30px_rgba(16,185,129,0.35)]' : ''
        }`}
        style={{ height: VIEWPORT_HEIGHT }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_55%)]"></div>

        <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-between text-xs text-slate-500">
          <span>Sharp</span>
          <span>Flat</span>
        </div>

        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400/70"></div>
        <div className="absolute left-1/2 top-1/2 h-6 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 shadow-lg"></div>

        <motion.div
          className="absolute inset-x-0 top-0 flex flex-col items-center relative"
          animate={{ y: baseOffset + translateY }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          style={{ opacity: isActive ? Math.min(1, clarity + 0.2) : 0.4 }}
        >
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full bg-emerald-400/20 border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            style={{
              top: zeroIndex * ITEM_HEIGHT + ITEM_HEIGHT / 2 - toleranceHeight / 2,
              height: toleranceHeight,
              width: 36,
            }}
          ></div>
          {values.map((value) => {
            const isMajor = value % 10 === 0;
            const isInTolerance = Math.abs(value) <= toleranceCents;
            const isSemitone = value % 100 === 0;
            const noteLabel = targetMidi !== null && isSemitone
              ? (() => {
                  const note = midiToNote(targetMidi + value / 100);
                  return `${note.note}${note.octave}`;
                })()
              : null;
            return (
              <div
                key={value}
                className={`flex items-center justify-center gap-3 text-[11px] ${
                  isInTolerance ? 'text-emerald-300' : 'text-slate-500'
                }`}
                style={{ height: ITEM_HEIGHT }}
              >
                <div
                  className={`h-px rounded-full ${
                    value === 0
                      ? 'w-10 bg-emerald-400'
                      : isInTolerance
                      ? 'w-8 bg-emerald-300/80'
                      : isMajor
                      ? 'w-8 bg-slate-600/70'
                      : 'w-5 bg-slate-500/40'
                  }`}
                ></div>
                <span className="w-10 text-right tabular-nums">
                  {value === 0 ? '0' : `${value > 0 ? '+' : ''}${value}`}
                </span>
                <span className={`w-14 text-left tabular-nums ${isSemitone ? 'text-slate-200' : 'text-slate-500/70'}`}>
                  {noteLabel ?? ''}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Flat</span>
        <span className={inTune ? 'text-emerald-300 font-semibold' : 'text-slate-500'}>
          ±{toleranceCents} cents
        </span>
        <span>Sharp</span>
      </div>
    </div>
  );
}
