import React, { useState, useRef, useEffect } from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSecretClick = () => {
    setClickCount(prevCount => prevCount + 1);

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0); // Reset count if no click within 1 second
    }, 1000);
  };

  useEffect(() => {
    if (clickCount >= 5) {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      setClickCount(0); // Reset immediately after successful trigger
      toast({
        title: "Akses Admin",
        description: "Mengalihkan ke halaman admin...",
      });
      navigate("/admin");
    }
  }, [clickCount, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1
          className="text-4xl font-bold mb-4 text-gray-800 cursor-pointer select-none"
          onClick={handleSecretClick}
        >
          Selamat Datang di Aplikasi Antrian Cetak Rapor
        </h1>
        <p className="text-xl text-gray-600 mb-8">Pilih peran Anda untuk melanjutkan:</p>
        <div className="flex flex-col space-y-4 max-w-xs mx-auto">
          <Link to="/guru">
            <Button className="w-full py-3 text-lg">Halaman Guru (Pengajuan Antrian)</Button>
          </Link>
          {/* Tombol Halaman Admin telah dihapus */}
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