
// This is a browser-compatible version of Google Drive API integration
// using direct API calls instead of the Node.js googleapis library

export interface UploadedFile {
  id: string;
  name: string;
  webViewLink: string;
  thumbnailLink?: string;
  fileType: 'image' | 'video';
}

// Google Drive API configuration
const CLIENT_ID = "344013693130-64rfdip3un3ghdcnavcfe3clm32fv1nu.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN = "1//05GHY4sw4REXuCgYIARAAGAUSNwF-L9IrJpJXt7TTxozPiXicVjwDKhlvCLjkWnwHKLBqS2iWbeTvMP-4h1t66Xsbruu0kK1S7Vo";
const FOLDER_ID = "1XiP6oKfidTOFUw06uF6QuWON-JPgghcU";
const API_BASE_URL = "https://www.googleapis.com/drive/v3";

/**
 * Get a fresh access token using the refresh token
 */
const getAccessToken = async (): Promise<string> => {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${data.error}`);
    }

    return data.access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
};

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
    
    // Get a fresh access token
    const accessToken = await getAccessToken();
    
    // Create file metadata
    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: [FOLDER_ID]
    };

    // Create multipart request
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    // Upload the file with metadata
    const uploadResponse = await fetch(`${API_BASE_URL}/files?uploadType=multipart&fields=id,name,webViewLink,thumbnailLink`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(`Upload failed: ${JSON.stringify(errorData)}`);
    }

    const fileData = await uploadResponse.json();
    
    // Make file publicly accessible
    await fetch(`${API_BASE_URL}/files/${fileData.id}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });
    
    console.log('File uploaded successfully:', fileData);
    
    return {
      id: fileData.id,
      name: fileData.name,
      webViewLink: fileData.webViewLink,
      thumbnailLink: fileData.thumbnailLink,
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
    // Get a fresh access token
    const accessToken = await getAccessToken();

    const response = await fetch(
      `${API_BASE_URL}/files?q='${FOLDER_ID}'+in+parents&fields=files(id,name,webViewLink,thumbnailLink,mimeType)&spaces=drive`, 
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.files?.map((file: any) => ({
      id: file.id,
      name: file.name,
      webViewLink: file.webViewLink,
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
    // Get a fresh access token
    const accessToken = await getAccessToken();

    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error);
    return false;
  }
};
