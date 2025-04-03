
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { database } from "@/lib/firebase";
import { ref, set, push, onValue, get, update, remove } from "firebase/database";
import { Activity, Question, Option, ActivityProgress } from "@/types/Activity";

interface ActivitiesContextType {
  activities: Activity[];
  isLoading: boolean;
  currentActivity: Activity | null;
  createActivity: (title: string, goals: string, questions: Question[]) => Promise<string | null>;
  updateActivity: (activityId: string, data: Partial<Omit<Activity, 'id'>>) => Promise<boolean>;
  deleteActivity: (activityId: string) => Promise<boolean>;
  getActivityById: (activityId: string) => Activity | undefined;
  saveProgress: (
    childId: string,
    activityId: string,
    questionId: string,
    selectedOptionId: string,
    isCorrect: boolean
  ) => Promise<boolean>;
  getChildProgress: (childId: string, activityId?: string) => Promise<ActivityProgress[]>;
  setCurrentActivity: (activity: Activity | null) => void;
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

export const ActivitiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTeacher } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);

  // Load activities from Firebase when the teacher changes
  useEffect(() => {
    if (currentTeacher) {
      setIsLoading(true);
      
      // Reference to the activities in the database
      const activitiesRef = ref(database, `teachers/${currentTeacher.id}/activities`);
      
      // Listen for changes to the activities
      const unsubscribe = onValue(activitiesRef, (snapshot) => {
        if (snapshot.exists()) {
          const activitiesData = snapshot.val();
          const activitiesArray: Activity[] = [];
          
          // Convert object to array
          Object.keys(activitiesData).forEach((key) => {
            activitiesArray.push({
              id: key,
              ...activitiesData[key]
            });
          });
          
          setActivities(activitiesArray);
        } else {
          setActivities([]);
        }
        
        setIsLoading(false);
      });
      
      return () => {
        unsubscribe();
      };
    } else {
      setActivities([]);
      setIsLoading(false);
    }
  }, [currentTeacher]);

  const createActivity = async (title: string, goals: string, questions: Question[]): Promise<string | null> => {
    try {
      if (!currentTeacher) return null;
      
      // Reference to the activities collection
      const activitiesRef = ref(database, `teachers/${currentTeacher.id}/activities`);
      
      // Create a new activity reference with an auto-generated key
      const newActivityRef = push(activitiesRef);
      
      // The activity object to save
      const newActivity: Omit<Activity, 'id'> = {
        title,
        goals,
        questions,
        createdAt: Date.now(),
        teacherId: currentTeacher.id
      };
      
      // Save the activity to the database
      await set(newActivityRef, newActivity);
      
      return newActivityRef.key;
    } catch (error) {
      console.error("Create activity error:", error);
      return null;
    }
  };

  const updateActivity = async (activityId: string, data: Partial<Omit<Activity, 'id'>>): Promise<boolean> => {
    try {
      if (!currentTeacher) return false;
      
      const activityRef = ref(database, `teachers/${currentTeacher.id}/activities/${activityId}`);
      
      // Update the activity
      await update(activityRef, data);
      
      return true;
    } catch (error) {
      console.error("Update activity error:", error);
      return false;
    }
  };

  const deleteActivity = async (activityId: string): Promise<boolean> => {
    try {
      if (!currentTeacher) return false;
      
      const activityRef = ref(database, `teachers/${currentTeacher.id}/activities/${activityId}`);
      
      // Delete the activity
      await remove(activityRef);
      
      return true;
    } catch (error) {
      console.error("Delete activity error:", error);
      return false;
    }
  };

  const getActivityById = (activityId: string): Activity | undefined => {
    return activities.find(activity => activity.id === activityId);
  };

  const saveProgress = async (
    childId: string,
    activityId: string,
    questionId: string,
    selectedOptionId: string,
    isCorrect: boolean
  ): Promise<boolean> => {
    try {
      if (!currentTeacher) return false;
      
      // Reference to the progress record
      const progressRef = ref(
        database, 
        `teachers/${currentTeacher.id}/children/${childId}/progress/${activityId}/answers/${questionId}`
      );
      
      // Save the progress
      await set(progressRef, {
        selectedOptionId,
        isCorrect,
        answeredAt: Date.now()
      });
      
      // Update the start time if it's the first answer
      const activityProgressRef = ref(
        database, 
        `teachers/${currentTeacher.id}/children/${childId}/progress/${activityId}`
      );
      
      const snapshot = await get(activityProgressRef);
      
      if (!snapshot.child('startedAt').exists()) {
        await update(activityProgressRef, {
          startedAt: Date.now()
        });
      }
      
      return true;
    } catch (error) {
      console.error("Save progress error:", error);
      return false;
    }
  };

  const getChildProgress = async (childId: string, activityId?: string): Promise<ActivityProgress[]> => {
    try {
      if (!currentTeacher) return [];
      
      const basePath = `teachers/${currentTeacher.id}/children/${childId}/progress`;
      const progressPath = activityId ? `${basePath}/${activityId}` : basePath;
      
      const progressRef = ref(database, progressPath);
      const snapshot = await get(progressRef);
      
      if (!snapshot.exists()) return [];
      
      if (activityId) {
        // Single activity progress
        const progressData = snapshot.val();
        
        return [{
          activityId,
          childId,
          answers: progressData.answers || {},
          startedAt: progressData.startedAt || 0,
          completedAt: progressData.completedAt,
          score: progressData.score
        }];
      } else {
        // All activity progress
        const progressData = snapshot.val();
        const progressArray: ActivityProgress[] = [];
        
        Object.keys(progressData).forEach((actId) => {
          progressArray.push({
            activityId: actId,
            childId,
            answers: progressData[actId].answers || {},
            startedAt: progressData[actId].startedAt || 0,
            completedAt: progressData[actId].completedAt,
            score: progressData[actId].score
          });
        });
        
        return progressArray;
      }
    } catch (error) {
      console.error("Get progress error:", error);
      return [];
    }
  };

  return (
    <ActivitiesContext.Provider
      value={{
        activities,
        isLoading,
        currentActivity,
        createActivity,
        updateActivity,
        deleteActivity,
        getActivityById,
        saveProgress,
        getChildProgress,
        setCurrentActivity
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
};

export const useActivities = (): ActivitiesContextType => {
  const context = useContext(ActivitiesContext);
  if (context === undefined) {
    throw new Error("useActivities must be used within an ActivitiesProvider");
  }
  return context;
};
