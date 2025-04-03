
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, HelpCircle, Image } from 'lucide-react';
import { Question, MediaFile } from '@/types/Activity';
import MediaUploader from './MediaUploader';

interface QuestionFormProps {
  question: Question;
  index: number;
  onTextChange: (id: string, text: string) => void;
  onOptionTextChange: (questionId: string, optionId: string, text: string) => void;
  onCorrectOptionChange: (questionId: string, optionId: string) => void;
  onRemove: (id: string) => void;
  onMediaChange: (questionId: string, media?: MediaFile) => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  index,
  onTextChange,
  onOptionTextChange,
  onCorrectOptionChange,
  onRemove,
  onMediaChange
}) => {
  const isTrueFalse = question.type === 'true_false';
  
  const handleMediaUploaded = (media: MediaFile) => {
    onMediaChange(question.id, media);
  };
  
  const handleRemoveMedia = () => {
    onMediaChange(question.id, undefined);
  };
  
  return (
    <Card className="border-waai-accent1/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">
          <span className="text-waai-primary">Question {index + 1}</span> 
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({isTrueFalse ? 'True/False' : 'Multiple Choice'})
          </span>
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onRemove(question.id)}
          className="text-gray-500 hover:text-red-500 hover:bg-red-50"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`question-${question.id}`}>Question Text</Label>
          <Input
            id={`question-${question.id}`}
            value={question.text}
            onChange={(e) => onTextChange(question.id, e.target.value)}
            placeholder={isTrueFalse ? "Enter true/false statement..." : "Enter question..."}
          />
        </div>
        
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Question Media (Optional)
          </Label>
          <MediaUploader 
            onFileUploaded={handleMediaUploaded}
            currentMedia={question.media}
            onRemoveMedia={handleRemoveMedia}
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-3">
            <Label>
              {isTrueFalse ? "Statement is:" : "Answer Options"}
            </Label>
            <Label className="text-sm text-gray-500">
              Select Correct Answer
            </Label>
          </div>
          
          <div className="space-y-3">
            {question.options.map((option) => (
              <div key={option.id} className="flex items-center gap-3">
                <div className="flex-1">
                  {isTrueFalse ? (
                    <div className="py-2 px-3 rounded-md bg-gray-100">
                      {option.text}
                    </div>
                  ) : (
                    <Input
                      value={option.text}
                      onChange={(e) => onOptionTextChange(question.id, option.id, e.target.value)}
                      placeholder="Enter option..."
                    />
                  )}
                </div>
                
                <div>
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={option.isCorrect}
                    onChange={() => onCorrectOptionChange(question.id, option.id)}
                    className="rounded-full h-4 w-4 text-waai-primary focus:ring-waai-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionForm;
