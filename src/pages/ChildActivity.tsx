
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { useChildren } from '@/contexts/ChildrenContext';
import { useActivities } from '@/contexts/ActivitiesContext';
import ActivityHeader from '@/components/activity/ActivityHeader';
import QuestionDisplay from '@/components/activity/QuestionDisplay';
import CompletionScreen from '@/components/activity/CompletionScreen';
import useActivityProgress from '@/hooks/useActivityProgress';

const ChildActivity = () => {
  const { childId, activityId } = useParams<{ childId: string; activityId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTeacher } = useAuth();
  const { getChildById } = useChildren();
  const { getActivityById } = useActivities();
  
  const [child, setChild] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);

  useEffect(() => {
    if (!currentTeacher || !childId || !activityId) {
      navigate('/teacher/dashboard');
      return;
    }
    
    const childData = getChildById(childId);
    const activityData = getActivityById(activityId);
    
    if (!childData || !activityData) {
      toast({
        title: "لم يتم العثور على المصدر",
        description: "تعذر العثور على الطفل أو النشاط.",
        variant: "destructive",
      });
      navigate('/teacher/dashboard');
      return;
    }
    
    setChild(childData);
    setActivity(activityData);
    
  }, [currentTeacher, childId, activityId, getChildById, getActivityById, navigate, toast]);

  const {
    currentQuestionIndex,
    selectedOptionId,
    isCorrect,
    showFeedback,
    completed,
    score,
    handleSelectOption,
    getCurrentQuestion
  } = useActivityProgress({ 
    childId: childId || '', 
    activityId: activityId || '', 
    activity 
  });

  const handleFinish = () => {
    if (childId) {
      navigate(`/child/welcome/${childId}`);
    } else {
      navigate('/teacher/dashboard');
    }
  };

  if (!child || !activity) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  
  if (!currentQuestion) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>لم يتم العثور على أسئلة!</p>
      </div>
    );
  }

  // Render the completion screen if activity is complete
  if (completed) {
    return (
      <CompletionScreen 
        childName={child.name}
        activityTitle={activity.title}
        score={score}
        onFinish={handleFinish}
      />
    );
  }

  // Render the main activity screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col" dir="rtl">
      <ActivityHeader 
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={activity.questions.length}
        activityTitle={activity.title}
        onExit={handleFinish}
      />

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
          
          <QuestionDisplay 
            question={currentQuestion}
            selectedOptionId={selectedOptionId}
            showFeedback={showFeedback}
            isCorrect={isCorrect}
            onSelectOption={handleSelectOption}
          />
        </div>
      </main>
    </div>
  );
};

export default ChildActivity;
