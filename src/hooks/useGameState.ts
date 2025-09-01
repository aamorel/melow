import { useReducer, useCallback, useEffect, useRef } from 'react';
import type { GameState, GameSession, Answer, Instrument } from '../types/game';
import { GAME_LEVELS } from '../utils/constants';
import { intervalGenerator } from '../services/intervalGenerator';
import { database } from '../services/database';

type GameAction =
  | { type: 'START_GAME'; level: number; instrument: Instrument }
  | { type: 'SUBMIT_ANSWER'; answer: string; responseTime: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'END_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'SET_LEVEL'; level: number }
  | { type: 'SET_INSTRUMENT'; instrument: Instrument };

const initialState: GameState = {
  currentSession: null,
  currentQuestionIndex: 0,
  isPlaying: false,
  showResult: false,
  selectedLevel: 1,
  selectedInstrument: 'piano',
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const level = GAME_LEVELS.find(l => l.id === action.level)!;
      const questions = intervalGenerator.generateQuestions(level, action.instrument);
      
      const session: GameSession = {
        level: action.level,
        instrument: action.instrument,
        questions,
        answers: [],
        startTime: Date.now(),
      };

      return {
        ...state,
        currentSession: session,
        currentQuestionIndex: 0,
        isPlaying: true,
        showResult: false,
      };
    }

    case 'SUBMIT_ANSWER': {
      if (!state.currentSession) return state;

      const currentQuestion = state.currentSession.questions[state.currentQuestionIndex];
      const isCorrect = intervalGenerator.validateAnswer(currentQuestion, action.answer);
      
      const answer: Answer = {
        questionId: currentQuestion.id,
        userAnswer: action.answer as any,
        isCorrect,
        responseTimeMs: action.responseTime,
      };

      const updatedAnswers = [...state.currentSession.answers, answer];
      const isLastQuestion = state.currentQuestionIndex >= state.currentSession.questions.length - 1;

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          answers: updatedAnswers,
          endTime: isLastQuestion ? Date.now() : state.currentSession.endTime,
        },
        showResult: true,
      };
    }

    case 'NEXT_QUESTION': {
      if (!state.currentSession) return state;

      const nextIndex = state.currentQuestionIndex + 1;
      const isGameComplete = nextIndex >= state.currentSession.questions.length;

      return {
        ...state,
        currentQuestionIndex: nextIndex,
        showResult: false,
        isPlaying: !isGameComplete,
      };
    }

    case 'END_GAME': {
      return {
        ...state,
        currentSession: null,
        currentQuestionIndex: 0,
        isPlaying: false,
        showResult: false,
      };
    }

    case 'RESET_GAME': {
      return {
        ...state,
        currentSession: null,
        currentQuestionIndex: 0,
        isPlaying: false,
        showResult: false,
      };
    }

    case 'SET_LEVEL': {
      return {
        ...state,
        selectedLevel: action.level,
      };
    }

    case 'SET_INSTRUMENT': {
      return {
        ...state,
        selectedInstrument: action.instrument,
      };
    }

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const savedSessionIds = useRef(new Set<string>());

  // Auto-save completed sessions
  useEffect(() => {
    if (state.currentSession && 
        state.currentSession.answers.length === state.currentSession.questions.length &&
        !state.isPlaying) {
      
      const sessionKey = `${state.currentSession.level}-${state.currentSession.startTime}`;
      
      if (!savedSessionIds.current.has(sessionKey)) {
        savedSessionIds.current.add(sessionKey);
        console.log('Auto-saving completed session:', sessionKey);
        database.saveSession(state.currentSession);
      }
    }
  }, [state.currentSession, state.isPlaying]);

  const startGame = useCallback((level: number, instrument: Instrument) => {
    dispatch({ type: 'START_GAME', level, instrument });
  }, []);

  const submitAnswer = useCallback((answer: string, responseTime: number) => {
    dispatch({ type: 'SUBMIT_ANSWER', answer, responseTime });
  }, []);

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  const endGame = useCallback(async () => {
    dispatch({ type: 'END_GAME' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const setLevel = useCallback((level: number) => {
    dispatch({ type: 'SET_LEVEL', level });
  }, []);

  const setInstrument = useCallback((instrument: Instrument) => {
    dispatch({ type: 'SET_INSTRUMENT', instrument });
  }, []);

  const currentQuestion = state.currentSession?.questions[state.currentQuestionIndex];
  const isGameComplete = state.currentSession && 
    state.currentQuestionIndex >= state.currentSession.questions.length;

  return {
    state,
    actions: {
      startGame,
      submitAnswer,
      nextQuestion,
      endGame,
      resetGame,
      setLevel,
      setInstrument,
    },
    computed: {
      currentQuestion,
      isGameComplete,
      progress: state.currentSession ? 
        (state.currentQuestionIndex + 1) / state.currentSession.questions.length : 0,
    },
  };
}