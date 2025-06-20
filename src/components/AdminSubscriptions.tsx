
import React, { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useAllSubscriptions, useUpdateSubscription, useSendSubscriptionEmail } from './admin/subscriptions/hooks';
import { SubscriptionsTable } from './admin/subscriptions/SubscriptionsTable';
import { SubscriptionFilters } from './admin/subscriptions/SubscriptionFilters';
import { SubscriptionPagination } from './admin/subscriptions/SubscriptionPagination';
import { EditSubscriptionDialog } from './admin/subscriptions/EditSubscriptionDialog';
import { EmailReminderDialog } from './admin/subscriptions/EmailReminderDialog';
import type { Subscription } from './admin/subscriptions/utils';

const AdminSubscriptions = () => {
  const [selectedSub, setSelectedSub] = React.useState<Subscription | null>(null);
  const [emailReminderSub, setEmailReminderSub] = React.useState<Subscription | null>(null);
  
  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: subscriptions, isLoading, error } = useAllSubscriptions();
  const updateMutation = useUpdateSubscription();
  const sendEmailMutation = useSendSubscriptionEmail();

  // Filter and pagination logic
  const filteredSubscriptions = useMemo(() => {
    if (!subscriptions) return [];
    
    return subscriptions.filter(sub => {
      const matchesSearch = searchTerm === '' || 
        sub.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.product_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || sub.subscription_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredSubscriptions.length / rowsPerPage);
  
  const paginatedSubscriptions = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredSubscriptions.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredSubscriptions, currentPage, rowsPerPage]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, rowsPerPage]);

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

  const handleOpenEmailReminder = (sub: Subscription) => {
    setEmailReminderSub(sub);
  };

  const handleCloseEmailDialog = () => {
    setEmailReminderSub(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <>
      <SubscriptionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={setRowsPerPage}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      
      <SubscriptionsTable
        subscriptions={paginatedSubscriptions}
        onApprove={handleApprove}
        onReject={handleReject}
        onOpenEdit={handleOpenEdit}
        onOpenEmailReminder={handleOpenEmailReminder}
        updateMutation={updateMutation}
        sendEmailMutation={sendEmailMutation}
      />

      <SubscriptionPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <div className="mt-4 text-sm text-muted-foreground">
        Menampilkan {paginatedSubscriptions.length} dari {filteredSubscriptions.length} data
      </div>
      
      <EditSubscriptionDialog
        subscription={selectedSub}
        isOpen={!!selectedSub}
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        updateMutation={updateMutation}
        sendEmailMutation={sendEmailMutation}
      />

      <EmailReminderDialog
        subscription={emailReminderSub}
        isOpen={!!emailReminderSub}
        onOpenChange={(isOpen) => !isOpen && handleCloseEmailDialog()}
        sendEmailMutation={sendEmailMutation}
      />
    </>
  );
};

export default AdminSubscriptions;
