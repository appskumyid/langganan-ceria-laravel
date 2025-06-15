import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Loader2, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { VariantProps } from 'class-variance-authority';
import { Link } from 'react-router-dom';
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
} from "@/components/ui/alert-dialog"
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Subscription = Tables<'user_subscriptions'>;

const ALL_STATUSES: Array<Subscription['subscription_status']> = [
  'active',
  'pending_payment',
  'waiting_confirmation',
  'expired',
  'cancelled',
];

const fetchAllSubscriptions = async (): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

const updateSubscriptionStatus = async ({ id, status, expires_at, rejection_reason }: { id: string; status: string; expires_at?: string | null, rejection_reason?: string | null }) => {
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

  if (error) {
      throw new Error(error.message);
  }
};

const getStatusVariant = (status: string): VariantProps<typeof badgeVariants>['variant'] => {
    switch (status) {
      case 'active': return 'success';
      case 'pending_payment': return 'warning';
      case 'waiting_confirmation': return 'info';
      case 'expired': return 'destructive';
      case 'cancelled': return 'secondary';
      default: return 'default';
    }
};

const AdminSubscriptions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedSub, setSelectedSub] = React.useState<Subscription | null>(null);
  const [newStatus, setNewStatus] = React.useState('');
  const [emailSubject, setEmailSubject] = React.useState('');
  const [emailMessage, setEmailMessage] = React.useState('');

  const { data: subscriptions, isLoading, error } = useQuery({
    queryKey: ['allSubscriptions'],
    queryFn: fetchAllSubscriptions,
  });

  const mutation = useMutation({
    mutationFn: updateSubscriptionStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allSubscriptions'] });
      toast({ title: 'Sukses', description: 'Status langganan berhasil diperbarui.' });
      setSelectedSub(null);

      // Invoke sync function after successful status update
      if (variables.status === 'active') {
        supabase.functions.invoke('mailchimp-sync', {
          body: { subscription_id: variables.id }
        }).then(({ error }) => {
          if (error) {
              console.error("Mailchimp sync failed:", error.message);
              toast({ title: 'Peringatan', description: `Sinkronisasi ke Mailchimp gagal: ${error.message}`, variant: 'destructive' });
          } else {
              toast({ title: 'Sinkronisasi Berhasil', description: 'Data pelanggan berhasil disinkronkan ke Mailchimp.' });
          }
        });
      }
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      setSelectedSub(null);
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async ({ to, subject, message, customerName }: { to: string, subject: string, message: string, customerName: string }) => {
        const { error, data } = await supabase.functions.invoke('send-subscription-message', {
            body: { to, subject, message, customerName },
        });
        if (error) throw new Error(error.message);
        return data;
    },
    onSuccess: () => {
        toast({ title: 'Sukses', description: 'Pesan berhasil dikirim ke pelanggan.' });
        setEmailSubject('');
        setEmailMessage('');
    },
    onError: (err: any) => {
        toast({ title: 'Error', description: `Gagal mengirim pesan: ${err.message}`, variant: 'destructive' });
    },
  });

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
    mutation.mutate({ id, status: 'active', expires_at: expiresAt.toISOString() });
  };
  
  const handleReject = (id: string) => {
      const reason = window.prompt("Masukkan alasan penolakan (kosongkan jika tidak ada):");
      mutation.mutate({ id, status: 'pending_payment', rejection_reason: reason || null });
  };
  
  const handleOpenEdit = (sub: Subscription) => {
    setSelectedSub(sub);
    setNewStatus(sub.subscription_status);
    setEmailSubject('');
    setEmailMessage('');
  };

  const handleSaveStatus = () => {
    if (selectedSub && newStatus) {
      mutation.mutate({ id: selectedSub.id, status: newStatus });
    }
  };

  const handleSendMessage = () => {
    if (selectedSub && emailSubject && emailMessage) {
        sendEmailMutation.mutate({
            to: selectedSub.customer_email,
            subject: emailSubject,
            message: emailMessage,
            customerName: selectedSub.customer_name,
        });
    } else {
        toast({ title: 'Peringatan', description: 'Subjek dan isi pesan tidak boleh kosong.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

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
            {subscriptions?.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div className="font-medium">{sub.customer_name}</div>
                  <div className="text-sm text-muted-foreground">{sub.customer_email}</div>
                </TableCell>
                <TableCell>{sub.product_name}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(sub.subscription_status)}>
                    {sub.subscription_status.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(sub.created_at).toLocaleDateString('id-ID')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {sub.subscription_status === 'waiting_confirmation' ? (
                      <>
                        {sub.payment_proof_url && (
                          <Button asChild variant="ghost" size="icon" title="Lihat Bukti Pembayaran">
                            <a href={sub.payment_proof_url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={mutation.isPending}>
                              {mutation.isPending && mutation.variables?.id === sub.id && mutation.variables.status === 'active' ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Setujui'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Konfirmasi Persetujuan</AlertDialogTitle>
                              <AlertDialogDescription>
                                Anda yakin ingin menyetujui pembayaran untuk langganan {sub.product_name} oleh {sub.customer_name}? Status akan berubah menjadi 'active'.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleApprove(sub.id, sub.product_period)}>
                                Ya, Setujui
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleReject(sub.id)}
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending && mutation.variables?.id === sub.id && mutation.variables.status === 'pending_payment' ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Tolak'}
                        </Button>
                      </>
                    ) : sub.subscription_status === 'active' ? (
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/admin/subscription/${sub.id}`}>
                          <Edit className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline">Detail</span>
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(sub)}>
                        <Edit className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Detail</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={!!selectedSub} onOpenChange={(isOpen) => { if (!isOpen) setSelectedSub(null) }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Detail Langganan</DialogTitle>
              <DialogDescription>
                Kelola langganan untuk {selectedSub?.product_name} oleh {selectedSub?.customer_name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={newStatus}
                  onValueChange={(value) => setNewStatus(value)}
                >
                  <SelectTrigger id="status" className="col-span-3">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 py-4 border-t">
              <h3 className="text-md font-medium px-1">Kirim Pesan ke Pelanggan</h3>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email-subject" className="text-right">
                  Subjek
                </Label>
                <Input
                  id="email-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="col-span-3"
                  placeholder="Subjek email..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email-message" className="text-right">
                  Pesan
                </Label>
                <Textarea
                  id="email-message"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="col-span-3"
                  placeholder="Tulis pesan Anda di sini..."
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row sm:justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedSub(null)}>Batal</Button>
              <Button onClick={handleSaveStatus} disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Simpan Status
              </Button>
              <Button onClick={handleSendMessage} disabled={sendEmailMutation.isPending}>
                {sendEmailMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Kirim Pesan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default AdminSubscriptions;
