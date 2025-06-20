import React, { useState, useEffect } from "react";
import { getAppData } from "@/lib/data";
import { Antrian, User, Kelas } from "@/types/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

const DisplayPage = () => {
  const [antrianList, setAntrianList] = useState<Antrian[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);

  const fetchInitialData = async () => {
    try {
      console.log("DisplayPage: Memulai pengambilan data awal...");
      const appData = await getAppData();
      setUserList(appData.user);
      setKelasList(appData.kelas);
      // Initial fetch for antrian, then rely on real-time updates
      setAntrianList(appData.antrian);
      console.log("DisplayPage: Data awal berhasil dimuat.");
    } catch (error) {
      console.error("DisplayPage: Error fetching initial data:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();

    // Set up real-time subscription for 'antrian' table
    console.log("DisplayPage: Menyiapkan langganan real-time untuk 'antrian'...");
    const antrianSubscription = supabase
      .channel('public:antrian')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'antrian' }, payload => {
        console.log('DisplayPage: Perubahan antrian diterima!', payload);
        // Re-fetch all antrian data to ensure correct sorting and filtering
        // This is simpler than trying to merge changes from payload
        supabase.from('antrian').select('*').order('createdAt', { ascending: true })
          .then(({ data, error }) => {
            if (error) {
              console.error("DisplayPage: Error fetching antrian setelah update real-time:", error);
            } else {
              setAntrianList(data || []);
              console.log("DisplayPage: Antrian diperbarui dari real-time.");
            }
          });
      })
      .subscribe();
    console.log("DisplayPage: Langganan 'antrian' diinisialisasi.");

    // Set up real-time subscription for 'guru' table (now 'user' in app, but 'guru' in DB)
    console.log("DisplayPage: Menyiapkan langganan real-time untuk 'guru' (sekarang user)...");
    const userSubscription = supabase
      .channel('public:guru') // Still 'guru' table in DB
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guru' }, payload => {
        console.log('DisplayPage: Perubahan user diterima!', payload);
        supabase.from('guru').select('*') // Still 'guru' table in DB
          .then(({ data, error }) => {
            if (error) {
              console.error("DisplayPage: Error fetching user setelah update real-time:", error);
            } else {
              setUserList(data || []);
              console.log("DisplayPage: User diperbarui dari real-time.");
            }
          });
      })
      .subscribe();
    console.log("DisplayPage: Langganan 'user' diinisialisasi.");

    // Set up real-time subscription for 'kelas' table
    console.log("DisplayPage: Menyiapkan langganan real-time untuk 'kelas'...");
    const kelasSubscription = supabase
      .channel('public:kelas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kelas' }, payload => {
        console.log('DisplayPage: Perubahan kelas diterima!', payload);
        supabase.from('kelas').select('*')
          .then(({ data, error }) => {
            if (error) {
              console.error("DisplayPage: Error fetching kelas setelah update real-time:", error);
            } else {
              setKelasList(data || []);
              console.log("DisplayPage: Kelas diperbarui dari real-time.");
            }
          });
      })
      .subscribe();
    console.log("DisplayPage: Langganan 'kelas' diinisialisasi.");

    return () => {
      console.log("DisplayPage: Membersihkan langganan real-time.");
      supabase.removeChannel(antrianSubscription);
      supabase.removeChannel(userSubscription);
      supabase.removeChannel(kelasSubscription);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const getUserName = (userId: string) => {
    return userList.find(u => u.id === userId)?.nama || "N/A";
  };

  const getKelasName = (kelasId: string) => {
    return kelasList.find(k => k.id === kelasId)?.nama || "N/A";
  };

  const waitingQueues = antrianList.filter(a => a.status === "Menunggu").sort((a, b) => a.nomorAntrian - b.nomorAntrian);
  const processingQueues = antrianList.filter(a => a.status === "Diproses").sort((a, b) => a.nomorAntrian - b.nomorAntrian);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900 p-4 md:p-8">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-center mb-6 md:mb-10 text-blue-700">
        ANTRIAN CETAK RAPOR
      </h1>

      <div className="flex flex-1 flex-col md:flex-row gap-4 md:gap-8">
        {/* Sedang Diproses */}
        <Card className="flex-1 bg-white border-blue-500 border-4 shadow-lg">
          <CardHeader className="bg-blue-500 py-3 md:py-4 rounded-t-lg">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-white">
              SEDANG DIPROSES
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center flex-grow">
            {processingQueues.length > 0 ? (
              <div className="text-center">
                <p className="text-5xl sm:text-6xl md:text-7xl font-bold text-yellow-600 animate-pulse">
                  {processingQueues[0].nomorAntrian}
                </p>
                <p className="text-2xl sm:text-3xl mt-2 md:mt-4 text-gray-800">
                  {getUserName(processingQueues[0].guruId)}
                </p>
                <p className="text-xl sm:text-2xl text-gray-700">
                  {getKelasName(processingQueues[0].kelasId)}
                </p>
                <p className="text-lg sm:text-xl text-gray-600 mt-1 md:mt-2">
                  {processingQueues[0].jamCetak}
                </p>
              </div>
            ) : (
              <p className="text-xl sm:text-3xl text-gray-500">Tidak ada antrian yang sedang diproses.</p>
            )}
          </CardContent>
        </Card>

        {/* Antrian Selanjutnya */}
        <Card className="flex-1 bg-white border-green-500 border-4 shadow-lg">
          <CardHeader className="bg-green-500 py-3 md:py-4 rounded-t-lg">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-white">
              ANTRIAN SELANJUTNYA
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center flex-grow">
            {waitingQueues.length > 0 ? (
              <div className="text-center">
                <p className="text-5xl sm:text-6xl md:text-7xl font-bold text-green-600">
                  {waitingQueues[0].nomorAntrian}
                </p>
                <p className="text-2xl sm:text-3xl mt-2 md:mt-4 text-gray-800">
                  {getUserName(waitingQueues[0].guruId)}
                </p>
                <p className="text-xl sm:text-2xl text-gray-700">
                  {getKelasName(waitingQueues[0].kelasId)}
                </p>
                <p className="text-lg sm:text-xl text-gray-600 mt-1 md:mt-2">
                  {waitingQueues[0].jamCetak}
                </p>
              </div>
            ) : (
              <p className="text-xl sm:text-3xl text-gray-500">Tidak ada antrian menunggu.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daftar Antrian Menunggu */}
      <Card className="mt-6 md:mt-8 bg-white border-gray-300 border-2 shadow-lg">
        <CardHeader className="bg-gray-200 py-2 md:py-3 rounded-t-lg">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center text-gray-800">
            DAFTAR ANTRIAN MENUNGGU
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4">
          {waitingQueues.length > 1 ? ( // Show list if more than 1 waiting queue (first one is "next")
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-h-60 overflow-y-auto">
              {waitingQueues.slice(1).map((antrian) => (
                <div key={antrian.id} className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-bold text-blue-600">{antrian.nomorAntrian}</span>
                  <div className="text-right">
                    <p className="text-base sm:text-lg font-medium text-gray-800">{getUserName(antrian.guruId)}</p>
                    <p className="text-sm sm:text-base text-gray-700">{getKelasName(antrian.kelasId)}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{antrian.jamCetak}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-3 md:py-4">Tidak ada antrian menunggu lainnya.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DisplayPage;