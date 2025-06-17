import React, { useState, useEffect } from "react";
import { getAppData, setAppData, generateUniqueId } from "@/lib/data";
import { AppData, Guru, Kelas, Antrian, AntrianStatus, Setting } from "@/types/app";
import SettingsManagement from "@/components/admin/SettingsManagement";
import GuruManagement from "@/components/admin/GuruManagement";
import KelasManagement from "@/components/admin/KelasManagement";
import QueueManagement from "@/components/admin/QueueManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useToast } from "@/components/ui/use-toast"; // Import useToast

const AdminPage = () => {
  const [appData, setAppDataState] = useState<AppData | null>(null);
  const { toast } = useToast(); // Initialize useToast

  useEffect(() => {
    const data = getAppData();
    setAppDataState(data);
  }, []);

  const updateAppData = (newData: AppData) => {
    setAppData(newData);
    setAppDataState(newData);
  };

  // Settings Management Handlers
  const handleSettingsChange = (newSettings: Setting) => {
    if (appData) {
      updateAppData({ ...appData, setting: newSettings });
    }
  };

  const handleSaveSettings = () => {
    // Logic to save settings is already handled by updateAppData
    // The toast message is handled in SettingsManagement component
  };

  // Guru Management Handlers
  const handleAddGuru = (nama: string) => {
    if (appData) {
      const newGuru: Guru = { id: generateUniqueId(), nama };
      updateAppData({ ...appData, guru: [...appData.guru, newGuru] });
    }
  };

  const handleEditGuru = (id: string, nama: string) => {
    if (appData) {
      const updatedGuruList = appData.guru.map(g =>
        g.id === id ? { ...g, nama } : g
      );
      updateAppData({ ...appData, guru: updatedGuruList });
    }
  };

  const handleDeleteGuru = (id: string) => {
    if (appData) {
      const filteredGuruList = appData.guru.filter(g => g.id !== id);
      updateAppData({ ...appData, guru: filteredGuruList });
    }
  };

  // Kelas Management Handlers
  const handleAddKelas = (nama: string) => {
    if (appData) {
      const newKelas: Kelas = { id: generateUniqueId(), nama };
      updateAppData({ ...appData, kelas: [...appData.kelas, newKelas] });
    }
  };

  const handleEditKelas = (id: string, nama: string) => {
    if (appData) {
      const updatedKelasList = appData.kelas.map(k =>
        k.id === id ? { ...k, nama } : k
      );
      updateAppData({ ...appData, kelas: updatedKelasList });
    }
  };

  const handleDeleteKelas = (id: string) => {
    if (appData) {
      const filteredKelasList = appData.kelas.filter(k => k.id !== id);
      updateAppData({ ...appData, kelas: filteredKelasList });
    }
  };

  // Queue Management Handlers
  const handleUpdateAntrianStatus = (id: string, status: AntrianStatus) => {
    if (appData) {
      const updatedAntrianList = appData.antrian.map(a =>
        a.id === id ? { ...a, status } : a
      );
      updateAppData({ ...appData, antrian: updatedAntrianList });
    }
  };

  const handleDeleteAntrian = (id: string) => {
    if (appData) {
      const filteredAntrianList = appData.antrian.filter(a => a.id !== id);
      updateAppData({ ...appData, antrian: filteredAntrianList });
    }
  };

  const handleCallNextQueue = () => {
    if (!appData) return;

    const currentAntrianList = [...appData.antrian];
    let updatedAntrianList = [...currentAntrianList];
    let toastMessage = "";

    // 1. Find the currently "Diproses" queue and set it to "Selesai"
    const processingQueueIndex = updatedAntrianList.findIndex(a => a.status === "Diproses");
    if (processingQueueIndex !== -1) {
      updatedAntrianList[processingQueueIndex] = {
        ...updatedAntrianList[processingQueueIndex],
        status: "Selesai",
      };
      toastMessage += `Antrian #${updatedAntrianList[processingQueueIndex].nomorAntrian} selesai. `;
    }

    // 2. Find the next "Menunggu" queue (lowest number)
    const waitingQueues = updatedAntrianList
      .filter(a => a.status === "Menunggu")
      .sort((a, b) => a.nomorAntrian - b.nomorAntrian);

    if (waitingQueues.length > 0) {
      const nextQueueToProcess = waitingQueues[0];
      const nextQueueIndex = updatedAntrianList.findIndex(a => a.id === nextQueueToProcess.id);

      if (nextQueueIndex !== -1) {
        updatedAntrianList[nextQueueIndex] = {
          ...updatedAntrianList[nextQueueIndex],
          status: "Diproses",
        };
        toastMessage += `Antrian #${nextQueueToProcess.nomorAntrian} dipanggil.`;
        toast({
          title: "Sukses!",
          description: toastMessage,
        });
      }
    } else {
      toastMessage = "Tidak ada antrian menunggu lainnya.";
      toast({
        title: "Info",
        description: toastMessage,
        variant: "default",
      });
    }

    updateAppData({ ...appData, antrian: updatedAntrianList });
  };


  if (!appData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Admin Panel...
      </div>
    );
  }

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
              onCallNextQueue={handleCallNextQueue} // Pass the new handler
            />
          </TabsContent>
          <TabsContent value="guru" className="mt-6">
            <GuruManagement
              guruList={appData.guru}
              onAddGuru={handleAddGuru}
              onEditGuru={handleEditGuru}
              onDeleteGuru={handleDeleteGuru}
            />
          </TabsContent>
          <TabsContent value="kelas" className="mt-6">
            <KelasManagement
              kelasList={appData.kelas}
              onAddKelas={handleAddKelas}
              onEditKelas={handleEditKelas}
              onDeleteKelas={handleDeleteKelas}
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
      <MadeWithDyad />
    </div>
  );
};

export default AdminPage;