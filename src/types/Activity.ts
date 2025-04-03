
// Activity types
export type QuestionType = 'multiple_choice' | 'true_false';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: Option[];
}

export interface Activity {
  id: string;
  title: string;
  goals: string;
  questions: Question[];
  createdAt: number;
  teacherId: string;
}

export interface ActivityProgress {
  activityId: string;
  childId: string;
  answers: {
    [questionId: string]: {
      selectedOptionId: string;
      isCorrect: boolean;
      answeredAt: number;
    }
  };
  startedAt: number;
  completedAt?: number;
  score?: number;
}
