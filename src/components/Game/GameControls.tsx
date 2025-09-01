import { Instrument } from '../../types/game';
import { GAME_LEVELS, INSTRUMENTS } from '../../utils/constants';
import { Button } from '../UI/Button';

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

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Start Training Session</h2>
      
      {/* Level Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Difficulty Level
        </label>
        <select
          value={selectedLevel}
          onChange={(e) => onLevelChange(parseInt(e.target.value))}
          disabled={disabled}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {GAME_LEVELS.map((level) => (
            <option key={level.id} value={level.id}>
              Level {level.id}: {level.name}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-600 mt-1">{currentLevel.description}</p>
      </div>

      {/* Instrument Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instrument
        </label>
        <select
          value={selectedInstrument}
          onChange={(e) => onInstrumentChange(e.target.value as Instrument)}
          disabled={disabled}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {INSTRUMENTS.map((instrument) => (
            <option key={instrument} value={instrument}>
              {instrument.charAt(0).toUpperCase() + instrument.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Level Details */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium text-gray-900 mb-2">Level Details:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• {currentLevel.intervals.length} different intervals</li>
          <li>• Starting notes: {currentLevel.startingNotes.join(', ')}</li>
          <li>• Octave range: {currentLevel.octaveRange[0]}-{currentLevel.octaveRange[1]}</li>
          {currentLevel.mixedInstruments && <li>• Mixed instruments per interval</li>}
        </ul>
      </div>

      <Button
        onClick={onStartGame}
        disabled={disabled}
        variant="primary"
        size="lg"
        className="w-full"
      >
        Start 10-Question Session
      </Button>
    </div>
  );
}