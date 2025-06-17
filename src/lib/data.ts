import { AppData, Guru, Kelas, Antrian, Setting } from "@/types/app";
import { supabase } from "@/integrations/supabase/client";

const SETTINGS_ID = "app_settings"; // Fixed ID for the single settings row

export const getAppData = async (): Promise<AppData> => {
  let guru: Guru[] = [];
  let kelas: Kelas[] = [];
  let antrian: Antrian[] = [];
  let setting: Setting | null = null;

  // Fetch Guru
  const { data: guruData, error: guruError } = await supabase.from('guru').select('*');
  if (guruError) console.error("Error fetching guru:", guruError);
  else guru = guruData || [];

  // Fetch Kelas
  const { data: kelasData, error: kelasError } = await supabase.from('kelas').select('*');
  if (kelasError) console.error("Error fetching kelas:", kelasError);
  else kelas = kelasData || [];

  // Fetch Antrian
  const { data: antrianData, error: antrianError } = await supabase.from('antrian').select('*').order('createdAt', { ascending: true });
  if (antrianError) console.error("Error fetching antrian:", antrianError);
  else antrian = antrianData || [];

  // Fetch Settings
  const { data: settingData, error: settingError } = await supabase.from('settings').select('*').eq('id', SETTINGS_ID).single();
  if (settingError && settingError.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error("Error fetching settings:", settingError);
  } else if (settingData) {
    setting = settingData;
  }

  const appData: AppData = {
    guru,
    kelas,
    antrian,
    setting: setting || initializeDefaultSettings(), // Use default if not found
  };

  // If any core data is missing, initialize it
  if (guru.length === 0 || kelas.length === 0 || !setting) {
    return await initializeAppData();
  }

  return appData;
};

export const setAppData = async (data: AppData) => {
  // This function will now handle updates for individual parts of AppData
  // It's better to have specific functions for updating guru, kelas, antrian, setting
  // For now, we'll just log a warning as this function will be refactored away.
  console.warn("setAppData is deprecated. Use specific update functions for guru, kelas, antrian, setting.");
};

// Specific functions for updating data in Supabase
export const addGuru = async (guru: Guru) => {
  const { data, error } = await supabase.from('guru').insert(guru).select();
  if (error) throw error;
  return data[0];
};

export const updateGuru = async (guru: Guru) => {
  const { data, error } = await supabase.from('guru').update(guru).eq('id', guru.id).select();
  if (error) throw error;
  return data[0];
};

export const deleteGuru = async (id: string) => {
  const { error } = await supabase.from('guru').delete().eq('id', id);
  if (error) throw error;
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
  if (error) throw error;
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
  };
};

export const initializeAppData = async (): Promise<AppData> => {
  const defaultGuru: Guru[] = [
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

  // Insert default guru if table is empty
  const { data: existingGuru } = await supabase.from('guru').select('id');
  if (!existingGuru || existingGuru.length === 0) {
    const { error } = await supabase.from('guru').insert(defaultGuru);
    if (error) console.error("Error inserting default guru:", error);
  }

  // Insert default kelas if table is empty
  const { data: existingKelas } = await supabase.from('kelas').select('id');
  if (!existingKelas || existingKelas.length === 0) {
    const { error } = await supabase.from('kelas').insert(defaultKelas);
    if (error) console.error("Error inserting default kelas:", error);
  }

  // Insert default settings if table is empty
  const { data: existingSettings } = await supabase.from('settings').select('id').eq('id', SETTINGS_ID);
  if (!existingSettings || existingSettings.length === 0) {
    const { error } = await supabase.from('settings').insert({ ...defaultSetting, id: SETTINGS_ID });
    if (error) console.error("Error inserting default settings:", error);
  }

  // Re-fetch all data after initialization to ensure consistency
  return getAppData();
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
  existingAntrian: Antrian[], // This will now be passed from the component's state
  setting: Setting
): Promise<{ tanggal: string; jam: string } | null> => {
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