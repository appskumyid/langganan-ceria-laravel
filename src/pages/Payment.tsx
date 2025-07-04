import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Copy, Clock, ArrowLeft, Loader2, Banknote, CreditCard, Heart } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

const fetchSubscriptionDetails = async (subscriptionId: string, userId: string | undefined) => {
  if (!userId) throw new Error("User not authenticated");
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// Helper function to extract donation amount from total price
const extractDonationInfo = (priceString: string) => {
  const totalAmount = parseInt(priceString.replace(/[^\d]/g, '')) || 0;
  // Assume the last 3 digits are the donation amount
  const donationAmount = totalAmount % 1000;
  const baseAmount = totalAmount - donationAmount;
  
  return {
    totalAmount,
    baseAmount,
    donationAmount: donationAmount > 0 ? donationAmount : 0
  };
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const { user } = useAuth();
  
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bank_transfer");
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: subscription, isLoading, error: queryError } = useQuery({
    queryKey: ['subscriptionDetails', subscriptionId],
    queryFn: () => fetchSubscriptionDetails(subscriptionId!, user?.id),
    enabled: !!subscriptionId && !!user,
  });

  useEffect(() => {
    if (subscription?.subscription_status !== 'pending_payment') {
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [subscription]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Berhasil Disalin", description: "Nomor rekening telah disalin ke clipboard." });
  };

  const handleConfirmPayment = async () => {
    if (!subscription) return;

    if (!selectedFile && selectedPaymentMethod === 'bank_transfer') {
      toast({
        title: "Bukti Pembayaran Diperlukan",
        description: "Silakan unggah bukti pembayaran Anda.",
        variant: "destructive",
      });
      return;
    }

    setIsConfirming(true);

    try {
      let paymentProofUrl: string | null = null;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${subscription.user_id}-${subscription.id}-${new Date().getTime()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('payment_proofs')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Gagal mengunggah bukti: ${uploadError.message}`);
        }
        
        const { data: urlData } = supabase.storage
          .from('payment_proofs')
          .getPublicUrl(filePath);

        if (!urlData) {
          throw new Error("Tidak bisa mendapatkan URL bukti pembayaran.");
        }
        paymentProofUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          subscription_status: 'waiting_confirmation',
          payment_proof_url: paymentProofUrl
        })
        .eq('id', subscription.id);

      if (error) throw error;

      supabase.functions.invoke('mailchimp-sync', {
        body: { subscription_id: subscription.id }
      }).then(({ error: funcError }) => {
        if (funcError) {
          console.warn("Mailchimp sync failed on user confirmation:", funcError.message);
        }
      });
      
      toast({
        title: "Konfirmasi Terkirim",
        description: "Pembayaran Anda sedang kami verifikasi. Status akan segera diperbarui.",
      });
      navigate("/my-subscriptions");
    } catch (error: any) {
      toast({
        title: "Gagal Mengkonfirmasi",
        description: error.message || "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-lg">Memuat detail pembayaran...</p>
      </div>
    );
  }

  if (queryError || !subscription) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Gagal memuat detail pembayaran atau langganan tidak ditemukan.</p>
        <Button onClick={() => navigate("/my-subscriptions")} className="mt-4">Kembali ke Langganan Saya</Button>
      </div>
    );
  }

  if (subscription.subscription_status !== 'pending_payment') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Status Pembayaran</h2>
            <p className="text-gray-600 mb-4">
              Langganan untuk {subscription.product_name} sudah lunas atau sedang diproses.
            </p>
            <Button onClick={() => navigate("/my-subscriptions")}>
              Lihat Langganan Saya
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const paymentMethods = [
    { id: 'bank_transfer', name: 'Transfer Bank', icon: Banknote },
    { id: 'virtual_account', name: 'Virtual Account', icon: CreditCard, disabled: true },
  ];

  // Extract donation information
  const { totalAmount, baseAmount, donationAmount } = extractDonationInfo(subscription.product_price);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/my-subscriptions")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold">Pembayaran</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Batas Waktu Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-mono font-bold text-red-600 mb-2">{formatTime(timeLeft)}</div>
                <p className="text-sm text-gray-600">Selesaikan pembayaran sebelum waktu habis</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Pilih Metode Pembayaran</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="space-y-3">
                  {paymentMethods.map(method => {
                    const Icon = method.icon;
                    return (
                      <Label key={method.id} htmlFor={method.id} className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${selectedPaymentMethod === method.id ? 'bg-primary/10 border-primary' : 'hover:bg-gray-50'} ${method.disabled ? 'cursor-not-allowed opacity-50' : ''}`}>
                        <RadioGroupItem value={method.id} id={method.id} disabled={method.disabled}/>
                        <Icon className="h-6 w-6 text-gray-700" />
                        <span className="font-semibold">{method.name}</span>
                        {method.disabled && <Badge variant="outline">Segera Hadir</Badge>}
                      </Label>
                    )
                  })}
                </RadioGroup>
              </CardContent>
            </Card>

            {selectedPaymentMethod === 'bank_transfer' && (
              <>
                <Card>
                  <CardHeader><CardTitle>Instruksi Transfer Bank</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Bank:</span>
                          <span className="font-medium">Bank BCA</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">No. Rekening:</span>
                          <div className="flex items-center gap-2">
                              <span className="font-mono font-bold">1234567890</span>
                              <Button size="sm" variant="ghost" onClick={() => copyToClipboard('1234567890')}><Copy className="h-4 w-4" /></Button>
                          </div>
                      </div>
                       <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Jumlah:</span>
                          <span className="font-bold text-lg text-green-600">{subscription.product_price}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Unggah Bukti Pembayaran</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      id="paymentProof"
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                      accept="image/png, image/jpeg, image/jpg, application/pdf"
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Unggah screenshot atau PDF bukti transfer Anda.
                    </p>
                  </CardContent>
                </Card>
              </>
            )}

            <Button onClick={handleConfirmPayment} className="w-full" disabled={timeLeft === 0 || isConfirming}>
              {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Saya Sudah Membayar
            </Button>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Ringkasan Pesanan</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{subscription.product_name}</h3>
                    <p className="text-sm text-gray-600">Langganan {subscription.product_period}</p>
                  </div>
                  <Badge variant={subscription.product_type === 'Premium' ? 'default' : 'secondary'}>{subscription.product_type}</Badge>
                </div>
                
                {donationAmount > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Harga produk:</span>
                      <span>{formatCurrency(baseAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Donasi amal:</span>
                      </div>
                      <span className="text-green-600">{formatCurrency(donationAmount)}</span>
                    </div>
                    <p className="text-xs text-green-600 italic">
                      *Donasi akan disalurkan untuk fakir miskin dan lembaga amal resmi
                    </p>
                  </>
                )}
                
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{subscription.product_price}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle>Detail Pelanggan</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Nama:</span><span>{subscription.customer_name}</span></div>
                <div className="flex justify-between"><span>Email:</span><span>{subscription.customer_email}</span></div>
                <div className="flex justify-between"><span>Telepon:</span><span>{subscription.customer_phone}</span></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
