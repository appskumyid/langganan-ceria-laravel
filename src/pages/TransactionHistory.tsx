
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2, Receipt, Calendar, CreditCard, Check, X } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getStatusVariant } from '@/components/admin/subscriptions/utils';

const TransactionHistory = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Tables<'user_subscriptions'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!user) {
      setLoading(false);
      setError("Pengguna tidak ditemukan. Silakan login ulang.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('user_subscriptions')
        .select('*');
      
      // If admin, show all transactions, otherwise show only user's transactions
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, error: dbError } = await query.order('created_at', { ascending: false });

      if (dbError) {
        throw dbError;
      }
      setTransactions(data || []);
    } catch (e: any) {
      console.error("Error fetching transactions:", e);
      setError(e.message || "Gagal memuat data transaksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, isAdmin]);

  // Generate transaction number
  const generateTransactionNumber = (id: string, createdAt: string) => {
    const date = new Date(createdAt);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const shortId = id.slice(0, 8).toUpperCase();
    return `TRX${year}${month}${day}${shortId}`;
  };

  // Admin functions for approval
  const handleApprove = async (transaction: Tables<'user_subscriptions'>) => {
    try {
      const now = new Date();
      let expiresAt = new Date();
      
      // Calculate expiry based on period
      const period = transaction.product_period.toLowerCase();
      if (period.includes('3') && period.includes('bulan')) {
        expiresAt.setMonth(now.getMonth() + 3);
      } else if (period.includes('6') && period.includes('bulan')) {
        expiresAt.setMonth(now.getMonth() + 6);
      } else if (period.includes('tahun')) {
        expiresAt.setFullYear(now.getFullYear() + 1);
      } else {
        expiresAt.setMonth(now.getMonth() + 1);
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          subscription_status: 'active',
          expires_at: expiresAt.toISOString(),
          subscribed_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', transaction.id);

      if (error) throw error;

      // Refresh transactions
      await fetchTransactions();
      
      // Sync with mailchimp
      supabase.functions.invoke('mailchimp-sync', {
        body: { subscription_id: transaction.id }
      });

      toast({
        title: 'Berhasil',
        description: 'Perpanjangan berhasil disetujui',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (transaction: Tables<'user_subscriptions'>) => {
    const reason = window.prompt("Masukkan alasan penolakan (kosongkan jika tidak ada):");
    
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          subscription_status: 'pending_payment',
          rejection_reason: reason || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      if (error) throw error;

      // Refresh transactions
      await fetchTransactions();

      toast({
        title: 'Berhasil',
        description: 'Perpanjangan ditolak',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <Receipt className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-gray-800">
          {isAdmin ? 'Riwayat Transaksi Semua Pengguna' : 'Riwayat Transaksi'}
        </h1>
      </div>
      
      {transactions.length === 0 ? (
        <div className="text-center py-10">
          <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Belum ada riwayat transaksi.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const transactionNumber = generateTransactionNumber(transaction.id, transaction.created_at);
            
            return (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{transaction.product_name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-500">#{transactionNumber}</span>
                        <Badge variant={getStatusVariant(transaction.subscription_status)}>
                          {transaction.subscription_status.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{transaction.product_price}</p>
                      <p className="text-sm text-gray-500">{transaction.product_period}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Tanggal Transaksi</p>
                        <p className="font-medium">
                          {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    {transaction.payment_method_selected && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-500">Metode Pembayaran</p>
                          <p className="font-medium">{transaction.payment_method_selected}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Kategori</p>
                        <p className="font-medium">{transaction.product_category}</p>
                      </div>
                    </div>
                  </div>

                  {/* Admin customer info */}
                  {isAdmin && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Nama Pelanggan</p>
                          <p className="font-medium">{transaction.customer_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium">{transaction.customer_email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin approval buttons for waiting_confirmation status */}
                  {isAdmin && transaction.subscription_status === 'waiting_confirmation' && (
                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                      <Button
                        onClick={() => handleApprove(transaction)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Setujui Perpanjangan
                      </Button>
                      <Button
                        onClick={() => handleReject(transaction)}
                        size="sm"
                        variant="destructive"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Tolak
                      </Button>
                    </div>
                  )}
                  
                  {transaction.expires_at && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Berakhir pada:</span>
                        <span className="font-medium">
                          {new Date(transaction.expires_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
