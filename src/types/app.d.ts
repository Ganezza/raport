export interface Guru {
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
  guruId: string;
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
}

export interface AppData {
  guru: Guru[];
  kelas: Kelas[];
  antrian: Antrian[];
  setting: Setting;
}