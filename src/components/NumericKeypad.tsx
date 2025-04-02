
import React from "react";
import { Button } from "@/components/ui/button";
import { Backspace, Check } from "lucide-react";

interface NumericKeypadProps {
  onDigitPress: (digit: number) => void;
  onBackspace: () => void;
  onConfirm: () => void;
  disabled?: boolean;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({ 
  onDigitPress, 
  onBackspace, 
  onConfirm,
  disabled = false
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-xs mx-auto mt-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
        <Button
          key={digit}
          variant="outline"
          className="h-16 text-2xl font-semibold bg-white hover:bg-gray-100"
          onClick={() => onDigitPress(digit)}
          disabled={disabled}
        >
          {digit}
        </Button>
      ))}
      <Button
        variant="outline"
        className="h-16 bg-white hover:bg-gray-100"
        onClick={onBackspace}
        disabled={disabled}
      >
        <Backspace className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        className="h-16 text-2xl font-semibold bg-white hover:bg-gray-100"
        onClick={() => onDigitPress(0)}
        disabled={disabled}
      >
        0
      </Button>
      <Button
        variant="default"
        className="h-16 bg-waai-primary hover:bg-waai-accent1"
        onClick={onConfirm}
        disabled={disabled}
      >
        <Check className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default NumericKeypad;
