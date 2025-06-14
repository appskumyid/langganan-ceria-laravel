
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

interface SubscribedProductCardProps {
  subscription: Tables<'user_subscriptions'>;
}

const SubscribedProductCard = ({ subscription }: SubscribedProductCardProps) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending_payment':
        return 'warning';
      case 'expired':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{subscription.product_name}</CardTitle>
        <CardDescription>
          Kategori: {subscription.product_category} - Tipe: {subscription.product_type}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Status Langganan:</span>
          <Badge variant={getStatusVariant(subscription.subscription_status) as any}>
            {subscription.subscription_status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Harga:</span>
          <span className="font-semibold">{subscription.product_price}{subscription.product_period}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Tanggal Berlangganan:</span>
          <span className="text-sm">{new Date(subscription.subscribed_at).toLocaleDateString('id-ID')}</span>
        </div>
        {subscription.expires_at && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Tanggal Berakhir:</span>
            <span className="text-sm">{new Date(subscription.expires_at).toLocaleDateString('id-ID')}</span>
          </div>
        )}
        
        {/* Tombol Detail akan ditambahkan nanti jika diperlukan untuk navigasi ke halaman detail spesifik */}
        {/* Untuk E-Commerce Non-Premium, tombol ini bisa mengarah ke edit store */}
        {subscription.product_category === 'E-Commerce' && subscription.product_type === 'Non-Premium' && (
           <Button asChild className="w-full">
            <Link to={`/my-subscriptions/${subscription.id}/edit-store`}>
              Kelola Toko <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
         {/* Placeholder untuk tombol detail produk lainnya */}
        {(subscription.product_category !== 'E-Commerce' || subscription.product_type !== 'Non-Premium') && (
          <Button variant="outline" className="w-full" disabled>
            Lihat Detail (Segera Hadir)
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscribedProductCard;
