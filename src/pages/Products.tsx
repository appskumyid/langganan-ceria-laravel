import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, MessageCircle, Play, Crown, Search, LogOut, Loader2 } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import CheckoutDialog from "@/components/CheckoutDialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type Product = Tables<'products'>;

const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

const categories = [
  "All",
  "E-Commerce",
  "Company Profile", 
  "CV / Portfolio",
  "Undangan Digital",
  "Aplikasi Bisnis (ERP, POS, LMS, dll)"
];

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: productsData = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Berhasil keluar",
        description: "Sampai jumpa lagi!"
      });
    }
  };

  const handleSubscribe = (product: Product) => {
    if (!user) {
      toast({
        title: "Silakan Masuk",
        description: "Anda perlu masuk untuk dapat berlangganan produk.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    setSelectedProduct(product);
    setIsCheckoutOpen(true);
  };

  const handleDemo = (demoUrl: string | null) => {
    if (demoUrl) {
      window.open(demoUrl, '_blank');
    }
  };

  const handleDetail = (productId: number) => {
    console.log(`View detail for product ${productId}`);
  };

  const handleWhatsApp = (productName: string) => {
    const message = `Halo, saya tertarik dengan ${productName}. Bisa minta informasi lebih lanjut?`;
    const whatsappUrl = `https://wa.me/6287886425562?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredProducts = productsData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const ProductCard = ({ product }: { product: Product }) => (
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
            onClick={() => handleSubscribe(product)}
          >
            Add Subscribe
          </Button>
          
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
              onClick={() => handleDetail(product.id)}
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
              WA
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-bold text-gray-900">
              Sistem Langganan
            </div>
            <div className="flex items-center space-x-6">
              <NavLink 
                to="/home" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </NavLink>
              <NavLink 
                to="/products" 
                className="text-primary font-medium px-3 py-2 rounded-md text-sm"
              >
                Product
              </NavLink>
              <NavLink 
                to="/services" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Service
              </NavLink>
              {user ? (
                <>
                  <NavLink
                    to="/"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </NavLink>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </Button>
                </>
              ) : (
                <>
                  <NavLink 
                    to="/auth" 
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Masuk
                  </NavLink>
                  <Button asChild>
                    <NavLink to="/auth">
                      Daftar
                    </NavLink>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Produk Kami
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Temukan solusi digital terbaik untuk kebutuhan bisnis Anda dengan berbagai kategori produk yang tersedia
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs md:text-sm">
                {category === "Aplikasi Bisnis (ERP, POS, LMS, dll)" ? "Aplikasi Bisnis" : category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              {isLoading && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <Skeleton className="w-full h-48 rounded-t-lg" />
                      <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-8 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {isError && (
                <div className="col-span-full text-center py-12 text-red-500">
                  <p className="text-lg">Gagal memuat produk.</p>
                  <p className="text-sm">{queryError?.message}</p>
                </div>
              )}
              {!isLoading && !isError && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-500 text-lg">
                        Tidak ada produk yang ditemukan untuk kategori "{activeCategory}" 
                        {searchTerm && ` dengan kata kunci "${searchTerm}"`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2024 Sistem Langganan. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Checkout Dialog */}
      {selectedProduct && (
        <CheckoutDialog
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          product={{
            id: selectedProduct.id,
            name: selectedProduct.name,
            price: selectedProduct.price,
            period: selectedProduct.period,
            category: selectedProduct.category,
            type: selectedProduct.type,
          }}
        />
      )}
    </div>
  );
};

export default Products;
