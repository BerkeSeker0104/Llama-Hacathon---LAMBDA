'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { StorageService } from '@/lib/storage-service';

interface PDFUploadProps {
  contractId: string;
  onUploadComplete: (result: { url: string; path: string; size: number }) => void;
  onUploadError: (error: string) => void;
  existingUrl?: string;
  disabled?: boolean;
}

export default function PDFUpload({ 
  contractId, 
  onUploadComplete, 
  onUploadError, 
  existingUrl,
  disabled = false 
}: PDFUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [disabled]);

  const handleFileSelect = (file: File) => {
    setError(null);
    
    // Validate file
    const validation = StorageService.validatePDFFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const result = await StorageService.uploadContractPDF(
        selectedFile,
        contractId,
        (progress) => {
          setUploadProgress(progress.percentage);
        }
      );

      onUploadComplete({
        url: result.url,
        path: result.path,
        size: result.size
      });

      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      onUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
            <div>
              <p className="text-lg font-medium">Uploading PDF...</p>
              <p className="text-sm text-gray-600">{uploadProgress.toFixed(0)}% complete</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <FileText className="h-12 w-12 text-green-500" />
              <div className="text-left">
                <p className="font-medium text-green-700">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">
                  {StorageService.formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                disabled={disabled}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : existingUrl ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div className="text-left">
                <p className="font-medium text-green-700">PDF Uploaded</p>
                <p className="text-sm text-gray-600">Contract PDF is ready for analysis</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
              disabled={disabled}
            >
              Replace PDF
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium">Upload Contract PDF</p>
              <p className="text-sm text-gray-600">
                Drag and drop your PDF here, or click to browse
              </p>
            </div>
            <div className="text-xs text-gray-500">
              <p>Maximum file size: 10MB</p>
              <p>Supported format: PDF only</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Upload Status */}
      {existingUrl && (
        <div className="mt-4">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            PDF Ready for Analysis
          </Badge>
        </div>
      )}
    </div>
  );
}
