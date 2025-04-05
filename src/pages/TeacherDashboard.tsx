
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, LogOut, User, Settings, UserPlus, BookOpen, Play, Calendar, BarChart4 } from 'lucide-react';
import Logo from '@/components/Logo';
import ChildCard from '@/components/ChildCard';
import AvatarSelector from '@/components/AvatarSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useChildren } from '@/contexts/ChildrenContext';
import { useActivities } from '@/contexts/ActivitiesContext';

const generateRandomName = () => {
  const femaleNames = ['لمى', 'سارة', 'نور', 'ريم', 'هند', 'جنى', 'ملك'];
  const maleNames = ['عمر', 'أحمد', 'يوسف', 'كريم', 'علي', 'زياد', 'حسن'];
  const allNames = [...femaleNames, ...maleNames];
  return allNames[Math.floor(Math.random() * allNames.length)];
};

const generateRandomPin = () => {
  // Generate a random 4-digit PIN
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTeacher, logout } = useAuth();
  const { children, addChild, isLoading: isChildrenLoading } = useChildren();
  const { activities, isLoading: isActivitiesLoading } = useActivities();
  
  const [newChildName, setNewChildName] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState("");
  const [childPin, setChildPin] = useState("");
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPinRequired, setIsPinRequired] = useState(false);

  useEffect(() => {
    if (!currentTeacher) {
      navigate('/teacher/login');
    }
  }, [currentTeacher, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddChild = async () => {
    if (!newChildName.trim()) {
      toast({
        title: "الاسم مطلوب",
        description: "يرجى إدخال اسم للطفل.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAvatarId) {
      toast({
        title: "الصورة الرمزية مطلوبة",
        description: "يرجى اختيار صورة رمزية للطفل.",
        variant: "destructive",
      });
      return;
    }

    if (isPinRequired) {
      if (childPin.length < 4) {
        toast({
          title: "رقم تعريفي غير صالح",
          description: "يرجى إدخال رقم تعريف شخصي مكون من 4 أرقام للطفل.",
          variant: "destructive",
        });
        return;
      }

      const existingChildWithPin = children.find(child => child.pin === childPin);
      if (existingChildWithPin) {
        toast({
          title: "الرقم التعريفي مستخدم بالفعل",
          description: "هذا الرقم التعريفي مخصص بالفعل لطفل آخر. يرجى استخدام رقم تعريفي مختلف.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsAddingChild(true);
    
    try {
      const pinToUse = isPinRequired ? childPin : undefined;
      const success = await addChild(newChildName, selectedAvatarId, pinToUse);
      
      if (success) {
        toast({
          title: "تمت إضافة الطفل",
          description: `تمت إضافة ${newChildName} بنجاح.`,
        });
        setNewChildName("");
        setSelectedAvatarId("");
        setChildPin("");
        setIsPinRequired(false);
        setIsDialogOpen(false);
      } else {
        toast({
          title: "فشل في إضافة الطفل",
          description: "حدث خطأ أثناء إضافة الطفل. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Add child error:", error);
      toast({
        title: "حدث خطأ",
        description: "لا يمكن إضافة الطفل. يرجى المحاولة مرة أخرى لاحقًا.",
        variant: "destructive",
      });
    } finally {
      setIsAddingChild(false);
    }
  };

  const handleStartSession = () => {
    navigate('/child/selection');
  };

  const navigateToCreateActivity = () => {
    navigate('/teacher/create-activity');
  };

  const viewActivityDetails = (activityId: string) => {
    navigate(`/teacher/activity/${activityId}`);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!currentTeacher) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <span className="font-medium text-gray-700">مرحبًا، {currentTeacher.name}</span>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              className="text-gray-500 hover:text-waai-primary"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">لوحة تحكم المعلم</h1>
            <p className="text-gray-600">إدارة ملفات الأطفال الشخصية والأنشطة التعليمية</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleStartSession} 
              className="bg-waai-accent1 hover:bg-waai-primary"
              disabled={children.length === 0}
            >
              <User className="ml-2 h-5 w-5" />
              بدء جلسة للطفل
            </Button>
            
            <Button
              onClick={navigateToCreateActivity}
              className="bg-waai-secondary hover:bg-waai-accent2"
            >
              <BookOpen className="ml-2 h-5 w-5" />
              إنشاء نشاط
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-waai-primary hover:bg-waai-accent1">
                  <UserPlus className="ml-2 h-5 w-5" />
                  إضافة طفل
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>إضافة طفل جديد</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">اسم الطفل</Label>
                    <div className="flex gap-2">
                      <Input
                        id="name"
                        value={newChildName}
                        onChange={(e) => setNewChildName(e.target.value)}
                        placeholder="أدخل اسم الطفل"
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        onClick={generateRandomName}
                        type="button"
                      >
                        عشوائي
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="pin-required"
                      checked={isPinRequired}
                      onChange={(e) => setIsPinRequired(e.target.checked)}
                      className="rounded border-gray-300 text-waai-primary focus:ring-waai-primary"
                    />
                    <Label htmlFor="pin-required">طلب رقم تعريفي لهذا الطفل</Label>
                  </div>
                  
                  {isPinRequired && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="pin">الرقم التعريفي للطفل (4 أرقام)</Label>
                      <div className="flex gap-2">
                        <Input
                          id="pin"
                          value={childPin}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            if (value.length <= 4) {
                              setChildPin(value);
                            }
                          }}
                          placeholder="رقم تعريفي من 4 أرقام"
                          maxLength={4}
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          onClick={generateRandomPin}
                          type="button"
                        >
                          توليد
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        سيكون هذا الرقم التعريفي مطلوبًا عندما يقوم الطفل بتسجيل الدخول.
                      </p>
                    </div>
                  )}
                  
                  <AvatarSelector
                    selectedAvatarId={selectedAvatarId}
                    onSelect={setSelectedAvatarId}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">إلغاء</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleAddChild}
                    disabled={isAddingChild}
                    className="bg-waai-primary hover:bg-waai-accent1"
                  >
                    {isAddingChild ? "جاري الإضافة..." : "إضافة طفل"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="activities" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="activities" className="flex items-center">
              <BookOpen className="ml-2 h-4 w-4" />
              الأنشطة
            </TabsTrigger>
            <TabsTrigger value="children" className="flex items-center">
              <User className="ml-2 h-4 w-4" />
              الأطفال
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="activities">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">الأنشطة التعليمية</h2>
                <span className="text-sm text-gray-500">الإجمالي: {activities.length}</span>
              </div>
              
              {isActivitiesLoading ? (
                <div className="text-center py-8">
                  <p>جاري تحميل الأنشطة...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">لم يتم إنشاء أنشطة بعد</h3>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    قم بإنشاء أول نشاط تعليمي لبدء التدريس مع وعي.
                  </p>
                  <Button 
                    className="bg-waai-primary hover:bg-waai-accent1"
                    onClick={navigateToCreateActivity}
                  >
                    <PlusCircle className="ml-2 h-5 w-5" />
                    إنشاء نشاط
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activities.map((activity) => (
                    <Card 
                      key={activity.id} 
                      className="border-waai-primary/10 hover:border-waai-primary/30 transition-all hover:shadow-md"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{activity.title}</CardTitle>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 ml-1" />
                          تم الإنشاء {formatDate(activity.createdAt)}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {activity.goals}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                          <span className="flex items-center">
                            <BookOpen className="h-4 w-4 ml-1" />
                            {activity.questions.length} سؤال
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-waai-primary"
                            onClick={() => viewActivityDetails(activity.id)}
                          >
                            <BarChart4 className="h-4 w-4 ml-1" />
                            التفاصيل
                          </Button>
                          
                          <Button
                            size="sm"
                            className="flex-1 bg-waai-primary hover:bg-waai-accent1"
                            onClick={() => navigate(`/teacher/activity/${activity.id}`)}
                          >
                            <Play className="h-4 w-4 ml-1" />
                            ابدأ
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="children">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">ملفات الأطفال الشخصية</h2>
                <span className="text-sm text-gray-500">الإجمالي: {children.length}</span>
              </div>
              
              {isChildrenLoading ? (
                <div className="text-center py-8">
                  <p>جاري تحميل ملفات الأطفال الشخصية...</p>
                </div>
              ) : children.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">لم تتم إضافة أطفال بعد</h3>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    أضف أول ملف شخصي للطفل للبدء في جلسات التعلم.
                  </p>
                  <Button 
                    className="bg-waai-primary hover:bg-waai-accent1"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <PlusCircle className="ml-2 h-5 w-5" />
                    إضافة طفل
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {children.map((child) => (
                    <ChildCard key={child.id} child={child} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
