import React, { useState, useEffect, useCallback } from "react";
import {
  getAppData,
  addGuru,
  updateGuru,
  deleteGuru,
  addKelas,
  updateKelas,
  deleteKelas,
  addAntrian, // Although not directly used for adding in AdminPage, it's good to have
  updateAntrian,
  deleteAntrian,
  updateSettings,
  generateUniqueId,
} from "@/lib/data";
import { AppData, Guru, Kelas, Antrian, AntrianStatus, Setting } from "@/types/app";
import SettingsManagement from "@/components/admin/SettingsManagement";
import GuruManagement from "@/components/admin/GuruManagement";
import KelasManagement from "@/components/admin/KelasManagement";
import QueueManagement from "@/components/admin/QueueManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client"; // Import supabase client

const AdminPage = () => {
  const [appData, setAppDataState] = useState<AppData | null>(null);
  const { toast } = useToast();

  const fetchInitialData = useCallback(async () => {
    console.log("AdminPage: Memulai pengambilan data awal...");
    try {
      const data = await getAppData();
      console.log("AdminPage: Data awal berhasil dimuat:", data);
      setAppDataState(data);
    } catch (error) {
      console.error("AdminPage: Gagal memuat data aplikasi awal:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data aplikasi dari database.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Settings Management Handlers
  const handleSettingsChange = (newSettings: Setting) => {
    if (appData) {
      setAppDataState(prev => prev ? { ...prev, setting: newSettings } : null);
    }
  };

  const handleSaveSettings = async () => {
    if (!appData) return;
    try {
      await updateSettings(appData.setting);
      toast({
        title: "Sukses!",
        description: "Pengaturan jadwal berhasil disimpan.",
      });
      await fetchInitialData(); // Re-fetch to ensure consistency
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan jadwal.",
        variant: "destructive",
      });
    }
  };

  // Guru Management Handlers
  const handleAddGuru = async (nama: string) => {
    if (!appData) return;
    try {
      const newGuru: Guru = { id: generateUniqueId(), nama };
      await addGuru(newGuru);
      toast({ title: "Sukses!", description: "Guru berhasil ditambahkan." });
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to add guru:", error);
      toast({ title: "Error", description: "Gagal menambahkan guru.", variant: "destructive" });
    }
  };

  const handleEditGuru = async (id: string, nama: string) => {
    if (!appData) return;
    try {
      await updateGuru({ id, nama });
      toast({ title: "Sukses!", description: "Nama Guru berhasil diperbarui." });
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to edit guru:", error);
      toast({ title: "Error", description: "Gagal memperbarui nama guru.", variant: "destructive" });
    }
  };

  const handleDeleteGuru = async (id: string) => {
    if (!appData) return;
    try {
      await deleteGuru(id);
      toast({ title: "Sukses!", description: "Guru berhasil dihapus." });
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to delete guru:", error);
      toast({ title: "Error", description: "Gagal menghapus guru.", variant: "destructive" });
    }
  };

  const handleAddMultipleGuru = async (names: string[]) => {
    if (!appData) return;
    try {
      const newGuruEntries: Guru[] = names.map(name => ({ id: generateUniqueId(), nama: name }));
      // Supabase insert can take an array for bulk inserts
      const { error } = await supabase.from('guru').insert(newGuruEntries);
      if (error) throw error;
      toast({ title: "Sukses!", description: `${names.length} guru berhasil ditambahkan dari file.`, });
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to add multiple gurus:", error);
      toast({ title: "Error", description: "Gagal menambahkan beberapa guru dari file.", variant: "destructive" });
    }
  };

  // Kelas Management Handlers
  const handleAddKelas = async (nama: string) => {
    if (!appData) return;
    try {
      const newKelas: Kelas = { id: generateUniqueId(), nama };
      await addKelas(newKelas);
      toast({ title: "Sukses!", description: "Kelas berhasil ditambahkan." });
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to add kelas:", error);
      toast({ title: "Error", description: "Gagal menambahkan kelas.", variant: "destructive" });
    }
  };

  const handleEditKelas = async (id: string, nama: string) => {
    if (!appData) return;
    try {
      await updateKelas({ id, nama });
      toast({ title: "Sukses!", description: "Nama Kelas berhasil diperbarui." });
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to edit kelas:", error);
      toast({ title: "Error", description: "Gagal memperbarui nama kelas.", variant: "destructive" });
    }
  };

  const handleDeleteKelas = async (id: string) => {
    if (!appData) return;
    try {
      await deleteKelas(id);
      toast({ title: "Sukses!", description: "Kelas berhasil dihapus." });
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to delete kelas:", error);
      toast({ title: "Error", description: "Gagal menghapus kelas.", variant: "destructive" });
    }
  };

  const handleAddMultipleKelas = async (names: string[]) => {
    if (!appData) return;
    try {
      const newKelasEntries: Kelas[] = names.map(name => ({ id: generateUniqueId(), nama: name }));
      // Supabase insert can take an array for bulk inserts
      const { error } = await supabase.from('kelas').insert(newKelasEntries);
      if (error) throw error;
      toast({ title: "Sukses!", description: `${names.length} kelas berhasil ditambahkan dari file.`, });
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to add multiple kelas:", error);
      toast({ title: "Error", description: "Gagal menambahkan beberapa kelas dari file.", variant: "destructive" });
    }
  };

  // Queue Management Handlers
  const handleUpdateAntrianStatus = async (id: string, status: AntrianStatus) => {
    if (!appData) return;
    try {
      const antrianToUpdate = appData.antrian.find(a => a.id === id);
      if (antrianToUpdate) {
        await updateAntrian({ ...antrianToUpdate, status });
        toast({ title: "Sukses!", description: `Status antrian #${antrianToUpdate.nomorAntrian} diperbarui menjadi ${status}.` });
        await fetchInitialData();
      }
    } catch (error) {
      console.error("Failed to update antrian status:", error);
      toast({ title: "Error", description: "Gagal memperbarui status antrian.", variant: "destructive" });
    }
  };

  const handleDeleteAntrian = async (id: string) => {
    if (!appData) return;
    try {
      await deleteAntrian(id);
      toast({ title: "Sukses!", description: "Antrian berhasil dihapus." });
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to delete antrian:", error);
      toast({ title: "Error", description: "Gagal menghapus antrian.", variant: "destructive" });
    }
  };

  const handleCallNextQueue = async () => {
    if (!appData) return;

    try {
      const currentAntrianList = [...appData.antrian];
      let toastMessage = "";
      let updates: Antrian[] = [];

      // 1. Find the currently "Diproses" queue and set it to "Selesai"
      const processingQueue = currentAntrianList.find(a => a.status === "Diproses");
      if (processingQueue) {
        updates.push({ ...processingQueue, status: "Selesai" });
        toastMessage += `Antrian #${processingQueue.nomorAntrian} selesai. `;
      }

      // 2. Find the next "Menunggu" queue (lowest number)
      const waitingQueues = currentAntrianList
        .filter(a => a.status === "Menunggu")
        .sort((a, b) => a.nomorAntrian - b.nomorAntrian);

      if (waitingQueues.length > 0) {
        const nextQueueToProcess = waitingQueues[0];
        updates.push({ ...nextQueueToProcess, status: "Diproses" });
        toastMessage += `Antrian #${nextQueueToProcess.nomorAntrian} dipanggil.`;
        toast({
          title: "Sukses!",
          description: toastMessage,
        });
      } else {
        toastMessage = "Tidak ada antrian menunggu lainnya.";
        toast({
          title: "Info",
          description: toastMessage,
          variant: "default",
        });
      }

      // Perform all updates in a single transaction (or multiple awaited calls)
      for (const antrian of updates) {
        await updateAntrian(antrian);
      }
      await fetchInitialData(); // Re-fetch after all updates
    } catch (error) {
      console.error("Failed to call next queue:", error);
      toast({
        title: "Error",
        description: "Gagal memanggil antrian berikutnya.",
        variant: "destructive",
      });
    }
  };

  if (!appData) {
    console.log("AdminPage: appData masih null, menampilkan loading...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Admin Panel...
      </div>
    );
  }

  console.log("AdminPage: appData sudah dimuat, menampilkan panel admin.");
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-8">Panel Admin</h1>

        <Tabs defaultValue="antrian" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="antrian">Antrian</TabsTrigger>
            <TabsTrigger value="guru">Guru</TabsTrigger>
            <TabsTrigger value="kelas">Kelas</TabsTrigger>
            <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          </TabsList>
          <TabsContent value="antrian" className="mt-6">
            <QueueManagement
              antrianList={appData.antrian}
              guruList={appData.guru}
              kelasList={appData.kelas}
              onUpdateAntrianStatus={handleUpdateAntrianStatus}
              onDeleteAntrian={handleDeleteAntrian}
              onCallNextQueue={handleCallNextQueue}
            />
          </TabsContent>
          <TabsContent value="guru" className="mt-6">
            <GuruManagement
              guruList={appData.guru}
              onAddGuru={handleAddGuru}
              onEditGuru={handleEditGuru}
              onDeleteGuru={handleDeleteGuru}
              onAddMultipleGuru={handleAddMultipleGuru}
            />
          </TabsContent>
          <TabsContent value="kelas" className="mt-6">
            <KelasManagement
              kelasList={appData.kelas}
              onAddKelas={handleAddKelas}
              onEditKelas={handleEditKelas}
              onDeleteKelas={handleDeleteKelas}
              onAddMultipleKelas={handleAddMultipleKelas}
            />
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <SettingsManagement
              settings={appData.setting}
              onSettingsChange={handleSettingsChange}
              onSave={handleSaveSettings}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;