
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, Home, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChildren } from '@/contexts/ChildrenContext';
import { useActivities } from '@/contexts/ActivitiesContext';
import { Activity, Question } from '@/types/Activity';
import { motion } from 'framer-motion';

const ChildActivity = () => {
  const { childId, activityId } = useParams<{ childId: string; activityId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTeacher } = useAuth();
  const { getChildById } = useChildren();
  const { getActivityById, saveProgress } = useActivities();
  
  const [child, setChild] = useState<any>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    if (!currentTeacher || !childId || !activityId) {
      navigate('/teacher/dashboard');
      return;
    }
    
    const childData = getChildById(childId);
    const activityData = getActivityById(activityId);
    
    if (!childData || !activityData) {
      toast({
        title: "Resource not found",
        description: "The child or activity could not be found.",
        variant: "destructive",
      });
      navigate('/teacher/dashboard');
      return;
    }
    
    setChild(childData);
    setActivity(activityData);
    setScore({ correct: 0, total: activityData.questions.length });
  }, [currentTeacher, childId, activityId, getChildById, getActivityById, navigate, toast]);

  const handleSelectOption = async (optionId: string) => {
    if (showFeedback) return; // Prevent changing answer during feedback
    
    setSelectedOptionId(optionId);
    
    if (!activity || !child) return;
    
    const currentQuestion = activity.questions[currentQuestionIndex];
    const selectedOption = currentQuestion.options.find(o => o.id === optionId);
    
    if (!selectedOption) return;
    
    setIsCorrect(selectedOption.isCorrect);
    setShowFeedback(true);
    
    // Save progress to the database
    await saveProgress(
      child.id,
      activity.id,
      currentQuestion.id,
      optionId,
      selectedOption.isCorrect
    );
    
    // Update score
    if (selectedOption.isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    }
    
    // Wait for feedback display
    setTimeout(() => {
      if (currentQuestionIndex < activity.questions.length - 1) {
        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOptionId(null);
        setIsCorrect(null);
        setShowFeedback(false);
      } else {
        // Activity completed
        setCompleted(true);
      }
    }, 2000);
  };

  const getCurrentQuestion = (): Question | null => {
    if (!activity) return null;
    return activity.questions[currentQuestionIndex];
  };

  const handleFinish = () => {
    navigate(`/child/welcome/${childId}`);
  };

  if (!child || !activity) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  
  if (!currentQuestion) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No questions found!</p>
      </div>
    );
  }

  // Render the completion screen if activity is complete
  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col">
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full"
          >
            <Card className="border-4 border-waai-primary shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <motion.div 
                    animate={{ 
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    <CheckCircle className="h-20 w-20 text-waai-primary mx-auto" />
                  </motion.div>
                </div>
                
                <h1 className="text-3xl font-bold mb-4 text-waai-primary">
                  Great Job, {child.name}!
                </h1>
                
                <p className="text-xl mb-6">
                  You completed the activity: 
                  <span className="font-semibold block mt-2">{activity.title}</span>
                </p>
                
                <div className="bg-waai-primary/10 rounded-lg p-4 mb-8">
                  <p className="text-2xl font-bold">
                    Score: {score.correct} / {score.total}
                  </p>
                  <div className="h-4 bg-gray-200 rounded-full mt-2">
                    <div 
                      className="h-4 bg-waai-primary rounded-full"
                      style={{ width: `${(score.correct / score.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <Button
                  onClick={handleFinish}
                  size="lg"
                  className="bg-waai-secondary hover:bg-waai-accent2 w-full py-6 text-lg"
                >
                  <Home className="mr-2 h-6 w-6" />
                  Go Back Home
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  // Render the main activity screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-waai-primary/20 rounded-full flex items-center justify-center">
              <span className="font-bold text-waai-primary">{currentQuestionIndex + 1}</span>
            </div>
            <span className="text-gray-500 ml-2">of {activity.questions.length}</span>
          </div>
          
          <h1 className="text-lg font-medium text-center text-waai-primary">{activity.title}</h1>
          
          <div>
            <Button
              variant="ghost"
              onClick={handleFinish}
              className="text-gray-500"
            >
              Exit
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="max-w-2xl w-full flex flex-col items-center">
          {/* Waai Character */}
          <div className="mb-6">
            <img 
              src="https://api.dicebear.com/7.x/bottts/svg?seed=Waai" 
              alt="Waai character" 
              className="h-24 w-24"
            />
          </div>
          
          <motion.div
            key={currentQuestion.id}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Card className="border-2 border-waai-primary/20 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6 text-center">
                  {currentQuestion.text}
                </h2>
                
                <div className="space-y-4">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => !showFeedback && handleSelectOption(option.id)}
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
                        <span className="text-green-600">Correct! Great job!</span>
                      ) : (
                        <span className="text-red-600">Not quite right. Let's keep learning!</span>
                      )}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ChildActivity;
