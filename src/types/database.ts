export interface SessionRecord {
  id?: number;
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
  question_number: number;
  starting_note: string;
  correct_interval: string;
  user_answer: string | null;
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