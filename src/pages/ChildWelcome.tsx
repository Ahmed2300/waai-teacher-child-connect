
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Play, Star, LogOut, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import PinInput from '@/components/PinInput';
import NumericKeypad from '@/components/NumericKeypad';
import { useAuth } from '@/contexts/AuthContext';
import { useChildren } from '@/contexts/ChildrenContext';
import { useActivities } from '@/contexts/ActivitiesContext';

const ChildWelcome = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTeacher } = useAuth();
  const { getChildById, verifyChildPin } = useChildren();
  const { activities } = useActivities();
  
  const [child, setChild] = useState<any>(null);
  const [isPinRequired, setIsPinRequired] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);

  useEffect(() => {
    if (!currentTeacher || !id) {
      navigate('/');
      return;
    }
    
    const childData = getChildById(id);
    if (!childData) {
      toast({
        title: "Child not found",
        description: "This child profile could not be found.",
        variant: "destructive",
      });
      navigate('/child/selection');
      return;
    }
    
    setChild(childData);
    setIsPinRequired(!!childData.pin);
    
    // If PIN is required, show the dialog
    if (childData.pin) {
      setShowPinDialog(true);
    } else {
      setIsVerified(true);
    }
  }, [currentTeacher, id, getChildById, navigate, toast]);

  const handlePinDigitPress = (digit: number) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit.toString());
      setPinError('');
    }
  };

  const handlePinBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setPinError('');
  };

  const handlePinComplete = async () => {
    if (pin.length !== 4) return;
    
    setIsVerifying(true);
    
    try {
      const isValid = await verifyChildPin(child.id, pin);
      
      if (isValid) {
        setIsVerified(true);
        setShowPinDialog(false);
      } else {
        setPinError('Incorrect PIN. Please try again.');
        setPin('');
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      setPinError('An error occurred. Please try again.');
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStartActivity = (activityId: string) => {
    navigate(`/child/activity/${child.id}/${activityId}`);
  };

  const handleBackToSelection = () => {
    navigate('/child/selection');
  };

  // If child not found or loaded yet
  if (!child) {
    return null;
  }

  // If PIN verification is required but not verified yet
  if (isPinRequired && !isVerified) {
    return (
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Enter PIN</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-4">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarImage src={child.avatarUrl} alt={child.name} />
              <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <h2 className="text-xl font-bold mb-6">Hi, {child.name}!</h2>
            
            <p className="text-gray-600 mb-4">Please enter your PIN to continue:</p>
            
            <PinInput 
              length={4} 
              value={pin} 
              onChange={setPin}
              onComplete={handlePinComplete}
              error={!!pinError}
            />
            
            {pinError && (
              <p className="text-red-500 mt-2">{pinError}</p>
            )}
            
            <NumericKeypad 
              onDigitPress={handlePinDigitPress}
              onBackspace={handlePinBackspace}
              onConfirm={handlePinComplete}
              disabled={isVerifying}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleBackToSelection}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Back to Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Main welcome screen (after PIN verification if required)
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={child.avatarUrl} alt={child.name} />
            <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h1 className="font-bold text-xl text-waai-primary">Hello, {child.name}!</h1>
        </div>
        
        <Button 
          variant="ghost" 
          onClick={handleBackToSelection}
          className="text-gray-500"
        >
          <Home className="h-5 w-5" />
        </Button>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-8">
            <img 
              src="https://api.dicebear.com/7.x/bottts/svg?seed=Waai" 
              alt="Waai character" 
              className="h-32 w-32"
            />
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-8">
            What would you like to learn today?
          </h2>
          
          {activities.length === 0 ? (
            <Card className="max-w-lg mx-auto text-center py-8">
              <CardContent>
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No Activities Available</h3>
                <p className="text-gray-600 mb-6">
                  Your teacher hasn't created any learning activities yet.
                </p>
                <Button
                  onClick={handleBackToSelection}
                  className="bg-waai-accent1 hover:bg-waai-primary"
                >
                  Go Back
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Card className="border-2 border-waai-primary/20 hover:border-waai-primary cursor-pointer h-full">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="mb-3 flex justify-between items-start">
                        <div className="p-2 rounded-full bg-waai-primary/10 text-waai-primary">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="flex">
                          {[1, 2, 3].map((star) => (
                            <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2">{activity.title}</h3>
                      
                      <p className="text-gray-600 mb-4 flex-grow">{activity.goals}</p>
                      
                      <div className="text-sm text-gray-500 mb-4">
                        {activity.questions.length} Questions
                      </div>
                      
                      <Button
                        onClick={() => handleStartActivity(activity.id)}
                        className="w-full bg-waai-secondary hover:bg-waai-accent2"
                      >
                        <Play className="mr-2 h-5 w-5" />
                        Start Learning!
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ChildWelcome;
