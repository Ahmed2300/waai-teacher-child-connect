
import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', withText = true }) => {
  const dimensions = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
  };

  const textSize = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${dimensions[size]} rounded-full bg-gradient-to-br from-waai-primary to-waai-secondary flex items-center justify-center`}>
        <span className="text-white font-bold text-lg">W</span>
      </div>
      {withText && (
        <span className={`font-bold ${textSize[size]} bg-gradient-to-r from-waai-primary to-waai-accent1 bg-clip-text text-transparent`}>
          Waai
        </span>
      )}
    </div>
  );
};

export default Logo;
