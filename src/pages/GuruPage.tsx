import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { getAppData, setAppData, generateUniqueId, getNextQueueNumber, getNextAvailableSlot } from "@/lib/data";
import { Antrian, Guru, Kelas } from "@/types/app";
import { QRCodeSVG } from 'qrcode.react';

const GuruPage = () => {
  const { toast } = useToast();
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [antrianList, setAntrianList] = useState<Antrian[]>([]);
  const [settings, setSettings] = useState<any>(null);

  const [selectedGuruId, setSelectedGuruId] = useState<string>("");
  const [selectedKelasId, setSelectedKelasId] = useState<string>("");
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const [checkbox3, setCheckbox3] = useState(false);

  const [generatedAntrian, setGeneratedAntrian] = useState<Antrian | null>(null);

  useEffect(() => {
    const appData = getAppData();
    setGuruList(appData.guru);
    setKelasList(appData.kelas);
    setAntrianList(appData.antrian);
    setSettings(appData.setting);
  }, []);

  const isGuruAlreadyQueued = (guruId: string) => {
    return antrianList.some(antrian => antrian.guruId === guruId && antrian.status !== "Selesai");
  };

  const isKelasAlreadyQueued = (kelasId: string) => {
    return antrianList.some(antrian => antrian.kelasId === kelasId && antrian.status !== "Selesai");
  };

  const handleCetakAntrian = () => {
    if (!selectedGuruId || !selectedKelasId) {
      toast({
        title: "Error",
        description: "Mohon pilih Nama Guru dan Kelas.",
        variant: "destructive",
      });
      return;
    }

    if (!checkbox1 || !checkbox2 || !checkbox3) {
      toast({
        title: "Error",
        description: "Mohon centang semua pernyataan sebelum mencetak nomor antrian.",
        variant: "destructive",
      });
      return;
    }

    if (isGuruAlreadyQueued(selectedGuruId)) {
      toast({
        title: "Error",
        description: "Guru ini sudah memiliki antrian yang aktif.",
        variant: "destructive",
      });
      return;
    }

    if (isKelasAlreadyQueued(selectedKelasId)) {
      toast({
        title: "Error",
        description: "Kelas ini sudah memiliki antrian yang aktif.",
        variant: "destructive",
      });
      return;
    }

    const appData = getAppData();
    const nextQueueNum = getNextQueueNumber(appData.antrian);
    const nextSlot = getNextAvailableSlot(appData.antrian, appData.setting);

    if (!nextSlot) {
      toast({
        title: "Error",
        description: "Tidak ada slot jadwal yang tersedia. Silakan hubungi admin.",
        variant: "destructive",
      });
      return;
    }

    const newAntrian: Antrian = {
      id: generateUniqueId(),
      nomorAntrian: nextQueueNum,
      guruId: selectedGuruId,
      kelasId: selectedKelasId,
      tanggalCetak: nextSlot.tanggal,
      jamCetak: nextSlot.jam,
      status: "Menunggu",
      createdAt: new Date().toISOString(),
    };

    appData.antrian.push(newAntrian);
    setAppData(appData);
    setAntrianList(appData.antrian); // Update state to reflect new antrian

    setGeneratedAntrian(newAntrian);

    toast({
      title: "Sukses!",
      description: `Nomor antrian Anda: ${newAntrian.nomorAntrian}`,
    });
  };

  const printQueueCard = () => {
    if (generatedAntrian) {
      const printContent = `
        <div style="text-align: center; padding: 20px; font-family: sans-serif;">
          <h2 style="margin-bottom: 10px;">Kartu Antrian Cetak Rapor</h2>
          <p style="font-size: 1.2em; margin-bottom: 5px;">Nomor Antrian:</p>
          <h1 style="font-size: 3em; margin-bottom: 20px; color: #007bff;">${generatedAntrian.nomorAntrian}</h1>
          <div id="qrcode-print" style="margin: 0 auto; width: 150px; height: 150px;"></div>
          <p style="margin-top: 20px;">Nama Guru: ${guruList.find(g => g.id === generatedAntrian.guruId)?.nama}</p>
          <p>Kelas: ${kelasList.find(k => k.id === generatedAntrian.kelasId)?.nama}</p>
          <p>Tanggal & Jam Cetak: ${generatedAntrian.tanggalCetak} Pukul ${generatedAntrian.jamCetak}</p>
          <p style="margin-top: 30px; font-size: 0.8em; color: #666;">Mohon datang tepat waktu.</p>
        </div>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Cetak Kartu Antrian</title></head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();

        // Render QR code into the new window's document
        const qrCodeContainer = printWindow.document.getElementById('qrcode-print');
        if (qrCodeContainer) {
          const qrCodeCanvas = document.createElement('canvas');
          new QRCodeSVG({
            value: JSON.stringify({
              id: generatedAntrian.id,
              nomor: generatedAntrian.nomorAntrian,
              guru: guruList.find(g => g.id === generatedAntrian.guruId)?.nama,
              kelas: kelasList.find(k => k.id === generatedAntrian.kelasId)?.nama,
              jadwal: `${generatedAntrian.tanggalCetak} ${generatedAntrian.jamCetak}`
            }),
            size: 150,
            level: 'H',
            includeMargin: false,
          }).render(qrCodeCanvas);
          qrCodeContainer.appendChild(qrCodeCanvas);
        }

        printWindow.print();
      }
    }
  };

  const isCetakButtonEnabled = selectedGuruId && selectedKelasId && checkbox1 && checkbox2 && checkbox3;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Form Pengajuan Antrian Cetak Rapor</h2>

        {!generatedAntrian ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="guru">Nama Guru</Label>
              <Select onValueChange={setSelectedGuruId} value={selectedGuruId}>
                <SelectTrigger id="guru">
                  <SelectValue placeholder="Pilih Guru" />
                </SelectTrigger>
                <SelectContent>
                  {guruList.map((guru) => (
                    <SelectItem
                      key={guru.id}
                      value={guru.id}
                      disabled={isGuruAlreadyQueued(guru.id)}
                    >
                      {guru.nama} {isGuruAlreadyQueued(guru.id) && "(Sudah Antri)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="kelas">Kelas</Label>
              <Select onValueChange={setSelectedKelasId} value={selectedKelasId}>
                <SelectTrigger id="kelas">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  {kelasList.map((kelas) => (
                    <SelectItem
                      key={kelas.id}
                      value={kelas.id}
                      disabled={isKelasAlreadyQueued(kelas.id)}
                    >
                      {kelas.nama} {isKelasAlreadyQueued(kelas.id) && "(Sudah Digunakan)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="checkbox1" checked={checkbox1} onCheckedChange={(checked) => setCheckbox1(!!checked)} />
                <Label htmlFor="checkbox1">Nilai dan CP sudah sesuai dan final</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="checkbox2" checked={checkbox2} onCheckedChange={(checked) => setCheckbox2(!!checked)} />
                <Label htmlFor="checkbox2">Data murid sudah benar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="checkbox3" checked={checkbox3} onCheckedChange={(checked) => setCheckbox3(!!checked)} />
                <Label htmlFor="checkbox3">Bertanggung jawab dalam proses cetak</Label>
              </div>
            </div>

            <Button
              className="w-full mt-6"
              onClick={handleCetakAntrian}
              disabled={!isCetakButtonEnabled}
            >
              CETAK NOMOR ANTRIAN
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Nomor Antrian Anda:</h3>
            <p className="text-5xl font-bold text-blue-600">{generatedAntrian.nomorAntrian}</p>
            <div className="flex justify-center my-4">
              <QRCodeSVG
                value={JSON.stringify({
                  id: generatedAntrian.id,
                  nomor: generatedAntrian.nomorAntrian,
                  guru: guruList.find(g => g.id === generatedAntrian.guruId)?.nama,
                  kelas: kelasList.find(k => k.id === generatedAntrian.kelasId)?.nama,
                  jadwal: `${generatedAntrian.tanggalCetak} ${generatedAntrian.jamCetak}`
                })}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
            <p>Nama Guru: <span className="font-medium">{guruList.find(g => g.id === generatedAntrian.guruId)?.nama}</span></p>
            <p>Kelas: <span className="font-medium">{kelasList.find(k => k.id === generatedAntrian.kelasId)?.nama}</span></p>
            <p>Tanggal & Jam Cetak: <span className="font-medium">{generatedAntrian.tanggalCetak} Pukul {generatedAntrian.jamCetak}</span></p>
            <Button className="w-full mt-6" onClick={printQueueCard}>
              Cetak / Unduh Kartu Antrian
            </Button>
            <Button variant="outline" className="w-full mt-2" onClick={() => setGeneratedAntrian(null)}>
              Kembali ke Form
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuruPage;