import React, { useState, useEffect, useCallback } from "react";
import {
  getAppData,
  addUser, // Changed from addGuru
  updateUser, // Changed from updateGuru
  deleteUser, // Changed from deleteGuru
  deleteAllUser, // Changed from deleteAllGuru
  addKelas,
  updateKelas,
  deleteKelas,
  deleteAllKelas,
  updateAntrian,
  deleteAntrian,
  updateSettings,
  generateUniqueId,
} from "@/lib/data";
import { AppData, User, Kelas, Antrian, AntrianStatus, Setting } from "@/types/app"; // Changed Guru to User
import SettingsManagement from "@/components/admin/SettingsManagement";
import UserManagement from "@/components/admin/UserManagement"; // Changed from GuruManagement
import KelasManagement from "@/components/admin/KelasManagement";
import QueueManagement from "@/components/admin/QueueManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/integrations/supabase/auth.tsx";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminPage = () => {
  const [appData, setAppDataState] = useState<AppData | null>(null);
  const { toast } = useToast();
  const { session, loading } = useSession();
  const navigate = useNavigate();

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
    if (!loading && !session) {
      toast({
        title: "Akses Ditolak",
        description: "Anda harus login untuk mengakses halaman admin.",
        variant: "destructive",
      });
      navigate('/login', { replace: true });
    } else if (session) {
      fetchInitialData();
    }
  }, [session, loading, navigate, fetchInitialData, toast]);

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
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan jadwal.",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async (nama: string) => { // Changed from handleAddGuru
    if (!appData) return;
    try {
      const newUser: User = { id: generateUniqueId(), nama }; // Changed Guru to User
      await addUser(newUser); // Changed addGuru
      toast({ title: "Sukses!", description: "User berhasil ditambahkan." }); // Changed text
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to add user:", error); // Changed text
      toast({ title: "Error", description: "Gagal menambahkan user.", variant: "destructive" }); // Changed text
    }
  };

  const handleEditUser = async (id: string, nama: string) => { // Changed from handleEditGuru
    if (!appData) return;
    try {
      await updateUser({ id, nama }); // Changed updateGuru
      toast({ title: "Sukses!", description: "Nama User berhasil diperbarui." }); // Changed text
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to edit user:", error); // Changed text
      toast({ title: "Error", description: "Gagal memperbarui nama user.", variant: "destructive" }); // Changed text
    }
  };

  const handleDeleteUser = async (id: string) => { // Changed from handleDeleteGuru
    if (!appData) return;
    try {
      await deleteUser(id); // Changed deleteGuru
      toast({ title: "Sukses!", description: "User berhasil dihapus." }); // Changed text
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to delete user:", error); // Changed text
      toast({ title: "Error", description: "Gagal menghapus user.", variant: "destructive" }); // Changed text
    }
  };

  const handleDeleteAllUser = async () => { // Changed from handleDeleteAllGuru
    if (!appData) return;
    try {
      await deleteAllUser(); // Changed deleteAllGuru
      toast({ title: "Sukses!", description: "Semua user berhasil dihapus." }); // Changed text
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to delete all users:", error); // Changed text
      toast({ title: "Error", description: "Gagal menghapus semua user.", variant: "destructive" }); // Changed text
    }
  };

  const handleAddMultipleUser = async (names: string[]) => { // Changed from handleAddMultipleGuru
    if (!appData) return;
    try {
      const newUserEntries: User[] = names.map(name => ({ id: generateUniqueId(), nama: name })); // Changed Guru to User
      const { error } = await supabase.from('guru').insert(newUserEntries); // Still 'guru' table in DB
      if (error) throw error;
      toast({ title: "Sukses!", description: `${names.length} user berhasil ditambahkan dari file.`, }); // Changed text
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to add multiple users:", error); // Changed text
      toast({ title: "Error", description: "Gagal menambahkan beberapa user dari file.", variant: "destructive" }); // Changed text
    }
  };

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

  const handleDeleteAllKelas = async () => {
    if (!appData) return;
    try {
      await deleteAllKelas();
      toast({ title: "Sukses!", description: "Semua kelas berhasil dihapus." });
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to delete all kelas:", error);
      toast({ title: "Error", description: "Gagal menghapus semua kelas.", variant: "destructive" });
    }
  };

  const handleAddMultipleKelas = async (names: string[]) => {
    if (!appData) return;
    try {
      const newKelasEntries: Kelas[] = names.map(name => ({ id: generateUniqueId(), nama: name }));
      const { error } = await supabase.from('kelas').insert(newKelasEntries);
      if (error) throw error;
      toast({ title: "Sukses!", description: `${names.length} kelas berhasil ditambahkan dari file.`, });
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to add multiple kelas:", error);
      toast({ title: "Error", description: "Gagal menambahkan beberapa kelas dari file.", variant: "destructive" });
    }
  };

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

      const processingQueue = currentAntrianList.find(a => a.status === "Diproses");
      if (processingQueue) {
        updates.push({ ...processingQueue, status: "Selesai" });
        toastMessage += `Antrian #${processingQueue.nomorAntrian} selesai. `;
      }

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

      for (const antrian of updates) {
        await updateAntrian(antrian);
      }
      await fetchInitialData();
    } catch (error) {
      console.error("Failed to call next queue:", error);
      toast({
        title: "Error",
        description: "Gagal memanggil antrian berikutnya.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Gagal logout. Silakan coba lagi.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout Berhasil",
        description: "Anda telah berhasil logout.",
      });
      navigate('/login', { replace: true });
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Admin Panel...
      </div>
    );
  }

  // Add this check to ensure appData is not null before rendering content that uses it
  if (!appData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat data aplikasi...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panel Admin</h1>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>

        <Tabs defaultValue="antrian" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="antrian">Antrian</TabsTrigger>
            <TabsTrigger value="user">User</TabsTrigger> {/* Changed from guru */}
            <TabsTrigger value="kelas">Kelas</TabsTrigger>
            <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          </TabsList>
          <TabsContent value="antrian" className="mt-6">
            <QueueManagement
              antrianList={appData.antrian}
              userList={appData.user} // Changed from guruList
              kelasList={appData.kelas}
              onUpdateAntrianStatus={handleUpdateAntrianStatus}
              onDeleteAntrian={handleDeleteAntrian}
              onCallNextQueue={handleCallNextQueue}
            />
          </TabsContent>
          <TabsContent value="user" className="mt-6"> {/* Changed from guru */}
            <UserManagement // Changed from GuruManagement
              userList={appData.user} // Changed from guruList
              onAddUser={handleAddUser} // Changed from onAddGuru
              onEditUser={handleEditUser} // Changed from onEditGuru
              onDeleteUser={handleDeleteUser} // Changed from onDeleteGuru
              onAddMultipleUser={handleAddMultipleUser} // Changed from onAddMultipleGuru
              onDeleteAllUser={handleDeleteAllUser} // Changed from onDeleteAllGuru
            />
          </TabsContent>
          <TabsContent value="kelas" className="mt-6">
            <KelasManagement
              kelasList={appData.kelas}
              onAddKelas={handleAddKelas}
              onEditKelas={handleEditKelas}
              onDeleteKelas={handleDeleteKelas}
              onAddMultipleKelas={handleAddMultipleKelas}
              onDeleteAllKelas={handleDeleteAllKelas}
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