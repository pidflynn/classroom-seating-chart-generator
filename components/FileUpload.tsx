
import React, { useRef } from 'react';
import { UploadIcon } from './icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  buttonText: string;
  id: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept, buttonText, id }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      if (fileInputRef.current) { // Reset file input
          fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept || "*/*"}
        className="hidden"
        id={id}
      />
      <button
        onClick={handleClick}
        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150 ease-in-out shadow-md"
      >
        <UploadIcon className="w-5 h-5 mr-2" />
        {buttonText}
      </button>
    </div>
  );
};

export default FileUpload;
