
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
  }, [currentTeacher, navigate]);

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
              title: "Invalid PIN",
              description: `Please enter a ${PIN_LENGTH}-digit PIN.`,
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
            title: "PINs don't match",
            description: "The PINs you entered don't match. Please try again.",
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
            title: "PIN setup complete!",
            description: "Your PIN has been successfully set up.",
          });
          navigate('/teacher/dashboard');
        } else {
          toast({
            title: "PIN setup failed",
            description: "There was an error setting up your PIN. Please try again.",
            variant: "destructive",
          });
        }
      } 
      // PIN verification flow (existing PIN)
      else {
        if (pin.length !== PIN_LENGTH) {
          toast({
            title: "Invalid PIN",
            description: `Please enter your ${PIN_LENGTH}-digit PIN.`,
            variant: "destructive",
          });
          return;
        }
        
        const success = await verifyPin(pin);
        if (success) {
          toast({
            title: "PIN verified",
            description: "Welcome back!",
          });
          navigate('/teacher/dashboard');
        } else {
          toast({
            title: "Incorrect PIN",
            description: "The PIN you entered is incorrect. Please try again.",
            variant: "destructive",
          });
          setPin("");
        }
      }
    } catch (error) {
      console.error("PIN error:", error);
      toast({
        title: "An error occurred",
        description: "Could not process your PIN. Please try again later.",
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
                  ? "Confirm Your PIN" 
                  : "Set Up Your PIN"
                : "Enter Your PIN"
              }
            </h1>
            
            <p className="text-gray-600 mb-6">
              {isSettingUp 
                ? isConfirming 
                  ? "Please confirm your PIN for verification."
                  : "Create a secure 4-digit PIN for additional security."
                : "Use your 4-digit PIN to access your account."
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
                Back to PIN Entry
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherPin;
