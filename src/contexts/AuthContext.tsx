
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, database } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  ref, 
  set, 
  get, 
  child, 
  onValue
} from "firebase/database";

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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  verifyPin: (pin: string) => Promise<boolean>;
  setupPin: (pin: string) => Promise<boolean>;
  logout: () => void;
  isRemembered: () => boolean;
  checkRememberedLogin: () => Promise<boolean>;
}

const AUTH_STORAGE_KEY = 'waai_teacher_auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Get teacher data from database and update state
  const fetchTeacherData = async (user: FirebaseUser) => {
    try {
      // Get teacher data from Realtime Database
      const teacherRef = ref(database, `teachers/${user.uid}/profile`);
      onValue(teacherRef, (snapshot) => {
        if (snapshot.exists()) {
          const teacherData = snapshot.val();
          
          // Get PIN information
          const pinRef = ref(database, `teachers/${user.uid}/security/hasPin`);
          get(pinRef).then((pinSnapshot) => {
            const hasPin = pinSnapshot.exists() ? pinSnapshot.val() : false;
            
            setCurrentTeacher({
              id: user.uid,
              name: teacherData.name,
              email: teacherData.email,
              hasPin: hasPin
            });
            
            setIsLoading(false);
          });
        } else {
          setCurrentTeacher(null);
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      setCurrentTeacher(null);
      setIsLoading(false);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchTeacherData(user);
      } else {
        setCurrentTeacher(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Check if we have remembered credentials
  useEffect(() => {
    const checkForSavedLogin = async () => {
      if (!currentTeacher) {
        await checkRememberedLogin();
      }
    };
    
    checkForSavedLogin();
  }, []);

  const saveLoginToStorage = (email: string, password: string) => {
    try {
      // In a production app, you'd want to use a more secure storage method
      // and/or encrypt the credentials before storing
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email, password }));
    } catch (error) {
      console.error("Error saving auth data to storage:", error);
    }
  };

  const getLoginFromStorage = () => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuth) {
        return JSON.parse(savedAuth);
      }
      return null;
    } catch (error) {
      console.error("Error getting auth data from storage:", error);
      return null;
    }
  };

  const clearLoginFromStorage = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Error removing auth data from storage:", error);
    }
  };

  const isRemembered = (): boolean => {
    return !!getLoginFromStorage();
  };

  const checkRememberedLogin = async (): Promise<boolean> => {
    try {
      const savedAuth = getLoginFromStorage();
      if (savedAuth) {
        const { email, password } = savedAuth;
        return await login(email, password, true);
      }
      return false;
    } catch (error) {
      console.error("Error during auto-login:", error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create teacher profile in Realtime Database
      await set(ref(database, `teachers/${user.uid}/profile`), {
        name,
        email,
        createdAt: Date.now()
      });
      
      // Set hasPin to false initially
      await set(ref(database, `teachers/${user.uid}/security/hasPin`), false);
      
      const teacher: Teacher = {
        id: user.uid,
        name,
        email,
        hasPin: false
      };
      
      setCurrentTeacher(teacher);
      return true;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Sign in user with Firebase Authentication
      await signInWithEmailAndPassword(auth, email, password);
      
      // Save credentials if rememberMe is true
      if (rememberMe) {
        saveLoginToStorage(email, password);
      }
      
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
      
      if (currentTeacher) {
        // In a real application, you'd want to hash the PIN before storing
        // For simplicity, we'll store the PIN as is for now
        // This is NOT secure and should be replaced with proper hashing
        const hashedPin = `hashed_${pin}_placeholder`;
        
        // Store the hashed PIN in the database
        await set(ref(database, `teachers/${currentTeacher.id}/security/hashedPin`), hashedPin);
        
        // Update hasPin flag
        await set(ref(database, `teachers/${currentTeacher.id}/security/hasPin`), true);
        
        // Update current teacher state
        const updatedTeacher = { ...currentTeacher, hasPin: true };
        setCurrentTeacher(updatedTeacher);
        
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
      
      if (currentTeacher) {
        // Get the stored hashed PIN from the database
        const pinRef = ref(database, `teachers/${currentTeacher.id}/security/hashedPin`);
        const snapshot = await get(pinRef);
        
        if (snapshot.exists()) {
          const storedHashedPin = snapshot.val();
          
          // In a real application, you'd use a proper comparison method
          // For simplicity, we're doing a direct comparison with our placeholder
          const isValid = storedHashedPin === `hashed_${pin}_placeholder`;
          
          return isValid;
        }
      }
      return false;
    } catch (error) {
      console.error("Verify PIN error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentTeacher(null);
      clearLoginFromStorage();
    } catch (error) {
      console.error("Logout error:", error);
    }
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
        logout,
        isRemembered,
        checkRememberedLogin
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
