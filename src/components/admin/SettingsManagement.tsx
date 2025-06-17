import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Setting } from "@/types/app";

interface SettingsManagementProps {
  settings: Setting;
  onSettingsChange: (newSettings: Setting) => void;
  onSave: () => void;
}

const SettingsManagement: React.FC<SettingsManagementProps> = ({
  settings,
  onSettingsChange,
  onSave,
}) => {
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    onSettingsChange({
      ...settings,
      [id]: id === "intervalAntarAntrian" ? Number(value) : value,
    });
  };

  const handleSaveClick = () => {
    if (!settings.tanggalCetakDefault || !settings.jamMulai || !settings.jamAkhir || settings.intervalAntarAntrian <= 0) {
      toast({
        title: "Error",
        description: "Semua pengaturan jadwal harus diisi dengan benar.",
        variant: "destructive",
      });
      return;
    }
    onSave();
    toast({
      title: "Sukses!",
      description: "Pengaturan jadwal berhasil disimpan.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Jadwal Cetak</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="tanggalCetakDefault">Tanggal Cetak Default (YYYY-MM-DD)</Label>
          <Input
            id="tanggalCetakDefault"
            type="date"
            value={settings.tanggalCetakDefault}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="jamMulai">Jam Mulai (HH:MM)</Label>
            <Input
              id="jamMulai"
              type="time"
              value={settings.jamMulai}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="jamAkhir">Jam Akhir (HH:MM)</Label>
            <Input
              id="jamAkhir"
              type="time"
              value={settings.jamAkhir}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="intervalAntarAntrian">Interval Antar Antrian (menit)</Label>
          <Input
            id="intervalAntarAntrian"
            type="number"
            value={settings.intervalAntarAntrian}
            onChange={handleInputChange}
            min="1"
          />
        </div>
        <Button onClick={handleSaveClick}>Simpan Pengaturan Jadwal</Button>
      </CardContent>
    </Card>
  );
};

export default SettingsManagement;