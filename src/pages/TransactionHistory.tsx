
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2, Receipt, Calendar, CreditCard, Check, X, Download, FileText, Edit } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getStatusVariant } from '@/components/admin/subscriptions/utils';

const TransactionHistory = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Tables<'user_subscriptions'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingExpiry, setEditingExpiry] = useState<string | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState('');

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

  // Get subscription duration in months - improved parsing
  const getSubscriptionDuration = (period: string) => {
    const periodLower = period.toLowerCase();
    
    // Handle different period formats
    if (periodLower.includes('quarterly') || (periodLower.includes('3') && periodLower.includes('bulan'))) {
      return '3 Bulan';
    } else if (periodLower.includes('semi_annual') || (periodLower.includes('6') && periodLower.includes('bulan'))) {
      return '6 Bulan';
    } else if (periodLower.includes('yearly') || periodLower.includes('tahun')) {
      return '12 Bulan (1 Tahun)';
    } else if (periodLower.includes('monthly') || periodLower.includes('1') || periodLower.includes('bulan')) {
      return '1 Bulan';
    } else {
      return '1 Bulan'; // Default fallback
    }
  };

  // Download payment proof
  const handleDownloadProof = async (paymentProofUrl: string, transactionNumber: string) => {
    try {
      const response = await fetch(paymentProofUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bukti_pembayaran_${transactionNumber}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengunduh bukti pembayaran',
        variant: 'destructive',
      });
    }
  };

  // Admin functions for approval
  const handleApprove = async (transaction: Tables<'user_subscriptions'>) => {
    try {
      // For renewal, calculate from current expiry date, not from now
      let expiresAt = new Date();
      
      if (transaction.expires_at) {
        // If there's an existing expiry date, extend from that date
        expiresAt = new Date(transaction.expires_at);
      } else {
        // If no existing expiry, start from now
        expiresAt = new Date();
      }
      
      // Calculate additional period based on subscription period - improved parsing
      const period = transaction.product_period.toLowerCase();
      if (period.includes('quarterly') || (period.includes('3') && period.includes('bulan'))) {
        expiresAt.setMonth(expiresAt.getMonth() + 3);
      } else if (period.includes('semi_annual') || (period.includes('6') && period.includes('bulan'))) {
        expiresAt.setMonth(expiresAt.getMonth() + 6);
      } else if (period.includes('yearly') || period.includes('tahun')) {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          subscription_status: 'active',
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
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

  // Admin function to edit expiry date
  const handleEditExpiry = async (transactionId: string) => {
    if (!newExpiryDate) {
      toast({
        title: 'Error',
        description: 'Tanggal berakhir tidak boleh kosong',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          expires_at: new Date(newExpiryDate).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;

      // Refresh transactions
      await fetchTransactions();
      setEditingExpiry(null);
      setNewExpiryDate('');

      toast({
        title: 'Berhasil',
        description: 'Tanggal berakhir berhasil diperbarui',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const startEditExpiry = (transactionId: string, currentExpiry: string | null) => {
    setEditingExpiry(transactionId);
    if (currentExpiry) {
      // Format date for input (YYYY-MM-DD)
      const date = new Date(currentExpiry);
      setNewExpiryDate(date.toISOString().split('T')[0]);
    } else {
      setNewExpiryDate('');
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
                      <p className="text-sm text-gray-500">{getSubscriptionDuration(transaction.product_period)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Payment proof download for admin */}
                  {isAdmin && transaction.payment_proof_url && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">Bukti Pembayaran</span>
                        </div>
                        <Button
                          onClick={() => handleDownloadProof(transaction.payment_proof_url!, transactionNumber)}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                  
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
                        <div className="flex items-center gap-2">
                          {editingExpiry === transaction.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="date"
                                value={newExpiryDate}
                                onChange={(e) => setNewExpiryDate(e.target.value)}
                                className="w-40"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleEditExpiry(transaction.id)}
                              >
                                Simpan
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingExpiry(null);
                                  setNewExpiryDate('');
                                }}
                              >
                                Batal
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span className="font-medium">
                                {new Date(transaction.expires_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                              {isAdmin && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditExpiry(transaction.id, transaction.expires_at)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
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
