import React, { useState, useEffect } from "react";
import { getAppData } from "@/lib/data";
import { Antrian, Guru, Kelas } from "@/types/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MadeWithDyad } from "@/components/made-with-dyad";

const DisplayPage = () => {
  const [antrianList, setAntrianList] = useState<Antrian[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);

  const fetchQueueData = () => {
    const appData = getAppData();
    setAntrianList(appData.antrian);
    setGuruList(appData.guru);
    setKelasList(appData.kelas);
  };

  useEffect(() => {
    fetchQueueData(); // Initial fetch

    const intervalId = setInterval(fetchQueueData, 5000); // Refresh every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const getGuruName = (guruId: string) => {
    return guruList.find(g => g.id === guruId)?.nama || "N/A";
  };

  const getKelasName = (kelasId: string) => {
    return kelasList.find(k => k.id === kelasId)?.nama || "N/A";
  };

  const waitingQueues = antrianList.filter(a => a.status === "Menunggu").sort((a, b) => a.nomorAntrian - b.nomorAntrian);
  const processingQueues = antrianList.filter(a => a.status === "Diproses").sort((a, b) => a.nomorAntrian - b.nomorAntrian);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white p-8">
      <h1 className="text-5xl font-extrabold text-center mb-10 text-blue-400">
        ANTRIAN CETAK RAPOR
      </h1>

      <div className="flex flex-1 gap-8">
        {/* Sedang Diproses */}
        <Card className="flex-1 bg-gray-800 border-blue-500 border-4 shadow-lg">
          <CardHeader className="bg-blue-600 py-4 rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-center text-white">
              SEDANG DIPROSES
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center h-full">
            {processingQueues.length > 0 ? (
              <div className="text-center">
                <p className="text-7xl font-bold text-yellow-400 animate-pulse">
                  {processingQueues[0].nomorAntrian}
                </p>
                <p className="text-3xl mt-4">
                  {getGuruName(processingQueues[0].guruId)}
                </p>
                <p className="text-2xl text-gray-300">
                  {getKelasName(processingQueues[0].kelasId)}
                </p>
                <p className="text-xl text-gray-400 mt-2">
                  {processingQueues[0].jamCetak}
                </p>
              </div>
            ) : (
              <p className="text-3xl text-gray-400">Tidak ada antrian yang sedang diproses.</p>
            )}
          </CardContent>
        </Card>

        {/* Antrian Selanjutnya */}
        <Card className="flex-1 bg-gray-800 border-green-500 border-4 shadow-lg">
          <CardHeader className="bg-green-600 py-4 rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-center text-white">
              ANTRIAN SELANJUTNYA
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center h-full">
            {waitingQueues.length > 0 ? (
              <div className="text-center">
                <p className="text-7xl font-bold text-green-400">
                  {waitingQueues[0].nomorAntrian}
                </p>
                <p className="text-3xl mt-4">
                  {getGuruName(waitingQueues[0].guruId)}
                </p>
                <p className="text-2xl text-gray-300">
                  {getKelasName(waitingQueues[0].kelasId)}
                </p>
                <p className="text-xl text-gray-400 mt-2">
                  {waitingQueues[0].jamCetak}
                </p>
              </div>
            ) : (
              <p className="text-3xl text-gray-400">Tidak ada antrian menunggu.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daftar Antrian Menunggu */}
      <Card className="mt-8 bg-gray-800 border-gray-700 border-2 shadow-lg">
        <CardHeader className="bg-gray-700 py-3 rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center text-white">
            DAFTAR ANTRIAN MENUNGGU
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {waitingQueues.length > 1 ? ( // Show list if more than 1 waiting queue (first one is "next")
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
              {waitingQueues.slice(1).map((antrian) => (
                <div key={antrian.id} className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-3xl font-bold text-blue-300">{antrian.nomorAntrian}</span>
                  <div className="text-right">
                    <p className="text-lg font-medium">{getGuruName(antrian.guruId)}</p>
                    <p className="text-md text-gray-400">{getKelasName(antrian.kelasId)}</p>
                    <p className="text-sm text-gray-500">{antrian.jamCetak}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-4">Tidak ada antrian menunggu lainnya.</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-auto pt-4">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default DisplayPage;