
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, Plus, CheckCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useChildren } from '@/contexts/ChildrenContext';
import AvatarSelector from '@/components/AvatarSelector';
import PinInput from '@/components/PinInput';
import NumericKeypad from '@/components/NumericKeypad';

const AddChild = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTeacher } = useAuth();
  const { addChild, availableAvatars, isLoading } = useChildren();
  
  // Child information
  const [childName, setChildName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('');
  
  // PIN setup
  const [enablePin, setEnablePin] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirmingPin, setIsConfirmingPin] = useState(false);
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!currentTeacher) {
      navigate('/teacher/login');
      return;
    }
    
    // Set default avatar if none selected
    if (!selectedAvatarId && availableAvatars.length > 0) {
      setSelectedAvatarId(availableAvatars[0].id);
    }
  }, [currentTeacher, navigate, availableAvatars, selectedAvatarId]);

  const handleBack = () => {
    navigate('/teacher/dashboard');
  };

  const handlePinDigitPress = (digit: number) => {
    if (isConfirmingPin) {
      if (confirmPin.length < 4) {
        setConfirmPin(prev => prev + digit.toString());
      }
    } else {
      if (pin.length < 4) {
        setPin(prev => prev + digit.toString());
      }
    }
  };

  const handlePinBackspace = () => {
    if (isConfirmingPin) {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatarId(avatarId);
  };

  const handlePinConfirm = async () => {
    if (!isConfirmingPin) {
      if (pin.length !== 4) {
        toast({
          title: "Invalid PIN",
          description: "Please enter a 4-digit PIN.",
          variant: "destructive",
        });
        return;
      }
      
      setIsConfirmingPin(true);
      return;
    }
    
    // Confirm the PIN matches
    if (pin !== confirmPin) {
      toast({
        title: "PINs don't match",
        description: "The PINs you entered don't match. Please try again.",
        variant: "destructive",
      });
      setConfirmPin("");
      setIsConfirmingPin(false);
      return;
    }
    
    // PIN setup successful
    toast({
      title: "PIN set successfully",
      description: "The child profile will be protected with this PIN.",
    });
    
    // Ready to submit the form
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (!childName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the child.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAvatarId) {
      toast({
        title: "Avatar required",
        description: "Please select an avatar for the child.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await addChild(
        childName.trim(),
        selectedAvatarId,
        enablePin ? pin : undefined
      );
      
      if (success) {
        toast({
          title: "Child added successfully",
          description: `${childName} has been added to your classroom.`,
        });
        navigate('/teacher/dashboard');
      } else {
        toast({
          title: "Error adding child",
          description: "There was a problem adding the child. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Add child error:", error);
      toast({
        title: "Error adding child",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            className="text-waai-primary hover:text-waai-accent1"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
          
          <Logo />
        </div>

        <div className="mt-8 max-w-xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-waai-primary to-waai-secondary">
            Add New Child
          </h1>
          
          <Card className="shadow-lg border-2 border-waai-accent1/20">
            <CardContent className="p-6 md:p-8">
              {enablePin && (isConfirmingPin || pin.length > 0) ? (
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center mb-4">
                    <Shield className="h-10 w-10 text-waai-primary" />
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-2 text-center">
                    {isConfirmingPin ? "Confirm Child's PIN" : "Create Child's PIN"}
                  </h2>
                  
                  <p className="text-gray-600 mb-6 text-center max-w-md">
                    {isConfirmingPin 
                      ? "Please enter the PIN again to confirm" 
                      : "Create a 4-digit PIN for this child to access their profile"}
                  </p>
                  
                  <PinInput 
                    length={4} 
                    value={isConfirmingPin ? confirmPin : pin} 
                    onChange={isConfirmingPin ? setConfirmPin : setPin}
                    onComplete={handlePinConfirm}
                  />
                  
                  <NumericKeypad 
                    onDigitPress={handlePinDigitPress}
                    onBackspace={handlePinBackspace}
                    onConfirm={handlePinConfirm}
                    disabled={isSubmitting}
                  />
                  
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (isConfirmingPin) {
                          setIsConfirmingPin(false);
                          setConfirmPin("");
                        } else {
                          setEnablePin(false);
                          setPin("");
                        }
                      }}
                      disabled={isSubmitting}
                      className="text-waai-primary hover:text-waai-accent1"
                    >
                      Back
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="childName">Child's Name</Label>
                      <Input
                        id="childName"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        placeholder="Enter child's name"
                        className="text-lg py-6"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Select an Avatar</Label>
                      <AvatarSelector
                        avatars={availableAvatars}
                        selectedAvatarId={selectedAvatarId}
                        onSelect={handleAvatarSelect}
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button
                        type="button"
                        variant={enablePin ? "default" : "outline"}
                        className={`w-full py-6 ${enablePin ? 'bg-waai-primary hover:bg-waai-accent1' : ''}`}
                        onClick={() => setEnablePin(!enablePin)}
                        disabled={isSubmitting}
                      >
                        <Shield className="mr-2 h-5 w-5" />
                        {enablePin ? "PIN Protection Enabled" : "Add PIN Protection (Optional)"}
                      </Button>
                    </div>
                    
                    <div className="pt-4 space-x-4 flex">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-1/2 py-6"
                        onClick={handleBack}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      
                      <Button
                        type="button"
                        className="w-1/2 py-6 bg-waai-secondary hover:bg-waai-accent2"
                        onClick={enablePin ? () => setPin("") : handleSubmit}
                        disabled={isSubmitting || !childName.trim() || !selectedAvatarId}
                      >
                        {enablePin ? (
                          <>
                            <Plus className="mr-2 h-5 w-5" />
                            Set PIN
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Add Child
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddChild;
