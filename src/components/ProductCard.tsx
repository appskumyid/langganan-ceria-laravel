
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageCircle, Play, Crown } from "lucide-react";

type Product = Tables<'products'>;

interface ProductCardProps {
  product: Product;
  onSubscribe: (product: Product) => void;
  onDemo: (demoUrl: string | null) => void;
  onDetail: (productId: number) => void;
  onWhatsApp: (productName: string) => void;
}

const ProductCard = ({ product, onSubscribe, onDemo, onDetail, onWhatsApp }: ProductCardProps) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge 
              variant={product.type === "Premium" ? "default" : "secondary"}
              className={product.type === "Premium" ? "bg-yellow-500 text-white" : ""}
            >
              {product.type === "Premium" && <Crown className="w-3 h-3 mr-1" />}
              {product.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
        <p className="text-gray-600 mb-4 h-12 overflow-hidden">{product.description || 'Tidak ada deskripsi.'}</p>
        
        <div className="mb-4">
          <span className="text-2xl font-bold text-primary">{product.price}</span>
          <span className="text-gray-500">{product.period}</span>
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

        <div className="space-y-2">
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
              onClick={() => onDetail(product.id)}
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
              WA
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
);

export default ProductCard;
