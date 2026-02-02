import type { ExerciseType } from './exercise';

export interface SessionRecord {
  id?: number;
  exercise_type?: ExerciseType;
  level: number;
  instrument: string;
  total_questions: number;
  correct_answers: number;
  average_response_time: number;
  accuracy_percentage: number;
  created_at?: string;
}

export interface AnswerRecord {
  id?: number;
  session_id: number;
  exercise_type?: ExerciseType;
  question_number: number;
  starting_note: string | null;
  target_note?: string | null;
  correct_interval: string | null;
  user_answer: string | null;
  detected_frequency?: number | null;
  cents_off?: number | null;
  is_correct: boolean;
  response_time_ms: number;
  created_at?: string;
}

export interface SettingsRecord {
  id: number;
  preferred_instrument: string;
  default_level: number;
  audio_volume: number;
  updated_at?: string;
}
