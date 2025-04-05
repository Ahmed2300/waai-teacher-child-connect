import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield } from 'lucide-react';
import Logo from '@/components/Logo';
import NumericKeypad from '@/components/NumericKeypad';
import PinInput from '@/components/PinInput';
import { useAuth } from '@/contexts/AuthContext';

const PIN_LENGTH = 4;

const TeacherPin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTeacher, verifyPin, setupPin, isLoading } = useAuth();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    // If no current teacher, redirect to login
    if (!currentTeacher) {
      navigate('/teacher/login');
      return;
    }

    // Check if teacher has a PIN set up
    setIsSettingUp(!currentTeacher.hasPin);
    
    // If teacher doesn't have a PIN, we'll set one up
    // Otherwise, we'll verify the PIN
    if (currentTeacher.hasPin === false) {
      // If we're setting up a PIN, let's show a welcome message
      toast({
        title: "مرحباً!",
        description: "يرجى إعداد رقم تعريف شخصي (PIN) مكون من 4 أرقام للوصول السريع إلى حسابك.",
      });
    }
  }, [currentTeacher, navigate, toast]);

  const handleDigitPress = (digit: number) => {
    if (isConfirming) {
      if (confirmPin.length < PIN_LENGTH) {
        setConfirmPin(prev => prev + digit.toString());
      }
    } else {
      if (pin.length < PIN_LENGTH) {
        setPin(prev => prev + digit.toString());
      }
    }
  };

  const handleBackspace = () => {
    if (isConfirming) {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleConfirm = async () => {
    try {
      // PIN setup flow (new PIN or resetting PIN)
      if (isSettingUp) {
        // Step 1: Enter the PIN
        if (!isConfirming) {
          if (pin.length !== PIN_LENGTH) {
            toast({
              title: "رقم تعريف غير صالح",
              description: `يرجى إدخال رقم تعريف شخصي مكون من ${PIN_LENGTH} أرقام.`,
              variant: "destructive",
            });
            return;
          }
          
          // Move to confirm PIN state
          setIsConfirming(true);
          return;
        }
        
        // Step 2: Confirm the PIN
        if (pin !== confirmPin) {
          toast({
            title: "الأرقام غير متطابقة",
            description: "أرقام التعريف الشخصي التي أدخلتها غير متطابقة. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
          });
          // Reset to start of PIN setup
          setConfirmPin("");
          setIsConfirming(false);
          return;
        }
        
        // PIN setup complete, save the PIN
        const success = await setupPin(pin);
        if (success) {
          toast({
            title: "تم إعداد رقم التعريف الشخصي!",
            description: "تم إعداد رقم التعريف الشخصي الخاص بك بنجاح.",
          });
          navigate('/teacher/dashboard');
        } else {
          toast({
            title: "فشل إعداد رقم التعريف الشخصي",
            description: "حدث خطأ أثناء إعداد رقم التعريف الشخصي الخاص بك. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
          });
        }
      } 
      // PIN verification flow (existing PIN)
      else {
        if (pin.length !== PIN_LENGTH) {
          toast({
            title: "رقم تعريف غير صالح",
            description: `يرجى إدخال رقم تعريف شخصي المكون من ${PIN_LENGTH} أرقام.`,
            variant: "destructive",
          });
          return;
        }
        
        const success = await verifyPin(pin);
        if (success) {
          toast({
            title: "تم التحقق من الرقم التعريفي",
            description: "مرحبًا بك مرة أخرى!",
          });
          navigate('/teacher/dashboard');
        } else {
          toast({
            title: "رقم تعريف شخصي غير صحيح",
            description: "رقم التعريف الشخصي الذي أدخلته غير صحيح. يرجى المحاولة مرة أخرى.",
            variant: "destructive",
          });
          setPin("");
        }
      }
    } catch (error) {
      console.error("PIN error:", error);
      toast({
        title: "حدث خطأ",
        description: "تعذرت معالجة رقم التعريف الشخصي الخاص بك. يرجى المحاولة مرة أخرى لاحقًا.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <Logo size="large" />
        
        <Card className="mt-8">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-waai-primary" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">
              {isSettingUp 
                ? isConfirming 
                  ? "تأكيد رقم التعريف الشخصي" 
                  : "إعداد رقم التعريف الشخصي"
                : "أدخل رقم التعريف الشخصي"
              }
            </h1>
            
            <p className="text-gray-600 mb-6">
              {isSettingUp 
                ? isConfirming 
                  ? "يرجى تأكيد رقم التعريف الشخصي للتحقق."
                  : "إنشاء رقم تعريف شخصي آمن مكون من 4 أرقام لأمان إضافي."
                : "استخدم رقم التعريف الشخصي المكون من 4 أرقام للوصول إلى حسابك."
              }
            </p>
            
            <PinInput 
              length={PIN_LENGTH} 
              value={isConfirming ? confirmPin : pin} 
            />
            
            <NumericKeypad 
              onDigitPress={handleDigitPress}
              onBackspace={handleBackspace}
              onConfirm={handleConfirm}
              disabled={isLoading}
            />
            
            {isConfirming && (
              <Button
                variant="ghost"
                className="mt-4 text-waai-primary hover:text-waai-accent1"
                onClick={() => {
                  setIsConfirming(false);
                  setConfirmPin("");
                }}
                disabled={isLoading}
              >
                العودة إلى إدخال الرقم التعريفي
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherPin;
