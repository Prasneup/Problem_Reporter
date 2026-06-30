import { supabase } from '../lib/supabase';

/**
 * Uploads a file (or base64 data string) to the specified Supabase storage bucket.
 * Returns the public URL of the uploaded asset.
 */
export const storageService = {
  async uploadFile(
    file: File | string,
    bucketName: string,
    folderPath: string = ''
  ): Promise<string> {
    try {
      let fileBody: File | Blob;
      let fileExt = 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      if (typeof file === 'string') {
        // Handle base64 string
        if (file.startsWith('data:')) {
          const mimeMatch = file.match(/data:([^;]+);base64,/);
          if (mimeMatch) {
            fileExt = mimeMatch[1].split('/')[1] || 'jpg';
          }
          const base64Data = file.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          fileBody = new Blob([byteArray], { type: mimeMatch ? mimeMatch[1] : 'image/jpeg' });
        } else {
          // It's a remote URL, just return it as is
          return file;
        }
      } else {
        fileBody = file;
        fileExt = file.name.split('.').pop() || 'jpg';
      }

      const fullPath = folderPath
        ? `${folderPath}/${fileName}.${fileExt}`
        : `${fileName}.${fileExt}`;

      const { error } = await supabase.storage
        ? await supabase.storage.from(bucketName).upload(fullPath, fileBody, {
          cacheControl: '3600',
          upsert: false,
        })
        : { error: new Error('Supabase storage is not initialized') };

      if (error) {
        throw error;
      }

      const { data } = supabase.storage.from(bucketName).getPublicUrl(fullPath);
      return data.publicUrl;
    } catch (err) {
      console.error('Storage upload failed:', err);
      throw err;
    }
  },

  async uploadReportImage(file: File | string): Promise<string> {
    // Standard bucket: report-images
    return this.uploadFile(file, 'report-images');
  },

  async uploadVerificationDoc(file: File | string): Promise<string> {
    // Public/private verification docs, we can upload to a folder or same bucket
    return this.uploadFile(file, 'report-images', 'verification');
  }
};

export default storageService;
