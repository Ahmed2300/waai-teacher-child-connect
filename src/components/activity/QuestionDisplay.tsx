
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle } from 'lucide-react';
import { Question } from '@/types/Activity';

interface QuestionDisplayProps {
  question: Question;
  selectedOptionId: string | null;
  showFeedback: boolean;
  isCorrect: boolean | null;
  onSelectOption: (optionId: string) => void;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  selectedOptionId,
  showFeedback,
  isCorrect,
  onSelectOption
}) => {
  return (
    <motion.div
      key={question.id}
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="border-2 border-waai-primary/20 shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-center">
            {question.text}
          </h2>
          
          <div className="space-y-4" dir="rtl">
            {question.options.map((option) => (
              <div
                key={option.id}
                onClick={() => !showFeedback && onSelectOption(option.id)}
                className={`
                  p-4 rounded-lg cursor-pointer transition-all transform hover:scale-105
                  ${selectedOptionId === option.id && showFeedback && option.isCorrect
                    ? 'bg-green-100 border-2 border-green-500'
                    : selectedOptionId === option.id && showFeedback && !option.isCorrect
                    ? 'bg-red-100 border-2 border-red-500'
                    : selectedOptionId === option.id
                    ? 'bg-waai-primary/20 border-2 border-waai-primary'
                    : 'bg-white border-2 border-gray-200 hover:border-waai-primary/50'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{option.text}</span>
                  
                  {showFeedback && selectedOptionId === option.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {option.isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-lg text-center"
            >
              <p className="text-xl font-bold">
                {isCorrect ? (
                  <span className="text-green-600">إجابة صحيحة! أحسنت!</span>
                ) : (
                  <span className="text-red-600">ليست الإجابة الصحيحة. لنواصل التعلم!</span>
                )}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuestionDisplay;
