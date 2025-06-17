import React, { useState, useEffect } from "react";
import { getAppData } from "@/lib/data";
import { Antrian, Guru, Kelas } from "@/types/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client"; // Import supabase client

const DisplayPage = () => {
  const [antrianList, setAntrianList] = useState<Antrian[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);

  const fetchInitialData = async () => {
    try {
      const appData = await getAppData();
      setGuruList(appData.guru);
      setKelasList(appData.kelas);
      // Initial fetch for antrian, then rely on real-time updates
      setAntrianList(appData.antrian);
    } catch (error) {
      console.error("Error fetching initial data for DisplayPage:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();

    // Set up real-time subscription for 'antrian' table
    const antrianSubscription = supabase
      .channel('public:antrian')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'antrian' }, payload => {
        console.log('Change received!', payload);
        // Re-fetch all antrian data to ensure correct sorting and filtering
        // This is simpler than trying to merge changes from payload
        supabase.from('antrian').select('*').order('createdAt', { ascending: true })
          .then(({ data, error }) => {
            if (error) {
              console.error("Error fetching antrian after real-time update:", error);
            } else {
              setAntrianList(data || []);
            }
          });
      })
      .subscribe();

    // Set up real-time subscription for 'guru' table
    const guruSubscription = supabase
      .channel('public:guru')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guru' }, payload => {
        console.log('Guru change received!', payload);
        supabase.from('guru').select('*')
          .then(({ data, error }) => {
            if (error) {
              console.error("Error fetching guru after real-time update:", error);
            } else {
              setGuruList(data || []);
            }
          });
      })
      .subscribe();

    // Set up real-time subscription for 'kelas' table
    const kelasSubscription = supabase
      .channel('public:kelas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kelas' }, payload => {
        console.log('Kelas change received!', payload);
        supabase.from('kelas').select('*')
          .then(({ data, error }) => {
            if (error) {
              console.error("Error fetching kelas after real-time update:", error);
            } else {
              setKelasList(data || []);
            }
          });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(antrianSubscription);
      supabase.removeChannel(guruSubscription);
      supabase.removeChannel(kelasSubscription);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const getGuruName = (guruId: string) => {
    return guruList.find(g => g.id === guruId)?.nama || "N/A";
  };

  const getKelasName = (kelasId: string) => {
    return kelasList.find(k => k.id === kelasId)?.nama || "N/A";
  };

  const waitingQueues = antrianList.filter(a => a.status === "Menunggu").sort((a, b) => a.nomorAntrian - b.nomorAntrian);
  const processingQueues = antrianList.filter(a => a.status === "Diproses").sort((a, b) => a.nomorAntrian - b.nomorAntrian);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900 p-8">
      <h1 className="text-5xl font-extrabold text-center mb-10 text-blue-700">
        ANTRIAN CETAK RAPOR
      </h1>

      <div className="flex flex-1 gap-8">
        {/* Sedang Diproses */}
        <Card className="flex-1 bg-white border-blue-500 border-4 shadow-lg">
          <CardHeader className="bg-blue-500 py-4 rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-center text-white">
              SEDANG DIPROSES
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center h-full">
            {processingQueues.length > 0 ? (
              <div className="text-center">
                <p className="text-7xl font-bold text-yellow-600 animate-pulse">
                  {processingQueues[0].nomorAntrian}
                </p>
                <p className="text-3xl mt-4 text-gray-800">
                  {getGuruName(processingQueues[0].guruId)}
                </p>
                <p className="text-2xl text-gray-700">
                  {getKelasName(processingQueues[0].kelasId)}
                </p>
                <p className="text-xl text-gray-600 mt-2">
                  {processingQueues[0].jamCetak}
                </p>
              </div>
            ) : (
              <p className="text-3xl text-gray-500">Tidak ada antrian yang sedang diproses.</p>
            )}
          </CardContent>
        </Card>

        {/* Antrian Selanjutnya */}
        <Card className="flex-1 bg-white border-green-500 border-4 shadow-lg">
          <CardHeader className="bg-green-500 py-4 rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-center text-white">
              ANTRIAN SELANJUTNYA
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center h-full">
            {waitingQueues.length > 0 ? (
              <div className="text-center">
                <p className="text-7xl font-bold text-green-600">
                  {waitingQueues[0].nomorAntrian}
                </p>
                <p className="text-3xl mt-4 text-gray-800">
                  {getGuruName(waitingQueues[0].guruId)}
                </p>
                <p className="text-2xl text-gray-700">
                  {getKelasName(waitingQueues[0].kelasId)}
                </p>
                <p className="text-xl text-gray-600 mt-2">
                  {waitingQueues[0].jamCetak}
                </p>
              </div>
            ) : (
              <p className="text-3xl text-gray-500">Tidak ada antrian menunggu.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daftar Antrian Menunggu */}
      <Card className="mt-8 bg-white border-gray-300 border-2 shadow-lg">
        <CardHeader className="bg-gray-200 py-3 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center text-gray-800">
            DAFTAR ANTRIAN MENUNGGU
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {waitingQueues.length > 1 ? ( // Show list if more than 1 waiting queue (first one is "next")
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
              {waitingQueues.slice(1).map((antrian) => (
                <div key={antrian.id} className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-3xl font-bold text-blue-600">{antrian.nomorAntrian}</span>
                  <div className="text-right">
                    <p className="text-lg font-medium text-gray-800">{getGuruName(antrian.guruId)}</p>
                    <p className="text-md text-gray-700">{getKelasName(antrian.kelasId)}</p>
                    <p className="text-sm text-gray-600">{antrian.jamCetak}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">Tidak ada antrian menunggu lainnya.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DisplayPage;