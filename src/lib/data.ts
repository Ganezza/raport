import { AppData, User, Kelas, Antrian, Setting } from "@/types/app";
import { supabase } from "@/integrations/supabase/client";

const SETTINGS_ID = "app_settings"; // Fixed ID for the single settings row

export const getAppData = async (): Promise<AppData> => {
  console.log("getAppData: Memulai pengambilan data dari Supabase...");
  let user: User[] = [];
  let kelas: Kelas[] = [];
  let antrian: Antrian[] = [];
  let setting: Setting | null = null;

  // Fetch User (from 'guru' table in DB)
  const { data: userData, error: userError } = await supabase.from('guru').select('*');
  if (userError) {
    console.error("getAppData: Error fetching user:", userError);
  } else {
    user = userData || [];
    console.log("getAppData: User berhasil dimuat:", user.length);
  }

  // Fetch Kelas
  const { data: kelasData, error: kelasError } = await supabase.from('kelas').select('*');
  if (kelasError) {
    console.error("getAppData: Error fetching kelas:", kelasError);
  } else {
    kelas = kelasData || [];
    console.log("getAppData: Kelas berhasil dimuat:", kelas.length);
  }

  // Fetch Antrian
  const { data: antrianData, error: antrianError } = await supabase.from('antrian').select('*').order('createdAt', { ascending: true });
  if (antrianError) {
    console.error("getAppData: Error fetching antrian:", antrianError);
  } else {
    antrian = antrianData || [];
    console.log("getAppData: Antrian berhasil dimuat:", antrian.length);
  }

  // Fetch Settings
  const { data: settingData, error: settingError } = await supabase.from('settings').select('*').eq('id', SETTINGS_ID).single();
  if (settingError && settingError.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error("getAppData: Error fetching settings:", settingError);
  } else if (settingData) {
    // Merge fetched data with default settings to ensure all properties exist,
    // especially for newly added columns like workingDays.
    setting = { ...initializeDefaultSettings(), ...settingData };
    console.log("getAppData: Pengaturan berhasil dimuat:", setting);
  } else {
    console.log("getAppData: Pengaturan tidak ditemukan, menggunakan default.");
    setting = initializeDefaultSettings(); // Use default if not found
  }

  // Only initialize default data if the main settings are missing.
  // This prevents re-initializing user/kelas if they are intentionally emptied by the user.
  if (!setting) { // This check might be redundant after the above logic, but kept for safety.
    console.log("getAppData: Pengaturan utama tidak ditemukan, memulai inisialisasi data default...");
    return await initializeAppData();
  }

  const appData: AppData = {
    user,
    kelas,
    antrian,
    setting: setting, // Use the fetched setting
  };

  console.log("getAppData: Semua data berhasil dikumpulkan.");
  return appData;
};

export const setAppData = async (data: AppData) => {
  // This function will now handle updates for individual parts of AppData
  // It's better to have specific functions for updating user, kelas, antrian, setting
  // For now, we'll just log a warning as this function will be refactored away.
  console.warn("setAppData is deprecated. Use specific update functions for user, kelas, antrian, setting.");
};

// Specific functions for updating data in Supabase
export const addUser = async (user: User) => {
  const { data, error } = await supabase.from('guru').insert(user).select();
  if (error) throw error;
  return data[0];
};

export const updateUser = async (user: User) => {
  const { data, error } = await supabase.from('guru').update(user).eq('id', user.id).select();
  if (error) throw error;
  return data[0];
};

export const deleteUser = async (id: string) => {
  const { error } = await supabase.from('guru').delete().eq('id', id);
  if (error) {
    console.error("deleteUser: Error deleting user:", error);
    throw error;
  }
};

export const deleteAllUser = async () => {
  const { error } = await supabase.from('guru').delete().neq('id', '0');
  if (error) {
    console.error("deleteAllUser: Error deleting all users:", error);
    throw error;
  }
};

