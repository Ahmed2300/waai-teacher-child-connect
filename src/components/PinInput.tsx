
import React, { useState, useEffect } from "react";

interface PinInputProps {
  length: number;
  value: string;
  onChange?: (value: string) => void;
  isHidden?: boolean;
  onComplete?: () => void;
  error?: boolean;
}

const PinInput: React.FC<PinInputProps> = ({ 
  length, 
  value, 
  onChange,
  isHidden = true,
  onComplete,
  error = false
}) => {
  const [focused, setFocused] = useState(false);

  // Create array of pin digits based on the current value
  const digits = value.split('').slice(0, length);
  
  // Fill remaining slots with empty strings
  while (digits.length < length) {
    digits.push('');
  }

  // Call onComplete when the PIN is fully entered
  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete();
    }
  }, [value, length, onComplete]);

  const handleClick = () => {
    setFocused(true);
  };

  // Render dots for hidden digits or actual numbers
  const renderDigit = (digit: string, index: number) => {
    if (digit === '') {
      return <div className="h-2 w-2 rounded-full bg-transparent"></div>;
    }
    return isHidden ? 
      <div className="h-3 w-3 rounded-full bg-waai-dark"></div> : 
      <span>{digit}</span>;
  };

  return (
    <div 
      className="flex justify-center gap-4 mb-6"
      onClick={handleClick}
    >
      {digits.map((digit, index) => (
        <div 
          key={index}
          className={`
            w-14 h-14 flex items-center justify-center
            border-2 ${digit ? 'border-waai-primary' : 'border-gray-300'}
            ${error ? 'border-red-500' : ''}
            rounded-lg text-2xl font-semibold select-none
          `}
        >
          {renderDigit(digit, index)}
        </div>
      ))}
    </div>
  );
};

export default PinInput;
