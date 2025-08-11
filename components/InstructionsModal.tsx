
import React from 'react';
import { XMarkIcon } from './icons';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="instructions-title"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
          <h2 id="instructions-title" className="text-xl md:text-2xl font-semibold text-slate-700">How to Use the Seating Chart Generator</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close instructions"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-6 overflow-y-auto">
          <Section title="Getting Started: Students">
            <InstructionPoint title="Download Template (.csv)">
              Click the "Download Template (.csv)" button. This provides a CSV file with the correct headers:
              <code className="block bg-gray-100 p-1 rounded text-sm my-1">Name,Nationality,English Ability (1-5),Gender (male/female/other)</code>
              Fill this template with your student data. "English Ability" should be a number from 1 (lowest) to 5 (highest).
            </InstructionPoint>
            <InstructionPoint title="Upload Students">
              Click "Upload Students" and select your completed CSV, Excel (.xlsx), or older Excel (.xls) file.
              This will load your students into the application. Uploading a new file will replace any existing student data.
            </InstructionPoint>
          </Section>

          <Section title="Building Your Classroom Layout">
            <InstructionPoint title="Adding Desks/Tables">
              Use "Add Desk (1)", "Table (2)", or "Table (4)" buttons to add items with the specified seating capacity. They appear at a default position on the layout editor.
            </InstructionPoint>
            <InstructionPoint title="Adding Teacher's Desk">
              Click "Teacher Desk" to add one. Only one teacher's desk can be present at a time.
            </InstructionPoint>
            <InstructionPoint title="Moving Items">
              Click and drag any table, desk, or teacher's desk to position it within the layout area. If you drag a table that is part of a group, all tables in that group will move together.
            </InstructionPoint>
            <InstructionPoint title="Selecting Items">
              Click an item to select it. To select multiple tables, hold <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Ctrl</kbd> (Windows/Linux) or <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Cmd</kbd> (Mac) and click on additional tables. The teacher's desk cannot be multi-selected with tables.
            </InstructionPoint>
            <InstructionPoint title="Rotating Tables">
              When a single table is selected, a rotation handle (circular arrow icon) appears on it. Click and drag this handle to rotate the table. Rotation snaps to 90-degree increments.
            </InstructionPoint>
             <InstructionPoint title="Understanding Seated Student Info">
              When a student is assigned to a seat, their information is displayed briefly: Name, Nationality, English Ability Level (e.g., <code className="text-xs">L:3</code>), and Gender (e.g., <code className="text-xs">G:M</code> for Male, <code className="text-xs">G:F</code> for Female, <code className="text-xs">G:O</code> for Other).
            </InstructionPoint>
            <InstructionPoint title="Grouping Tables">
              Select two or more tables, then click "Group Selected Tables". Grouped tables will move together when any table in the group is dragged. Algorithms may also prioritize placing students within the same group.
            </InstructionPoint>
             <InstructionPoint title="Ungrouping Tables">
              Select one or more tables that are part of a group, then click "Ungroup Selected Tables". This will remove the selected tables from their respective groups.
            </InstructionPoint>
            <InstructionPoint title="Removing Items">
              Select one or more items (tables or teacher's desk) and click "Remove Selected". This will delete them from the layout.
            </InstructionPoint>
          </Section>

          <Section title="Arranging Students">
            <InstructionPoint title="Class Name">
              Enter a name for your class (e.g., "Year 7 English"). This name is used in the PDF export title and filename.
            </InstructionPoint>
            <InstructionPoint title="Assignment Algorithms">
              Ensure students are loaded and tables are on the layout.
              <ul className="list-disc list-inside mt-1 space-y-1 pl-2">
                <li><strong>Randomized Mix:</strong> Shuffles all students and assigns them randomly to available empty seats. It will attempt to fill seats in table groups first, then ungrouped tables.</li>
                <li><strong>Michael's Triangle:</strong> Attempts to create "triangles" consisting of one student with lower English ability (level 1) and two students with stronger English ability (levels 3-4). One strong student will ideally be of the same nationality as the weaker student, and the other of a different nationality. These triangles are placed first (prioritizing groups if possible, then single tables with enough capacity), and then any remaining students are assigned to remaining slots.</li>
              </ul>
            </InstructionPoint>
            <InstructionPoint title="Clear All Assignments">
              Click this to remove all students from their assigned seats. The layout of tables and desks remains.
            </InstructionPoint>
          </Section>

          <Section title="Saving & Loading Your Work">
            <InstructionPoint title="Save Settings">
              Click "Save Settings" to download a JSON file (<code>seating_chart_settings.json</code>). This file contains your current class name, student list, table/desk layout, and group configurations.
            </InstructionPoint>
            <InstructionPoint title="Load Settings">
              Click "Load Settings" (next to "Save Settings" button) and select a previously saved JSON file. This will replace your current setup with the data from the file.
            </InstructionPoint>
          </Section>

          <Section title="Exporting Your Seating Chart">
            <InstructionPoint title="Export PDF">
              Click "Export PDF". This generates a PDF document of the current classroom layout, including student names in their seats. The PDF will be titled with your Class Name.
            </InstructionPoint>
          </Section>
        </div>

        <div className="p-4 md:p-6 border-t border-gray-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}
const Section: React.FC<SectionProps> = ({ title, children }) => (
  <section className="space-y-3">
    <h3 className="text-lg font-semibold text-slate-600 border-b border-slate-200 pb-1">{title}</h3>
    {children}
  </section>
);

interface InstructionPointProps {
  title: string;
  children: React.ReactNode;
}
const InstructionPoint: React.FC<InstructionPointProps> = ({ title, children }) => (
  <div className="ml-2">
    <h4 className="font-medium text-slate-800">{title}</h4>
    <p className="text-sm text-gray-700 leading-relaxed">{children}</p>
  </div>
);

export default InstructionsModal;
