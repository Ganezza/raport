export interface User {
  id: string;
  nama: string;
}

export interface Kelas {
  id: string;
  nama: string;
}

export type AntrianStatus = "Menunggu" | "Diproses" | "Selesai";

export interface Antrian {
  id: string;
  nomorAntrian: number;
  userId: string; // Changed from guruId to userId
  kelasId: string;
  tanggalCetak: string; // YYYY-MM-DD
  jamCetak: string; // HH:MM
  status: AntrianStatus;
  createdAt: string; // ISO string
}

export interface Setting {
  tanggalCetakDefault: string; // YYYY-MM-DD
  jamMulai: string; // HH:MM
  jamAkhir: string; // HH:MM
  intervalAntarAntrian: number; // minutes
  workingDays: number[]; // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
}

export interface AppData {
  user: User[]; // Changed from guru to user
  kelas: Kelas[];
  antrian: Antrian[];
  setting: Setting;
}