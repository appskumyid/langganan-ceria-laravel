
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";
import { Crown } from "lucide-react";

type Product = Tables<'managed_products'>;

interface ProductDetailDialogProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const formatPricing = (pricing: any) => {
    if (!pricing || typeof pricing !== 'object') return [];
    const periods = [
        { key: 'monthly', label: 'Bulanan' },
        { key: 'quarterly', label: '3 Bulan' },
        { key: 'semiAnnual', label: '6 Bulan' },
        { key: 'yearly', label: 'Tahunan' },
    ];
    return periods
        .map(p => ({ label: p.label, price: pricing[p.key] }))
        .filter(p => p.price);
}

export const ProductDetailDialog = ({ product, isOpen, onOpenChange }: ProductDetailDialogProps) => {
  if (!product) return null;

  const pricingPeriods = formatPricing(product.pricing);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline">{product.category}</Badge>
            <Badge
                variant="default"
                className={
                    product.type === "Premium" 
                    ? "bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-500/90" 
                    : "bg-gray-900/75 text-white border-transparent hover:bg-gray-900/85"
                }
            >
                {product.type === "Premium" && <Crown className="w-3 h-3 mr-1" />}
                {product.type}
            </Badge>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <img src={product.image_url || '/placeholder.svg'} alt={product.name} className="w-full h-64 object-cover rounded-lg" />
          <p className="text-muted-foreground">{product.description || "Tidak ada deskripsi."}</p>
          
          {product.features && product.features.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-lg">Fitur Unggulan</h4>
              <ul className="list-disc list-inside space-y-1">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {pricingPeriods.length > 0 && (
             <div>
                <h4 className="font-semibold mb-2 text-lg">Opsi Harga</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pricingPeriods.map(({label, price}) => (
                        <div key={label} className="p-3 bg-muted rounded-lg">
                            <p className="font-semibold">{label}</p>
                            <p className="text-primary">{price}</p>
                        </div>
                    ))}
                </div>
             </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
};
