
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Building2, Wallet, Smartphone, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ProductForCheckout {
  id: number;
  name: string;
  price: string;
  period: string;
  category: string;
  type: "Premium" | "Non-Premium";
}

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductForCheckout;
}

const paymentMethods = [
  {
    id: "transfer",
    name: "Transfer Bank",
    icon: Building2,
    description: "Transfer ke rekening bank"
  },
  {
    id: "credit_card",
    name: "Kartu Kredit/Debit",
    icon: CreditCard,
    description: "Visa, Mastercard, dll"
  },
  {
    id: "ewallet",
    name: "E-Wallet",
    icon: Wallet,
    description: "GoPay, OVO, DANA, dll"
  },
  {
    id: "va",
    name: "Virtual Account",
    icon: Smartphone,
    description: "BCA, BRI, BNI, Mandiri"
  }
];

const CheckoutDialog = ({ isOpen, onClose, product }: CheckoutDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedPayment, setSelectedPayment] = useState("transfer");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setCustomerInfo({
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, isOpen]);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Anda harus login untuk berlangganan.",
        variant: "destructive",
      });
      onClose();
      navigate('/auth');
      return;
    }

    setIsProcessing(true);

    let expiresAt = null;
    if (product.period === "/bulan") {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      expiresAt = date.toISOString();
    }

    const subscriptionData = {
      user_id: user.id,
      product_static_id: product.id,
      product_name: product.name,
      product_price: product.price,
      product_period: product.period,
      product_category: product.category,
      product_type: product.type,
      subscription_status: 'pending_payment' as const,
      payment_method_selected: selectedPayment,
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone,
      expires_at: expiresAt,
    };

    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    setIsProcessing(false);

    if (error) {
      console.error("Error creating subscription:", error);
      toast({
        title: "Gagal Berlangganan",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil!",
        description: "Produk telah ditambahkan. Lanjutkan ke pembayaran.",
      });
      onClose();
      if (data) {
        navigate(`/payment/${data.id}`);
      } else {
        navigate('/my-subscriptions');
      }
    }
  };

  const isFormValid = customerInfo.name && customerInfo.email && customerInfo.phone;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checkout - {product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Product Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">Langganan {product.period}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{product.price}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="font-semibold">Informasi Pelanggan</h3>
            <div className="space-y-2">
              <Input
                placeholder="Nama Lengkap"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                type="email"
                placeholder="Email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input
                type="tel"
                placeholder="Nomor Telepon"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h3 className="font-semibold">Metode Pembayaran</h3>
            <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div key={method.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex items-center space-x-3 cursor-pointer flex-1">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button 
              onClick={handleCheckout} 
              className="flex-1"
              disabled={!isFormValid || isProcessing}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lanjut Pembayaran
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
