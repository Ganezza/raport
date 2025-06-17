import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Guru } from "@/types/app";
import { PlusCircle, Edit, Trash2, Upload } from "lucide-react"; // Import Upload icon

interface GuruManagementProps {
  guruList: Guru[];
  onAddGuru: (nama: string) => void;
  onEditGuru: (id: string, nama: string) => void;
  onDeleteGuru: (id: string) => void;
  onAddMultipleGuru: (names: string[]) => void; // New prop for bulk add
}

const GuruManagement: React.FC<GuruManagementProps> = ({
  guruList,
  onAddGuru,
  onEditGuru,
  onDeleteGuru,
  onAddMultipleGuru, // Destructure new prop
}) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentGuruName, setCurrentGuruName] = useState("");
  const [editingGuruId, setEditingGuruId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State for file upload

  const handleSaveGuru = () => {
    if (!currentGuruName.trim()) {
      toast({ title: "Error", description: "Nama Guru tidak boleh kosong.", variant: "destructive" });
      return;
    }
    if (editingGuruId) {
      onEditGuru(editingGuruId, currentGuruName.trim());
      toast({ title: "Sukses!", description: "Nama Guru berhasil diperbarui." });
    } else {
      onAddGuru(currentGuruName.trim());
      toast({ title: "Sukses!", description: "Guru berhasil ditambahkan." });
    }
    setCurrentGuruName("");
    setEditingGuruId(null);
    setIsDialogOpen(false);
  };

  const openDialogForAdd = () => {
    setCurrentGuruName("");
    setEditingGuruId(null);
    setIsDialogOpen(true);
  };

  const openDialogForEdit = (guru: Guru) => {
    setEditingGuruId(guru.id);
    setCurrentGuruName(guru.nama);
    setIsDialogOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadGuru = () => {
    if (!selectedFile) {
      toast({ title: "Error", description: "Mohon pilih file terlebih dahulu.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const names = content.split('\n').map(name => name.trim()).filter(name => name.length > 0);

      if (names.length === 0) {
        toast({ title: "Info", description: "File kosong atau tidak ada nama yang valid.", variant: "default" });
        return;
      }

      onAddMultipleGuru(names); // Call the new bulk add handler

      toast({ title: "Sukses!", description: `${names.length} guru berhasil ditambahkan dari file.`, });
      setSelectedFile(null); // Clear selected file
      // Optionally clear the file input element
      const fileInput = document.getElementById('guruFileInput') as HTMLInputElement;
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
        <CardTitle className="text-2xl font-bold">Manajemen Guru</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openDialogForAdd}>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Guru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGuruId ? "Edit Guru" : "Tambah Guru Baru"}</DialogTitle>
              <DialogDescription>
                {editingGuruId ? "Ubah nama guru." : "Masukkan nama guru baru."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="guruName" className="text-right">
                  Nama
                </Label>
                <Input
                  id="guruName"
                  value={currentGuruName}
                  onChange={(e) => setCurrentGuruName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveGuru}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Unggah Guru dari File Teks (.txt)</h3>
          <p className="text-sm text-gray-600 mb-3">
            Unggah file teks dengan satu nama guru per baris.
          </p>
          <div className="flex items-center space-x-2">
            <Input
              id="guruFileInput"
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Button onClick={handleUploadGuru} disabled={!selectedFile}>
              <Upload className="mr-2 h-4 w-4" /> Unggah
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Nama Guru</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guruList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Belum ada data guru.
                </TableCell>
              </TableRow>
            ) : (
              guruList.map((guru, index) => (
                <TableRow key={guru.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{guru.nama}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openDialogForEdit(guru)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteGuru(guru.id)}>
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

export default GuruManagement;