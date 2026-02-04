import type { Instrument } from '../../types/game';
import { GAME_LEVELS } from '../../utils/constants';
import { SessionSetup, SESSION_INSTRUMENTS } from './SessionSetup';

interface GameControlsProps {
  selectedLevel: number;
  selectedInstrument: Instrument;
  onLevelChange: (level: number) => void;
  onInstrumentChange: (instrument: Instrument) => void;
  onStartGame: () => void;
  disabled?: boolean;
}

export function GameControls({
  selectedLevel,
  selectedInstrument,
  onLevelChange,
  onInstrumentChange,
  onStartGame,
  disabled = false
}: GameControlsProps) {
  const currentLevel = GAME_LEVELS.find(l => l.id === selectedLevel)!;
  const levelDetailItems = [
    `${currentLevel.intervals.length} intervals`,
    `Start notes: ${currentLevel.startingNotes.join(', ')}`,
    `Octave range: ${currentLevel.octaveRange[0]}-${currentLevel.octaveRange[1]}`,
  ];

  if (currentLevel.mixedInstruments) {
    levelDetailItems.push('Mixed instruments');
  }

  return (
    <SessionSetup
      title="Build your round"
      levels={GAME_LEVELS}
      selectedLevel={selectedLevel}
      onLevelChange={onLevelChange}
      instruments={SESSION_INSTRUMENTS}
      selectedInstrument={selectedInstrument}
      onInstrumentChange={onInstrumentChange}
      detailItems={levelDetailItems}
      onStart={onStartGame}
      disabled={disabled}
    />
  );
}
