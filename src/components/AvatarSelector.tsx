
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useChildren, Avatar as AvatarType } from '@/contexts/ChildrenContext';

interface AvatarSelectorProps {
  selectedAvatarId: string;
  onSelect: (avatarId: string) => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ 
  selectedAvatarId, 
  onSelect 
}) => {
  const { availableAvatars } = useChildren();

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-3">Select an avatar</h3>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {availableAvatars.map((avatar) => (
          <div 
            key={avatar.id}
            onClick={() => onSelect(avatar.id)}
            className={`
              cursor-pointer p-2 rounded-lg transition-all
              ${selectedAvatarId === avatar.id 
                ? 'bg-waai-primary/20 ring-2 ring-waai-primary' 
                : 'hover:bg-gray-100'
              }
            `}
          >
            <Avatar className="h-16 w-16 mx-auto">
              <AvatarImage src={avatar.url} alt={avatar.description} />
              <AvatarFallback>{avatar.description.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-xs text-center mt-2 text-gray-700">{avatar.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelector;
