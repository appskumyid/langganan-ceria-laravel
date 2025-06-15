
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Users, Shield, DollarSign, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user } = useAuth();
  const { role, isAdmin, loading: roleLoading } = useUserRole();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalMembers: 0,
    totalAdmins: 0,
    totalUsers: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      if (!isAdmin) {
        setLoadingStats(false);
        return;
      }

      setLoadingStats(true);
      try {
        // Fetch profiles with roles
        const { data: profilesWithRoles, error: profilesError } = await supabase
          .from('profiles')
          .select(`id, user_roles(role)`);
        
        if (profilesError) throw profilesError;

        let totalAdmins = 0;
        let totalMembers = 0;

        profilesWithRoles.forEach(profile => {
          if (profile.user_roles.some((r: any) => r.role === 'admin')) {
            totalAdmins++;
          }
          if (profile.user_roles.some((r: any) => r.role === 'member')) {
            totalMembers++;
          }
        });

        // Fetch total revenue from active subscriptions
        const { data: subscriptions, error: subsError } = await supabase
          .from('user_subscriptions')
          .select('product_price')
          .eq('subscription_status', 'active');

        if (subsError) throw subsError;

        const totalRevenue = subscriptions.reduce((acc, sub) => {
          const price = parseFloat(sub.product_price);
          return acc + (isNaN(price) ? 0 : price);
        }, 0);

        setStats({
          totalRevenue,
          totalMembers,
          totalAdmins,
          totalUsers: profilesWithRoles.length,
        });

      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (!roleLoading) {
      fetchAdminStats();
    }
  }, [isAdmin, roleLoading]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Selamat Datang, {user?.email}!
        </h1>
        <p className="text-gray-600">
          Dashboard utama Anda. Role Anda: {role || 'Loading...'}
        </p>
      </div>

      {roleLoading ? (
        <div className="flex justify-center items-center h-24">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : isAdmin ? (
        <>
          {loadingStats ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.totalRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">Dari langganan aktif</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Member</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMembers}</div>
                  <p className="text-xs text-muted-foreground">Pengguna dengan role member</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Admin</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAdmins}</div>
                  <p className="text-xs text-muted-foreground">Pengguna dengan role admin</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Semua pengguna terdaftar</p>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Belum ada aktivitas absensi
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengumuman</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Tidak ada pengumuman
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
