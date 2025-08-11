
import { AppSettings } from '../types';
import { APP_SETTINGS_FILENAME } from '../constants';

export const saveAppSettings = (settings: AppSettings): void => {
  try {
    const jsonString = JSON.stringify(settings, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = APP_SETTINGS_FILENAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error saving app settings:", error);
    alert("Failed to save settings. Check console for details.");
  }
};

export const loadAppSettings = (file: File): Promise<AppSettings> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        if (!jsonString) {
          reject(new Error("File content is empty."));
          return;
        }
        const parsedSettings = JSON.parse(jsonString);
        
        // Basic validation (can be more thorough)
        if (!parsedSettings.students || !parsedSettings.tables || typeof parsedSettings.className !== 'string') {
          reject(new Error("Invalid settings file format. Missing students, tables, or className."));
          return;
        }
        // Further validation for tables and slots if necessary
        if (parsedSettings.tables.some((table: any) => !table.studentSlots || !table.id || table.capacity === undefined || table.rotation === undefined)) {
            reject(new Error("Invalid table data in settings file."));
            return;
        }

        const settings: AppSettings = {
          ...parsedSettings,
          tableGroups: parsedSettings.tableGroups || [], // Ensure tableGroups exists
        };
        
        resolve(settings);
      } catch (error) {
        console.error("Error loading app settings:", error);
        reject(new Error(`Failed to parse settings file. ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsText(file);
  });
};
