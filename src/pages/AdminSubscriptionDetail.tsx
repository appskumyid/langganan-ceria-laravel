
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import SubscriptionManagementForms from '@/components/SubscriptionManagementForms';
import { Loader2, Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

const AdminSubscriptionDetail = () => {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['adminSubscriptionDetail', subscriptionId],
    queryFn: () => fetchSubscriptionById(subscriptionId!),
    enabled: !!subscriptionId,
  });

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
    </div>
  );
};

export default AdminSubscriptionDetail;
