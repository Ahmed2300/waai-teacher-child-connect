
import React from 'react';
import { Button } from "@/components/ui/button";

interface ActivityHeaderProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  activityTitle: string;
  onExit: () => void;
}

const ActivityHeader: React.FC<ActivityHeaderProps> = ({
  currentQuestionIndex,
  totalQuestions,
  activityTitle,
  onExit
}) => {
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-waai-primary/20 rounded-full flex items-center justify-center">
            <span className="font-bold text-waai-primary">{currentQuestionIndex + 1}</span>
          </div>
          <span className="text-gray-500 mr-2">{totalQuestions} من</span>
        </div>
        
        <h1 className="text-lg font-medium text-center text-waai-primary">{activityTitle}</h1>
        
        <div>
          <Button
            variant="ghost"
            onClick={onExit}
            className="text-gray-500"
          >
            خروج
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ActivityHeader;
