
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Play } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useChildren, Child, Avatar } from '@/contexts/ChildrenContext';
import PinInput from '@/components/PinInput';

const ChildWelcome = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTeacher } = useAuth();
  const { getChildById, availableAvatars, verifyChildPin } = useChildren();
  
  const [child, setChild] = useState<Child | null>(null);
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [pinRequired, setPinRequired] = useState<boolean>(false);
  const [pin, setPin] = useState<string>("");
  const [pinVerified, setPinVerified] = useState<boolean>(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!currentTeacher) {
      navigate('/teacher/login');
      return;
    }
    
    if (id) {
      const foundChild = getChildById(id);
      if (foundChild) {
        setChild(foundChild);
        const foundAvatar = availableAvatars.find(a => a.id === foundChild.avatarId);
        if (foundAvatar) {
          setAvatar(foundAvatar);
        }
        
        // Check if the child has a PIN
        setPinRequired(!!foundChild.pin);
      } else {
        toast({
          title: "Child not found",
          description: "Could not find this child profile.",
          variant: "destructive",
        });
        navigate('/child/selection');
      }
    }
  }, [id, currentTeacher, getChildById, availableAvatars, navigate, toast]);

  const handleBackToSelection = () => {
    navigate('/child/selection');
  };

  const handleStartActivity = () => {
    toast({
      title: "Activity Starting",
      description: "The learning activities would start here.",
    });
    // This would navigate to the actual activity in a real implementation
    setTimeout(() => {
      navigate('/child/selection');
    }, 2000);
  };

  const handlePinSubmit = async () => {
    if (!child) return;
    
    const isValid = await verifyChildPin(child.id, pin);
    if (isValid) {
      setPinVerified(true);
      toast({
        title: "PIN Verified",
        description: "Welcome to your learning journey!",
      });
    } else {
      toast({
        title: "Incorrect PIN",
        description: "Please try again.",
        variant: "destructive",
      });
      setPin("");
    }
  };

  if (!child || !avatar) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            className="text-waai-primary hover:text-waai-accent1"
            onClick={handleBackToSelection}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
          
          <Logo />
        </div>

        <div className="flex flex-col items-center justify-center mt-12 max-w-md mx-auto">
          {pinRequired && !pinVerified ? (
            <Card className="w-full border-4 border-waai-accent1/30 shadow-lg">
              <CardContent className="p-8 flex flex-col items-center">
                <div className="w-24 h-24 mb-6">
                  <img
                    src={avatar.url}
                    alt={child.name}
                    className="w-full h-full object-cover rounded-full border-4 border-waai-accent1"
                  />
                </div>
                
                <h1 className="text-2xl font-bold mb-4 text-center">
                  Hello, <span className="text-waai-primary">{child.name}</span>!
                </h1>
                
                <p className="text-lg text-gray-700 mb-6 text-center">
                  Please enter your PIN to continue
                </p>
                
                <div className="w-full mb-6">
                  <PinInput 
                    value={pin} 
                    onChange={setPin} 
                    length={4} 
                    onComplete={handlePinSubmit}
                  />
                </div>
                
                <Button 
                  onClick={handlePinSubmit}
                  size="lg" 
                  className="w-full bg-waai-secondary hover:bg-waai-accent2 text-white rounded-full h-14 text-xl"
                  disabled={pin.length < 4}
                >
                  Unlock
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full border-4 border-waai-accent1/30 shadow-lg">
              <CardContent className="p-8 flex flex-col items-center">
                <div className="w-32 h-32 mb-6 animate-bounce-slow">
                  <img
                    src={avatar.url}
                    alt={child.name}
                    className="w-full h-full object-cover rounded-full border-4 border-waai-accent1"
                  />
                </div>
                
                <h1 className="text-4xl font-bold mb-4 text-center">
                  Welcome, <span className="text-waai-primary">{child.name}</span>!
                </h1>
                
                <p className="text-lg text-gray-700 mb-8 text-center">
                  Are you ready for today's adventure?
                </p>
                
                <Button 
                  onClick={handleStartActivity}
                  size="lg" 
                  className="w-full bg-waai-secondary hover:bg-waai-accent2 text-white rounded-full h-14 text-xl"
                >
                  <Play className="mr-2 h-6 w-6" />
                  Let's Play!
                </Button>
              </CardContent>
            </Card>
          )}
          
          <div className="mt-8 animate-pulse">
            <svg className="w-12 h-12 text-waai-primary mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildWelcome;
