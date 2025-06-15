
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import type { Subscription } from './utils';

const fetchAllSubscriptions = async (): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
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

  if (error) throw new Error(error.message);
};

const sendEmailFn = async ({ to, subject, message, customerName }: { to: string, subject: string, message: string, customerName: string }) => {
    const { error, data } = await supabase.functions.invoke('send-subscription-message', {
        body: { to, subject, message, customerName },
    });
    if (error) throw new Error(error.message);
    return data;
};

export const useAllSubscriptions = () => {
    return useQuery({
        queryKey: ['allSubscriptions'],
        queryFn: fetchAllSubscriptions,
    });
};

export const useUpdateSubscription = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const mutation = useMutation({
        mutationFn: updateSubscriptionStatus,
        onSuccess: (data, variables) => {
          queryClient.invalidateQueries({ queryKey: ['allSubscriptions'] });
          toast({ title: 'Sukses', description: 'Status langganan berhasil diperbarui.' });
    
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
        },
      });

    return mutation;
};

export const useSendSubscriptionEmail = () => {
    const { toast } = useToast();
    return useMutation({
        mutationFn: sendEmailFn,
        onSuccess: () => {
            toast({ title: 'Sukses', description: 'Pesan berhasil dikirim ke pelanggan.' });
        },
        onError: (err: any) => {
            toast({ title: 'Error', description: `Gagal mengirim pesan: ${err.message}`, variant: 'destructive' });
        },
    });
};
