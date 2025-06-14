
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import SubscribedProductCard from '@/components/SubscribedProductCard';
import { Loader2, LayoutGrid, List } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import SubscriptionsTable from '@/components/SubscriptionsTable';

const MySubscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Tables<'user_subscriptions'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'table'>('grid');

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

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Langganan Saya</h1>
        <div className='flex items-center gap-2'>
            <span className="text-sm text-muted-foreground hidden sm:inline">Tampilan:</span>
            <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setView('grid')} aria-label="Grid View">
                <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={view === 'table' ? 'default' : 'outline'} size="icon" onClick={() => setView('table')} aria-label="Table View">
                <List className="h-4 w-4" />
            </Button>
        </div>
      </div>
      
      {subscriptions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">Anda belum memiliki langganan.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((sub) => (
            <SubscribedProductCard key={sub.id} subscription={sub} />
          ))}
        </div>
      ) : (
        <SubscriptionsTable subscriptions={subscriptions} />
      )}
    </div>
  );
};

export default MySubscriptions;
