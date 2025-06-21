
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Edit, Trash2, Server, Github } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type DeployConfig = Tables<'deploy_configs'>;
type SSHKey = Tables<'ssh_keys'>;

interface DeployConfigFormData {
  name: string;
  type: 'github' | 'server';
  github_repo: string;
  server_ip: string;
  server_username: string;
  server_port: number;
  deploy_path: string;
  ssh_key_id: string;
}

export const DeployConfigManager = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<DeployConfig | null>(null);

  const form = useForm<DeployConfigFormData>({
    defaultValues: {
      name: '',
      type: 'github',
      github_repo: '',
      server_ip: '',
      server_username: '',
      server_port: 22,
      deploy_path: '',
      ssh_key_id: '',
    },
  });

  const deployType = form.watch('type');

  const { data: deployConfigs, isLoading } = useQuery({
    queryKey: ['deploy_configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deploy_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: sshKeys } = useQuery({
    queryKey: ['ssh_keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ssh_keys')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const saveConfigMutation = useMutation({
    mutationFn: async (data: DeployConfigFormData) => {
      if (editingConfig) {
        const { error } = await supabase
          .from('deploy_configs')
          .update(data)
          .eq('id', editingConfig.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('deploy_configs')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deploy_configs'] });
      setIsFormOpen(false);
      setEditingConfig(null);
      form.reset();
      toast({ 
        title: editingConfig ? 'Deploy Config diperbarui' : 'Deploy Config ditambahkan',
        description: 'Deploy configuration berhasil disimpan.'
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: async (configId: string) => {
      const { error } = await supabase
        .from('deploy_configs')
        .delete()
        .eq('id', configId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deploy_configs'] });
      toast({ 
        title: 'Deploy Config dihapus',
        description: 'Deploy configuration berhasil dihapus.'
      });
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const handleEdit = (config: DeployConfig) => {
    setEditingConfig(config);
    form.reset({
      name: config.name,
      type: config.type as 'github' | 'server',
      github_repo: config.github_repo || '',
      server_ip: config.server_ip || '',
      server_username: config.server_username || '',
      server_port: config.server_port || 22,
      deploy_path: config.deploy_path || '',
      ssh_key_id: config.ssh_key_id || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = (configId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus deploy configuration ini?')) {
      deleteConfigMutation.mutate(configId);
    }
  };

  const onSubmit = (data: DeployConfigFormData) => {
    saveConfigMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Deploy Configurations</h3>
          <p className="text-sm text-gray-500">
            Kelola konfigurasi deploy ke GitHub dan Server
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingConfig(null); form.reset(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Deploy Config
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingConfig ? 'Edit Deploy Configuration' : 'Tambah Deploy Configuration'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Konfigurasi</FormLabel>
                      <FormControl>
                        <Input placeholder="contoh: Production Server" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Deploy</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe deploy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="github">GitHub Repository</SelectItem>
                          <SelectItem value="server">Server (SSH)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {deployType === 'github' && (
                  <FormField
                    control={form.control}
                    name="github_repo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub Repository</FormLabel>
                        <FormControl>
                          <Input placeholder="username/repository-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {deployType === 'server' && (
                  <>
                    <FormField
                      control={form.control}
                      name="server_ip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Server IP Address</FormLabel>
                          <FormControl>
                            <Input placeholder="192.168.1.100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="server_username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="root atau username lain" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="server_port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SSH Port</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="22" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="deploy_path"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deploy Path</FormLabel>
                          <FormControl>
                            <Input placeholder="/var/www/html" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="ssh_key_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SSH Key</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih SSH Key" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sshKeys?.map((key) => (
                            <SelectItem key={key.id} value={key.id}>
                              {key.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={saveConfigMutation.isPending}>
                    {saveConfigMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingConfig ? 'Perbarui' : 'Simpan'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : deployConfigs && deployConfigs.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deployConfigs.map((config) => (
              <TableRow key={config.id}>
                <TableCell className="font-medium">{config.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {config.type === 'github' ? (
                      <>
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </>
                    ) : (
                      <>
                        <Server className="h-4 w-4 mr-2" />
                        Server
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {config.type === 'github' 
                    ? config.github_repo 
                    : `${config.server_ip}:${config.server_port}`
                  }
                </TableCell>
                <TableCell>{new Date(config.created_at).toLocaleDateString('id-ID')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex space-x-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(config)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(config.id)}
                      disabled={deleteConfigMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Belum ada deploy configuration yang ditambahkan.</p>
        </div>
      )}
    </div>
  );
};
