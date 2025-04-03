
import { google } from 'googleapis';

// Google Drive credentials
const CLIENT_ID = "344013693130-64rfdip3un3ghdcnavcfe3clm32fv1nu.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN = "1//05GHY4sw4REXuCgYIARAAGAUSNwF-L9IrJpJXt7TTxozPiXicVjwDKhlvCLjkWnwHKLBqS2iWbeTvMP-4h1t66Xsbruu0kK1S7Vo";
const FOLDER_ID = "1XiP6oKfidTOFUw06uF6QuWON-JPgghcU";

// Create a new OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET
);

// Set refresh token
oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN
});

// Create Google Drive instance
const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
});

export interface UploadedFile {
  id: string;
  name: string;
  webViewLink: string;
  thumbnailLink?: string;
  fileType: 'image' | 'video';
}

/**
 * Upload a file to Google Drive
 * @param file The file to upload
 * @returns Details about the uploaded file
 */
export const uploadFileToDrive = async (file: File): Promise<UploadedFile | null> => {
  try {
    console.log('Starting file upload to Google Drive...');
    
    // Determine the file type based on MIME type
    const fileType = file.type.startsWith('image/') ? 'image' : 'video';
    
    // Create a buffer from the file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload the file to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        mimeType: file.type,
        parents: [FOLDER_ID]
      },
      media: {
        mimeType: file.type,
        body: buffer
      },
      fields: 'id,name,webViewLink,thumbnailLink',
    });
    
    // Make file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    console.log('File uploaded successfully:', response.data);
    
    return {
      id: response.data.id!,
      name: response.data.name!,
      webViewLink: response.data.webViewLink!,
      thumbnailLink: response.data.thumbnailLink,
      fileType
    };
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    return null;
  }
};

/**
 * List files from the specified folder
 * @returns Array of file details
 */
export const listDriveFiles = async (): Promise<UploadedFile[]> => {
  try {
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents`,
      fields: 'files(id, name, webViewLink, thumbnailLink, mimeType)',
      spaces: 'drive'
    });
    
    return response.data.files?.map(file => ({
      id: file.id!,
      name: file.name!,
      webViewLink: file.webViewLink!,
      thumbnailLink: file.thumbnailLink,
      fileType: file.mimeType?.startsWith('image/') ? 'image' : 'video'
    })) || [];
  } catch (error) {
    console.error('Error listing files from Google Drive:', error);
    return [];
  }
};

/**
 * Delete a file from Google Drive
 * @param fileId The ID of the file to delete
 * @returns Whether the deletion was successful
 */
export const deleteDriveFile = async (fileId: string): Promise<boolean> => {
  try {
    await drive.files.delete({
      fileId: fileId
    });
    return true;
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error);
    return false;
  }
};
