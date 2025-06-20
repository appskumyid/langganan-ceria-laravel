
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import { getStatusVariant } from "./admin/subscriptions/utils";

interface SubscribedProductCardProps {
  subscription: Tables<'user_subscriptions'>;
}

const SubscribedProductCard = ({ subscription }: SubscribedProductCardProps) => {
  // Generate transaction number based on subscription ID and created date
  const generateTransactionNumber = (id: string, createdAt: string) => {
    const date = new Date(createdAt);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const shortId = id.slice(0, 8).toUpperCase();
    return `TRX${year}${month}${day}${shortId}`;
  };

  const transactionNumber = generateTransactionNumber(subscription.id, subscription.created_at);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{subscription.product_name}</CardTitle>
        <CardDescription>
          Kategori: {subscription.product_category} - Tipe: {subscription.product_type}
        </CardDescription>
        <div className="text-xs text-gray-500">#{transactionNumber}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Status Langganan:</span>
          <Badge variant={getStatusVariant(subscription.subscription_status)}>
            {subscription.subscription_status.replace(/_/g, ' ').toUpperCase()}
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
        
        {subscription.subscription_status === 'pending_payment' ? (
           <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
            <Link to={`/payment/${subscription.id}`}>
              Selesaikan Pembayaran <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : subscription.subscription_status === 'waiting_confirmation' ? (
          <Button variant="outline" className="w-full" disabled>
            <Clock className="mr-2 h-4 w-4" />
            Menunggu Konfirmasi
          </Button>
        ) : subscription.subscription_status === 'active' ? (
          <div className="space-y-2">
            {subscription.product_category === 'E-Commerce' && subscription.product_type === 'Non-Premium' && (
               <Button asChild className="w-full">
                <Link to={`/my-subscriptions/${subscription.id}/edit-store`}>
                  Kelola Toko <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            {(subscription.product_category !== 'E-Commerce' || subscription.product_type !== 'Non-Premium') && (
              <Button asChild variant="outline" className="w-full">
                <Link to={`/my-subscriptions/${subscription.id}`}>
                  Lihat Detail <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <Link to={`/renew/${subscription.id}`}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Perpanjang Langganan
              </Link>
            </Button>
          </div>
        ) : subscription.subscription_status === 'expired' ? (
          <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
            <Link to={`/renew/${subscription.id}`}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Perpanjang Langganan
            </Link>
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Tidak Tersedia
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscribedProductCard;
