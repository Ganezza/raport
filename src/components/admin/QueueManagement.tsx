import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Antrian, AntrianStatus, User, Kelas } from "@/types/app";
import { Trash2, PlayCircle } from "lucide-react";

interface QueueManagementProps {
  antrianList: Antrian[];
  userList: User[];
  kelasList: Kelas[];
  onUpdateAntrianStatus: (id: string, status: AntrianStatus) => void;
  onDeleteAntrian: (id: string) => void;
  onCallNextQueue: () => void;
}

const QueueManagement: React.FC<QueueManagementProps> = ({
  antrianList,
  userList,
  kelasList,
  onUpdateAntrianStatus,
  onDeleteAntrian,
  onCallNextQueue,
}) => {
  const getUserName = (userId: string) => {
    return userList.find(u => u.id === userId)?.nama || "N/A";
  };

  const getKelasName = (kelasId: string) => {
    return kelasList.find(k => k.id === kelasId)?.nama || "N/A";
  };

  const getStatusColor = (status: AntrianStatus) => {
    switch (status) {
      case "Menunggu":
        return "text-blue-600";
      case "Diproses":
        return "text-yellow-600";
      case "Selesai":
        return "text-green-600";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Manajemen Antrian</CardTitle>
        <Button onClick={onCallNextQueue} className="flex items-center">
          <PlayCircle className="mr-2 h-4 w-4" /> Panggil Antrian Berikutnya
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Antrian</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Jadwal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {antrianList.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center">Belum ada antrian.</TableCell></TableRow>
            ) : (
              antrianList.map((antrian) => (
                <TableRow key={antrian.id}>
                  <TableCell className="font-medium">{antrian.nomorAntrian}</TableCell>
                  <TableCell>{getUserName(antrian.guruId)}</TableCell>
                  <TableCell>{getKelasName(antrian.kelasId)}</TableCell>
                  <TableCell>{antrian.tanggalCetak} {antrian.jamCetak}</TableCell>
                  <TableCell>
                    <Select
                      value={antrian.status}
                      onValueChange={(value: AntrianStatus) => onUpdateAntrianStatus(antrian.id, value)}
                    >
                      <SelectTrigger className={`w-[120px] ${getStatusColor(antrian.status)}`}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Menunggu">Menunggu</SelectItem>
                        <SelectItem value="Diproses">Diproses</SelectItem>
                        <SelectItem value="Selesai">Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onDeleteAntrian(antrian.id)}>
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

export default QueueManagement;