
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';
import ChildCard from '@/components/ChildCard';
import { useAuth } from '@/contexts/AuthContext';
import { useChildren } from '@/contexts/ChildrenContext';

const ChildSelection = () => {
  const navigate = useNavigate();
  const { currentTeacher } = useAuth();
  const { children, setActiveChild, isLoading } = useChildren();

  useEffect(() => {
    // Redirect if not authenticated
    if (!currentTeacher) {
      navigate('/teacher/login');
    }
  }, [currentTeacher, navigate]);

  const handleChildSelect = (childId: string) => {
    setActiveChild(childId);
    navigate(`/child/welcome/${childId}`);
  };

  const handleBackToTeacherDashboard = () => {
    navigate('/teacher/dashboard');
  };

  if (!currentTeacher) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            className="text-waai-primary hover:text-waai-accent1"
            onClick={handleBackToTeacherDashboard}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Button>
          
          <Logo />
        </div>

        <div className="mt-12 max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-waai-primary to-waai-secondary bg-clip-text text-transparent">
            Who's Ready to Learn Today?
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Tap on your picture to begin!
          </p>

          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading children profiles...</p>
            </div>
          ) : children.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <h3 className="text-xl font-medium mb-4">No Children Profiles Found</h3>
              <p className="text-gray-600 mb-6">
                No children have been added yet. Please add children from the teacher dashboard.
              </p>
              <Button 
                className="bg-waai-primary hover:bg-waai-accent1"
                onClick={handleBackToTeacherDashboard}
              >
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {children.map((child) => (
                <div key={child.id} className="transform transition-all hover:scale-105">
                  <ChildCard 
                    child={child} 
                    onClick={() => handleChildSelect(child.id)}
                    isSelectable={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildSelection;