export const addKelas = async (kelas: Kelas) => {
  const { data, error } = await supabase.from('kelas').insert(kelas).select();
  if (error) throw error;
  return data[0];
};

export const updateKelas = async (kelas: Kelas) => {
  const { data, error } = await supabase.from('kelas').update(kelas).eq('id', kelas.id).select();
  if (error) throw error;
  return data[0];
};

export const deleteKelas = async (id: string) => {
  const { error } = await supabase.from('kelas').delete().eq('id', id);
  if (error) {
    console.error("deleteKelas: Error deleting kelas:", error);
    throw error;
  }
};

export const deleteAllKelas = async () => {
  const { error } = await supabase.from('kelas').delete().neq('id', '0'); // Delete all where id is not '0' (effectively all rows)
  if (error) {
    console.error("deleteAllKelas: Error deleting all kelas:", error);
    throw error;
  }
};

export const addAntrian = async (antrian: Antrian) => {
  const { data, error } = await supabase.from('antrian').insert(antrian).select();
  if (error) throw error;
  return data[0];
};

export const updateAntrian = async (antrian: Antrian) => {
  const { data, error } = await supabase.from('antrian').update(antrian).eq('id', antrian.id).select();
  if (error) throw error;
  return data[0];
};

export const deleteAntrian = async (id: string) => {
  const { error } = await supabase.from('antrian').delete().eq('id', id);
  if (error) throw error;
};

export const updateSettings = async (settings: Setting) => {
  const { data, error } = await supabase.from('settings').upsert({ ...settings, id: SETTINGS_ID }).select();
  if (error) throw error;
  return data[0];
};

const initializeDefaultSettings = (): Setting => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const defaultDate = `${year}-${month}-${day}`;

  return {
    tanggalCetakDefault: defaultDate,
    jamMulai: "08:00",
    jamAkhir: "16:00",
    intervalAntarAntrian: 10, // minutes
    workingDays: [1, 2, 3, 4, 5], // Default to Monday-Friday
  };
};

export const initializeAppData = async (): Promise<AppData> => {
  console.log("initializeAppData: Memulai inisialisasi data default...");
  const defaultUser: User[] = [
    { id: generateUniqueId(), nama: "Budi Santoso" },
    { id: generateUniqueId(), nama: "Siti Aminah" },
    { id: generateUniqueId(), nama: "Joko Susilo" },
  ];

  const defaultKelas: Kelas[] = [
    { id: generateUniqueId(), nama: "XII IPA 1" },
    { id: generateUniqueId(), nama: "XII IPA 2" },
    { id: generateUniqueId(), nama: "XII IPS 1" },
  ];

  const defaultSetting = initializeDefaultSettings();

  let initializedUser: User[] = [];
  let initializedKelas: Kelas[] = [];
  let initializedSetting: Setting | null = null;

  // Insert default user if table is empty (still 'guru' table in DB)
  const { data: existingUser } = await supabase.from('guru').select('id');
  if (!existingUser || existingUser.length === 0) {
    console.log("initializeAppData: Memasukkan user default...");
    const { data, error } = await supabase.from('guru').insert(defaultUser).select();
    if (error) console.error("initializeAppData: Error inserting default user:", error);
    else initializedUser = data || [];
  } else {
    initializedUser = (await supabase.from('guru').select('*')).data || [];
  }

  // Insert default kelas if table is empty
  const { data: existingKelas } = await supabase.from('kelas').select('id');
  if (!existingKelas || existingKelas.length === 0) {
    console.log("initializeAppData: Memasukkan kelas default...");
    const { data, error } = await supabase.from('kelas').insert(defaultKelas).select();
    if (error) console.error("initializeAppData: Error inserting default kelas:", error);
    else initializedKelas = data || [];
  } else {
    initializedKelas = (await supabase.from('kelas').select('*')).data || [];
  }

  // Insert default settings if table is empty
  const { data: existingSettings } = await supabase.from('settings').select('id').eq('id', SETTINGS_ID);
  if (!existingSettings || existingSettings.length === 0) {
    console.log("initializeAppData: Memasukkan pengaturan default...");
    const { data, error } = await supabase.from('settings').insert({ ...defaultSetting, id: SETTINGS_ID }).select();
    if (error) console.error("initializeAppData: Error inserting default settings:", error);
    else initializedSetting = data ? data[0] : null;
  } else {
    initializedSetting = (await supabase.from('settings').select('*').eq('id', SETTINGS_ID).single()).data;
  }

  // Return the newly initialized or existing data
  const currentAntrian = (await supabase.from('antrian').select('*').order('createdAt', { ascending: true })).data || [];
  
  const finalAppData: AppData = {
    user: initializedUser,
    kelas: initializedKelas,
    antrian: currentAntrian,
    setting: initializedSetting || initializeDefaultSettings(),
  };
  console.log("initializeAppData: Inisialisasi selesai, mengembalikan data:", finalAppData);
  return finalAppData;
};

