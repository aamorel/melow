import type { Instrument } from '../../types/game';
import { CHORD_LEVELS, CHORD_QUALITIES } from '../../utils/constants';
import { SessionSetup, SESSION_INSTRUMENTS } from '../../components/Game/SessionSetup';

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

  const detailItems = [
    `${chordLabelCount} chord qualities`,
    `Examples: ${chordPreview}${chordLabelCount > 4 ? ' + more' : ''}`,
    `Root notes: ${currentLevel.startingNotes.join(', ')}`,
    `Octave range: ${currentLevel.octaveRange[0]}-${currentLevel.octaveRange[1]}`,
  ];

  return (
    <SessionSetup
      title="Build your round"
      levels={CHORD_LEVELS}
      selectedLevel={selectedLevel}
      onLevelChange={onLevelChange}
      instruments={SESSION_INSTRUMENTS}
      selectedInstrument={selectedInstrument}
      onInstrumentChange={onInstrumentChange}
      detailItems={detailItems}
      onStart={onStartGame}
      disabled={disabled}
    />
  );
}
