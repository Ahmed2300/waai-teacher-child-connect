
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Image, FileVideo } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { uploadFileToDrive } from "@/services/googleDriveService";
import { MediaFile } from "@/types/Activity";

interface MediaUploaderProps {
  onFileUploaded: (file: MediaFile) => void;
  currentMedia?: MediaFile;
  onRemoveMedia?: () => void;
  allowedTypes?: string[];
  maxSizeMB?: number;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onFileUploaded,
  currentMedia,
  onRemoveMedia,
  allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/webm"],
  maxSizeMB = 10
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please upload one of the following: ${allowedTypes.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast({
        title: "File too large",
        description: `File must be smaller than ${maxSizeMB}MB`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    toast({
      title: "Uploading...",
      description: "Your file is being uploaded, please wait.",
    });

    try {
      const uploadedFile = await uploadFileToDrive(file);
      
      if (uploadedFile) {
        const mediaFile: MediaFile = {
          id: uploadedFile.id,
          name: uploadedFile.name,
          url: uploadedFile.webViewLink,
          thumbnailUrl: uploadedFile.thumbnailLink,
          type: uploadedFile.fileType
        };
        
        onFileUploaded(mediaFile);
        
        toast({
          title: "File uploaded successfully",
          description: `${file.name} has been uploaded.`,
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. We're using demo mode for now.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      {currentMedia ? (
        <Card className="relative p-2 border-2 border-dashed border-primary/50 mb-4">
          <div className="absolute top-2 right-2 z-10">
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={onRemoveMedia}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {currentMedia.type === 'image' ? (
            <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden rounded-md">
              <img 
                src={currentMedia.thumbnailUrl || currentMedia.url} 
                alt={currentMedia.name} 
                className="object-contain max-w-full max-h-full"
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted flex items-center justify-center rounded-md">
              <div className="text-center">
                <FileVideo className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{currentMedia.name}</p>
                <a 
                  href={currentMedia.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-primary hover:underline mt-1 block"
                >
                  Open video in new tab
                </a>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <div 
          className="border-2 border-dashed border-primary/50 rounded-lg p-6 text-center mb-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={handleButtonClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={allowedTypes.join(',')}
            className="hidden"
          />
          
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          
          <h3 className="text-lg font-medium mb-1">
            {isUploading ? "Uploading..." : "Upload Media"}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop or click to upload an image or video
          </p>
          
          <p className="text-xs text-muted-foreground">
            Supported formats: JPG, PNG, GIF, MP4, WEBM (Max: {maxSizeMB}MB)
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
