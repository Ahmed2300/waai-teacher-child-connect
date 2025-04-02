
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useChildren, Child } from '@/contexts/ChildrenContext';

interface ChildCardProps {
  child: Child;
  onClick?: () => void;
  isSelectable?: boolean;
  isSmall?: boolean;
}

const ChildCard: React.FC<ChildCardProps> = ({ 
  child, 
  onClick, 
  isSelectable = false,
  isSmall = false
}) => {
  const { availableAvatars } = useChildren();
  const avatar = availableAvatars.find(a => a.id === child.avatarId);

  return (
    <Card 
      className={`
        overflow-hidden transition-all border-2
        ${isSelectable ? 'cursor-pointer hover:scale-105 hover:shadow-md border-transparent hover:border-waai-accent1' : ''}
        ${isSmall ? 'w-full' : 'w-full max-w-xs'}
      `}
      onClick={onClick}
    >
      <CardContent className={`p-4 flex flex-col items-center ${isSmall ? 'gap-2' : 'gap-4'}`}>
        <Avatar className={isSmall ? "h-14 w-14" : "h-24 w-24"}>
          <AvatarImage 
            src={avatar?.url} 
            alt={child.name} 
            className={isSelectable ? "animate-bounce-slow" : ""}
          />
          <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h3 className={`font-medium ${isSmall ? 'text-base' : 'text-xl'}`}>{child.name}</h3>
      </CardContent>
    </Card>
  );
};

export default ChildCard;
