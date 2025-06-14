
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SubscribedProductCard from '@/components/SubscribedProductCard';
import { Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

const MySubscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Tables<'user_subscriptions'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user) {
        setLoading(false);
        setError("Pengguna tidak ditemukan. Silakan login ulang.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: dbError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('subscribed_at', { ascending: false });

        if (dbError) {
          throw dbError;
        }
        setSubscriptions(data || []);
      } catch (e: any) {
        console.error("Error fetching subscriptions:", e);
        setError(e.message || "Gagal memuat data langganan.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user]);

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

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-semibold mb-4">Langganan Saya</h1>
        <p className="text-gray-600">Anda belum memiliki langganan aktif.</p>
        {/* Tambahkan link ke halaman produk jika ada */}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Langganan Saya</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.map((sub)_ => (
          <SubscribedProductCard key={sub.id} subscription={sub} />
        ))}
      </div>
    </div>
  );
};

export default MySubscriptions;
