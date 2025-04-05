
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { BookOpen, UserPlus, LogIn } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col">
      <header className="container mx-auto py-6 flex justify-between items-center">
        <Logo size="large" />
        <div className="space-x-4">
          <Button
            variant="outline"
            className="border-waai-primary text-waai-primary hover:bg-waai-primary hover:text-white"
            onClick={() => navigate('/teacher/login')}
          >
            <LogIn className="mr-2 h-4 w-4" />
            تسجيل الدخول
          </Button>
          <Button
            onClick={() => navigate('/teacher/register')}
            className="bg-waai-primary hover:bg-waai-accent1"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            إنشاء حساب
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-center gap-12">
        <div className="md:w-1/2 text-center md:text-right">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-waai-primary to-waai-secondary bg-clip-text text-transparent">
            ربط المعلمين والأطفال
          </h1>
          <p className="text-xl mb-8 text-gray-700 max-w-xl">
            منصة آمنة وجذابة للمعلمين لإنشاء ملفات تعريف لطلابهم وتتبع تقدمهم.
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Button 
              size="lg" 
              className="bg-waai-primary hover:bg-waai-accent1"
              onClick={() => navigate('/teacher/register')}
            >
              ابدأ الآن
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-waai-accent2 text-waai-accent2 hover:bg-waai-accent2 hover:text-white"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              اعرف المزيد
            </Button>
          </div>
        </div>

        <div className="md:w-1/2 grid grid-cols-2 gap-6">
          <Card className="transform rotate-2 shadow-lg border-waai-primary/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-waai-primary mb-2">للمعلمين</h3>
              <p className="text-gray-600">إدارة ملفات الطلاب، وتتبع التقدم، وإنشاء مسارات تعلم مخصصة.</p>
            </CardContent>
          </Card>
          <Card className="transform -rotate-2 shadow-lg border-waai-secondary/20 mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-waai-secondary mb-2">للأطفال</h3>
              <p className="text-gray-600">واجهة ممتعة وجذابة مع شخصيات رمزية مخصصة وتعلم تفاعلي.</p>
            </CardContent>
          </Card>
          <Card className="transform -rotate-1 shadow-lg border-waai-accent1/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-waai-accent1 mb-2">آمن</h3>
              <p className="text-gray-600">مصادقة ثنائية العوامل مع بريد إلكتروني وحماية رقم التعريف الشخصي لحسابات المعلمين.</p>
            </CardContent>
          </Card>
          <Card className="transform rotate-1 shadow-lg border-waai-accent2/20 mt-4">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-waai-accent2 mb-2">متكيف</h3>
              <p className="text-gray-600">يعمل بشكل مثالي في الإعدادات الصفية أو في جلسات التعلم الفردية.</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-white py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2023 وَعْي. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
