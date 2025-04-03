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
  const femaleNames = ['Lama', 'Sara', 'Noor', 'Reem', 'Hind', 'Jana', 'Malak'];
  const maleNames = ['Omar', 'Ahmed', 'Youssef', 'Karim', 'Ali', 'Ziad', 'Hassan'];
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
        title: "Name is required",
        description: "Please enter a name for the child.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAvatarId) {
      toast({
        title: "Avatar is required",
        description: "Please select an avatar for the child.",
        variant: "destructive",
      });
      return;
    }

    if (isPinRequired) {
      if (childPin.length < 4) {
        toast({
          title: "Invalid PIN",
          description: "Please enter a 4-digit PIN for the child.",
          variant: "destructive",
        });
        return;
      }

      const existingChildWithPin = children.find(child => child.pin === childPin);
      if (existingChildWithPin) {
        toast({
          title: "PIN already in use",
          description: "This PIN is already assigned to another child. Please use a different PIN.",
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
          title: "Child added",
          description: `${newChildName} has been added successfully.`,
        });
        setNewChildName("");
        setSelectedAvatarId("");
        setChildPin("");
        setIsPinRequired(false);
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Failed to add child",
          description: "There was an error adding the child. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Add child error:", error);
      toast({
        title: "An error occurred",
        description: "Could not add child. Please try again later.",
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
    return date.toLocaleDateString('en-US', {
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
              <span className="font-medium text-gray-700">Welcome, {currentTeacher.name}</span>
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
            <h1 className="text-2xl font-bold mb-2">Teacher Dashboard</h1>
            <p className="text-gray-600">Manage children profiles and educational activities</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleStartSession} 
              className="bg-waai-accent1 hover:bg-waai-primary"
              disabled={children.length === 0}
            >
              <User className="mr-2 h-5 w-5" />
              Start Child Session
            </Button>
            
            <Button
              onClick={navigateToCreateActivity}
              className="bg-waai-secondary hover:bg-waai-accent2"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Create Activity
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-waai-primary hover:bg-waai-accent1">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Add Child
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add a New Child</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Child's Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="name"
                        value={newChildName}
                        onChange={(e) => setNewChildName(e.target.value)}
                        placeholder="Enter child's name"
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        onClick={generateRandomName}
                        type="button"
                      >
                        Random
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
                    <Label htmlFor="pin-required">Require PIN for this child</Label>
                  </div>
                  
                  {isPinRequired && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="pin">Child's PIN (4 digits)</Label>
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
                          placeholder="4-digit PIN"
                          maxLength={4}
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          onClick={generateRandomPin}
                          type="button"
                        >
                          Generate
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        This PIN will be required when the child logs in.
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
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleAddChild}
                    disabled={isAddingChild}
                    className="bg-waai-primary hover:bg-waai-accent1"
                  >
                    {isAddingChild ? "Adding..." : "Add Child"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="activities" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="activities" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="children" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Children
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="activities">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Educational Activities</h2>
                <span className="text-sm text-gray-500">{activities.length} total</span>
              </div>
              
              {isActivitiesLoading ? (
                <div className="text-center py-8">
                  <p>Loading activities...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Activities Created Yet</h3>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    Create your first educational activity to start teaching with Waai.
                  </p>
                  <Button 
                    className="bg-waai-primary hover:bg-waai-accent1"
                    onClick={navigateToCreateActivity}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create Activity
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
                          <Calendar className="h-3 w-3 mr-1" />
                          Created {formatDate(activity.createdAt)}
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
                            <BookOpen className="h-4 w-4 mr-1" />
                            {activity.questions.length} questions
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-waai-primary"
                            onClick={() => viewActivityDetails(activity.id)}
                          >
                            <BarChart4 className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          
                          <Button
                            size="sm"
                            className="flex-1 bg-waai-primary hover:bg-waai-accent1"
                            onClick={() => navigate(`/teacher/activity/${activity.id}`)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
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
                <h2 className="text-xl font-semibold">Children Profiles</h2>
                <span className="text-sm text-gray-500">{children.length} total</span>
              </div>
              
              {isChildrenLoading ? (
                <div className="text-center py-8">
                  <p>Loading children profiles...</p>
                </div>
              ) : children.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Children Added Yet</h3>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    Add your first child profile to get started with learning sessions.
                  </p>
                  <Button 
                    className="bg-waai-primary hover:bg-waai-accent1"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Add Child
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
