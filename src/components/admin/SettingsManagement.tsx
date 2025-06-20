import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Setting } from "@/types/app";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox

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

  const handleWorkingDayChange = (dayIndex: number, checked: boolean) => {
    const newWorkingDays = checked
      ? [...settings.workingDays, dayIndex].sort((a, b) => a - b)
      : settings.workingDays.filter((day) => day !== dayIndex);
    onSettingsChange({
      ...settings,
      workingDays: newWorkingDays,
    });
  };

  const handleSaveClick = () => {
    // Removed validation for tanggalCetakDefault as it's now automatic
    if (!settings.jamMulai || !settings.jamAkhir || settings.intervalAntarAntrian <= 0) {
      toast({
        title: "Error",
        description: "Jam Mulai, Jam Akhir, dan Interval Antar Antrian harus diisi dengan benar.",
        variant: "destructive",
      });
      return;
    }
    if (settings.workingDays.length === 0) {
      toast({
        title: "Error",
        description: "Setidaknya satu hari kerja harus dipilih.",
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

  const daysOfWeek = [
    { name: "Minggu", index: 0 },
    { name: "Senin", index: 1 },
    { name: "Selasa", index: 2 },
    { name: "Rabu", index: 3 },
    { name: "Kamis", index: 4 },
    { name: "Jumat", index: 5 },
    { name: "Sabtu", index: 6 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Jadwal Cetak</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tanggal Cetak Default dihapus karena akan otomatis */}
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
        <div>
          <Label>Hari Kerja</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {daysOfWeek.map((day) => (
              <div key={day.index} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day.index}`}
                  checked={settings.workingDays.includes(day.index)}
                  onCheckedChange={(checked) =>
                    handleWorkingDayChange(day.index, checked as boolean)
                  }
                />
                <label
                  htmlFor={`day-${day.index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {day.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={handleSaveClick}>Simpan Pengaturan Jadwal</Button>
      </CardContent>
    </Card>
  );
};

export default SettingsManagement;