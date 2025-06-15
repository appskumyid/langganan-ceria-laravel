
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock } from 'lucide-react';
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
                if (subscription.product_category === 'E-Commerce' && subscription.product_type === 'Non-Premium') {
                    return (
                        <Button asChild variant="outline" size="sm">
                            <Link to={`/my-subscriptions/${subscription.id}/edit-store`}>
                                Kelola <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    );
                }
                return (
                    <Button variant="outline" size="sm" disabled>
                        Detail (Segera Hadir)
                    </Button>
                );
            default:
                return null;
        }
    };

    return (
        <TableRow>
            <TableCell>
                <div className="font-medium">{subscription.product_name}</div>
                <div className="text-sm text-muted-foreground">{subscription.product_category}</div>
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
