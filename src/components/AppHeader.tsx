
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronDown, Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const fetchCompanyName = async () => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'company_name')
    .single();
  
  if (error) return 'KSAinovasi';
  return data?.value || 'KSAinovasi';
};

const AppHeader = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

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
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil keluar",
        description: "Sampai jumpa lagi!",
      });
    }
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive
        ? "text-primary"
        : "text-gray-700 hover:text-gray-900"
    }`;

  const getMobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-md text-base font-medium w-full text-left ${
      isActive
        ? "text-primary bg-gray-50"
        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
    }`;

  const DesktopNavigation = () => (
    <div className="flex items-center space-x-6">
      <NavLink to="/home" className={getNavLinkClass}>
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
      <NavLink to="/services" className={getNavLinkClass}>
        Service
      </NavLink>
      <NavLink to="/contact" className={getNavLinkClass}>
        Contact
      </NavLink>
      {user ? (
        <>
          <NavLink to="/dashboard" className={getNavLinkClass}>
            Dashboard
          </NavLink>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </>
      ) : (
        <>
          <NavLink to="/auth" className={getNavLinkClass}>
            Masuk
          </NavLink>
          <Button asChild>
            <NavLink to="/auth">Daftar</NavLink>
          </Button>
        </>
      )}
    </div>
  );

  const MobileNavigation = () => (
    <div className="flex flex-col space-y-4 p-6">
      <NavLink 
        to="/home" 
        className={getMobileNavLinkClass}
        onClick={() => setIsOpen(false)}
      >
        Home
      </NavLink>
      
      <div className="space-y-2">
        <div className="px-4 py-2 text-base font-medium text-gray-900">
          Product
        </div>
        <div className="pl-4 space-y-1">
          <NavLink 
            to="/products?category=ecommerce" 
            className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            E-commerce
          </NavLink>
          <NavLink 
            to="/products?category=pos" 
            className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            Point of Sales
          </NavLink>
          <NavLink 
            to="/products?category=invitation" 
            className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            Undangan Online
          </NavLink>
          <NavLink 
            to="/products?category=company-profile" 
            className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            Company Profile
          </NavLink>
          <NavLink 
            to="/products?category=software" 
            className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            Software
          </NavLink>
        </div>
      </div>

      <NavLink 
        to="/services" 
        className={getMobileNavLinkClass}
        onClick={() => setIsOpen(false)}
      >
        Service
      </NavLink>
      
      <NavLink 
        to="/contact" 
        className={getMobileNavLinkClass}
        onClick={() => setIsOpen(false)}
      >
        Contact
      </NavLink>

      <div className="border-t border-gray-200 pt-4 mt-4">
        {user ? (
          <div className="space-y-2">
            <NavLink 
              to="/dashboard" 
              className={getMobileNavLinkClass}
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </NavLink>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => {
                handleSignOut();
                setIsOpen(false);
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <NavLink 
              to="/auth" 
              className={getMobileNavLinkClass}
              onClick={() => setIsOpen(false)}
            >
              Masuk
            </NavLink>
            <Button 
              asChild 
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              <NavLink to="/auth">Daftar</NavLink>
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <NavLink to="/home" className="text-xl font-bold text-gray-900">
            {companyName}
          </NavLink>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <DesktopNavigation />
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <MobileNavigation />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
