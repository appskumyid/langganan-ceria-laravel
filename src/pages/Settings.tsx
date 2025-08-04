
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SSHKeyManager } from "@/components/ssh-keys/SSHKeyManager";
import { DeployConfigManager } from "@/components/deploy/DeployConfigManager";
import { AdminFileManager } from "@/components/AdminFileManager";
import AdminSettings from "@/components/AdminSettings";
import { useUserRole } from "@/hooks/useUserRole";
import ChangePassword from "@/pages/ChangePassword";

const Settings = () => {
  const { isAdmin } = useUserRole();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan</h1>
        <p className="text-gray-600">Kelola pengaturan akun dan konfigurasi deploy Anda</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
          <TabsTrigger value="general">Umum</TabsTrigger>
          <TabsTrigger value="ssh-keys">SSH Keys</TabsTrigger>
          <TabsTrigger value="deploy-config">Deploy Config</TabsTrigger>
          {isAdmin && <TabsTrigger value="file-manager">File Manager</TabsTrigger>}
          <TabsTrigger value="profile">Profil</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <AdminSettings />
        </TabsContent>

        <TabsContent value="ssh-keys">
          <Card>
            <CardHeader>
              <CardTitle>SSH Keys Management</CardTitle>
              <CardDescription>
                Kelola SSH keys untuk deploy ke server atau repository GitHub
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SSHKeyManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deploy-config">
          <Card>
            <CardHeader>
              <CardTitle>Deploy Configurations</CardTitle>
              <CardDescription>
                Konfigurasi deployment ke GitHub repository atau server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeployConfigManager />
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="file-manager">
            <AdminFileManager />
          </TabsContent>
        )}

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil Pengguna</CardTitle>
              <CardDescription>
                Pengaturan profil dan informasi akun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePassword />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
