import { AppData, Guru, Kelas, Antrian, Setting } from "@/types/app";

const LOCAL_STORAGE_KEY = "queueAppData";

export const getAppData = (): AppData => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return initializeAppData();
};

export const setAppData = (data: AppData) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

const initializeAppData = (): AppData => {
  const defaultGuru: Guru[] = [
    { id: "g1", nama: "Budi Santoso" },
    { id: "g2", nama: "Siti Aminah" },
    { id: "g3", nama: "Joko Susilo" },
  ];

  const defaultKelas: Kelas[] = [
    { id: "k1", nama: "XII IPA 1" },
    { id: "k2", nama: "XII IPA 2" },
    { id: "k3", nama: "XII IPS 1" },
  ];

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const defaultDate = `${year}-${month}-${day}`;

  const defaultSetting: Setting = {
    tanggalCetakDefault: defaultDate,
    jamMulai: "08:00",
    jamAkhir: "16:00",
    intervalAntarAntrian: 10, // minutes
  };

  const initialData: AppData = {
    guru: defaultGuru,
    kelas: defaultKelas,
    antrian: [],
    setting: defaultSetting,
  };

  setAppData(initialData);
  return initialData;
};

export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const getNextQueueNumber = (antrian: Antrian[]): number => {
  if (antrian.length === 0) {
    return 1;
  }
  const maxNumber = Math.max(...antrian.map(a => a.nomorAntrian));
  return maxNumber + 1;
};

export const getNextAvailableSlot = (
  existingAntrian: Antrian[],
  setting: Setting
): { tanggal: string; jam: string } | null => {
  const { tanggalCetakDefault, jamMulai, jamAkhir, intervalAntarAntrian } = setting;

  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const startMinutes = parseTime(jamMulai);
  const endMinutes = parseTime(jamAkhir);

  const slots: { [key: string]: boolean } = {}; // "YYYY-MM-DD HH:MM" -> true if taken

  existingAntrian.forEach(a => {
    slots[`${a.tanggalCetak} ${a.jamCetak}`] = true;
  });

  for (let currentMinutes = startMinutes; currentMinutes < endMinutes; currentMinutes += intervalAntarAntrian) {
    const potentialTime = formatTime(currentMinutes);
    const slotKey = `${tanggalCetakDefault} ${potentialTime}`;
    if (!slots[slotKey]) {
      return { tanggal: tanggalCetakDefault, jam: potentialTime };
    }
  }

  return null; // No available slots
};