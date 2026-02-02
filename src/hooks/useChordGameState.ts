import { useReducer, useCallback, useEffect, useRef } from 'react';
import type { ChordGameState, ChordSession, ChordAnswer, ChordQuality } from '../types/chord';
import type { Instrument } from '../types/game';
import { CHORD_LEVELS } from '../utils/constants';
import { chordGenerator } from '../services/chordGenerator';
import { database } from '../services/database';

type ChordAction =
  | { type: 'START_GAME'; level: number; instrument: Instrument }
  | { type: 'SUBMIT_ANSWER'; answer: ChordQuality; responseTime: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'END_GAME' }
  | { type: 'SET_LEVEL'; level: number }
  | { type: 'SET_INSTRUMENT'; instrument: Instrument };

const initialState: ChordGameState = {
  currentSession: null,
  currentQuestionIndex: 0,
  showResult: false,
  selectedLevel: 1,
  selectedInstrument: 'piano',
};

function chordReducer(state: ChordGameState, action: ChordAction): ChordGameState {
  switch (action.type) {
    case 'START_GAME': {
      const level = CHORD_LEVELS.find(l => l.id === action.level) ?? CHORD_LEVELS[0];
      const questions = chordGenerator.generateQuestions(level, action.instrument);

      const session: ChordSession = {
        level: level.id,
        instrument: action.instrument,
        questions,
        answers: [],
        startTime: Date.now(),
      };

      return {
        ...state,
        currentSession: session,
        currentQuestionIndex: 0,
        showResult: false,
      };
    }

    case 'SUBMIT_ANSWER': {
      if (!state.currentSession) return state;

      const currentQuestion = state.currentSession.questions[state.currentQuestionIndex];
      const isCorrect = chordGenerator.validateAnswer(currentQuestion, action.answer);

      const answer: ChordAnswer = {
        questionId: currentQuestion.id,
        userAnswer: action.answer,
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

      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        showResult: false,
      };
    }

    case 'END_GAME': {
      return {
        ...initialState,
        selectedLevel: state.selectedLevel,
        selectedInstrument: state.selectedInstrument,
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

export function useChordGameState() {
  const [state, dispatch] = useReducer(chordReducer, initialState);
  const savedSessionIds = useRef(new Set<string>());

  useEffect(() => {
    if (
      state.currentSession &&
      state.currentSession.answers.length === state.currentSession.questions.length
    ) {
      const sessionKey = `chords-${state.currentSession.level}-${state.currentSession.startTime}`;
      if (!savedSessionIds.current.has(sessionKey)) {
        savedSessionIds.current.add(sessionKey);
        database.saveChordSession(state.currentSession);
      }
    }
  }, [state.currentSession]);

  const startGame = useCallback((level: number, instrument: Instrument) => {
    dispatch({ type: 'START_GAME', level, instrument });
  }, []);

  const submitAnswer = useCallback((answer: ChordQuality, responseTime: number) => {
    dispatch({ type: 'SUBMIT_ANSWER', answer, responseTime });
  }, []);

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  const endGame = useCallback(() => {
    dispatch({ type: 'END_GAME' });
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
      setLevel,
      setInstrument,
    },
    computed: {
      currentQuestion,
      isGameComplete,
    },
  };
}
