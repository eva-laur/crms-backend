/** Simple localStorage-backed stores for course materials, student submissions
 *  and marks. Files are stored as base64 data URLs. Browser localStorage
 *  caps around 5 MB total, so keep uploads small. */

export interface FileBlob {
  name: string;
  type: string;
  size: number;   // bytes
  dataUrl: string;
}

export interface Material {
  id: string;
  courseCode: string;
  title: string;
  classGroup: string;
  lecturerEmail: string;
  lecturerName: string;
  uploadedAt: string;   // ISO
  file: FileBlob;
  downloads: string[];  // matricules that downloaded
}

export interface Submission {
  id: string;
  studentMat: string;
  studentName: string;
  studentEmail: string;
  lecturerEmail: string;
  courseCode: string;
  note: string;
  submittedAt: string;
  file: FileBlob;
}

export interface Mark {
  id: string;
  studentMat: string;
  studentEmail: string;
  courseCode: string;
  courseTitle: string;
  classGroup: string;
  ca: number;      // /40
  exam: number;    // /60
  total: number;   // /100 (auto)
  lecturerEmail: string;
  enteredAt: string;   // ISO
  term: string;        // e.g. "2026-S1"
}

const MATERIALS_KEY = "crms-materials";
const SUBMISSIONS_KEY = "crms-submissions";
const MARKS_KEY = "crms-marks";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(key) ?? "[]"); } catch { return []; }
}
function write<T>(key: string, val: T[]) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(val)); }
  catch (e) { throw new Error("Storage full — this file may be too large. Try a smaller file (< 3 MB)."); }
}

export const listMaterials    = () => read<Material>(MATERIALS_KEY);
export const listSubmissions  = () => read<Submission>(SUBMISSIONS_KEY);
export const listMarks        = () => read<Mark>(MARKS_KEY);

export function saveMaterial(m: Material)    { write(MATERIALS_KEY, [m, ...listMaterials()]); }
export function saveSubmission(s: Submission){ write(SUBMISSIONS_KEY, [s, ...listSubmissions()]); }
export function saveMark(m: Mark) {
  const all = listMarks().filter(x => !(x.studentMat === m.studentMat && x.courseCode === m.courseCode && x.term === m.term));
  write(MARKS_KEY, [m, ...all]);
}

export function deleteMaterial(id: string)   { write(MATERIALS_KEY, listMaterials().filter(m => m.id !== id)); }
export function deleteSubmission(id: string) { write(SUBMISSIONS_KEY, listSubmissions().filter(s => s.id !== id)); }

export function recordDownload(matId: string, mat: string) {
  const all = listMaterials();
  const m = all.find(x => x.id === matId);
  if (!m) return;
  if (!m.downloads.includes(mat)) m.downloads.push(mat);
  write(MATERIALS_KEY, all);
}

export function fileToBlob(file: File): Promise<FileBlob> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res({ name: file.name, type: file.type || "application/octet-stream", size: file.size, dataUrl: String(reader.result) });
    reader.onerror = () => rej(reader.error);
    reader.readAsDataURL(file);
  });
}

export function triggerDownload(blob: FileBlob) {
  const a = document.createElement("a");
  a.href = blob.dataUrl;
  a.download = blob.name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

export function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB user limit
