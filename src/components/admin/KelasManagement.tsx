import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Kelas } from "@/types/app";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

interface KelasManagementProps {
  kelasList: Kelas[];
  onAddKelas: (nama: string) => void;
  onEditKelas: (id: string, nama: string) => void;
  onDeleteKelas: (id: string) => void;
}

const KelasManagement: React.FC<KelasManagementProps> = ({
  kelasList,
  onAddKelas,
  onEditKelas,
  onDeleteKelas,
}) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentKelasName, setCurrentKelasName] = useState("");
  const [editingKelasId, setEditingKelasId] = useState<string | null>(null);

  const handleSaveKelas = () => {
    if (!currentKelasName.trim()) {
      toast({ title: "Error", description: "Nama Kelas tidak boleh kosong.", variant: "destructive" });
      return;
    }
    if (editingKelasId) {
      onEditKelas(editingKelasId, currentKelasName.trim());
      toast({ title: "Sukses!", description: "Nama Kelas berhasil diperbarui." });
    } else {
      onAddKelas(currentKelasName.trim());
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
                  onChange={(e) => setCurrentKelasName(e.target.value)}
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
                    <Button variant="ghost" size="sm" onClick={() => openDialogForEdit(kelas)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteKelas(kelas.id)}>
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