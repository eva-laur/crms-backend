/** Shared academic roster keyed by class group, plus course catalog.
 *  Used by Logbook, Course Progress, Announcements and Cancellations so
 *  every faculty action operates on the same student set. */

export interface Student { mat: string; name: string; }
export interface Course  { code: string; title: string; classGroup: string; lecturerEmail: string; }

export const CLASS_GROUPS = ["CS-Y3-A", "CS-Y3-B", "CS-Y4", "EE-Y2", "DS-M1"] as const;
export type ClassGroup = (typeof CLASS_GROUPS)[number];

export const ROSTERS: Record<ClassGroup, Student[]> = {
  "CS-Y3-A": [
    { mat: "IUC-2024-STU-0421", name: "Amira N. Kone" },
    { mat: "IUC-2024-STU-0512", name: "Joshua Adeyemi" },
    { mat: "IUC-2024-STU-0666", name: "Kwame Boateng" },
    { mat: "IUC-2024-STU-0790", name: "Sophia Da Silva" },
  ],
  "CS-Y3-B": [
    { mat: "IUC-2024-STU-0301", name: "Mariam Traoré" },
    { mat: "IUC-2024-STU-0188", name: "David Mensah" },
    { mat: "IUC-2024-STU-0902", name: "Léa Souaré" },
  ],
  "CS-Y4": [
    { mat: "IUC-2023-STU-0188", name: "David Mensah" },
    { mat: "IUC-2023-STU-0301", name: "Mariam Traoré" },
    { mat: "IUC-2023-STU-0902", name: "Sophia Imani" },
  ],
  "EE-Y2": [
    { mat: "IUC-2025-EE-0011", name: "Tariq Belkhir" },
    { mat: "IUC-2025-EE-0022", name: "Naomi Onyango" },
  ],
  "DS-M1": [
    { mat: "IUC-2025-STU-0902", name: "Léa Souaré" },
    { mat: "IUC-2025-DS-0501", name: "Imani Pereira" },
  ],
};

export const COURSES: Course[] = [
  { code: "CS-401", title: "Distributed Systems",     classGroup: "CS-Y4",   lecturerEmail: "s.etoa@iuc.edu" },
  { code: "CS-220", title: "Computer Networks",       classGroup: "CS-Y3-A", lecturerEmail: "s.etoa@iuc.edu" },
  { code: "CS-340", title: "Operating Systems",       classGroup: "CS-Y3-B", lecturerEmail: "s.etoa@iuc.edu" },
  { code: "MA-310", title: "Linear Algebra",          classGroup: "CS-Y3-A", lecturerEmail: "s.etoa@iuc.edu" },
  { code: "EE-150", title: "Signals & Systems",       classGroup: "EE-Y2",   lecturerEmail: "s.etoa@iuc.edu" },
  { code: "DS-510", title: "Applied Machine Learning",classGroup: "DS-M1",   lecturerEmail: "s.etoa@iuc.edu" },
];

export function rosterFor(classGroup: string): Student[] {
  return ROSTERS[classGroup as ClassGroup] ?? [];
}

export function coursesForLecturer(email: string): Course[] {
  return COURSES.filter(c => c.lecturerEmail.toLowerCase() === email.toLowerCase());
}

export function coursesForStudent(mat: string): Course[] {
  return COURSES.filter(c => rosterFor(c.classGroup).some(s => s.mat === mat));
}

export const TIME_SLOTS = [
  "08:00–10:00", "10:00–12:00", "12:00–14:00",
  "14:00–16:00", "16:00–18:00",
] as const;
