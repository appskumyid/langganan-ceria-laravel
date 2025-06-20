
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";
import { Crown, Clock, CheckCircle } from "lucide-react";

type Product = Tables<'managed_products'>;

interface ProductDetailDialogProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const formatPricing = (pricing: any) => {
    if (!pricing || typeof pricing !== 'object') return [];
    const periods = [
        { key: 'monthly', label: 'Bulanan', icon: <Clock className="w-4 h-4" /> },
        { key: 'quarterly', label: '3 Bulan', icon: <Clock className="w-4 h-4" /> },
        { key: 'semiAnnual', label: '6 Bulan', icon: <Clock className="w-4 h-4" /> },
        { key: 'yearly', label: 'Tahunan', icon: <Clock className="w-4 h-4" /> },
    ];
    return periods
        .map(p => ({ ...p, price: pricing[p.key] }))
        .filter(p => p.price);
}

const formatPrice = (price: string) => {
  const numericPrice = parseInt(price.replace(/[^0-9]/g, ''));
  return `Rp ${numericPrice.toLocaleString('id-ID')}`;
};

export const ProductDetailDialog = ({ product, isOpen, onOpenChange }: ProductDetailDialogProps) => {
  if (!product) return null;

  const pricingPeriods = formatPricing(product.pricing);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
        
        <div className="grid gap-6 py-4">
          <img src={product.image_url || '/placeholder.svg'} alt={product.name} className="w-full h-64 object-cover rounded-lg" />
          
          <div>
            <h4 className="font-semibold mb-2 text-lg">Deskripsi Produk</h4>
            <p className="text-muted-foreground">{product.description || "Tidak ada deskripsi."}</p>
          </div>
          
          {product.features && product.features.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-lg">Fitur Unggulan</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pricingPeriods.length > 0 && (
             <div>
                <h4 className="font-semibold mb-3 text-lg">Paket Berlangganan</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pricingPeriods.map(({key, label, price, icon}) => (
                        <div key={key} className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                              {icon}
                              <h5 className="font-semibold">{label}</h5>
                            </div>
                            <div className="space-y-1">
                              <p className="text-2xl font-bold text-primary">{formatPrice(price)}</p>
                              <p className="text-sm text-muted-foreground">
                                per {label.toLowerCase()}
                              </p>
                              {key === 'yearly' && (
                                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  Hemat lebih banyak!
                                </div>
                              )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-2">Yang Anda Dapatkan:</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Akses penuh ke semua fitur produk</li>
                    <li>• Dukungan teknis 24/7</li>
                    <li>• Update gratis selama masa berlangganan</li>
                    <li>• Panduan penggunaan lengkap</li>
                  </ul>
                </div>
             </div>
          )}

          {product.demo_url && (
            <div>
              <h4 className="font-semibold mb-2 text-lg">Demo & Preview</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Lihat demo produk untuk memahami fitur dan kemampuan sebelum berlangganan.
              </p>
              <a 
                href={product.demo_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Lihat Demo
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
