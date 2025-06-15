
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Tables } from '@/integrations/supabase/types';
import { UserSubscriptionTableRow } from './UserSubscriptionTableRow';

interface UserSubscriptionsTableProps {
    subscriptions: Tables<'user_subscriptions'>[];
}

export const UserSubscriptionsTable = ({ subscriptions }: UserSubscriptionsTableProps) => {
    return (
        <div className="w-full overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Produk</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tgl. Langganan</TableHead>
                        <TableHead>Tgl. Berakhir</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {subscriptions.map((sub) => (
                        <UserSubscriptionTableRow key={sub.id} subscription={sub} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
