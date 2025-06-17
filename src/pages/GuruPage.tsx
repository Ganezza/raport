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
import QRCode from 'qrcode';
import { MadeWithDyad } from "@/components/made-with-dyad";

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

  // New states for reprint feature
  const [showNewQueueForm, setShowNewQueueForm] = useState(true);
  const [reprintSelectedGuruId, setReprintSelectedGuruId] = useState<string>("");
  const [foundActiveAntrian, setFoundActiveAntrian] = useState<Antrian | null>(null);

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
    console.log("GuruPage: Data antrian setelah penambahan:", appData.antrian.length, appData.antrian);
    setAntrianList(appData.antrian); // Update state to reflect new antrian

    setGeneratedAntrian(newAntrian);
    setShowNewQueueForm(true); // Ensure we are on the new queue form view after generation

    toast({
      title: "Sukses!",
      description: `Nomor antrian Anda: ${newAntrian.nomorAntrian}.`,
    });
  };

  const printQueueCard = async (antrianToPrint: Antrian) => {
    if (antrianToPrint) {
      const qrCodeValue = JSON.stringify({
        id: antrianToPrint.id,
        nomor: antrianToPrint.nomorAntrian,
        guru: guruList.find(g => g.id === antrianToPrint.guruId)?.nama,
        kelas: kelasList.find(k => k.id === antrianToPrint.kelasId)?.nama,
        jadwal: `${antrianToPrint.tanggalCetak} ${antrianToPrint.jamCetak}`
      });

      let qrCodeDataUrl = '';
      try {
        qrCodeDataUrl = await QRCode.toDataURL(qrCodeValue, {
          errorCorrectionLevel: 'H',
          width: 150,
          margin: 0,
        });
      } catch (err) {
        console.error("Failed to generate QR code for print:", err);
        toast({
          title: "Error",
          description: "Gagal membuat QR Code untuk dicetak.",
          variant: "destructive",
        });
        return;
      }

      const printContent = `
        <div style="width: 280px; padding: 20px; border: 1px solid #ccc; border-radius: 8px; text-align: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <h2 style="margin-bottom: 15px; color: #333; font-size: 1.5em;">Kartu Antrian Cetak Rapor</h2>
          <p style="font-size: 1.1em; margin-bottom: 5px; color: #555;">Nomor Antrian:</p>
          <h1 style="font-size: 3.5em; margin-bottom: 25px; color: #007bff; font-weight: bold;">${antrianToPrint.nomorAntrian}</h1>
          <img src="${qrCodeDataUrl}" style="display: block; margin: 0 auto 20px auto; width: 150px; height: 150px; border: 1px solid #eee;" />
          <p style="margin-top: 10px; font-size: 1em; color: #333;">Nama Guru: <strong style="color: #007bff;">${guruList.find(g => g.id === antrianToPrint.guruId)?.nama}</strong></p>
          <p style="font-size: 1em; color: #333;">Kelas: <strong style="color: #007bff;">${kelasList.find(k => k.id === antrianToPrint.kelasId)?.nama}</strong></p>
          <p style="font-size: 0.9em; color: #666; margin-top: 10px;">Tanggal & Jam Cetak: ${antrianToPrint.tanggalCetak} Pukul ${antrianToPrint.jamCetak}</p>
          <p style="margin-top: 30px; font-size: 0.75em; color: #888;">Mohon datang tepat waktu.</p>
        </div>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Cetak Kartu Antrian</title>');
        printWindow.document.write('<style>@media print { body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; } }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  const handleSearchActiveQueue = () => {
    if (!reprintSelectedGuruId) {
      toast({
        title: "Error",
        description: "Mohon pilih Nama Guru untuk mencari antrian.",
        variant: "destructive",
      });
      setFoundActiveAntrian(null);
      return;
    }

    const activeQueue = antrianList.find(
      (antrian) => antrian.guruId === reprintSelectedGuruId && antrian.status !== "Selesai"
    );

    if (activeQueue) {
      setFoundActiveAntrian(activeQueue);
      toast({
        title: "Antrian Ditemukan!",
        description: `Antrian aktif untuk guru ini adalah #${activeQueue.nomorAntrian}.`,
      });
    } else {
      setFoundActiveAntrian(null);
      toast({
        title: "Info",
        description: "Tidak ada antrian aktif ditemukan untuk guru ini.",
        variant: "default",
      });
    }
  };

  const isCetakButtonEnabled = selectedGuruId && selectedKelasId && checkbox1 && checkbox2 && checkbox3;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Aplikasi Antrian Cetak Rapor</h2>

        <div className="flex space-x-4 mb-6">
          <Button
            className="flex-1"
            variant={showNewQueueForm ? "default" : "outline"}
            onClick={() => {
              setShowNewQueueForm(true);
              setGeneratedAntrian(null);
              setFoundActiveAntrian(null);
              setReprintSelectedGuruId("");
            }}
          >
            Cetak Antrian Baru
          </Button>
          <Button
            className="flex-1"
            variant={!showNewQueueForm ? "default" : "outline"}
            onClick={() => {
              setShowNewQueueForm(false);
              setGeneratedAntrian(null);
              setFoundActiveAntrian(null);
              setSelectedGuruId("");
              setSelectedKelasId("");
              setCheckbox1(false);
              setCheckbox2(false);
              setCheckbox3(false);
            }}
          >
            Cetak Ulang Kartu Antrian
          </Button>
        </div>

        {showNewQueueForm ? (
          !generatedAntrian ? (
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
              <Button className="w-full mt-6" onClick={() => printQueueCard(generatedAntrian)}>
                Cetak / Unduh Kartu Antrian
              </Button>
              <Button variant="outline" className="w-full mt-2" onClick={() => setGeneratedAntrian(null)}>
                Kembali ke Form
              </Button>
            </div>
          )
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="reprintGuru">Cari Antrian Aktif Berdasarkan Nama Guru</Label>
              <Select onValueChange={setReprintSelectedGuruId} value={reprintSelectedGuruId}>
                <SelectTrigger id="reprintGuru">
                  <SelectValue placeholder="Pilih Guru" />
                </SelectTrigger>
                <SelectContent>
                  {guruList.map((guru) => (
                    <SelectItem key={guru.id} value={guru.id}>
                      {guru.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleSearchActiveQueue}>
              Cari Antrian Aktif
            </Button>

            {foundActiveAntrian && (
              <div className="text-center space-y-4 mt-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold">Antrian Aktif Ditemukan:</h3>
                <p className="text-5xl font-bold text-blue-600">{foundActiveAntrian.nomorAntrian}</p>
                <div className="flex justify-center my-4">
                  <QRCodeSVG
                    value={JSON.stringify({
                      id: foundActiveAntrian.id,
                      nomor: foundActiveAntrian.nomorAntrian,
                      guru: guruList.find(g => g.id === foundActiveAntrian.guruId)?.nama,
                      kelas: kelasList.find(k => k.id === foundActiveAntrian.kelasId)?.nama,
                      jadwal: `${foundActiveAntrian.tanggalCetak} ${foundActiveAntrian.jamCetak}`
                    })}
                    size={180}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p>Nama Guru: <span className="font-medium">{guruList.find(g => g.id === foundActiveAntrian.guruId)?.nama}</span></p>
                <p>Kelas: <span className="font-medium">{kelasList.find(k => k.id === foundActiveAntrian.kelasId)?.nama}</span></p>
                <p>Tanggal & Jam Cetak: <span className="font-medium">{foundActiveAntrian.tanggalCetak} Pukul {foundActiveAntrian.jamCetak}</span></p>
                <Button className="w-full mt-6" onClick={() => printQueueCard(foundActiveAntrian)}>
                  Cetak Ulang Kartu Antrian
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default GuruPage;