
import { Student, Gender } from '../types';

declare const XLSX: any; // XLSX is loaded from CDN

export const parseStudentFile = (file: File): Promise<Student[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const fileData = event.target?.result;
        if (!fileData) {
          reject(new Error("Failed to read file contents."));
          return;
        }

        let workbook;
        if (file.type === "text/csv" || file.name.endsWith(".csv")) {
          workbook = XLSX.read(fileData, { type: 'string' });
        } else {
          workbook = XLSX.read(fileData, { type: 'array' });
        }

        if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
          reject(new Error("Could not parse the workbook. It might be empty, corrupted, or an unsupported format."));
          return;
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        if (!worksheet) {
          reject(new Error("The first sheet in the workbook is missing or unreadable."));
          return;
        }
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false }) as any[][];
        
        if (jsonData.length < 2) { // Expecting headers + at least one data row
          reject(new Error("No student data found in the file. Ensure headers and at least one data row are present."));
          return;
        }

        const rawHeaders = jsonData[0] as any[];
        const headers = rawHeaders.map((h, index) => {
            let headerText = h ? h.toString() : ""; // Handle null/undefined cells
            if (index === 0) {
                headerText = headerText.replace(/^\uFEFF/, ''); // Remove BOM from first header
            }
            return headerText.trim().toLowerCase();
        });
        
        console.log("Processed Headers by Parser:", headers); // For debugging

        const expectedHeaderKeys = {
            name: 'Name',
            nationality: 'Nationality',
            ability: 'English Ability (1-5)',
            gender: 'Gender'
        };
        
        const headerChecks = {
            name: (h: string) => h === 'name',
            nationality: (h: string) => h === 'nationality',
            ability: (h: string) => h.includes('english ability') || h.includes('englishability'),
            gender: (h: string) => h.includes('gender')
        };

        const headerIndices = {
            name: headers.findIndex(headerChecks.name),
            nationality: headers.findIndex(headerChecks.nationality),
            ability: headers.findIndex(headerChecks.ability),
            gender: headers.findIndex(headerChecks.gender)
        };

        const missingHeaders: string[] = [];
        if (headerIndices.name === -1) missingHeaders.push(expectedHeaderKeys.name);
        if (headerIndices.nationality === -1) missingHeaders.push(expectedHeaderKeys.nationality);
        if (headerIndices.ability === -1) missingHeaders.push(expectedHeaderKeys.ability);
        if (headerIndices.gender === -1) missingHeaders.push(expectedHeaderKeys.gender);

        if (missingHeaders.length > 0) {
          const errorMessage = `Missing required columns. Expected: ${missingHeaders.join(', ')}. Found headers in file: [${headers.join(', ')}]`;
          console.error("Header matching failed. Processed headers:", headers, "Indices found:", headerIndices);
          reject(new Error(errorMessage));
          return;
        }
        
        const nameIndex = headerIndices.name;
        const nationalityIndex = headerIndices.nationality;
        const abilityIndex = headerIndices.ability;
        const genderIndex = headerIndices.gender;
        
        const students: Student[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.every(cell => cell === null || cell === undefined || cell.toString().trim() === '')) continue; 

          const name = row[nameIndex]?.toString().trim();
          const nationality = row[nationalityIndex]?.toString().trim();
          const englishAbilityRaw = row[abilityIndex];
          const genderRaw = row[genderIndex]?.toString().trim().toLowerCase();

          if (!name || !nationality || englishAbilityRaw === undefined || !genderRaw) {
            console.warn(`Skipping row ${i+1} due to missing critical data: Name: ${name}, Nationality: ${nationality}, Ability: ${englishAbilityRaw}, Gender: ${genderRaw}`);
            continue;
          }
          
          const englishAbility = parseInt(englishAbilityRaw, 10);
          if (isNaN(englishAbility) || englishAbility < 1 || englishAbility > 5) {
             console.warn(`Skipping student ${name} (row ${i+1}) due to invalid English ability: ${englishAbilityRaw}`);
             continue;
          }

          let gender: Gender;
          if (genderRaw === 'male' || genderRaw === 'm') gender = Gender.Male;
          else if (genderRaw === 'female' || genderRaw === 'f') gender = Gender.Female;
          else if (genderRaw === 'other' || genderRaw === 'o') gender = Gender.Other;
          else {
            console.warn(`Skipping student ${name} (row ${i+1}) due to invalid gender: ${genderRaw}`);
            continue;
          }
          
          students.push({
            id: `student-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
            name,
            nationality,
            englishAbility: englishAbility as Student['englishAbility'],
            gender,
          });
        }
        resolve(students);
      } catch (error) {
        console.error("Error parsing student file:", error);
        if (error instanceof Error) {
            reject(new Error(`Failed to parse file: ${error.message}`));
        } else {
            reject(new Error(`Failed to parse file: An unknown error occurred.`));
        }
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
       reader.readAsText(file);
    } else {
       reader.readAsArrayBuffer(file);
    }
  });
};
