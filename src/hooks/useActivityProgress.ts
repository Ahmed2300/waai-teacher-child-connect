
import { useState, useEffect } from 'react';
import { useActivities } from '@/contexts/ActivitiesContext';
import { Activity, Question } from '@/types/Activity';

interface UseActivityProgressProps {
  childId: string;
  activityId: string;
  activity: Activity | null;
}

interface ActivityProgressState {
  currentQuestionIndex: number;
  selectedOptionId: string | null;
  isCorrect: boolean | null;
  showFeedback: boolean;
  completed: boolean;
  score: {
    correct: number;
    total: number;
  };
  answeredQuestions: string[];
}

export const useActivityProgress = ({ childId, activityId, activity }: UseActivityProgressProps) => {
  const { saveProgress, getChildProgress } = useActivities();
  
  const [state, setState] = useState<ActivityProgressState>({
    currentQuestionIndex: 0,
    selectedOptionId: null,
    isCorrect: null,
    showFeedback: false,
    completed: false,
    score: { correct: 0, total: activity?.questions.length || 0 },
    answeredQuestions: [],
  });
  
  useEffect(() => {
    if (!childId || !activityId || !activity) return;
    
    // Initialize the score
    setState(prev => ({
      ...prev,
      score: { ...prev.score, total: activity.questions.length },
    }));
    
    // Check if there's any progress already for this activity
    const loadProgress = async () => {
      const progressData = await getChildProgress(childId, activityId);
      if (progressData && progressData.length > 0 && progressData[0].answers) {
        const answers = progressData[0].answers;
        const answered = Object.keys(answers);
        
        // Calculate correct answers
        const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
        
        setState(prev => ({
          ...prev,
          answeredQuestions: answered,
          score: { ...prev.score, correct: correctCount },
        }));
      }
    };
    
    loadProgress();
  }, [childId, activityId, activity, getChildProgress]);
  
  const handleSelectOption = async (optionId: string) => {
    if (state.showFeedback || !activity) return; // Prevent changing answer during feedback
    
    setState(prev => ({ ...prev, selectedOptionId: optionId }));
    
    const currentQuestion = activity.questions[state.currentQuestionIndex];
    const selectedOption = currentQuestion.options.find(o => o.id === optionId);
    
    if (!selectedOption) return;
    
    const isAnswerCorrect = selectedOption.isCorrect;
    
    setState(prev => ({
      ...prev,
      isCorrect: isAnswerCorrect,
      showFeedback: true,
      answeredQuestions: prev.answeredQuestions.includes(currentQuestion.id)
        ? prev.answeredQuestions
        : [...prev.answeredQuestions, currentQuestion.id],
    }));
    
    // Save progress to the database
    await saveProgress(
      childId,
      activityId,
      currentQuestion.id,
      optionId,
      isAnswerCorrect
    );
    
    // Update score - only count if this is the first time answering this question
    if (!state.answeredQuestions.includes(currentQuestion.id) && isAnswerCorrect) {
      setState(prev => ({
        ...prev,
        score: { ...prev.score, correct: prev.score.correct + 1 },
      }));
    }
    
    // Wait for feedback display
    setTimeout(() => {
      if (state.currentQuestionIndex < activity.questions.length - 1) {
        // Move to next question
        setState(prev => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          selectedOptionId: null,
          isCorrect: null,
          showFeedback: false,
        }));
      } else {
        // Activity completed
        setState(prev => ({ ...prev, completed: true }));
      }
    }, 2000);
  };
  
  const getCurrentQuestion = (): Question | null => {
    if (!activity) return null;
    return activity.questions[state.currentQuestionIndex];
  };
  
  return {
    ...state,
    handleSelectOption,
    getCurrentQuestion,
  };
};

export default useActivityProgress;
