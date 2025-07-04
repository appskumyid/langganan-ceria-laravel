import { useState, useEffect } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Shield, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AdminSubscriptions from '@/components/AdminSubscriptions';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface UserRole {
  role: string;
}

interface MemberData {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  user_roles: UserRole[];
}

const AdminDashboard = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!isAdmin) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            full_name,
            created_at
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching members:', error);
        } else {
          // Fetch user roles separately
          const profilesWithRoles = await Promise.all(
            (data || []).map(async (profile) => {
              const { data: roleData } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', profile.id);

              return {
                ...profile,
                user_roles: roleData || []
              };
            })
          );
          setMembers(profilesWithRoles);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!roleLoading) {
      fetchMembers();
    }
  }, [isAdmin, roleLoading]);

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Anda tidak memiliki akses ke halaman admin. Hanya admin yang dapat mengakses halaman ini.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Admin
        </h1>
        <p className="text-gray-600">
          Kelola pengguna dan lihat data member yang registrasi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Member
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter(m => m.user_roles?.[0]?.role === 'member').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Admin
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter(m => m.user_roles?.[0]?.role === 'admin').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengguna
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna Terdaftar</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Memuat data...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tanggal Registrasi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.full_name || 'Tidak ada nama'}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={member.user_roles?.[0]?.role === 'admin' ? 'default' : 'secondary'}
                      >
                        {member.user_roles?.[0]?.role === 'admin' ? 'Admin' : 'Member'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/admin/users/${member.id}`}>
                            <Eye className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Detail</span>
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Kelola Langganan Pengguna</CardTitle>
          <p className="text-sm text-muted-foreground pt-1">Setujui pembayaran yang menunggu konfirmasi.</p>
        </CardHeader>
        <CardContent>
          <AdminSubscriptions />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
