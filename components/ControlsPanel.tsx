
import React, { useState } from 'react';
import { AlgorithmType, AppSettings, Student } from '../types';
import FileUpload from './FileUpload';
import TemplateDownloadLink from './TemplateDownloadLink';
import { exportLayoutAsPDF } from '../services/pdfExporter';
import { saveAppSettings, loadAppSettings } from '../services/appStateSerializer';
import { parseStudentFile } from '../services/excelParser';
import { DeskIcon, TableIcon, TrashIcon, DownloadIcon, UploadIcon, SaveIcon, ShuffleIcon, LightBulbIcon, UsersIcon, UserMinusIcon, QuestionMarkCircleIcon } from './icons';

interface ControlsPanelProps {
  className: string;
  onClassNameChange: (name: string) => void;
  onAddTable: (capacity: 1 | 2 | 4) => void;
  onAddTeacherDesk: () => void;
  onRemoveSelectedItems: () => void;
  canRemove: boolean;
  onApplyAlgorithm: (algorithm: AlgorithmType) => void;
  currentStudents: Student[];
  onStudentsLoad: (students: Student[]) => void;
  onSettingsLoad: (settings: AppSettings) => void;
  currentSettings: AppSettings; 
  isLoading: boolean;
  onClearAssignments: () => void;
  onGroupSelectedTables: () => void;
  canGroup: boolean;
  onUngroupSelectedTables: () => void;
  canUngroup: boolean;
  onOpenInstructions: () => void; // New prop for opening instructions
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  className, onClassNameChange,
  onAddTable, onAddTeacherDesk, onRemoveSelectedItems, canRemove,
  onApplyAlgorithm, currentStudents, onStudentsLoad, onSettingsLoad, currentSettings, isLoading, onClearAssignments,
  onGroupSelectedTables, canGroup,
  onUngroupSelectedTables, canUngroup,
  onOpenInstructions // Destructure new prop
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleStudentFileUpload = async (file: File) => {
    setError(null);
    try {
      const students = await parseStudentFile(file);
      onStudentsLoad(students);
      alert(`${students.length} students loaded successfully!`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during file upload.");
      alert(`Error loading students: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleSettingsUpload = async (file: File) => {
    setError(null);
    try {
      const settings = await loadAppSettings(file);
      onSettingsLoad(settings);
      alert("Settings loaded successfully!");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred loading settings.");
       alert(`Error loading settings: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };
  
  const handleExportPDF = async () => {
     if (isLoading) return;
     try {
        await exportLayoutAsPDF(className);
     } catch (err) {
        alert(`Error exporting PDF: ${err instanceof Error ? err.message : "Unknown error"}`);
     }
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-lg space-y-6">
      {error && <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">{error}</div>}
      
      <div className="flex justify-between items-center">
        <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
        <button 
            onClick={onOpenInstructions}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Show Instructions"
            aria-label="Show Instructions"
        >
            <QuestionMarkCircleIcon className="w-6 h-6" />
        </button>
      </div>
      <input
        type="text"
        id="className"
        value={className}
        onChange={(e) => onClassNameChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 -mt-2"
      />

      <div className="grid grid-cols-2 gap-3">
        <FileUpload
          id="student-upload"
          onFileSelect={handleStudentFileUpload}
          accept=".xlsx, .xls, .csv"
          buttonText="Upload Students"
        />
        <TemplateDownloadLink />
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Layout Tools</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <button onClick={() => onAddTable(1)} className="flex items-center justify-center p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 text-sm shadow">
                <DeskIcon className="w-4 h-4 mr-1.5" /> Add Desk (1)
            </button>
            <button onClick={() => onAddTable(2)} className="flex items-center justify-center p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 text-sm shadow">
                <DeskIcon className="w-4 h-4 mr-1.5" /> Table (2)
            </button>
            <button onClick={() => onAddTable(4)} className="flex items-center justify-center p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 text-sm shadow">
                <DeskIcon className="w-4 h-4 mr-1.5" /> Table (4)
            </button>
            <button onClick={onAddTeacherDesk} className="col-span-1 md:col-span-1 flex items-center justify-center p-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm shadow">
                <TableIcon className="w-4 h-4 mr-1.5" /> Teacher Desk
            </button>
            <button 
                onClick={onRemoveSelectedItems} 
                disabled={!canRemove || isLoading}
                className="flex items-center justify-center p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300 text-sm shadow col-span-2 md:col-span-1"
                title={!canRemove ? "Select item(s) to remove" : "Remove selected item(s)"}
            >
                <TrashIcon className="w-4 h-4 mr-1.5" /> Remove Selected
            </button>
             <button 
                onClick={onGroupSelectedTables} 
                disabled={!canGroup || isLoading}
                className="col-span-3 md:col-span-3 flex items-center justify-center p-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 disabled:bg-gray-300 text-sm shadow"
                title={!canGroup ? "Select at least two tables to group" : "Group selected tables"}
            >
                <UsersIcon className="w-4 h-4 mr-1.5" /> Group Selected Tables
            </button>
            <button 
                onClick={onUngroupSelectedTables} 
                disabled={!canUngroup || isLoading}
                className="col-span-3 md:col-span-3 flex items-center justify-center p-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 disabled:bg-gray-300 text-sm shadow"
                title={!canUngroup ? "Select tables that are part of a group to ungroup" : "Ungroup selected tables"}
            >
                <UserMinusIcon className="w-4 h-4 mr-1.5" /> Ungroup Selected Tables
            </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Assignment Algorithms</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button onClick={() => onApplyAlgorithm(AlgorithmType.Randomized)} disabled={isLoading || currentStudents.length === 0} className="flex items-center justify-center p-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-gray-300 text-sm shadow">
                <ShuffleIcon className="w-4 h-4 mr-1.5" /> Randomized Mix
            </button>
            <button onClick={() => onApplyAlgorithm(AlgorithmType.MichaelsTriangle)} disabled={isLoading || currentStudents.length === 0} className="flex items-center justify-center p-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300 text-sm shadow">
                <LightBulbIcon className="w-4 h-4 mr-1.5" /> Michael's Triangle
            </button>
         </div>
         <button onClick={onClearAssignments} disabled={isLoading} className="w-full mt-2 p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-gray-300 text-sm shadow">
            Clear All Assignments
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Session & Export</h4>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            <button onClick={() => saveAppSettings(currentSettings)} disabled={isLoading} className="flex items-center justify-center p-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 text-sm shadow">
                <SaveIcon className="w-4 h-4 mr-1.5" /> Save Settings
            </button>
             <FileUpload
                id="settings-upload"
                onFileSelect={handleSettingsUpload}
                accept=".json"
                buttonText="Load Settings"
            />
            <button onClick={handleExportPDF} disabled={isLoading} className="flex items-center justify-center p-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 text-sm shadow">
                <DownloadIcon className="w-4 h-4 mr-1.5" /> Export PDF
            </button>
        </div>
      </div>
    </div>
  );
};

export default ControlsPanel;
