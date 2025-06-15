
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useAllSubscriptions, useUpdateSubscription, useSendSubscriptionEmail } from './admin/subscriptions/hooks';
import { SubscriptionsTable } from './admin/subscriptions/SubscriptionsTable';
import { EditSubscriptionDialog } from './admin/subscriptions/EditSubscriptionDialog';
import type { Subscription } from './admin/subscriptions/utils';

const AdminSubscriptions = () => {
  const [selectedSub, setSelectedSub] = React.useState<Subscription | null>(null);

  const { data: subscriptions, isLoading, error } = useAllSubscriptions();
  const updateMutation = useUpdateSubscription();
  const sendEmailMutation = useSendSubscriptionEmail();

  const handleApprove = (id: string, period: string) => {
    const now = new Date();
    let expiresAt = new Date();
    
    if (period.toLowerCase().includes('bulan')) {
        expiresAt.setMonth(now.getMonth() + 1);
    } else if (period.toLowerCase().includes('tahun')) {
        expiresAt.setFullYear(now.getFullYear() + 1);
    } else {
        expiresAt.setMonth(now.getMonth() + 1);
    }
    updateMutation.mutate({ id, status: 'active', expires_at: expiresAt.toISOString() });
  };
  
  const handleReject = (id: string) => {
      const reason = window.prompt("Masukkan alasan penolakan (kosongkan jika tidak ada):");
      updateMutation.mutate({ id, status: 'pending_payment', rejection_reason: reason || null });
  };
  
  const handleOpenEdit = (sub: Subscription) => {
    setSelectedSub(sub);
  };

  const handleCloseDialog = () => {
    setSelectedSub(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <>
      <SubscriptionsTable
        subscriptions={subscriptions || []}
        onApprove={handleApprove}
        onReject={handleReject}
        onOpenEdit={handleOpenEdit}
        updateMutation={updateMutation}
      />
      <EditSubscriptionDialog
        subscription={selectedSub}
        isOpen={!!selectedSub}
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        updateMutation={updateMutation}
        sendEmailMutation={sendEmailMutation}
      />
    </>
  );
};

export default AdminSubscriptions;
