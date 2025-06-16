
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import SubscriptionManagementForms from '@/components/SubscriptionManagementForms';
import { Loader2, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProductFileManager } from '@/components/ProductFileManager';
import { UserGeneratedFileManager } from '@/components/UserGeneratedFileManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const fetchSubscriptionById = async (subscriptionId: string) => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .single();

  if (error) {
    throw error;
  }
  return data;
};

const fetchProductByName = async (productName: string) => {
  const { data, error } = await supabase
    .from('managed_products')
    .select('*')
    .eq('name', productName)
    .maybeSingle();

  if (error) {
    console.error("Error fetching product by name:", error);
    return null;
  }
  return data;
};

const AdminSubscriptionDetail = () => {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();

  const { data: subscription, isLoading: isLoadingSubscription, error } = useQuery({
    queryKey: ['adminSubscriptionDetail', subscriptionId],
    queryFn: () => fetchSubscriptionById(subscriptionId!),
    enabled: !!subscriptionId,
  });

  const { data: product, isLoading: isLoadingProduct } = useQuery<Tables<'managed_products'> | null>({
    queryKey: ['managedProductByName', subscription?.product_name],
    queryFn: () => fetchProductByName(subscription!.product_name),
    enabled: !!subscription?.product_name,
  });

  const isLoading = isLoadingSubscription || isLoadingProduct;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Gagal Memuat Data</AlertTitle>
        <AlertDescription>
          Terjadi kesalahan saat mengambil detail langganan: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Langganan Pengguna</h1>
          <p className="text-muted-foreground">
            Lihat dan kelola detail langganan untuk: {subscription?.customer_name} ({subscription?.customer_email})
          </p>
        </div>
      </div>
      
      {subscription ? (
        <SubscriptionManagementForms subscription={subscription} />
      ) : (
        <p className="text-center py-10 text-muted-foreground">Langganan tidak ditemukan.</p>
      )}

      {subscription && (
        <UserGeneratedFileManager subscription={subscription} />
      )}

      {product && (
        <Card>
          <CardHeader>
            <CardTitle>Template File Produk (Asli)</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductFileManager product={product} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSubscriptionDetail;
