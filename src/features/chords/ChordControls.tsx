import type { Instrument } from '../../types/game';
import { CHORD_LEVELS, CHORD_QUALITIES, INSTRUMENTS } from '../../utils/constants';
import { Button } from '../../components/UI/Button';

interface ChordControlsProps {
  selectedLevel: number;
  selectedInstrument: Instrument;
  onLevelChange: (level: number) => void;
  onInstrumentChange: (instrument: Instrument) => void;
  onStartGame: () => void;
  disabled?: boolean;
}

export function ChordControls({
  selectedLevel,
  selectedInstrument,
  onLevelChange,
  onInstrumentChange,
  onStartGame,
  disabled = false,
}: ChordControlsProps) {
  const currentLevel = CHORD_LEVELS.find(l => l.id === selectedLevel) ?? CHORD_LEVELS[0];
  const chordLabelCount = currentLevel.chords.length;
  const chordPreview = currentLevel.chords
    .slice(0, 4)
    .map(chord => CHORD_QUALITIES[chord].name)
    .join(', ');

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <h2 className="text-2xl font-semibold text-center mb-6">Session</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Level
        </label>
        <select
          value={selectedLevel}
          onChange={(e) => onLevelChange(parseInt(e.target.value, 10))}
          disabled={disabled}
          className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 p-3 text-sm text-slate-100 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-400/40"
        >
          {CHORD_LEVELS.map((level) => (
            <option key={level.id} value={level.id}>
              Level {level.id}: {level.name}
            </option>
          ))}
        </select>
        <p className="text-sm text-slate-400 mt-1">{currentLevel.description}</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Instrument
        </label>
        <select
          value={selectedInstrument}
          onChange={(e) => onInstrumentChange(e.target.value as Instrument)}
          disabled={disabled}
          className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 p-3 text-sm text-slate-100 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-400/40"
        >
          {INSTRUMENTS.map((instrument) => (
            <option key={instrument} value={instrument}>
              {instrument.charAt(0).toUpperCase() + instrument.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 rounded-xl border border-slate-800/70 bg-slate-950/40 p-4">
        <h4 className="font-medium text-slate-200 mb-2">Level details</h4>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>{chordLabelCount} chord qualities</li>
          <li>Examples: {chordPreview}{chordLabelCount > 4 ? ' + more' : ''}</li>
          <li>Root notes: {currentLevel.startingNotes.join(', ')}</li>
          <li>Octave range: {currentLevel.octaveRange[0]}-{currentLevel.octaveRange[1]}</li>
        </ul>
      </div>

      <Button
        onClick={onStartGame}
        disabled={disabled}
        variant="primary"
        size="lg"
        className="w-full"
      >
        Begin session
      </Button>
    </div>
  );
}
