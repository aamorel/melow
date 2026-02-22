import type { Instrument } from '../../types/game';
import { SCALE_LEVELS, SCALE_TYPES } from '../../utils/constants';
import { SessionSetup, SESSION_INSTRUMENTS } from '../../components/Game/SessionSetup';

interface ScaleControlsProps {
  selectedLevel: number;
  selectedInstrument: Instrument;
  onLevelChange: (level: number) => void;
  onInstrumentChange: (instrument: Instrument) => void;
  onStartGame: () => void;
  disabled?: boolean;
}

export function ScaleControls({
  selectedLevel,
  selectedInstrument,
  onLevelChange,
  onInstrumentChange,
  onStartGame,
  disabled = false,
}: ScaleControlsProps) {
  const currentLevel = SCALE_LEVELS.find(l => l.id === selectedLevel) ?? SCALE_LEVELS[0];
  const scaleLabelCount = currentLevel.scales.length;
  const scalePreview = currentLevel.scales
    .slice(0, 4)
    .map(scale => SCALE_TYPES[scale].name)
    .join(', ');

  const detailItems = [
    `${scaleLabelCount} scale types`,
    `Examples: ${scalePreview}${scaleLabelCount > 4 ? ' + more' : ''}`,
    `Root notes: ${currentLevel.startingNotes.join(', ')}`,
    `Octave range: ${currentLevel.octaveRange[0]}-${currentLevel.octaveRange[1]}`,
  ];

  if (currentLevel.mixedInstruments) {
    detailItems.push('Mixed instruments');
  }

  return (
    <SessionSetup
      title="Build your round"
      levels={SCALE_LEVELS}
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
