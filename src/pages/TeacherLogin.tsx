
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
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
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
            title: "Welcome back!",
            description: "You've been automatically logged in.",
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
          title: "Login successful!",
          description: "Please enter your PIN to continue.",
        });
        navigate("/teacher/pin");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "An error occurred",
        description: "Could not complete login. Please try again later.",
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
          <p className="mt-4 text-gray-600">Checking login status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Link 
        to="/" 
        className="absolute top-4 left-4 flex items-center text-waai-primary hover:text-waai-accent1 font-medium"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Home
      </Link>
      
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo size="large" />
          <h1 className="mt-4 text-2xl font-bold">Teacher Login</h1>
          <p className="text-gray-600">Welcome back! Please login to your account</p>
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Enter your password" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={togglePasswordVisibility}
                            className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
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
                        <div className="space-y-1 leading-none">
                          <FormLabel 
                            htmlFor="rememberMe" 
                            className="text-sm font-normal cursor-pointer"
                          >
                            Remember me
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <Link to="/forgot-password" className="text-sm text-waai-primary hover:text-waai-accent1">
                    Forgot password?
                  </Link>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-waai-primary hover:bg-waai-accent1"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t p-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/teacher/register" className="text-waai-primary hover:text-waai-accent1 font-semibold">
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default TeacherLogin;
