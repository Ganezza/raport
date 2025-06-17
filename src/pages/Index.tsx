import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Selamat Datang di Aplikasi Antrian Cetak Rapor</h1>
        <p className="text-xl text-gray-600 mb-8">Pilih peran Anda untuk melanjutkan:</p>
        <div className="flex flex-col space-y-4 max-w-xs mx-auto">
          <Link to="/guru">
            <Button className="w-full py-3 text-lg">Halaman Guru (Pengajuan Antrian)</Button>
          </Link>
          <Link to="/admin">
            <Button className="w-full py-3 text-lg" variant="secondary">Halaman Admin</Button>
          </Link>
          <Link to="/display">
            <Button className="w-full py-3 text-lg" variant="outline">Halaman Display Antrian (Mode TV)</Button>
          </Link>
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;