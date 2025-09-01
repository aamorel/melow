# 🎵 Melow - Music Interval Training

A modern web application for learning and practicing music intervals, built with React, TypeScript, and Tailwind CSS.

## Features

### 🎯 Progressive Learning System
- **7 difficulty levels** from beginner to expert
- **Level 1**: Major scale intervals from C (perfect for beginners)
- **Level 2**: Add minor intervals
- **Level 3**: Random starting notes
- **Level 4**: Extended octave range
- **Level 5**: All chromatic intervals including tritone
- **Level 6**: Mixed instruments per interval
- **Level 7**: Expert mode with full complexity

### 🎼 Multiple Instruments
- **Piano** - Pure, clear tones
- **Saxophone** - Warm, breathy sound (perfect for sax learners!)
- **Guitar** - Natural attack and decay
- **Flute** - Airy, gentle tones
- **Violin** - Sustained string sounds

### 📊 Progress Tracking
- Session history with detailed statistics
- Accuracy percentage per level
- Average response time tracking
- Visual progress charts
- Local data storage (localStorage)

### 🎮 Interactive Training
- 10-question sessions per training round
- Real-time feedback on answers
- Replay intervals as needed
- Clean, responsive UI

## Getting Started

### Prerequisites
- Node.js (18+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd melow
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## How to Use

1. **Choose your level**: Start with Level 1 if you're new to interval training
2. **Select an instrument**: Pick your preferred sound (saxophone recommended for sax players!)
3. **Start training**: Complete 10-question sessions
4. **Listen carefully**: Play each interval and identify what you hear
5. **Track progress**: View your improvement in the Progress tab

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Audio**: Web Audio API
- **State Management**: React Context + useReducer
- **Data Storage**: localStorage (browser-based)

## Project Structure

```
src/
├── components/          # React components
│   ├── Game/           # Game-related components
│   ├── Stats/          # Statistics and progress
│   └── UI/             # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # Business logic services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Audio Implementation

The app uses the Web Audio API to generate realistic instrument sounds:
- Each instrument has unique waveforms and envelopes
- Saxophone uses filtered sawtooth waves for warmth
- Piano uses sine waves with appropriate attack/decay
- All instruments support frequency-accurate note generation

## Future Enhancements

- Better SQLite3 integration for robust data storage
- Harmonic intervals (simultaneous notes)
- Descending intervals
- Custom interval sets
- Export/import progress data
- Multiplayer challenges

## Contributing

This project is designed to be simple and extensible. Key principles:
- Clean, readable code
- TypeScript for type safety
- Modular component architecture
- Separation of concerns (UI, business logic, data)

## License

MIT License - feel free to use this project for learning and personal use.