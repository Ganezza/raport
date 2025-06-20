import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types/app"; // Changed Guru to User
import { PlusCircle, Edit, Trash2, Upload } from "lucide-react";

interface UserManagementProps { // Changed interface name
  userList: User[]; // Changed prop name
  onAddUser: (nama: string) => void; // Changed prop name
  onEditUser: (id: string, nama: string) => void; // Changed prop name
  onDeleteUser: (id: string) => void; // Changed prop name
  onAddMultipleUser: (names: string[]) => void; // Changed prop name
  onDeleteAllUser: () => void; // Changed prop name
}

const UserManagement: React.FC<UserManagementProps> = ({ // Changed component name and prop type
  userList, // Changed prop name
  onAddUser, // Changed prop name
  onEditUser, // Changed prop name
  onDeleteUser, // Changed prop name
  onAddMultipleUser, // Changed prop name
  onDeleteAllUser, // Changed prop name
}) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUserName, setCurrentUserName] = useState(""); // Changed variable name
  const [editingUserId, setEditingUserId] = useState<string | null>(null); // Changed variable name
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSaveUser = () => { // Changed function name
    const trimmedAndUppercasedName = currentUserName.trim().toUpperCase(); // Changed variable name
    if (!trimmedAndUppercasedName) {
      toast({ title: "Error", description: "Nama User tidak boleh kosong.", variant: "destructive" }); // Changed text
      return;
    }
    if (editingUserId) { // Changed variable name
      onEditUser(editingUserId, trimmedAndUppercasedName); // Changed function call
      toast({ title: "Sukses!", description: "Nama User berhasil diperbarui." }); // Changed text
    } else {
      onAddUser(trimmedAndUppercasedName); // Changed function call
      toast({ title: "Sukses!", description: "User berhasil ditambahkan." }); // Changed text
    }
    setCurrentUserName(""); // Changed variable name
    setEditingUserId(null); // Changed variable name
    setIsDialogOpen(false);
  };

  const openDialogForAdd = () => {
    setCurrentUserName(""); // Changed variable name
    setEditingUserId(null); // Changed variable name
    setIsDialogOpen(true);
  };

  const openDialogForEdit = (user: User) => { // Changed parameter name and type
    setEditingUserId(user.id); // Changed variable name
    setCurrentUserName(user.nama); // Changed variable name
    setIsDialogOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadUser = () => { // Changed function name
    if (!selectedFile) {
      toast({ title: "Error", description: "Mohon pilih file terlebih dahulu.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const names = content.split('\n').map(name => name.trim().toUpperCase()).filter(name => name.length > 0);

      if (names.length === 0) {
        toast({ title: "Info", description: "File kosong atau tidak ada nama yang valid.", variant: "default" });
        return;
      }

      console.log("UserManagement: Names parsed from file:", names); // Changed text
      onAddMultipleUser(names); // Changed function call

      toast({ title: "Sukses!", description: `${names.length} user berhasil ditambahkan dari file.`, }); // Changed text
      setSelectedFile(null);
      const fileInput = document.getElementById('userInputFile') as HTMLInputElement; // Changed ID
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
        <CardTitle className="text-2xl font-bold">Manajemen User</CardTitle> {/* Changed text */}
        <div className="flex space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openDialogForAdd}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah User {/* Changed text */}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUserId ? "Edit User" : "Tambah User Baru"}</DialogTitle> {/* Changed text */}
                <DialogDescription>
                  {editingUserId ? "Ubah nama user." : "Masukkan nama user baru."} {/* Changed text */}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="userName" className="text-right">
                    Nama
                  </Label>
                  <Input
                    id="userName"
                    value={currentUserName} // Changed variable name
                    onChange={(e) => setCurrentUserName(e.target.value.toUpperCase())} // Changed variable name
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveUser}>Simpan</Button> {/* Changed function call */}
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={userList.length === 0}> {/* Changed prop name */}
                <Trash2 className="mr-2 h-4 w-4" /> Hapus Semua
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini akan menghapus <span className="font-bold">SEMUA</span> data user secara permanen. {/* Changed text */}
                  Ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={onDeleteAllUser}>Hapus Semua</AlertDialogAction> {/* Changed function call */}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Unggah User dari File Teks (.txt)</h3> {/* Changed text */}
          <p className="text-sm text-gray-600 mb-3">
            Unggah file teks dengan satu nama user per baris. {/* Changed text */}
          </p>
          <div className="flex items-center space-x-2">
            <Input
              id="userInputFile" // Changed ID
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Button onClick={handleUploadUser} disabled={!selectedFile}> {/* Changed function call */}
              <Upload className="mr-2 h-4 w-4" /> Unggah
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Nama User</TableHead> {/* Changed text */}
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userList.length === 0 ? ( // Changed prop name
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Belum ada data user. {/* Changed text */}
                </TableCell>
              </TableRow>
            ) : (
              userList.map((user, index) => ( // Changed variable name
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.nama}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openDialogForEdit(user)}> {/* Changed function call */}
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteUser(user.id)}> {/* Changed function call */}
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

export default UserManagement; // Changed export name