
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

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
};

interface ChildrenContextType {
  children: Child[];
  availableAvatars: Avatar[];
  activeChild: Child | null;
  isLoading: boolean;
  addChild: (name: string, avatarId: string) => Promise<boolean>;
  setActiveChild: (childId: string) => void;
  getChildById: (id: string) => Child | undefined;
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

  // Load children from localStorage when the teacher changes
  useEffect(() => {
    if (currentTeacher) {
      const storedChildren = localStorage.getItem(`waai-children-${currentTeacher.id}`);
      if (storedChildren) {
        setChildrenList(JSON.parse(storedChildren));
      } else {
        setChildrenList([]);
      }
    } else {
      setChildrenList([]);
    }
    setIsLoading(false);
  }, [currentTeacher]);

  // Save children to localStorage whenever they change
  useEffect(() => {
    if (currentTeacher && childrenList.length > 0) {
      localStorage.setItem(`waai-children-${currentTeacher.id}`, JSON.stringify(childrenList));
    }
  }, [childrenList, currentTeacher]);

  const addChild = async (name: string, avatarId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (!currentTeacher) return false;
      
      const newChild: Child = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        avatarId,
        createdAt: Date.now()
      };
      
      setChildrenList(prev => [...prev, newChild]);
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
        getChildById
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
