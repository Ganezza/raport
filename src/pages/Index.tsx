import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@/integrations/supabase/auth.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { session, loading } = useSession();

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
      
      if (!loading && !session) {
        toast({
          title: "Akses Admin",
          description: "Silakan login untuk mengakses halaman admin.",
        });
        navigate("/login");
      } else if (session) {
        toast({
          title: "Akses Admin",
          description: "Mengalihkan ke halaman admin...",
        });
        navigate("/admin");
      }
    }
  }, [clickCount, navigate, toast, session, loading]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <CardHeader className="text-center">
          <CardTitle
            className="text-3xl font-bold mb-4 text-gray-800 cursor-pointer select-none"
            onClick={handleSecretClick}
          >
            Selamat Datang di Aplikasi Antrian Cetak Rapor
          </CardTitle>
          <p className="text-lg text-gray-600 mb-8">Pilih peran Anda untuk melanjutkan:</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 max-w-xs mx-auto">
            <Link to="/guru">
              <Button className="w-full py-3 text-lg">Pengajuan Antrian</Button>
            </Link>
            <Link to="/display">
              <Button className="w-full py-3 text-lg" variant="outline">Cek Proses Antrian</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;