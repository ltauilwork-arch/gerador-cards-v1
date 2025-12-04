export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
  modifiedTime?: string;
}

const TARGET_FOLDER_ID = "13iL9TyT8iWzCd07jM8EfUE4aJuqX_A-z";

export const listFiles = async (accessToken: string): Promise<DriveFile[]> => {
  try {
    // Query to list files specifically in the target folder
    const query = `'${TARGET_FOLDER_ID}' in parents and trashed = false`;
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,thumbnailLink,webViewLink,modifiedTime)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching files: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error("Failed to list Drive files:", error);
    throw error;
  }
};

export const uploadFile = async (
  accessToken: string,
  blob: Blob,
  name: string
): Promise<DriveFile> => {
  try {
    const metadata = {
      name: name,
      parents: [TARGET_FOLDER_ID],
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", blob);

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    if (!response.ok) {
      throw new Error(`Error uploading file: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to upload file:", error);
    throw error;
  }
};

export const updateFile = async (
  accessToken: string,
  fileId: string,
  blob: Blob
): Promise<DriveFile> => {
  try {
    const form = new FormData();
    // For now, just the file content.
    // We use multipart to be consistent and allow future metadata updates.
    form.append(
      "metadata",
      new Blob([JSON.stringify({})], { type: "application/json" })
    );
    form.append("file", blob);
    
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    if (!response.ok) {
      throw new Error(`Error updating file: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to update file:", error);
    throw error;
  }
};
