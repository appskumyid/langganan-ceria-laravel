import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Copy, Clock, ArrowLeft, Loader2, Banknote, CreditCard, Heart, RefreshCw, Calendar } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { DeployedFileManager } from "@/components/DeployedFileManager";

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

// Generate random donation amount and payment code
const generateRandomDonation = () => Math.floor(Math.random() * 900) + 100;
const generatePaymentCode = () => Math.floor(Math.random() * 900) + 100;

const SubscriptionRenewal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const { user } = useAuth();
  
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bank_transfer");
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [donationAmount] = useState(generateRandomDonation());
  const [paymentCode] = useState(generatePaymentCode());

  const { data: subscription, isLoading, error: queryError } = useQuery({
    queryKey: ['subscriptionRenewal', subscriptionId],
    queryFn: () => fetchSubscriptionDetails(subscriptionId!, user?.id),
    enabled: !!subscriptionId && !!user,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
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
    toast({ title: "Berhasil Disalin", description: "Nomor rekening telah disalin ke clipboard." });
  };

  const calculateRenewalPrice = () => {
    const basePrice = parseInt(subscription?.product_price.replace(/[^\d]/g, '') || '0');
    const totalWithDonation = basePrice + donationAmount + paymentCode;
    
    // Add period multiplier
    const periodMultiplier = selectedPeriod === 'yearly' ? 12 * 0.85 : selectedPeriod === 'quarterly' ? 3 * 0.95 : 1; // Discounts for longer periods
    
    return Math.floor(totalWithDonation * periodMultiplier);
  };

  const handleRenewalConfirmation = async () => {
    if (!subscription) return;

    if (!selectedFile && selectedPaymentMethod === 'bank_transfer') {
      toast({
        title: "Bukti Pembayaran Diperlukan",
        description: "Silakan unggah bukti pembayaran Anda.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      let paymentProofUrl: string | null = null;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `renewal-${subscription.user_id}-${subscription.id}-${new Date().getTime()}.${fileExt}`;
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

      // Calculate new expiry date
      const currentExpiry = subscription.expires_at ? new Date(subscription.expires_at) : new Date();
      const newExpiry = new Date(currentExpiry);
      
      switch (selectedPeriod) {
        case 'monthly':
          newExpiry.setMonth(newExpiry.getMonth() + 1);
          break;
        case 'quarterly':
          newExpiry.setMonth(newExpiry.getMonth() + 3);
          break;
        case 'yearly':
          newExpiry.setFullYear(newExpiry.getFullYear() + 1);
          break;
      }

      // Update existing subscription for renewal instead of creating new record
      const renewalPrice = formatCurrency(calculateRenewalPrice());
      
      // Don't update expires_at here - let admin approve and set the actual expiry date
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          product_price: renewalPrice,
          product_period: selectedPeriod,
          subscription_status: 'waiting_confirmation',
          payment_method_selected: selectedPaymentMethod,
          payment_proof_url: paymentProofUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      if (updateError) throw updateError;

      // Sync with mailchimp
      supabase.functions.invoke('mailchimp-sync', {
        body: { subscription_id: subscription.id }
      }).then(({ error: funcError }) => {
        if (funcError) {
          console.warn("Mailchimp sync failed on renewal:", funcError.message);
        }
      });
      
      toast({
        title: "Perpanjangan Berhasil Diproses",
        description: "Perpanjangan langganan Anda sedang kami verifikasi. Status akan segera diperbarui.",
      });
      navigate("/my-subscriptions");
    } catch (error: any) {
      toast({
        title: "Gagal Memproses Perpanjangan",
        description: error.message || "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-lg">Memuat detail perpanjangan...</p>
      </div>
    );
  }

  if (queryError || !subscription) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Gagal memuat detail langganan atau langganan tidak ditemukan.</p>
        <Button onClick={() => navigate("/my-subscriptions")} className="mt-4">Kembali ke Langganan Saya</Button>
      </div>
    );
  }

  const paymentMethods = [
    { id: 'bank_transfer', name: 'Transfer Bank', icon: Banknote },
    { id: 'virtual_account', name: 'Virtual Account', icon: CreditCard, disabled: true },
  ];

  const renewalPrice = calculateRenewalPrice();
  const { baseAmount } = extractDonationInfo(subscription.product_price);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/my-subscriptions")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <RefreshCw className="h-6 w-6" />
              Perpanjangan Langganan
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Payment Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Batas Waktu Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-mono font-bold text-red-600 mb-2">{formatTime(timeLeft)}</div>
                <p className="text-sm text-gray-600">Selesaikan pembayaran sebelum waktu habis</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pilih Periode Perpanjangan</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">
                      <div className="flex justify-between items-center w-full">
                        <span>Bulanan</span>
                        <Badge variant="outline">Harga Normal</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="quarterly">
                      <div className="flex justify-between items-center w-full">
                        <span>3 Bulan</span>
                        <Badge variant="secondary">Hemat 5%</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="yearly">
                      <div className="flex justify-between items-center w-full">
                        <span>Tahunan</span>
                        <Badge className="bg-green-600">Hemat 15%</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                          <span className="font-bold text-lg text-green-600">{formatCurrency(renewalPrice)}</span>
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

            <Button onClick={handleRenewalConfirmation} className="w-full" disabled={timeLeft === 0 || isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Konfirmasi Perpanjangan
            </Button>
          </div>

          {/* Right Column - Summary and File Manager */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Ringkasan Perpanjangan</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{subscription.product_name}</h3>
                    <p className="text-sm text-gray-600">Perpanjangan {selectedPeriod === 'monthly' ? 'Bulanan' : selectedPeriod === 'quarterly' ? '3 Bulan' : 'Tahunan'}</p>
                  </div>
                  <Badge variant={subscription.product_type === 'Premium' ? 'default' : 'secondary'}>{subscription.product_type}</Badge>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Harga dasar ({selectedPeriod}):</span>
                  <span>{formatCurrency(baseAmount * (selectedPeriod === 'yearly' ? 12 * 0.85 : selectedPeriod === 'quarterly' ? 3 * 0.95 : 1))}</span>
                </div>
                
                <div className="flex justify-between text-sm items-center">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Donasi amal:</span>
                  </div>
                  <span className="text-green-600">{formatCurrency(donationAmount)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Kode pembayaran:</span>
                  <span>{formatCurrency(paymentCode)}</span>
                </div>
                
                <p className="text-xs text-green-600 italic">
                  *Donasi akan disalurkan untuk fakir miskin dan lembaga amal resmi
                </p>
                
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Perpanjangan:</span>
                  <span>{formatCurrency(renewalPrice)}</span>
                </div>

                {/* Expiry Information */}
                <div className="bg-amber-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Perpanjangan Hingga:</span>
                  </div>
                  <p className="text-sm text-amber-600 mt-1">
                    {subscription.expires_at && new Date(subscription.expires_at).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })} + {selectedPeriod === 'monthly' ? '1 bulan' : selectedPeriod === 'quarterly' ? '3 bulan' : '1 tahun'}
                  </p>
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

            {/* Deployed File Manager */}
            <DeployedFileManager subscriptionId={subscriptionId!} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRenewal;