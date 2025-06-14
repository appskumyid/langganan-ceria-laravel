
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import CheckoutDialog from "@/components/CheckoutDialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import PageHeader from "@/components/PageHeader";
import ProductCard from "@/components/ProductCard";
import { ProductSearch, CategoryTabs } from "@/components/ProductFilters";

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: productsData = [], isLoading, isError, error: queryError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

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

  const searchedProducts = productsData.filter(product => {
    return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      <main className="flex-grow">
        <PageHeader 
          title="Produk Kami"
          subtitle="Temukan solusi digital terbaik untuk kebutuhan bisnis Anda dengan berbagai kategori produk yang tersedia"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProductSearch searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />

          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <CategoryTabs categories={categories} />

            {categories.map((category) => {
                const categoryProducts = category === 'All'
                  ? searchedProducts
                  : searchedProducts.filter(p => p.category === category);

                const categoryDisplayName = category === "Aplikasi Bisnis (ERP, POS, LMS, dll)" ? "Aplikasi Bisnis" : category;

                return (
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
                        {categoryProducts.length > 0 ? (
                          categoryProducts.map((product) => (
                            <ProductCard 
                              key={product.id} 
                              product={product}
                              onSubscribe={handleSubscribe}
                              onDemo={handleDemo}
                              onDetail={handleDetail}
                              onWhatsApp={handleWhatsApp}
                            />
                          ))
                        ) : (
                          <div className="col-span-full text-center py-12">
                            <p className="text-gray-500 text-lg">
                              Tidak ada produk yang ditemukan untuk kategori "{categoryDisplayName}" 
                              {searchTerm && ` dengan kata kunci "${searchTerm}"`}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                );
            })}
          </Tabs>
        </div>
      </main>

      <AppFooter />

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
