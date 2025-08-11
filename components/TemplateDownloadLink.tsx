
import React from 'react';
import { STUDENT_CSV_TEMPLATE_HEADERS, STUDENT_CSV_TEMPLATE_DATA, STUDENT_CSV_TEMPLATE_FILENAME } from '../constants';
import { DownloadIcon } from './icons';

const TemplateDownloadLink: React.FC = () => {
  const handleDownload = () => {
    const csvContent = `${STUDENT_CSV_TEMPLATE_HEADERS}\n${STUDENT_CSV_TEMPLATE_DATA}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", STUDENT_CSV_TEMPLATE_FILENAME);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-150 ease-in-out shadow-md"
    >
      <DownloadIcon className="w-5 h-5 mr-2" />
      Download Template (.csv)
    </button>
  );
};

export default TemplateDownloadLink;
