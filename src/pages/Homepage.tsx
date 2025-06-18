
import BannerSlide from '@/components/BannerSlide';
import ProductList from '@/components/ProductList';
import ServiceList from '@/components/ServiceList';
import AppFooter from '@/components/AppFooter';
import { Button } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const fetchCompanyName = async () => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'company_name')
    .single();
  
  if (error) return 'KSAinovasi';
  return data?.value || 'KSAinovasi';
};

const Homepage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const { data: companyName = 'KSAinovasi' } = useQuery({
    queryKey: ['company_name'],
    queryFn: fetchCompanyName,
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-bold text-gray-900">
              {companyName}
            </div>
            <div className="flex items-center space-x-6">
              <NavLink 
                to="/home" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </NavLink>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    Product
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border shadow-lg z-50">
                  <DropdownMenuItem>
                    <NavLink to="/products?category=ecommerce" className="w-full">
                      E-commerce
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <NavLink to="/products?category=pos" className="w-full">
                      Point of Sales
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <NavLink to="/products?category=invitation" className="w-full">
                      Undangan Online
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <NavLink to="/products?category=company-profile" className="w-full">
                      Company Profile
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <NavLink to="/products?category=software" className="w-full">
                      Software
                    </NavLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <NavLink 
                to="/services" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Service
              </NavLink>
              <NavLink 
                to="/contact" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Contact
              </NavLink>
              {user ? (
                <>
                  <NavLink
                    to="/dashboard"
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

      {/* Banner Slide */}
      <BannerSlide />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Products Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Produk Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan berbagai produk berkualitas dengan sistem langganan yang fleksibel
            </p>
          </div>
          <ProductList />
        </section>

        {/* Services Section */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Layanan Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Layanan terbaik untuk mendukung kebutuhan bisnis Anda
            </p>
          </div>
          <ServiceList />
        </section>
      </div>

      {/* Footer */}
      <AppFooter />
    </div>
  );
};

export default Homepage;
