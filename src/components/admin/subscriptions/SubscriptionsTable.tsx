
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SubscriptionTableRow } from './SubscriptionTableRow';
import type { Subscription } from './utils';
import type { UseMutationResult } from '@tanstack/react-query';

interface SubscriptionsTableProps {
    subscriptions: Subscription[];
    onApprove: (id: string, period: string) => void;
    onReject: (id: string) => void;
    onOpenEdit: (subscription: Subscription) => void;
    updateMutation: UseMutationResult<void, Error, { id: string; status: string; expires_at?: string | null | undefined; rejection_reason?: string | null | undefined; }, unknown>;
}

export const SubscriptionsTable = ({ subscriptions, onApprove, onReject, onOpenEdit, updateMutation }: SubscriptionsTableProps) => {
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
                    {subscriptions.map((sub) => (
                        <SubscriptionTableRow
                            key={sub.id}
                            subscription={sub}
                            onApprove={onApprove}
                            onReject={onReject}
                            onOpenEdit={onOpenEdit}
                            updateMutation={updateMutation}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

