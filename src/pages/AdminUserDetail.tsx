
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Loader2, Terminal, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSubscriptionsTable } from '@/components/user/subscriptions/UserSubscriptionsTable';
import { useUserRole } from '@/hooks/useUserRole';

type Profile = Tables<'profiles'>;
type Subscription = Tables<'user_subscriptions'>;

const fetchUserById = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

const fetchSubscriptionsByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

const AdminUserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const { isAdmin, loading: roleLoading } = useUserRole();

  const { data: user, isLoading: userLoading, error: userError } = useQuery<Profile | null, Error>({
    queryKey: ['userDetail', userId],
    queryFn: () => fetchUserById(userId!),
    enabled: !!userId && isAdmin,
  });

  const { data: subscriptions, isLoading: subsLoading, error: subsError } = useQuery<Subscription[], Error>({
    queryKey: ['userSubscriptions', userId],
    queryFn: () => fetchSubscriptionsByUserId(userId!),
    enabled: !!userId && isAdmin,
  });
  
  const isLoading = roleLoading || userLoading || subsLoading;
  const error = userError || subsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin && !roleLoading) {
    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertTitle>Akses Ditolak</AlertTitle>
            <AlertDescription>
                Anda tidak memiliki izin untuk melihat halaman ini.
            </AlertDescription>
            </Alert>
        </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Gagal Memuat Data</AlertTitle>
        <AlertDescription>
          Terjadi kesalahan saat mengambil detail pengguna: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
          <h1 className="text-3xl font-bold text-gray-900">Detail Pengguna</h1>
          <p className="text-muted-foreground">
            Lihat detail dan riwayat langganan untuk pengguna.
          </p>
      </div>
      
      {user ? (
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pengguna</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col">
                <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                <p>{user.full_name || 'N/A'}</p>
            </div>
            <div className="flex flex-col">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{user.email}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
         <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Pengguna Tidak Ditemukan</AlertTitle>
            <AlertDescription>
              Data pengguna dengan ID yang diberikan tidak dapat ditemukan.
            </AlertDescription>
        </Alert>
      )}

      {user && (
        <Card>
            <CardHeader>
            <CardTitle>Riwayat Langganan</CardTitle>
            </CardHeader>
            <CardContent>
                {subscriptions && subscriptions.length > 0 ? (
                    <UserSubscriptionsTable subscriptions={subscriptions} />
                ) : (
                    <p className="text-center py-10 text-muted-foreground">Pengguna ini belum memiliki langganan.</p>
                )}
            </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminUserDetail;
