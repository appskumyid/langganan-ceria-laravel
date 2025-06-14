
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Copy, Clock, ArrowLeft } from "lucide-react";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, completed, expired

  // Mock data - in real app this would come from the checkout
  const paymentData = {
    orderId: "ORD-2024-001",
    product: {
      name: "Toko Online Premium",
      price: "Rp 599.000",
      period: "/bulan"
    },
    paymentMethod: "Transfer Bank",
    bankDetails: {
      bankName: "Bank BCA",
      accountNumber: "1234567890",
      accountName: "PT Sistem Langganan Indonesia"
    },
    customer: {
      name: "John Doe",
      email: "john@example.com",
      phone: "081234567890"
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPaymentStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Nomor rekening telah disalin!");
  };

  const handleConfirmPayment = () => {
    setPaymentStatus("completed");
    setTimeout(() => {
      navigate("/products");
    }, 2000);
  };

  if (paymentStatus === "completed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h2>
            <p className="text-gray-600 mb-4">
              Terima kasih telah berlangganan {paymentData.product.name}
            </p>
            <Button onClick={() => navigate("/products")}>
              Kembali ke Produk
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/products")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold">Pembayaran</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Instructions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Waktu Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-red-600 mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Selesaikan pembayaran sebelum waktu habis
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instruksi Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Transfer Bank</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Bank:</span>
                      <span className="font-medium">{paymentData.bankDetails.bankName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">No. Rekening:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{paymentData.bankDetails.accountNumber}</span>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => copyToClipboard(paymentData.bankDetails.accountNumber)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Atas Nama:</span>
                      <span className="font-medium">{paymentData.bankDetails.accountName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Jumlah:</span>
                      <span className="font-bold text-lg text-green-600">{paymentData.product.price}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Langkah-langkah:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>Buka aplikasi mobile banking atau kunjungi ATM</li>
                    <li>Pilih menu transfer ke bank {paymentData.bankDetails.bankName}</li>
                    <li>Masukkan nomor rekening: {paymentData.bankDetails.accountNumber}</li>
                    <li>Masukkan jumlah pembayaran: {paymentData.product.price}</li>
                    <li>Konfirmasi transfer dan simpan bukti pembayaran</li>
                    <li>Klik tombol "Konfirmasi Pembayaran" di bawah</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button 
                onClick={handleConfirmPayment}
                className="flex-1"
                disabled={paymentStatus === "expired"}
              >
                Konfirmasi Pembayaran
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/products")}
              >
                Batal
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{paymentData.product.name}</h3>
                    <p className="text-sm text-gray-600">Langganan {paymentData.product.period}</p>
                  </div>
                  <Badge variant="secondary">Premium</Badge>
                </div>
                
                <hr />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{paymentData.product.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Admin:</span>
                    <span>Gratis</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{paymentData.product.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detail Pelanggan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nama:</span>
                  <span>{paymentData.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span>{paymentData.customer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Telepon:</span>
                  <span>{paymentData.customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Order ID:</span>
                  <span className="font-mono text-sm">{paymentData.orderId}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bantuan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Butuh bantuan dengan pembayaran? Hubungi kami:
                </p>
                <div className="space-y-1 text-sm">
                  <p><strong>WhatsApp:</strong> +62 878-8642-5562</p>
                  <p><strong>Email:</strong> support@sistemlangganan.com</p>
                  <p><strong>Jam Operasional:</strong> 09:00 - 17:00 WIB</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
