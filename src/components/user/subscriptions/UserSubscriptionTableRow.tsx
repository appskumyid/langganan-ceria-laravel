
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';
import { getStatusVariant } from '@/components/admin/subscriptions/utils';

interface UserSubscriptionTableRowProps {
    subscription: Tables<'user_subscriptions'>;
}

export const UserSubscriptionTableRow = ({ subscription }: UserSubscriptionTableRowProps) => {
    
    const getAction = () => {
        switch (subscription.subscription_status) {
            case 'pending_payment':
                return (
                    <Button asChild size="sm">
                        <Link to={`/payment/${subscription.id}`}>
                            Bayar <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                );
            case 'waiting_confirmation':
                 return (
                    <Button variant="outline" size="sm" disabled>
                        <Clock className="mr-2 h-4 w-4" />
                        Menunggu
                    </Button>
                );
            case 'active':
                return (
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link to={`/my-subscriptions/${subscription.id}`}>
                                Detail <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                            <Link to={`/renew/${subscription.id}`}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Perpanjang
                            </Link>
                        </Button>
                    </div>
                );
            case 'expired':
                return (
                    <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
                        <Link to={`/renew/${subscription.id}`}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Perpanjang
                        </Link>
                    </Button>
                );
            default:
                return null;
        }
    };

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
        <TableRow>
            <TableCell>
                <div className="font-medium">{subscription.product_name}</div>
                <div className="text-sm text-muted-foreground">{subscription.product_category}</div>
                <div className="text-xs text-gray-500 mt-1">#{transactionNumber}</div>
            </TableCell>
            <TableCell>
                <Badge variant={getStatusVariant(subscription.subscription_status)}>
                    {subscription.subscription_status.replace(/_/g, ' ').toUpperCase()}
                </Badge>
            </TableCell>
            <TableCell>
                {subscription.subscribed_at
                    ? new Date(subscription.subscribed_at).toLocaleDateString('id-ID')
                    : new Date(subscription.created_at).toLocaleDateString('id-ID')
                }
            </TableCell>
            <TableCell>
                {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString('id-ID') : '-'}
            </TableCell>
            <TableCell className="text-right">
                {getAction()}
            </TableCell>
        </TableRow>
    );
};
