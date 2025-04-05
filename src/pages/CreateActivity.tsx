
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
        { id: `opt_${Date.now()}_true`, text: 'صحيح', isCorrect: false },
        { id: `opt_${Date.now()}_false`, text: 'خطأ', isCorrect: false }
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
        title: "العنوان مطلوب",
        description: "يرجى إدخال عنوان لهذا النشاط.",
        variant: "destructive",
      });
      return false;
    }

    if (!goals.trim()) {
      toast({
        title: "أهداف التعلم مطلوبة",
        description: "يرجى إدخال أهداف التعلم لهذا النشاط.",
        variant: "destructive",
      });
      return false;
    }

    if (questions.length === 0) {
      toast({
        title: "الأسئلة مطلوبة",
        description: "يرجى إضافة سؤال واحد على الأقل للنشاط.",
        variant: "destructive",
      });
      return false;
    }

    for (const question of questions) {
      if (!question.text.trim()) {
        toast({
          title: "نص السؤال مطلوب",
          description: "يرجى إدخال نص لجميع الأسئلة.",
          variant: "destructive",
        });
        return false;
      }

      const hasCorrectOption = question.options.some(opt => opt.isCorrect);
      if (!hasCorrectOption) {
        toast({
          title: "الإجابة الصحيحة مطلوبة",
          description: "يرجى تحديد إجابة صحيحة لكل سؤال.",
          variant: "destructive",
        });
        return false;
      }

      for (const option of question.options) {
        if (question.type === 'multiple_choice' && !option.text.trim()) {
          toast({
            title: "نص الخيار مطلوب",
            description: "يرجى إدخال نص لجميع الخيارات في أسئلة الاختيار من متعدد.",
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
          title: "تم إنشاء النشاط",
          description: "تم إنشاء النشاط التعليمي بنجاح.",
        });
        navigate('/teacher/dashboard');
      } else {
        toast({
          title: "فشل في إنشاء النشاط",
          description: "حدث خطأ أثناء إنشاء النشاط. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Create activity error:", error);
      toast({
        title: "حدث خطأ",
        description: "تعذر إنشاء النشاط. يرجى المحاولة مرة أخرى لاحقًا.",
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
            العودة للوحة التحكم
          </Button>
          
          <Logo />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">إنشاء نشاط تعليمي جديد</h1>
          
          <Card className="mb-8 border-waai-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-waai-primary">
                <BookOpen className="ml-2 h-5 w-5" />
                تفاصيل النشاط
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان النشاط</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثل: تعلم أجزاء الحاسوب"
                  className="text-lg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goals">أهداف التعلم</Label>
                <Textarea
                  id="goals"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="صف ما سيتعلمه الأطفال من هذا النشاط..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  صورة/فيديو الغلاف (اختياري)
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
            <h2 className="text-xl font-semibold">الأسئلة</h2>
            <div className="flex gap-3">
              <Button
                onClick={handleAddQuestion}
                variant="outline"
                className="text-waai-primary border-waai-primary"
              >
                <Plus className="ml-2 h-4 w-4" />
                إضافة اختيار متعدد
              </Button>
              <Button
                onClick={handleAddTrueFalseQuestion}
                variant="outline"
                className="text-waai-secondary border-waai-secondary"
              >
                <Plus className="ml-2 h-4 w-4" />
                إضافة صح/خطأ
              </Button>
            </div>
          </div>
          
          {questions.length === 0 ? (
            <Card className="text-center py-12 bg-gray-50 border-dashed">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">لم تتم إضافة أسئلة بعد</h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">
                أضف سؤالاً واحداً على الأقل إلى نشاطك باستخدام الأزرار أعلاه.
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
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || questions.length === 0}
              className="bg-waai-primary hover:bg-waai-accent1"
            >
              <Save className="ml-2 h-5 w-5" />
              {isSubmitting ? "جاري الحفظ..." : "حفظ النشاط"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateActivity;
