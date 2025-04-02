import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { database } from "@/lib/firebase";
import { ref, set, push, onValue, get, update, remove } from "firebase/database";

// Define types
export type Avatar = {
  id: string;
  url: string;
  description: string;
};

export type Child = {
  id: string;
  name: string;
  avatarId: string;
  createdAt: number;
  pin?: string; // Optional PIN for the child
};

interface ChildrenContextType {
  children: Child[];
  availableAvatars: Avatar[];
  activeChild: Child | null;
  isLoading: boolean;
  addChild: (name: string, avatarId: string, pin?: string) => Promise<boolean>;
  setActiveChild: (childId: string) => void;
  getChildById: (id: string) => Child | undefined;
  verifyChildPin: (childId: string, pin: string) => Promise<boolean>;
}

// Create a context
const ChildrenContext = createContext<ChildrenContextType | undefined>(undefined);

// Define available avatars
const avatars: Avatar[] = [
  { id: "cat_avatar_01", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix", description: "Cute Cat" },
  { id: "dog_avatar_02", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Buddy", description: "Friendly Dog" },
  { id: "rabbit_avatar_03", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Hopper", description: "Happy Rabbit" },
  { id: "fox_avatar_04", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Rusty", description: "Swift Fox" },
  { id: "owl_avatar_05", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sage", description: "Wise Owl" },
  { id: "panda_avatar_06", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Bamboo", description: "Playful Panda" },
];

// Sample female and male names (to simulate random name generation)
const femaleNames = ['Lama', 'Sara', 'Noor', 'Reem', 'Hind', 'Jana', 'Malak'];
const maleNames = ['Omar', 'Ahmed', 'Youssef', 'Karim', 'Ali', 'Ziad', 'Hassan'];
const allNames = [...femaleNames, ...maleNames];

export const ChildrenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTeacher } = useAuth();
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [activeChild, setActiveChildState] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load children from Firebase when the teacher changes
  useEffect(() => {
    if (currentTeacher) {
      setIsLoading(true);
      
      // Reference to the children in the database
      const childrenRef = ref(database, `teachers/${currentTeacher.id}/children`);
      
      // Listen for changes to the children
      const unsubscribe = onValue(childrenRef, (snapshot) => {
        if (snapshot.exists()) {
          const childrenData = snapshot.val();
          const childrenArray: Child[] = [];
          
          // Convert object to array
          Object.keys(childrenData).forEach((key) => {
            childrenArray.push({
              id: key,
              ...childrenData[key]
            });
          });
          
          setChildrenList(childrenArray);
        } else {
          setChildrenList([]);
        }
        
        setIsLoading(false);
      });
      
      // Get active child from localStorage if available
      const storedActiveChildId = localStorage.getItem(`waai-active-child-${currentTeacher.id}`);
      if (storedActiveChildId) {
        const childRef = ref(database, `teachers/${currentTeacher.id}/children/${storedActiveChildId}`);
        get(childRef).then((snapshot) => {
          if (snapshot.exists()) {
            const childData = snapshot.val();
            setActiveChildState({
              id: storedActiveChildId,
              ...childData
            });
          }
        });
      }
      
      return () => {
        unsubscribe();
      };
    } else {
      setChildrenList([]);
      setIsLoading(false);
    }
  }, [currentTeacher]);

  const addChild = async (name: string, avatarId: string, pin?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (!currentTeacher) return false;
      
      // Reference to the children collection
      const childrenRef = ref(database, `teachers/${currentTeacher.id}/children`);
      
      // If a PIN is provided, validate it's not already used by another child
      if (pin) {
        // Check if this PIN already exists for any other child
        const existingChildWithPin = childrenList.find(child => child.pin === pin);
        if (existingChildWithPin) {
          console.error("PIN already in use by another child");
          return false;
        }
      }
      
      // Create a new child reference with an auto-generated key
      const newChildRef = push(childrenRef);
      
      // The child object to save
      const newChild: Omit<Child, "id"> = {
        name,
        avatarId,
        createdAt: Date.now()
      };
      
      // Add the PIN if provided
      if (pin) {
        newChild.pin = pin;
      }
      
      // Save the child to the database
      await set(newChildRef, newChild);
      
      return true;
    } catch (error) {
      console.error("Add child error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveChild = (childId: string) => {
    const child = childrenList.find(c => c.id === childId);
    if (child) {
      setActiveChildState(child);
      // Store active child in localStorage
      if (currentTeacher) {
        localStorage.setItem(`waai-active-child-${currentTeacher.id}`, childId);
      }
    }
  };

  const getChildById = (id: string): Child | undefined => {
    return childrenList.find(child => child.id === id);
  };

  const verifyChildPin = async (childId: string, pin: string): Promise<boolean> => {
    try {
      const child = childrenList.find(c => c.id === childId);
      
      if (!child || !child.pin) {
        return false; // Child not found or no PIN set
      }
      
      // Simple PIN verification (direct comparison)
      return child.pin === pin;
    } catch (error) {
      console.error("PIN verification error:", error);
      return false;
    }
  };

  const getRandomName = (): string => {
    return allNames[Math.floor(Math.random() * allNames.length)];
  };

  return (
    <ChildrenContext.Provider
      value={{
        children: childrenList,
        availableAvatars: avatars,
        activeChild,
        isLoading,
        addChild,
        setActiveChild,
        getChildById,
        verifyChildPin
      }}
    >
      {children}
    </ChildrenContext.Provider>
  );
};

export const useChildren = (): ChildrenContextType => {
  const context = useContext(ChildrenContext);
  if (context === undefined) {
    throw new Error("useChildren must be used within a ChildrenProvider");
  }
  return context;
};
