import type { Tables } from '@/integrations/supabase/types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge, badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye } from 'lucide-react';

interface SubscriptionsTableProps {
  subscriptions: Tables<'user_subscriptions'>[];
}

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

const SubscriptionsTable = ({ subscriptions }: SubscriptionsTableProps) => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const updateSubscriptionMutation = useMutation({
        mutationFn: async ({ id, status, expires_at, rejection_reason }: { id: string; status: string; expires_at?: string | null, rejection_reason?: string | null }) => {
            const updateData: { 
                subscription_status: string, 
                expires_at?: string | null, 
                rejection_reason?: string | null, 
                subscribed_at?: string 
            } = { subscription_status: status };
            
            if (expires_at !== undefined) {
                updateData.expires_at = expires_at;
                updateData.subscribed_at = new Date().toISOString();
            }
             if (rejection_reason !== undefined) {
                updateData.rejection_reason = rejection_reason;
            } else {
                updateData.rejection_reason = null;
            }

            const { error } = await supabase
                .from('user_subscriptions')
                .update(updateData)
                .eq('id', id);
            
            if (error) throw error;
        },
        onSuccess: () => {
            toast({ title: 'Status langganan berhasil diperbarui.' });
            queryClient.invalidateQueries({ queryKey: ['adminSubscriptions'] });
            queryClient.invalidateQueries({ queryKey: ['userSubscriptions'] });
        },
        onError: (error: any) => {
            toast({ title: 'Gagal memperbarui status.', description: error.message, variant: 'destructive' });
        }
    });

    const handleApprove = (id: string, period: string) => {
        const now = new Date();
        let expiresAt = new Date();
        
        if (period.toLowerCase().includes('bulan')) {
            expiresAt.setMonth(now.getMonth() + 1);
        } else if (period.toLowerCase().includes('tahun')) {
            expiresAt.setFullYear(now.getFullYear() + 1);
        } else {
            // Default to 1 month if period is not recognized
            expiresAt.setMonth(now.getMonth() + 1);
        }

        updateSubscriptionMutation.mutate({ id, status: 'active', expires_at: expiresAt.toISOString() });
    };

    const handleReject = (id: string) => {
        const reason = window.prompt("Masukkan alasan penolakan (kosongkan jika tidak ada):");
        updateSubscriptionMutation.mutate({ id, status: 'pending_payment', rejection_reason: reason || null });
    };

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px]">Produk</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tgl. Langganan</TableHead>
                            <TableHead>Tgl. Berakhir</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscriptions.map(sub => (
                            <TableRow key={sub.id}>
                                <TableCell className="font-medium">{sub.product_name}</TableCell>
                                <TableCell>{sub.product_price}{sub.product_period}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(sub.subscription_status)}>
                                        {sub.subscription_status.replace(/_/g, ' ').toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>{sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString('id-ID') : '-'}</TableCell>
                                <TableCell>{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('id-ID') : '-'}</TableCell>
                                <TableCell className="text-right">
                                    {isAdmin && sub.subscription_status === 'waiting_confirmation' && sub.payment_proof_url ? (
                                        <div className="flex gap-2 justify-end items-center">
                                            <Button asChild variant="ghost" size="icon" title="Lihat Bukti Pembayaran">
                                                <a href={sub.payment_proof_url} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="h-4 w-4" />
                                                </a>
                                            </Button>
                                            <Button 
                                                size="sm"
                                                onClick={() => handleApprove(sub.id, sub.product_period)}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                Approve
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                size="sm" 
                                                onClick={() => handleReject(sub.id)}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button asChild variant="outline" size="sm">
                                            <Link to={`${isAdmin ? `/admin/subscriptions/${sub.id}` : `/my-subscriptions/${sub.id}`}`}>
                                                Detail
                                            </Link>
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default SubscriptionsTable;
