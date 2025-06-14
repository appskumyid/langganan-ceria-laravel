
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { VariantProps } from 'class-variance-authority';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Subscription = Tables<'user_subscriptions'>;

const fetchAllSubscriptions = async (): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

const updateSubscriptionStatus = async ({ id, status }: { id: string; status: 'active' | 'expired' }) => {
  let updateData: Partial<Subscription> = { subscription_status: status };
  if (status === 'active') {
    const expires_at = new Date();
    expires_at.setMonth(expires_at.getMonth() + 1);
    updateData.expires_at = expires_at.toISOString();
    updateData.subscribed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('user_subscriptions')
    .update(updateData)
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

const getStatusVariant = (status: string): VariantProps<typeof badgeVariants>['variant'] => {
    switch (status) {
      case 'active': return 'success';
      case 'pending_payment': return 'warning';
      case 'waiting_confirmation': return 'info';
      case 'expired': return 'destructive';
      case 'cancelled': return 'secondary';
      default: return 'default';
    }
};

const AdminSubscriptions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: subscriptions, isLoading, error } = useQuery({
    queryKey: ['allSubscriptions'],
    queryFn: fetchAllSubscriptions,
  });

  const mutation = useMutation({
    mutationFn: updateSubscriptionStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allSubscriptions'] });
      toast({ title: 'Sukses', description: 'Status langganan berhasil diperbarui.' });
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const handleApprove = (id: string) => {
    mutation.mutate({ id, status: 'active' });
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tgl. Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions?.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div className="font-medium">{sub.customer_name}</div>
                  <div className="text-sm text-muted-foreground">{sub.customer_email}</div>
                </TableCell>
                <TableCell>{sub.product_name}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(sub.subscription_status)}>
                    {sub.subscription_status.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(sub.created_at).toLocaleDateString('id-ID')}</TableCell>
                <TableCell className="text-right">
                  {sub.subscription_status === 'waiting_confirmation' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button size="sm" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Setujui'}
                         </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Konfirmasi Persetujuan</AlertDialogTitle>
                          <AlertDialogDescription>
                            Anda yakin ingin menyetujui pembayaran untuk langganan {sub.product_name} oleh {sub.customer_name}? Status akan berubah menjadi 'active'.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleApprove(sub.id)}>
                            Ya, Setujui
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
};

export default AdminSubscriptions;
