
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ChildrenProvider } from "./contexts/ChildrenContext";
import { ActivitiesProvider } from "./contexts/ActivitiesContext";

import Index from "./pages/Index";
import TeacherRegister from "./pages/TeacherRegister";
import TeacherLogin from "./pages/TeacherLogin";
import TeacherPin from "./pages/TeacherPin";
import TeacherDashboard from "./pages/TeacherDashboard";
import ChildSelection from "./pages/ChildSelection";
import ChildWelcome from "./pages/ChildWelcome";
import AddChild from "./pages/AddChild";
import CreateActivity from "./pages/CreateActivity";
import ActivityDetail from "./pages/ActivityDetail";
import ChildActivity from "./pages/ChildActivity";
import ActivityResults from "./pages/ActivityResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ChildrenProvider>
        <ActivitiesProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/teacher/register" element={<TeacherRegister />} />
                <Route path="/teacher/login" element={<TeacherLogin />} />
                <Route path="/teacher/pin" element={<TeacherPin />} />
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher/add-child" element={<AddChild />} />
                <Route path="/teacher/create-activity" element={<CreateActivity />} />
                <Route path="/teacher/activity/:id" element={<ActivityDetail />} />
                <Route path="/teacher/results/:childId/:activityId" element={<ActivityResults />} />
                <Route path="/child/selection" element={<ChildSelection />} />
                <Route path="/child/welcome/:id" element={<ChildWelcome />} />
                <Route path="/child/activity/:childId/:activityId" element={<ChildActivity />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ActivitiesProvider>
      </ChildrenProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
