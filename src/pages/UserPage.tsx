import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { getAppData, generateUniqueId, getNextQueueNumber, getNextAvailableSlot, addAntrian, addUser } from "@/lib/data";
import { Antrian, User, Kelas, Setting } from "@/types/app";
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UserPage = () => {
  const { toast } = useToast();
  const [userList, setUserList] = useState<User[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [antrianList, setAntrianList] = useState<Antrian[]>([]);
  const [settings, setSettings] = useState<Setting | null>(null);

  const [inputUserName, setInputUserName] = useState<string>("");
  const [selectedKelasId, setSelectedKelasId] = useState<string>("");

  const [generatedAntrian, setGeneratedAntrian] = useState<Antrian | null>(null);

  const [showNewQueueForm, setShowNewQueueForm] = useState(true);
  const [reprintSelectedUserId, setReprintSelectedUserId] = useState<string>("");
  const [foundActiveAntrian, setFoundActiveAntrian] = useState<Antrian | null>(null);

  const fetchAppData = async () => {
    try {
      const appData = await getAppData();
      setUserList(appData.user);
      setKelasList(appData.kelas);
      setAntrianList(appData.antrian);
      setSettings(appData.setting);
      console.log("UserPage: Data antrian dimuat:", appData.antrian.length, appData.antrian);
      console.log("UserPage: Pengaturan dimuat:", appData.setting);
    } catch (error) {
      console.error("UserPage: Gagal memuat data aplikasi:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data aplikasi.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAppData();
  }, []);

  const isUserAlreadyQueued = (userName: string) => {
    const trimmedUserName = userName.trim().toUpperCase();
    return antrianList.some(antrian => {
      const user = userList.find(u => u.id === antrian.guruId); // Changed to guruId
      return user && user.nama.toUpperCase() === trimmedUserName && antrian.status !== "Selesai";
    });
  };

  const handleCetakAntrian = async () => {
    console.log("handleCetakAntrian: Memulai proses cetak antrian.");
    console.log("handleCetakAntrian: inputUserName:", inputUserName);
    console.log("handleCetakAntrian: selectedKelasId:", selectedKelasId);

    const trimmedUserName = inputUserName.trim().toUpperCase();

    if (!trimmedUserName) {
      toast({
        title: "Error",
        description: "Mohon masukkan Nama User.",
        variant: "destructive",
      });
      console.error("handleCetakAntrian: Nama User belum diisi.");
      return;
    }

    if (!selectedKelasId) {
      toast({
        title: "Error",
        description: "Mohon pilih Kelas.",
        variant: "destructive",
      });
      console.error("handleCetakAntrian: Kelas belum dipilih.");
      return;
    }

    if (isUserAlreadyQueued(trimmedUserName)) {
      toast({
        title: "Error",
        description: "Nama ini sudah memiliki antrian yang aktif.",
        variant: "destructive",
      });
      console.error("handleCetakAntrian: Nama sudah memiliki antrian aktif.");
      return;
    }

    if (!settings) {
      toast({
        title: "Error",
        description: "Pengaturan aplikasi belum dimuat. Coba refresh halaman.",
        variant: "destructive",
      });
      console.error("handleCetakAntrian: Pengaturan aplikasi null.");
      return;
    }
    console.log("handleCetakAntrian: Pengaturan yang digunakan:", settings);

    try {
      let finalUserId: string;
      const existingUser = userList.find(u => u.nama.toUpperCase() === trimmedUserName);

      if (existingUser) {
        finalUserId = existingUser.id;
        console.log("handleCetakAntrian: User ditemukan:", existingUser.nama, existingUser.id);
      } else {
        // Add new user if not found
        console.log("handleCetakAntrian: User tidak ditemukan, menambahkan user baru:", trimmedUserName);
        try {
          const newUser: User = { id: generateUniqueId(), nama: trimmedUserName };
          const addedUser = await addUser(newUser);
          finalUserId = addedUser.id;
          toast({ title: "Info", description: `Nama user "${trimmedUserName}" baru ditambahkan.` });
          await fetchAppData(); // Re-fetch user list to include the new user
        } catch (error) {
          console.error("handleCetakAntrian: Gagal menambahkan user baru:", error);
          toast({
            title: "Error",
            description: "Gagal menambahkan user baru. Silakan coba lagi.",
            variant: "destructive",
          });
          return;
        }
      }

      const nextQueueNum = await getNextQueueNumber();
      console.log("handleCetakAntrian: Nomor antrian berikutnya:", nextQueueNum);

      console.log("handleCetakAntrian: Mencari slot tersedia dengan antrianList:", antrianList.length, "dan settings:", settings);
      const nextSlot = await getNextAvailableSlot(antrianList, settings); // Pass current antrianList and settings

      if (!nextSlot) {
        toast({
          title: "Error",
          description: "Tidak ada slot jadwal yang tersedia. Silakan hubungi admin.",
          variant: "destructive",
        });
        console.error("handleCetakAntrian: Tidak ada slot jadwal yang tersedia.");
        return;
      }
      console.log("handleCetakAntrian: Slot tersedia berikutnya:", nextSlot);

      const newAntrian: Antrian = {
        id: generateUniqueId(),
        nomorAntrian: nextQueueNum,
        guruId: finalUserId, // Changed to guruId
        kelasId: selectedKelasId,
        tanggalCetak: nextSlot.tanggal,
        jamCetak: nextSlot.jam,
        status: "Menunggu",
        createdAt: new Date().toISOString(),
      };
      console.log("handleCetakAntrian: Objek antrian baru:", newAntrian);

      const addedAntrian = await addAntrian(newAntrian); // Add to Supabase
      console.log("handleCetakAntrian: Antrian berhasil ditambahkan ke Supabase:", addedAntrian);
      await fetchAppData(); // Re-fetch all data to update state

      setGeneratedAntrian(addedAntrian);
      setShowNewQueueForm(true); // Ensure we are on the new queue form view after generation
      setInputUserName(""); // Clear the input field

      toast({
        title: "Sukses!",
        description: `Nomor antrian Anda: ${addedAntrian.nomorAntrian}.`,
      });
    } catch (error) {
      console.error("handleCetakAntrian: Gagal membuat antrian baru:", error);
      toast({
        title: "Error",
        description: "Gagal mencetak nomor antrian. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  const printQueueCard = async (antrianToPrint: Antrian) => {
    if (antrianToPrint) {
      const qrCodeValue = JSON.stringify({
        id: antrianToPrint.id,
        nomor: antrianToPrint.nomorAntrian,
        user: userList.find(u => u.id === antrianToPrint.guruId)?.nama, // Changed to guruId
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
          <p style="margin-top: 10px; font-size: 1em; color: #333;">Nama: <strong style="color: #007bff;">${userList.find(u => u.id === antrianToPrint.guruId)?.nama}</strong></p> {/* Changed to guruId */}
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
    if (!reprintSelectedUserId) {
      toast({
        title: "Error",
        description: "Mohon pilih Nama untuk mencari antrian.",
        variant: "destructive",
      });
      setFoundActiveAntrian(null);
      return;
    }

    const activeQueue = antrianList.find(
      (antrian) => antrian.guruId === reprintSelectedUserId && antrian.status !== "Selesai" // Changed to guruId
    );

    if (activeQueue) {
      setFoundActiveAntrian(activeQueue);
      toast({
        title: "Antrian Ditemukan!",
        description: `Antrian aktif untuk nama ini adalah #${activeQueue.nomorAntrian}.`,
      });
    } else {
      setFoundActiveAntrian(null);
      toast({
        title: "Info",
        description: "Tidak ada antrian aktif ditemukan untuk nama ini.",
        variant: "default",
      });
    }
  };

  // isCetakButtonEnabled now only depends on inputUserName and selectedKelasId
  const isCetakButtonEnabled = inputUserName.trim() !== "" && selectedKelasId !== "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold mb-6">Pengajuan Antrian Rapor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <Button
              className="flex-1"
              variant={showNewQueueForm ? "default" : "outline"}
              onClick={() => {
                setShowNewQueueForm(true);
                setGeneratedAntrian(null);
                setFoundActiveAntrian(null);
                setReprintSelectedUserId("");
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
                setInputUserName(""); // Clear manual input
                setSelectedKelasId("");
              }}
            >
              Cetak Ulang Kartu Antrian
            </Button>
          </div>

          {showNewQueueForm ? (
            !generatedAntrian ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="userName">Nama</Label>
                  <Input
                    id="userName"
                    value={inputUserName}
                    onChange={(e) => setInputUserName(e.target.value)}
                    placeholder="Masukkan Nama"
                  />
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
                        >
                          {kelas.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      user: userList.find(u => u.id === generatedAntrian.guruId)?.nama, // Changed to guruId
                      kelas: kelasList.find(k => k.id === generatedAntrian.kelasId)?.nama,
                      jadwal: `${generatedAntrian.tanggalCetak} ${generatedAntrian.jamCetak}`
                    })}
                    size={180}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p>Nama: <span className="font-medium">{userList.find(u => u.id === generatedAntrian.guruId)?.nama}</span></p> {/* Changed to guruId */}
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
                <Label htmlFor="reprintUser">Cari Antrian Aktif Berdasarkan Nama</Label>
                <Select onValueChange={setReprintSelectedUserId} value={reprintSelectedUserId}>
                  <SelectTrigger id="reprintUser">
                    <SelectValue placeholder="Pilih Nama" />
                  </SelectTrigger>
                  <SelectContent>
                    {userList.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.nama}
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
                        user: userList.find(u => u.id === foundActiveAntrian.guruId)?.nama, // Changed to guruId
                        kelas: kelasList.find(k => k.id === foundActiveAntrian.kelasId)?.nama,
                        jadwal: `${foundActiveAntrian.tanggalCetak} ${foundActiveAntrian.jamCetak}`
                      })}
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p>Nama: <span className="font-medium">{userList.find(u => u.id === foundActiveAntrian.guruId)?.nama}</span></p> {/* Changed to guruId */}
                  <p>Kelas: <span className="font-medium">{kelasList.find(k => k.id === foundActiveAntrian.kelasId)?.nama}</span></p>
                  <p>Tanggal & Jam Cetak: <span className="font-medium">{foundActiveAntrian.tanggalCetak} Pukul {foundActiveAntrian.jamCetak}</span></p>
                  <Button className="w-full mt-6" onClick={() => printQueueCard(foundActiveAntrian)}>
                    Cetak Ulang Kartu Antrian
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPage;