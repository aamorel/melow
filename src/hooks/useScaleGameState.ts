import { useReducer, useCallback, useEffect, useRef } from 'react';
import type { ScaleGameState, ScaleSession, ScaleAnswer, ScaleType } from '../types/scale';
import type { Instrument } from '../types/game';
import { SCALE_LEVELS } from '../utils/constants';
import { scaleGenerator } from '../services/scaleGenerator';
import { database } from '../services/database';

type ScaleAction =
  | { type: 'START_GAME'; level: number; instrument: Instrument }
  | { type: 'SUBMIT_ANSWER'; answer: ScaleType; responseTime: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'END_GAME' }
  | { type: 'SET_LEVEL'; level: number }
  | { type: 'SET_INSTRUMENT'; instrument: Instrument };

const initialState: ScaleGameState = {
  currentSession: null,
  currentQuestionIndex: 0,
  showResult: false,
  selectedLevel: 1,
  selectedInstrument: 'piano',
};

function scaleReducer(state: ScaleGameState, action: ScaleAction): ScaleGameState {
  switch (action.type) {
    case 'START_GAME': {
      const level = SCALE_LEVELS.find(l => l.id === action.level) ?? SCALE_LEVELS[0];
      const questions = scaleGenerator.generateQuestions(level, action.instrument);

      const session: ScaleSession = {
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
      const isCorrect = scaleGenerator.validateAnswer(currentQuestion, action.answer);

      const answer: ScaleAnswer = {
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

export function useScaleGameState() {
  const [state, dispatch] = useReducer(scaleReducer, initialState);
  const savedSessionIds = useRef(new Set<string>());

  useEffect(() => {
    if (
      state.currentSession &&
      state.currentSession.answers.length === state.currentSession.questions.length
    ) {
      const sessionKey = `scales-${state.currentSession.level}-${state.currentSession.startTime}`;
      if (!savedSessionIds.current.has(sessionKey)) {
        savedSessionIds.current.add(sessionKey);
        database.saveScaleSession(state.currentSession);
      }
    }
  }, [state.currentSession]);

  const startGame = useCallback((level: number, instrument: Instrument) => {
    dispatch({ type: 'START_GAME', level, instrument });
  }, []);

  const submitAnswer = useCallback((answer: ScaleType, responseTime: number) => {
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
