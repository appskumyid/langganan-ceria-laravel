
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageCircle, Play, Crown } from "lucide-react";

type Product = Tables<'managed_products'>;

interface ProductCardProps {
  product: Product;
  onSubscribe: (product: Product) => void;
  onDemo: (demoUrl: string | null) => void;
  onDetail: (product: Product) => void;
  onWhatsApp: (productName: string) => void;
}

const ProductCard = ({ product, onSubscribe, onDemo, onDetail, onWhatsApp }: ProductCardProps) => {
  const pricing = product.pricing as { monthly?: string };
  const monthlyPrice = pricing?.monthly;
  const rawPrice = monthlyPrice ? String(monthlyPrice) : '0';
  const displayPrice = Number(rawPrice.replace(/[^0-9]/g, ''));

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
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
            {displayPrice > 0 ? `Rp${displayPrice.toLocaleString('id-ID')}` : 'Hubungi kami'}
          </span>
          {displayPrice > 0 && (
            <span className="text-sm text-muted-foreground ml-1">/bulan</span>
          )}
        </div>

        <div className="mb-4">
          <h4 className="font-semibold mb-2">Fitur:</h4>
          <div className="flex flex-wrap gap-1">
            {product.features?.map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2 mt-auto">
          <Button 
            className="w-full" 
            onClick={() => onSubscribe(product)}
          >
            Add Subscribe
          </Button>
          
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDemo(product.demo_url)}
              disabled={!product.demo_url}
              className="flex items-center gap-1"
            >
              <Play className="h-3 w-3" />
              Demo
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDetail(product)}
              className="flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              Detail
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onWhatsApp(product.name)}
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
}

export default ProductCard;
