
export const APP_TITLE = "Classroom Seating Chart Generator";
export const DEFAULT_CLASS_NAME = "My Classroom";
export const LAYOUT_EDITOR_ID = "layout-editor-area";

export const TABLE_SLOT_WIDTH = 117; // px, increased by 30% for better visibility
export const TABLE_SLOT_HEIGHT = 78; // px, increased by 30% for better visibility
export const TABLE_PADDING = 5; // px, padding within the table visual
export const SLOT_BORDER_WIDTH = 1; // px

export const TEACHER_DESK_WIDTH = 169; // px, increased by 30% for better visibility
export const TEACHER_DESK_HEIGHT = 91; // px, increased by 30% for better visibility

export const STUDENT_CSV_TEMPLATE_HEADERS = "Name,Nationality,English Ability (1-5),Gender (male/female/other)";
export const STUDENT_CSV_TEMPLATE_DATA = `Nguyen Van An,Vietnamese,1,male
Tran Thi Binh,Vietnamese,2,female
Le Minh Cuong,Vietnamese,3,male
Pham Hoai Dan,Vietnamese,3,female
Vo Tuan Em,Vietnamese,4,male
Do Ngoc Giang,Vietnamese,4,female
Hoang Van Hai,Vietnamese,5,male
Bui Thi Kim,Vietnamese,5,female
Dang Quang Long,Vietnamese,3,male
Ly My Nhan,Vietnamese,4,female
Kim Min-jun,Korean,1,male
Lee Seo-yeon,Korean,2,female
Park Ji-hoon,Korean,3,male
Choi Soo-min,Korean,3,female
Jung Hyun-woo,Korean,4,male
Kang Ji-eun,Korean,4,female
Yoon Dong-hyun,Korean,5,male
Han Yoo-jin,Korean,5,female
Song Jae-hee,Korean,3,male
Im Chae-won,Korean,4,female
Suzuki Taro,Japanese,3,male
Wang Lin,Chinese,3,female
Somchai Boonmee,Thai,5,male
Maria Santos,Filipino,5,female`;

export const STUDENT_CSV_TEMPLATE_FILENAME = "student_template.csv";
export const APP_SETTINGS_FILENAME = "seating_chart_settings.json";
export const SEATING_CHART_PDF_FILENAME = "seating_chart.pdf"; // Will be prefixed with class name

export const ENGLISH_ABILITY_LOW = 1;
export const ENGLISH_ABILITY_STRONG_THRESHOLD_MIN = 3;
export const ENGLISH_ABILITY_STRONG_THRESHOLD_MAX = 4;

export const ROTATION_STEP = 90; // degrees
