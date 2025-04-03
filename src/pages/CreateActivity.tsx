
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Save, BookOpen, HelpCircle, FileImage } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useActivities } from '@/contexts/ActivitiesContext';
import { Question, QuestionType, Option, MediaFile } from '@/types/Activity';
import QuestionForm from '@/components/QuestionForm';
import MediaUploader from '@/components/MediaUploader';

const CreateActivity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTeacher } = useAuth();
  const { createActivity } = useActivities();
  
  const [title, setTitle] = useState('');
  const [goals, setGoals] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [coverMedia, setCoverMedia] = useState<MediaFile | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is authenticated
  React.useEffect(() => {
    if (!currentTeacher) {
      navigate('/teacher/login');
    }
  }, [currentTeacher, navigate]);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      text: '',
      type: 'multiple_choice',
      options: [
        { id: `opt_${Date.now()}_1`, text: '', isCorrect: false },
        { id: `opt_${Date.now()}_2`, text: '', isCorrect: false },
        { id: `opt_${Date.now()}_3`, text: '', isCorrect: false },
        { id: `opt_${Date.now()}_4`, text: '', isCorrect: false }
      ]
    };
    
    setQuestions([...questions, newQuestion]);
  };

  const handleAddTrueFalseQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      text: '',
      type: 'true_false',
      options: [
        { id: `opt_${Date.now()}_true`, text: 'True', isCorrect: false },
        { id: `opt_${Date.now()}_false`, text: 'False', isCorrect: false }
      ]
    };
    
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionTextChange = (id: string, text: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, text } : q
    ));
  };

  const handleOptionTextChange = (questionId: string, optionId: string, text: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.map(opt => 
              opt.id === optionId ? { ...opt, text } : opt
            ) 
          } 
        : q
    ));
  };

  const handleCorrectOptionChange = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.map(opt => 
              ({ ...opt, isCorrect: opt.id === optionId })
            ) 
          } 
        : q
    ));
  };

  const handleQuestionMediaChange = (questionId: string, media?: MediaFile) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, media } : q
    ));
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleBack = () => {
    navigate('/teacher/dashboard');
  };

  const validateActivity = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for this activity.",
        variant: "destructive",
      });
      return false;
    }

    if (!goals.trim()) {
      toast({
        title: "Learning goals required",
        description: "Please enter the learning goals for this activity.",
        variant: "destructive",
      });
      return false;
    }

    if (questions.length === 0) {
      toast({
        title: "Questions required",
        description: "Please add at least one question to the activity.",
        variant: "destructive",
      });
      return false;
    }

    for (const question of questions) {
      if (!question.text.trim()) {
        toast({
          title: "Question text required",
          description: "Please enter text for all questions.",
          variant: "destructive",
        });
        return false;
      }

      const hasCorrectOption = question.options.some(opt => opt.isCorrect);
      if (!hasCorrectOption) {
        toast({
          title: "Correct answer required",
          description: "Please mark a correct answer for each question.",
          variant: "destructive",
        });
        return false;
      }

      for (const option of question.options) {
        if (question.type === 'multiple_choice' && !option.text.trim()) {
          toast({
            title: "Option text required",
            description: "Please enter text for all options in multiple choice questions.",
            variant: "destructive",
          });
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateActivity()) return;

    setIsSubmitting(true);
    
    try {
      const activityId = await createActivity(title, goals, questions, coverMedia);
      
      if (activityId) {
        toast({
          title: "Activity created",
          description: "Your educational activity has been created successfully.",
        });
        navigate('/teacher/dashboard');
      } else {
        toast({
          title: "Failed to create activity",
          description: "There was an error creating the activity. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Create activity error:", error);
      toast({
        title: "An error occurred",
        description: "Could not create activity. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentTeacher) {
    return null; // Will redirect in useEffect
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
          <h1 className="text-2xl font-bold mb-6">Create New Educational Activity</h1>
          
          <Card className="mb-8 border-waai-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-waai-primary">
                <BookOpen className="mr-2 h-5 w-5" />
                Activity Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Activity Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Learning Computer Parts"
                  className="text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goals">Learning Goals</Label>
                <Textarea
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="Describe what children will learn from this activity..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  Cover Image/Video (Optional)
                </Label>
                <MediaUploader 
                  onFileUploaded={setCoverMedia}
                  currentMedia={coverMedia}
                  onRemoveMedia={() => setCoverMedia(undefined)}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Questions</h2>
            <div className="flex gap-3">
              <Button
                onClick={handleAddQuestion}
                variant="outline"
                className="text-waai-primary border-waai-primary"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Multiple Choice
              </Button>
              <Button
                onClick={handleAddTrueFalseQuestion}
                variant="outline"
                className="text-waai-secondary border-waai-secondary"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add True/False
              </Button>
            </div>
          </div>
          
          {questions.length === 0 ? (
            <Card className="text-center py-12 bg-gray-50 border-dashed">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Questions Added Yet</h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">
                Add at least one question to your activity using the buttons above.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <QuestionForm
                  key={question.id}
                  question={question}
                  index={index}
                  onTextChange={handleQuestionTextChange}
                  onOptionTextChange={handleOptionTextChange}
                  onCorrectOptionChange={handleCorrectOptionChange}
                  onRemove={handleRemoveQuestion}
                  onMediaChange={handleQuestionMediaChange}
                />
              ))}
            </div>
          )}
          
          <div className="mt-8 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || questions.length === 0}
              className="bg-waai-primary hover:bg-waai-accent1"
            >
              <Save className="mr-2 h-5 w-5" />
              {isSubmitting ? "Saving..." : "Save Activity"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateActivity;
