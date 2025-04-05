
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home } from 'lucide-react';

interface CompletionScreenProps {
  childName: string;
  activityTitle: string;
  score: {
    correct: number;
    total: number;
  };
  onFinish: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({
  childName,
  activityTitle,
  score,
  onFinish
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="border-4 border-waai-primary shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <motion.div 
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <CheckCircle className="h-20 w-20 text-waai-primary mx-auto" />
                </motion.div>
              </div>
              
              <h1 className="text-3xl font-bold mb-4 text-waai-primary">
                رائع يا {childName}!
              </h1>
              
              <p className="text-xl mb-6">
                لقد أكملت النشاط: 
                <span className="font-semibold block mt-2">{activityTitle}</span>
              </p>
              
              <div className="bg-waai-primary/10 rounded-lg p-4 mb-8">
                <p className="text-2xl font-bold">
                  النتيجة: {score.correct} / {score.total}
                </p>
                <div className="h-4 bg-gray-200 rounded-full mt-2">
                  <div 
                    className="h-4 bg-waai-primary rounded-full"
                    style={{ width: `${(score.correct / score.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <Button
                onClick={onFinish}
                size="lg"
                className="bg-waai-secondary hover:bg-waai-accent2 w-full py-6 text-lg"
              >
                <Home className="ml-2 h-6 w-6" />
                العودة إلى الصفحة الرئيسية
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default CompletionScreen;
