
import React, { createContext, useContext, useState, useEffect } from "react";

// Define types
type Teacher = {
  id: string;
  name: string;
  email: string;
  hasPin: boolean;
};

interface AuthContextType {
  currentTeacher: Teacher | null;
  isLoading: boolean;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  verifyPin: (pin: string) => Promise<boolean>;
  setupPin: (pin: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if we have a teacher in localStorage on mount
  useEffect(() => {
    const storedTeacher = localStorage.getItem('waai-teacher');
    if (storedTeacher) {
      setCurrentTeacher(JSON.parse(storedTeacher));
    }
    setIsLoading(false);
  }, []);

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // This would normally be a Firebase auth call
    // For now, we'll simulate a successful registration
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock teacher object with a unique ID
      const teacher: Teacher = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        hasPin: false
      };
      
      setCurrentTeacher(teacher);
      localStorage.setItem('waai-teacher', JSON.stringify(teacher));
      return true;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const login = async (email: string, password: string): Promise<boolean> => {
    // This would normally be a Firebase auth call
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, we'll create a teacher object
      // In a real app, we'd retrieve this from Firebase
      const teacher: Teacher = {
        id: "teacher-123",
        name: "Demo Teacher",
        email,
        hasPin: true
      };
      
      setCurrentTeacher(teacher);
      localStorage.setItem('waai-teacher', JSON.stringify(teacher));
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const setupPin = async (pin: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call to save the hashed PIN
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (currentTeacher) {
        const updatedTeacher = { ...currentTeacher, hasPin: true };
        setCurrentTeacher(updatedTeacher);
        localStorage.setItem('waai-teacher', JSON.stringify(updatedTeacher));
        // In real implementation, we'd save the hashed PIN to Firebase
        localStorage.setItem(`waai-teacher-pin-${currentTeacher.id}`, `hashed_${pin}_placeholder`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Setup PIN error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifyPin = async (pin: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // Simulate API call to verify the PIN
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (currentTeacher) {
        const storedHashedPin = localStorage.getItem(`waai-teacher-pin-${currentTeacher.id}`);
        // In real implementation, we'd use bcrypt to compare
        const isValid = storedHashedPin === `hashed_${pin}_placeholder`;
        return isValid;
      }
      return false;
    } catch (error) {
      console.error("Verify PIN error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setCurrentTeacher(null);
    localStorage.removeItem('waai-teacher');
  };

  return (
    <AuthContext.Provider
      value={{
        currentTeacher,
        isLoading,
        register,
        login,
        setupPin,
        verifyPin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
