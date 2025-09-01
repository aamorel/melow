-- Melow Music Interval Training Database Schema

-- Sessions table - stores completed training sessions
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level INTEGER NOT NULL,
    instrument TEXT NOT NULL,
    total_questions INTEGER DEFAULT 10,
    correct_answers INTEGER NOT NULL,
    average_response_time REAL NOT NULL,
    accuracy_percentage REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Individual answers table - stores each question/answer pair
CREATE TABLE answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER REFERENCES sessions(id),
    question_number INTEGER NOT NULL,
    starting_note TEXT NOT NULL,
    correct_interval TEXT NOT NULL,
    user_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    response_time_ms INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User settings
CREATE TABLE settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    preferred_instrument TEXT DEFAULT 'piano',
    default_level INTEGER DEFAULT 1,
    audio_volume REAL DEFAULT 0.7,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_sessions_level ON sessions(level);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);
CREATE INDEX idx_answers_session_id ON answers(session_id);
CREATE INDEX idx_answers_correct_interval ON answers(correct_interval);