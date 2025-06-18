
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <NavLink to="/" className="text-xl font-bold text-gray-900">
            {companyName}
          </NavLink>
          <div className="flex items-center space-x-6">
            <NavLink to="/home" className={getNavLinkClass}>
              Home
            </NavLink>
            <NavLink to="/products" className={getNavLinkClass}>
              Product
            </NavLink>
            <NavLink to="/services" className={getNavLinkClass}>
              Service
            </NavLink>
            <NavLink to="/contact" className={getNavLinkClass}>
              Contact
            </NavLink>
            {user ? (
              <>
                <NavLink to="/" className={getNavLinkClass}>
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
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
