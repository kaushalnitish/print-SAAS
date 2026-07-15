import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, FileText, Image as ImageIcon, File, X, AlertCircle, ArrowRight } from 'lucide-react';
import { usePrintFlow } from '../context/PrintFlowContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PrintFile } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const UploadScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { file, setFile } = usePrintFlow();
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper to get file type icon
  const getFileTypeIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (type.includes('image')) return <ImageIcon className="w-8 h-8 text-emerald-500" />;
    if (type.includes('word') || type.includes('officedocument')) return <FileText className="w-8 h-8 text-blue-500" />;
    return <File className="w-8 h-8 text-slate-500" />;
  };

  const validateAndSetFile = (rawFile: File) => {
    setError(null);
    
    // Allowed extensions/types
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.docx'];
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    const fileExtension = '.' + rawFile.name.split('.').pop()?.toLowerCase();
    const isValidExtension = allowedExtensions.includes(fileExtension);
    const isValidType = allowedTypes.includes(rawFile.type) || rawFile.name.endsWith('.docx');

    if (!isValidExtension && !isValidType) {
      setError('Unsupported file format. Please select a PDF, Word document, or image (JPG, PNG).');
      return;
    }

    // 100 MB Limit
    const maxSizeInBytes = 100 * 1024 * 1024;
    if (rawFile.size > maxSizeInBytes) {
      setError('File is too large. Maximum size allowed is 100 MB.');
      return;
    }

    // Dynamic mock page estimation for a rich realistic preview experience later
    let estimatedPages = 1;
    if (fileExtension === '.pdf') {
      // Estimate 1 page per 150KB, minimum 1, max 45 pages
      estimatedPages = Math.min(45, Math.max(1, Math.floor(rawFile.size / (150 * 1024))));
    } else if (fileExtension === '.docx') {
      estimatedPages = Math.min(15, Math.max(1, Math.floor(rawFile.size / (50 * 1024))));
    } else {
      estimatedPages = 1; // Images are always 1 page
    }

    // Create a mock object matching PrintFile interface
    const mockFile: PrintFile = {
      name: rawFile.name,
      size: rawFile.size,
      type: rawFile.type || (fileExtension === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/octet-stream'),
      pages: estimatedPages,
      previewUrl: rawFile.type.startsWith('image/') ? URL.createObjectURL(rawFile) : undefined,
      rawFile,
    };

    setFile(mockFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col justify-between flex-1 px-6 py-8 bg-slate-50/50 max-w-lg mx-auto w-full min-h-[calc(100vh-80px)]">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Upload Your Document</h2>
          <p className="text-slate-500 text-base mt-1 font-medium">Select the file you need to print today.</p>
        </div>

        {/* Dropzone Card */}
        <Card
          id="upload-dropzone-card"
          className={`border-2 border-dashed flex flex-col items-center justify-center py-12 px-6 transition-all duration-300 rounded-[32px] cursor-pointer relative bg-white
            ${isDragging ? 'border-slate-800 bg-slate-50/60 scale-[1.01]' : 'border-slate-200 hover:border-slate-350'}
            ${file ? 'border-solid border-slate-100' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!file ? triggerFileSelect : undefined}
          animateEntrance={true}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.docx,application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileSelect}
            id="file-input-field"
          />

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-4 w-full"
              >
                <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-slate-800">Tap to browse files</p>
                  <p className="text-slate-400 text-sm font-medium">or drag and drop your document here</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-500">
                  <span>PDF, WORD, JPG, PNG</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>Max 100MB</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="loaded"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left relative"
                onClick={(e) => e.stopPropagation()} // Prevent triggering file select
              >
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  {getFileTypeIcon(file.type)}
                </div>
                
                <div className="flex-1 min-w-0 pr-8">
                  <p className="font-bold text-slate-800 text-lg truncate" title={file.name}>
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-slate-400 text-sm font-medium">
                    <span>{formatFileSize(file.size)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-slate-500 font-semibold">{file.pages} {file.pages === 1 ? 'page' : 'pages'}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRemoveFile}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors shadow-sm focus:outline-none"
                  aria-label="Remove selected file"
                  id="remove-file-btn"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 border border-red-150 rounded-2xl flex items-start gap-3 text-red-700"
              id="upload-error-alert"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm md:text-base">
                <p className="font-bold text-red-800 text-base">Unable to upload file</p>
                <p className="text-slate-600 leading-normal">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Button controls */}
      <div className="mt-8">
        <Button
          id="continue-to-settings-btn"
          variant="primary"
          disabled={!file}
          onClick={() => {
            const match = location.pathname.match(/(\/s\/[^/]+)/);
            const prefix = match ? match[1] : '';
            navigate(`${prefix}/settings`);
          }}
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          Continue to Print Settings
        </Button>
      </div>
    </div>
  );
};
