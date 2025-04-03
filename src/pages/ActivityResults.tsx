
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, CheckCircle, XCircle, BarChart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChildren } from '@/contexts/ChildrenContext';
import { useActivities } from '@/contexts/ActivitiesContext';
import { Activity, ActivityProgress } from '@/types/Activity';
import Logo from '@/components/Logo';

const ActivityResults = () => {
  const { childId, activityId } = useParams<{ childId: string; activityId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTeacher } = useAuth();
  const { getChildById } = useChildren();
  const { getActivityById, getChildProgress } = useActivities();
  
  const [child, setChild] = useState<any>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [progress, setProgress] = useState<ActivityProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentTeacher || !childId || !activityId) {
        navigate('/teacher/dashboard');
        return;
      }
      
      try {
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
        
        // Get progress data
        const progressData = await getChildProgress(childId, activityId);
        if (progressData && progressData.length > 0) {
          setProgress(progressData[0]);
        }
      } catch (error) {
        console.error("Failed to fetch results:", error);
        toast({
          title: "Failed to load results",
          description: "There was an error loading the activity results.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentTeacher, childId, activityId, getChildById, getActivityById, getChildProgress, navigate, toast]);

  const handleBack = () => {
    navigate('/teacher/dashboard');
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const calculateScorePercentage = () => {
    if (!progress || !activity) return 0;
    
    const totalAnswered = Object.keys(progress.answers).length;
    if (totalAnswered === 0) return 0;
    
    const correctAnswers = Object.values(progress.answers).filter(answer => answer.isCorrect).length;
    return Math.round((correctAnswers / totalAnswered) * 100);
  };

  if (isLoading || !child || !activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading results...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-waai-primary"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
          
          <Logo />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Activity Results</h1>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 font-medium">{child.name}'s Performance</span>
            </div>
          </div>
          
          <Card className="mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-waai-primary flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                {activity.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-500 mb-1">Questions</p>
                  <p className="text-2xl font-bold">
                    {progress ? Object.keys(progress.answers).length : 0} / {activity.questions.length}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-500 mb-1">Score</p>
                  <p className="text-2xl font-bold">
                    {progress ? calculateScorePercentage() : 0}%
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-gray-500 mb-1">Completed On</p>
                  <p className="text-sm font-medium">
                    {progress && progress.startedAt ? formatDate(progress.startedAt) : 'Not completed yet'}
                  </p>
                </div>
              </div>
              
              {!progress || Object.keys(progress.answers).length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-2">No Activity Data Yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {child.name} hasn't completed this activity yet. Come back after they've answered some questions.
                  </p>
                </div>
              ) : (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Question Details</h3>
                  <div className="space-y-4">
                    {activity.questions.map((question, index) => {
                      const answer = progress?.answers[question.id];
                      const hasAnswered = !!answer;
                      const selectedOption = question.options.find(opt => opt.id === answer?.selectedOptionId);
                      const correctOption = question.options.find(opt => opt.isCorrect);
                      
                      return (
                        <div key={question.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium">
                              {index + 1}. {question.text}
                            </h4>
                            {hasAnswered && (
                              <div className={`flex items-center ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {answer.isCorrect ? (
                                  <CheckCircle className="h-5 w-5 mr-1" />
                                ) : (
                                  <XCircle className="h-5 w-5 mr-1" />
                                )}
                                <span>{answer.isCorrect ? 'Correct' : 'Incorrect'}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="pl-4 space-y-2">
                            {question.options.map((option) => (
                              <div 
                                key={option.id}
                                className={`
                                  p-2 rounded
                                  ${hasAnswered && option.id === answer.selectedOptionId && option.isCorrect
                                    ? 'bg-green-100'
                                    : hasAnswered && option.id === answer.selectedOptionId && !option.isCorrect
                                    ? 'bg-red-100'
                                    : hasAnswered && option.isCorrect
                                    ? 'bg-green-50'
                                    : ''
                                  }
                                `}
                              >
                                <div className="flex items-center">
                                  <div className="w-5 h-5 flex items-center justify-center mr-2">
                                    {hasAnswered && option.id === answer.selectedOptionId && (
                                      <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                                    )}
                                  </div>
                                  <span>
                                    {option.text}
                                    {option.isCorrect && (
                                      <span className="text-green-600 ml-2">(Correct answer)</span>
                                    )}
                                  </span>
                                </div>
                              </div>
                            ))}
                            
                            {!hasAnswered && (
                              <p className="text-gray-500 italic">No answer provided</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Dashboard
            </Button>
            
            <Button
              onClick={() => navigate(`/child/activity/${childId}/${activityId}`)}
              className="bg-waai-primary hover:bg-waai-accent1"
            >
              Start Activity Again
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivityResults;