export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const getNextQueueNumber = async (): Promise<number> => {
  const { data: antrian, error } = await supabase.from('antrian').select('nomorAntrian');
  if (error) {
    console.error("Error fetching antrian for next queue number:", error);
    return 1; // Fallback
  }
  if (!antrian || antrian.length === 0) {
    return 1;
  }
  const maxNumber = Math.max(...antrian.map(a => a.nomorAntrian));
  return maxNumber + 1;
};

export const getNextAvailableSlot = async (
  existingAntrian: Antrian[],
  setting: Setting
): Promise<{ tanggal: string; jam: string } | null> => {
  const { tanggalCetakDefault, jamMulai, jamAkhir, intervalAntarAntrian, workingDays } = setting;

  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const isWorkingDay = (date: Date, days: number[]) => {
    return days.includes(date.getDay()); // getDay() returns 0 for Sunday, 1 for Monday, etc.
  };

  const addDays = (date: Date, days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to start of day

  let currentSearchDate = new Date(tanggalCetakDefault);
  currentSearchDate.setHours(0, 0, 0, 0); // Normalize to start of day

  // Ensure we start searching from today or a future date if tanggalCetakDefault is in the past
  if (currentSearchDate.getTime() < today.getTime()) {
    currentSearchDate = today;
  }

  const maxSearchDays = 365; // Prevent infinite loop, search up to a year ahead
  for (let i = 0; i < maxSearchDays; i++) {
    if (isWorkingDay(currentSearchDate, workingDays)) {
      const startMinutesForDay = parseTime(jamMulai);
      const endMinutesForDay = parseTime(jamAkhir);

      let currentSlotMinutes = startMinutesForDay;

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      const isCurrentSearchDateToday = currentSearchDate.toDateString() === new Date().toDateString();

      // If it's today and already past the end time, skip to next day
      if (isCurrentSearchDateToday && currentTimeInMinutes >= endMinutesForDay) {
        currentSearchDate = addDays(currentSearchDate, 1);
        continue; // Go to next iteration of the outer loop
      }

      // If it's today, start searching from the current time + interval, or jamMulai if current time is before jamMulai
      if (isCurrentSearchDateToday) {
        currentSlotMinutes = Math.max(startMinutesForDay, currentTimeInMinutes + intervalAntarAntrian);
      }

      for (let j = currentSlotMinutes; j < endMinutesForDay; j += intervalAntarAntrian) {
        const potentialTime = formatTime(j);
        const formattedDate = currentSearchDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const slotKey = `${formattedDate} ${potentialTime}`;

        // Check if this slot is already taken by an existing antrian
        const isSlotTaken = existingAntrian.some(a => 
          a.tanggalCetak === formattedDate && 
          a.jamCetak === potentialTime &&
          a.status !== "Selesai" // Only consider active queues
        );

        if (!isSlotTaken) {
          return { tanggal: formattedDate, jam: potentialTime };
        }
      }
    }
    // Move to the next day
    currentSearchDate = addDays(currentSearchDate, 1);
  }

  return null; // No available slots found within the search limit
};