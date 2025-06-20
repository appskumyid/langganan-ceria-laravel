
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from "@/components/ui/alert-dialog";
import { Loader2, Edit, Eye, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { differenceInMonths } from 'date-fns';
import type { Subscription } from './utils';
import { getStatusVariant } from './utils';
import type { UseMutationResult } from '@tanstack/react-query';

interface SubscriptionTableRowProps {
    subscription: Subscription;
    onApprove: (id: string, period: string) => void;
    onReject: (id: string) => void;
    onOpenEdit: (subscription: Subscription) => void;
    onOpenEmailReminder: (subscription: Subscription) => void;
    updateMutation: UseMutationResult<void, Error, { id: string; status: string; expires_at?: string | null | undefined; rejection_reason?: string | null | undefined; }, unknown>;
    sendEmailMutation: UseMutationResult<any, Error, { to: string, subject: string, message: string, customerName: string }, unknown>;
}

export const SubscriptionTableRow = ({ 
    subscription, 
    onApprove, 
    onReject, 
    onOpenEdit, 
    onOpenEmailReminder,
    updateMutation,
    sendEmailMutation
}: SubscriptionTableRowProps) => {
    
    const calculateActivePeriod = () => {
        if (!subscription.expires_at || !subscription.subscribed_at) return '-';
        
        const startDate = new Date(subscription.subscribed_at);
        const endDate = new Date(subscription.expires_at);
        const months = differenceInMonths(endDate, startDate);
        
        if (months === 0) return '< 1 bulan';
        return `${months} bulan`;
    };

    return (
        <TableRow key={subscription.id}>
            <TableCell>
                <div className="font-medium">{subscription.customer_name}</div>
                <div className="text-sm text-muted-foreground">{subscription.customer_email}</div>
            </TableCell>
            <TableCell>{subscription.product_name}</TableCell>
            <TableCell>
                <Badge variant={getStatusVariant(subscription.subscription_status)}>
                    {subscription.subscription_status.replace(/_/g, ' ').toUpperCase()}
                </Badge>
            </TableCell>
            <TableCell>{new Date(subscription.created_at).toLocaleDateString('id-ID')}</TableCell>
            <TableCell>
                {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString('id-ID') : '-'}
            </TableCell>
            <TableCell>{calculateActivePeriod()}</TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                    {/* Email Reminder Button - only for active subscriptions */}
                    {subscription.subscription_status === 'active' && (
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onOpenEmailReminder(subscription)}
                            disabled={sendEmailMutation.isPending}
                            title="Kirim Email Peringatan"
                        >
                            <Mail className="h-4 w-4" />
                        </Button>
                    )}

                    {subscription.subscription_status === 'waiting_confirmation' ? (
                        <>
                            {subscription.payment_proof_url && (
                                <Button asChild variant="ghost" size="icon" title="Lihat Bukti Pembayaran">
                                    <a href={subscription.payment_proof_url} target="_blank" rel="noopener noreferrer">
                                        <Eye className="h-4 w-4" />
                                    </a>
                                </Button>
                            )}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={updateMutation.isPending}>
                                        {updateMutation.isPending && updateMutation.variables?.id === subscription.id && updateMutation.variables.status === 'active' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Setujui'}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Konfirmasi Persetujuan</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Anda yakin ingin menyetujui pembayaran untuk langganan {subscription.product_name} oleh {subscription.customer_name}? Status akan berubah menjadi 'active'.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onApprove(subscription.id, subscription.product_period)}>
                                            Ya, Setujui
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onReject(subscription.id)}
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending && updateMutation.variables?.id === subscription.id && updateMutation.variables.status === 'pending_payment' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tolak'}
                            </Button>
                        </>
                    ) : subscription.subscription_status === 'active' ? (
                        <Button asChild variant="outline" size="sm">
                            <Link to={`/admin/subscription/${subscription.id}`}>
                                <Edit className="h-4 w-4 md:mr-2" />
                                <span className="hidden md:inline">Detail</span>
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => onOpenEdit(subscription)}>
                            <Edit className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Detail</span>
                        </Button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
};
