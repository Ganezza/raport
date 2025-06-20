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
  guruId: string; // Changed from userId to guruId to match DB schema
  kelasId: string;
  tanggalCetak: string; // YYYY-MM-DD
  jamCetak: string; // HH:MM
  status: AntrianStatus;
  createdAt: string; // ISO string
}

export interface AppData {
  user: User[];
  kelas: Kelas[];
  antrian: Antrian[];
  setting: Setting;
}