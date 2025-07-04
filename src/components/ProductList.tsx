import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageCircle, Play, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, Json } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { ProductDetailDialog } from "./ProductDetailDialog";

type Product = Tables<'managed_products'>;
type PricingInfo = { period: string; price: string };

const fetchHomepageProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .rpc('get_random_managed_products', { limit_count: 3 });

  if (error) {
    console.error("Error fetching homepage products:", error);
    throw new Error(error.message);
  }
  return (data as any) || [];
};

const ProductList = () => {
  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ['homepageManagedProducts'],
    queryFn: fetchHomepageProducts,
  });

  const [detailedProduct, setDetailedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleDetail = (product: Product) => {
    setDetailedProduct(product);
    setIsDetailOpen(true);
  };

  const handleWhatsApp = (productName: string) => {
    const message = `Halo, saya tertarik dengan ${productName}. Bisa minta informasi lebih lanjut?`;
    const whatsappUrl = `https://wa.me/6287886425562?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDemo = (demoUrl: string | null) => {
    if (demoUrl) {
      window.open(demoUrl, '_blank');
    }
  };

  const formatPrice = (price: string | number) => {
    const numericPrice = parseInt(String(price).replace(/[^0-9]/g, ''));
    return `Rp ${numericPrice.toLocaleString('id-ID')}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="w-full h-48 rounded-t-lg" />
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-8 w-1/2" />
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !productsData) {
    return (
      <div className="text-center py-12 text-red-500">
        <p className="text-lg">Gagal memuat produk.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productsData.map((product) => {
          let pricing: PricingInfo[] = [];
          const productPricing = product.pricing;

          if (productPricing && typeof productPricing === 'object' && !Array.isArray(productPricing)) {
            // Handles when pricing is an object like { monthly: '100', yearly: '1000' }
            pricing = Object.entries(productPricing)
              .filter(([, price]) => price != null && String(price).trim() !== '')
              .map(([period, price]) => ({
                period: String(period),
                price: String(price),
              }));
          } else if (Array.isArray(productPricing)) {
            // Legacy support for array format if any
            pricing = (productPricing as any[]).filter(p => p && p.price != null && String(p.price).trim() !== '');
          } else if (typeof productPricing === 'string') {
            try {
              const parsed = JSON.parse(productPricing);
              if (Array.isArray(parsed)) {
                pricing = parsed.filter(p => p && p.price != null && String(p.price).trim() !== '');
              } else if (parsed && typeof parsed === 'object') {
                pricing = Object.entries(parsed)
                  .filter(([, price]) => price != null && String(price).trim() !== '')
                  .map(([period, price]) => ({
                    period: String(period),
                    price: String(price),
                  }));
              }
            } catch (e) {
              console.error(`Failed to parse pricing for product ${product.id}:`, e);
            }
          }

          const monthlyPriceInfo = pricing.find(p => p && typeof p.period === 'string' && p.period.toLowerCase() === 'monthly');
          
          // Prioritize monthly price, but fall back to the first available price.
          const displayPriceInfo = monthlyPriceInfo || (pricing.length > 0 ? pricing[0] : null);
          
          const rawPrice = displayPriceInfo && displayPriceInfo.price ? String(displayPriceInfo.price) : '0';
          const displayPrice = Number(rawPrice.replace(/[^0-9]/g, ''));

          const getPeriodText = (period?: string) => {
            if (!period) return '';
            switch (period.toLowerCase()) {
              case 'monthly': return '/bulan';
              case 'quarterly': return '/3 bulan';
              case 'semiannual': return '/6 bulan';
              case 'yearly': return '/tahun';
              default: return `/${period}`;
            }
          };
          
          return (
            <Card key={product.id} className="hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
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
                </div>
              </CardHeader>
              <CardContent className="p-6 flex flex-col flex-grow">
                <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                <p className="text-gray-600 mb-4 h-12 overflow-hidden">{product.description || 'Tidak ada deskripsi.'}</p>
                
                <div className="mb-4">
                  <span className="text-2xl font-bold text-primary">
                    {displayPrice > 0 ? formatPrice(displayPrice) : 'Hubungi kami'}
                  </span>
                  {displayPrice > 0 && displayPriceInfo && displayPriceInfo.period && (
                    <span className="text-sm text-muted-foreground">
                      {getPeriodText(displayPriceInfo.period)}
                    </span>
                  )}
                  {pricing.length > 1 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Mulai dari • Tersedia {pricing.length} paket
                    </p>
                  )}
                </div>

                {product.features && product.features.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Fitur:</h4>
                    <div className="flex flex-wrap gap-1">
                      {product.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {product.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.features.length - 3} lainnya
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2 mt-auto">
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDemo(product.demo_url)}
                      disabled={!product.demo_url}
                      className="flex items-center gap-1"
                    >
                      <Play className="h-3 w-3" />
                      Demo
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDetail(product)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Detail
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleWhatsApp(product.name)}
                      className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <MessageCircle className="h-3 w-3" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <ProductDetailDialog
        product={detailedProduct}
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </>
  );
};

export default ProductList;
