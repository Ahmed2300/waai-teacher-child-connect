
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BookOpen, Play, List, Calendar, Info } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useActivities } from '@/contexts/ActivitiesContext';
import { useChildren } from '@/contexts/ChildrenContext';
import { Activity } from '@/types/Activity';

const ActivityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTeacher } = useAuth();
  const { getActivityById } = useActivities();
  const { children } = useChildren();
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>('');

  useEffect(() => {
    if (!currentTeacher) {
      navigate('/teacher/login');
      return;
    }
    
    if (!id) {
      navigate('/teacher/dashboard');
      return;
    }
    
    const activityData = getActivityById(id);
    if (activityData) {
      setActivity(activityData);
    } else {
      toast({
        title: "Activity not found",
        description: "The requested activity could not be found.",
        variant: "destructive",
      });
      navigate('/teacher/dashboard');
    }
  }, [currentTeacher, id, getActivityById, navigate, toast]);

  const handleBack = () => {
    navigate('/teacher/dashboard');
  };

  const handleStartActivity = () => {
    if (!selectedChildId) {
      toast({
        title: "Select a child",
        description: "Please select a child to start the activity with.",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/child/activity/${selectedChildId}/${activity?.id}`);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!activity) {
    return null;
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
          <h1 className="text-2xl font-bold mb-2">{activity.title}</h1>
          <p className="text-gray-500 mb-6 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Created on {formatDate(activity.createdAt)}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-waai-primary">
                  <List className="h-5 w-5 mr-2" />
                  Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{activity.questions.length}</p>
              </CardContent>
            </Card>
            
            <Card className="col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-waai-secondary">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Learning Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{activity.goals}</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="mr-2 h-5 w-5" />
                Questions Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity.questions.map((question, index) => (
                  <div key={question.id} className="p-4 border rounded-md">
                    <p className="font-medium mb-2">
                      {index + 1}. {question.text}
                    </p>
                    <div className="pl-6 space-y-1 text-sm text-gray-600">
                      {question.options.map((option) => (
                        <p key={option.id} className={option.isCorrect ? "font-semibold text-waai-primary" : ""}>
                          • {option.text} {option.isCorrect && "(Correct)"}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="mr-2 h-5 w-5 text-waai-primary" />
                Start Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {children.length > 0 ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select a child to start this activity:
                    </label>
                    <select
                      value={selectedChildId}
                      onChange={(e) => setSelectedChildId(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">-- Select a child --</option>
                      {children.map((child) => (
                        <option key={child.id} value={child.id}>
                          {child.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Button
                    onClick={handleStartActivity}
                    disabled={!selectedChildId}
                    className="w-full bg-waai-primary hover:bg-waai-accent1"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Start Activity with Selected Child
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-3">You need to add a child profile first.</p>
                  <Button 
                    onClick={() => navigate('/teacher/add-child')}
                    className="bg-waai-secondary hover:bg-waai-accent2"
                  >
                    Add Child
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ActivityDetail;
