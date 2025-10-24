import { ref, uploadBytes, getDownloadURL, deleteObject, getMetadata } from 'firebase/storage';
import { storage } from './firebase-client';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  contentType: string;
}

export class StorageService {
  /**
   * Upload PDF file to Firebase Storage
   */
  static async uploadContractPDF(
    file: File, 
    contractId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Create storage reference
      const fileName = `contract-${contractId}-${Date.now()}.pdf`;
      const storageRef = ref(storage, `contracts/${contractId}/${fileName}`);
      
      // Upload file
      const uploadTask = uploadBytes(storageRef, file);
      
      // Get download URL
      const snapshot = await uploadTask;
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Get file metadata
      const metadata = await getMetadata(snapshot.ref);
      
      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        size: metadata.size,
        contentType: metadata.contentType || 'application/pdf'
      };
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw new Error('Failed to upload PDF file');
    }
  }

  /**
   * Delete PDF file from Firebase Storage
   */
  static async deleteContractPDF(contractId: string, fileName: string): Promise<void> {
    try {
      const storageRef = ref(storage, `contracts/${contractId}/${fileName}`);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting PDF:', error);
      throw new Error('Failed to delete PDF file');
    }
  }

  /**
   * Get file metadata
   */
  static async getFileMetadata(path: string) {
    try {
      const storageRef = ref(storage, path);
      return await getMetadata(storageRef);
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error('Failed to get file metadata');
    }
  }

  /**
   * Validate PDF file
   */
  static validatePDFFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Please upload a PDF file' };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    // Check if file is empty
    if (file.size === 0) {
      return { valid: false, error: 'File cannot be empty' };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
