
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { VariantProps } from 'class-variance-authority';
import SubscriptionManagementForms from '@/components/SubscriptionManagementForms';
import { DeployedFileManager } from '@/components/DeployedFileManager';

const getStatusVariant = (status: string): VariantProps<typeof badgeVariants>['variant'] => {
  switch (status) {
    case 'active':
      return 'success';
    case 'pending_payment':
      return 'warning';
    case 'waiting_confirmation':
      return 'info';
    case 'expired':
      return 'destructive';
    case 'cancelled':
      return 'secondary';
    default:
      return 'default';
  }
};

const fetchSubscription = async (subscriptionId: string, userId: string) => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
        throw new Error('Langganan tidak ditemukan atau Anda tidak memiliki akses.');
    }
    throw error;
  }
  return data;
};

const SubscriptionDetail = () => {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const { user } = useAuth();

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['subscription', subscriptionId, user?.id],
    queryFn: () => fetchSubscription(subscriptionId!, user!.id),
    enabled: !!subscriptionId && !!user,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">Error: {(error as Error).message}</div>;
  }

  if (!subscription) {
      return <div className="text-center py-8">Langganan tidak ditemukan.</div>;
  }

  // Generate transaction number
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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Detail Langganan Anda</h1>
        {(subscription.subscription_status === 'active' || subscription.subscription_status === 'expired') && (
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link to={`/renew/${subscription.id}`}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Perpanjang Langganan
            </Link>
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{subscription.product_name}</CardTitle>
          <CardDescription>
            ID Langganan: {subscription.id}
          </CardDescription>
          <div className="text-sm text-gray-600">
            Nomor Transaksi: #{transactionNumber}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <Badge variant={getStatusVariant(subscription.subscription_status)}>
                {subscription.subscription_status.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Harga</p>
              <p>{subscription.product_price}{subscription.product_period}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tanggal Langganan</p>
              <p>{new Date(subscription.subscribed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tanggal Berakhir</p>
              <p>{subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Metode Pembayaran</p>
              <p>{subscription.payment_method_selected || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <SubscriptionManagementForms subscription={subscription} />
      
      {subscription.subscription_status === 'active' && (
        <DeployedFileManager subscriptionId={subscription.id} />
      )}
    </div>
  );
};

export default SubscriptionDetail;
