
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
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Edit, Trash2, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type SSHKey = Tables<'ssh_keys'>;

interface SSHKeyFormData {
  name: string;
  description: string;
  private_key: string;
  public_key: string;
}

export const SSHKeyManager = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<SSHKey | null>(null);

  const form = useForm<SSHKeyFormData>({
    defaultValues: {
      name: '',
      description: '',
      private_key: '',
      public_key: '',
    },
  });

  const { data: sshKeys, isLoading } = useQuery({
    queryKey: ['ssh_keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ssh_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const saveKeyMutation = useMutation({
    mutationFn: async (data: SSHKeyFormData) => {
      if (editingKey) {
        const { error } = await supabase
          .from('ssh_keys')
          .update(data)
          .eq('id', editingKey.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ssh_keys')
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssh_keys'] });
      setIsFormOpen(false);
      setEditingKey(null);
      form.reset();
      toast({ 
        title: editingKey ? 'SSH Key diperbarui' : 'SSH Key ditambahkan',
        description: 'SSH Key berhasil disimpan.'
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

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from('ssh_keys')
        .delete()
        .eq('id', keyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ssh_keys'] });
      toast({ 
        title: 'SSH Key dihapus',
        description: 'SSH Key berhasil dihapus.'
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

  const handleEdit = (key: SSHKey) => {
    setEditingKey(key);
    form.reset({
      name: key.name,
      description: key.description || '',
      private_key: key.private_key,
      public_key: key.public_key,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (keyId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus SSH Key ini?')) {
      deleteKeyMutation.mutate(keyId);
    }
  };

  const onSubmit = (data: SSHKeyFormData) => {
    saveKeyMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">SSH Keys Management</h3>
          <p className="text-sm text-gray-500">
            Kelola SSH keys untuk deploy ke server
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingKey(null); form.reset(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah SSH Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingKey ? 'Edit SSH Key' : 'Tambah SSH Key'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama SSH Key</FormLabel>
                      <FormControl>
                        <Input placeholder="contoh: Server Production" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Input placeholder="Deskripsi opsional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="private_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Private Key</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="-----BEGIN PRIVATE KEY-----" 
                          className="font-mono text-sm"
                          rows={8}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="public_key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Public Key</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="ssh-rsa AAAAB3NzaC1yc2E..." 
                          className="font-mono text-sm"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={saveKeyMutation.isPending}>
                    {saveKeyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingKey ? 'Perbarui' : 'Simpan'}
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
      ) : sshKeys && sshKeys.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sshKeys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <Key className="h-4 w-4 mr-2" />
                    {key.name}
                  </div>
                </TableCell>
                <TableCell>{key.description || '-'}</TableCell>
                <TableCell>{new Date(key.created_at).toLocaleDateString('id-ID')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex space-x-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(key)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(key.id)}
                      disabled={deleteKeyMutation.isPending}
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
          <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Belum ada SSH Key yang ditambahkan.</p>
        </div>
      )}
    </div>
  );
};
