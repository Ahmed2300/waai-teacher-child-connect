
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';

// Form validation schema
const formSchema = z.object({
  email: z.string().email({ message: "يرجى إدخال عنوان بريد إلكتروني صالح" }),
  password: z.string().min(1, { message: "كلمة المرور مطلوبة" }),
  rememberMe: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const TeacherLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isLoading, isRemembered, checkRememberedLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [checkingRemembered, setCheckingRemembered] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Check for remembered login when component mounts
  useEffect(() => {
    const attemptAutoLogin = async () => {
      if (isRemembered()) {
        const success = await checkRememberedLogin();
        
        if (success) {
          toast({
            title: "مرحبًا بعودتك!",
            description: "لقد تم تسجيل دخولك تلقائيًا.",
          });
          navigate("/teacher/pin");
        }
      }
      
      setCheckingRemembered(false);
    };
    
    attemptAutoLogin();
  }, [navigate, toast, checkRememberedLogin, isRemembered]);

  const onSubmit = async (data: FormValues) => {
    try {
      const success = await login(data.email, data.password, data.rememberMe);
      
      if (success) {
        toast({
          title: "تم تسجيل الدخول بنجاح!",
          description: "يرجى إدخال رقم التعريف الشخصي للمتابعة.",
        });
        navigate("/teacher/pin");
      } else {
        toast({
          title: "فشل تسجيل الدخول",
          description: "بريد إلكتروني أو كلمة مرور غير صالحة. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "حدث خطأ",
        description: "لا يمكن إكمال تسجيل الدخول. يرجى المحاولة مرة أخرى لاحقًا.",
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Show a loading state while checking for remembered login
  if (checkingRemembered) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <Logo size="large" />
          <p className="mt-4 text-gray-600">جاري التحقق من حالة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Link 
        to="/" 
        className="absolute top-4 right-4 flex items-center text-waai-primary hover:text-waai-accent1 font-medium"
      >
        العودة إلى الرئيسية
        <ArrowLeft className="mr-1 h-4 w-4 rotate-180" />
      </Link>
      
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo size="large" />
          <h1 className="mt-4 text-2xl font-bold">تسجيل دخول المعلم</h1>
          <p className="text-gray-600">مرحبًا بعودتك! يرجى تسجيل الدخول إلى حسابك</p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="أدخل بريدك الإلكتروني" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="أدخل كلمة المرور" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={togglePasswordVisibility}
                            className="absolute left-0 top-0 h-full px-3 py-2 text-gray-400"
                          >
                            {showPassword ? 
                              <EyeOff className="h-4 w-4" /> : 
                              <Eye className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange} 
                            id="rememberMe" 
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none mr-2">
                          <FormLabel 
                            htmlFor="rememberMe" 
                            className="text-sm font-normal cursor-pointer"
                          >
                            تذكرني
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Link to="/forgot-password" className="text-sm text-waai-primary hover:text-waai-accent1">
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-waai-primary hover:bg-waai-accent1"
                  disabled={isLoading}
                >
                  {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟{" "}
              <Link to="/teacher/register" className="text-waai-primary hover:text-waai-accent1 font-semibold">
                تسجيل
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default TeacherLogin;
