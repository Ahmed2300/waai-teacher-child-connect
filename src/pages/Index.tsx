
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { BookOpen, UserPlus, LogIn } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col">
      <header className="container mx-auto py-6 flex justify-between items-center">
        <Logo size="large" />
        <div className="space-x-4">
          <Button
            variant="outline"
            className="border-waai-primary text-waai-primary hover:bg-waai-primary hover:text-white"
            onClick={() => navigate('/teacher/login')}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>
          <Button
            onClick={() => navigate('/teacher/register')}
            className="bg-waai-primary hover:bg-waai-accent1"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Register
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-center gap-12">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-waai-primary to-waai-secondary bg-clip-text text-transparent">
            Connect Teachers & Children
          </h1>
          <p className="text-xl mb-8 text-gray-700 max-w-xl">
            A secure and engaging platform for educators to create profiles for their students and track their progress.
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Button 
              size="lg" 
              className="bg-waai-primary hover:bg-waai-accent1"
              onClick={() => navigate('/teacher/register')}
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-waai-accent2 text-waai-accent2 hover:bg-waai-accent2 hover:text-white"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>
        </div>

        <div className="md:w-1/2 grid grid-cols-2 gap-6">
          <Card className="transform rotate-2 shadow-lg border-waai-primary/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-waai-primary mb-2">For Teachers</h3>
              <p className="text-gray-600">Manage student profiles, track progress, and create personalized learning paths.</p>
            </CardContent>
          </Card>
          <Card className="transform -rotate-2 shadow-lg border-waai-secondary/20 mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-waai-secondary mb-2">For Children</h3>
              <p className="text-gray-600">Fun, engaging interface with personalized avatars and interactive learning.</p>
            </CardContent>
          </Card>
          <Card className="transform -rotate-1 shadow-lg border-waai-accent1/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-waai-accent1 mb-2">Secure</h3>
              <p className="text-gray-600">Two-factor authentication with email and PIN protection for teacher accounts.</p>
            </CardContent>
          </Card>
          <Card className="transform rotate-1 shadow-lg border-waai-accent2/20 mt-4">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-waai-accent2 mb-2">Adaptable</h3>
              <p className="text-gray-600">Works perfectly in classroom settings or for individual learning sessions.</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-white py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2023 Waai. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
