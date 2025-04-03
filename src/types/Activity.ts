
// Activity types
export type QuestionType = 'multiple_choice' | 'true_false';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video';
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: Option[];
  media?: MediaFile; // Optional media for the question
}

export interface Activity {
  id: string;
  title: string;
  goals: string;
  questions: Question[];
  createdAt: number;
  teacherId: string;
  coverMedia?: MediaFile; // Optional cover media for the activity
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
