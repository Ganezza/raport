import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Menambahkan import ini
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Kelas } from "@/types/app";
import { PlusCircle, Edit, Trash2, Upload } from "lucide-react";

interface KelasManagementProps {
  kelasList: Kelas[];
  onAddKelas: (nama: string) => void;
  onEditKelas: (id: string, nama: string) => void;
  onDeleteKelas: (id: string) => void;
  onAddMultipleKelas: (names: string[]) => void;
}

const KelasManagement: React.FC<KelasManagementProps> = ({
  kelasList,
  onAddKelas,
  onEditKelas,
  onDeleteKelas,
  onAddMultipleKelas,
}) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentKelasName, setCurrentKelasName] = useState("");
  const [editingKelasId, setEditingKelasId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSaveKelas = () => {
    const trimmedAndUppercasedName = currentKelasName.trim().toUpperCase(); // Convert to uppercase
    if (!trimmedAndUppercasedName) {
      toast({ title: "Error", description: "Nama Kelas tidak boleh kosong.", variant: "destructive" });
      return;
    }
    if (editingKelasId) {
      onEditKelas(editingKelasId, trimmedAndUppercasedName);
      toast({ title: "Sukses!", description: "Nama Kelas berhasil diperbarui." });
    } else {
      onAddKelas(trimmedAndUppercasedName);
      toast({ title: "Sukses!", description: "Kelas berhasil ditambahkan." });
    }
    setCurrentKelasName("");
    setEditingKelasId(null);
    setIsDialogOpen(false);
  };

  const openDialogForAdd = () => {
    setCurrentKelasName("");
    setEditingKelasId(null);
    setIsDialogOpen(true);
  };

  const openDialogForEdit = (kelas: Kelas) => {
    setEditingKelasId(kelas.id);
    setCurrentKelasName(kelas.nama);
    setIsDialogOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadKelas = () => {
    if (!selectedFile) {
      toast({ title: "Error", description: "Mohon pilih file terlebih dahulu.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const names = content.split('\n').map(name => name.trim().toUpperCase()).filter(name => name.length > 0); // Convert to uppercase

      if (names.length === 0) {
        toast({ title: "Info", description: "File kosong atau tidak ada nama yang valid.", variant: "default" });
        return;
      }

      onAddMultipleKelas(names);

      toast({ title: "Sukses!", description: `${names.length} kelas berhasil ditambahkan dari file.`, });
      setSelectedFile(null);
      const fileInput = document.getElementById('kelasFileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    };

    reader.onerror = () => {
      toast({ title: "Error", description: "Gagal membaca file.", variant: "destructive" });
    };

    reader.readAsText(selectedFile);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Manajemen Kelas</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openDialogForAdd}>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kelas
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingKelasId ? "Edit Kelas" : "Tambah Kelas Baru"}</DialogTitle>
              <DialogDescription>
                {editingKelasId ? "Ubah nama kelas." : "Masukkan nama kelas baru."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="kelasName" className="text-right">
                  Nama
                </Label>
                <Input
                  id="kelasName"
                  value={currentKelasName}
                  onChange={(e) => setCurrentKelasName(e.target.value.toUpperCase())} {/* Convert to uppercase */}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveKelas}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Unggah Kelas dari File Teks (.txt)</h3>
          <p className="text-sm text-gray-600 mb-3">
            Unggah file teks dengan satu nama kelas per baris.
          </p>
          <div className="flex items-center space-x-2">
            <Input
              id="kelasFileInput"
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Button onClick={handleUploadKelas} disabled={!selectedFile}>
              <Upload className="mr-2 h-4 w-4" /> Unggah
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Nama Kelas</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kelasList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Belum ada data kelas.
                </TableCell>
              </TableRow>
            ) : (
              kelasList.map((kelas, index) => (
                <TableRow key={kelas.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{kelas.nama}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => {
                      console.log("KelasManagement: Tombol Edit diklik untuk kelas ID:", kelas.id);
                      openDialogForEdit(kelas);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      console.log("KelasManagement: Tombol Hapus diklik untuk kelas ID:", kelas.id);
                      onDeleteKelas(kelas.id);
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default KelasManagement;