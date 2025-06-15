
import { useState, useEffect } from "react";
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
import { ProductPagination } from "@/components/ProductPagination";

type Product = Tables<'managed_products'>;

const PRODUCTS_PER_PAGE = 9;

const fetchProducts = async (page: number, searchTerm: string, category: string): Promise<{ products: Product[], count: number | null }> => {
  let query = supabase
    .from('managed_products')
    .select('*', { count: 'exact' });

  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }

  if (category !== 'All') {
    query = query.eq('category', category);
  }

  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  query = query
    .order('created_at', { ascending: false })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    throw new Error(error.message);
  }

  return { products: data || [], count };
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['managed_products_public', activeCategory, debouncedSearchTerm, currentPage],
    queryFn: () => fetchProducts(currentPage, debouncedSearchTerm, activeCategory),
    placeholderData: (previousData) => previousData,
  });

  const productsData = data?.products || [];
  const totalProducts = data?.count || 0;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

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

  const handleDetail = (productId: string) => {
    console.log(`View detail for product ${productId}`);
  };

  const handleWhatsApp = (productName: string) => {
    const message = `Halo, saya tertarik dengan ${productName}. Bisa minta informasi lebih lanjut?`;
    const whatsappUrl = `https://wa.me/6287886425562?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const renderContent = () => {
    if (isLoading && !productsData.length) {
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
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="col-span-full text-center py-12 text-red-500">
          <p className="text-lg">Gagal memuat produk.</p>
          <p className="text-sm">{queryError?.message}</p>
        </div>
      );
    }
    
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsData.length > 0 ? (
            productsData.map((product) => (
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
                Tidak ada produk yang ditemukan.
              </p>
            </div>
          )}
        </div>
        <ProductPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </>
    );
  };

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

          <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="w-full">
            <CategoryTabs categories={categories} />

            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                {renderContent()}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>

      <AppFooter />

      {selectedProduct && (
        <CheckoutDialog
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          product={{
            id: 0, // Using placeholder ID due to system limitations
            name: selectedProduct.name,
            price: (selectedProduct.pricing as any)?.monthly || '0',
            period: (selectedProduct.pricing as any)?.monthly ? '/bulan' : '',
            category: selectedProduct.category,
            type: selectedProduct.type,
          }}
        />
      )}
    </div>
  );
};

export default Products;
