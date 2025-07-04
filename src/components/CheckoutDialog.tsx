
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Building2, Wallet, Smartphone, Loader2, Heart } from "lucide-react";
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

// Function to generate random donation amount and payment code
const generateDonationAmount = () => {
  // Generate random amount between 100-999
  return Math.floor(Math.random() * 900) + 100;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const CheckoutDialog = ({ isOpen, onClose, product }: CheckoutDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedPayment, setSelectedPayment] = useState("transfer");
  const [isProcessing, setIsProcessing] = useState(false);
  const [donationAmount] = useState(generateDonationAmount());

  // Calculate total payment amount
  const basePrice = parseInt(product.price.replace(/[^\d]/g, '')) || 0;
  const totalAmount = basePrice + donationAmount;

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
      product_price: formatCurrency(totalAmount), // Use total amount including donation
      product_period: product.period,
      product_category: product.category,
      product_type: product.type,
      subscription_status: 'pending_payment' as const,
      payment_method_selected: selectedPayment,
      customer_name: user.user_metadata?.full_name || user.email || '',
      customer_email: user.email || '',
      customer_phone: user.phone || '',
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
        description: `Produk telah ditambahkan. Total pembayaran ${formatCurrency(totalAmount)} (termasuk donasi ${formatCurrency(donationAmount)} untuk fakir miskin).`,
      });
      onClose();
      if (data) {
        navigate(`/payment/${data.id}`);
      } else {
        navigate('/my-subscriptions');
      }
    }
  };

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

          {/* Donation Info */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-green-600" />
                <h3 className="font-semibold text-green-800">Donasi Otomatis</h3>
              </div>
              <p className="text-sm text-green-700 mb-2">
                Tambahan {formatCurrency(donationAmount)} akan disumbangkan untuk fakir miskin dan lembaga amal resmi.
              </p>
              <div className="border-t border-green-200 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Total Pembayaran:</span>
                  <span className="font-bold text-lg text-green-800">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

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
              disabled={isProcessing}
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
