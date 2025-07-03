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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Edit, Trash2, Eye, Github, Settings, Download, RefreshCw, Server, Rocket, History, HardDrive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SSHKeyManager } from '@/components/ssh-keys/SSHKeyManager';
import { DeployConfigManager } from '@/components/deploy/DeployConfigManager';
import { DeploymentHistory } from '@/components/deploy/DeploymentHistory';
import { DeployService } from '@/services/deployService';

type Product = Tables<'managed_products'>;
type UserGeneratedFile = Tables<'user_generated_files'>;
type DeployConfig = Tables<'deploy_configs'>;

interface GeneratedFileManagerProps {
  product: Product;
}

interface FileFormData {
  file_name: string;
  html_content: string;
}

interface DeployFormData {
  deploy_config_id: string;
}

export const GeneratedFileManager = ({ product }: GeneratedFileManagerProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeployFormOpen, setIsDeployFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<UserGeneratedFile | null>(null);
  const [activeTab, setActiveTab] = useState<'ssh-keys' | 'deploy-configs'>('ssh-keys');

  const form = useForm<FileFormData>({
    defaultValues: {
      file_name: '',
      html_content: '',
    },
  });

  const deployForm = useForm<DeployFormData>({
    defaultValues: {
      deploy_config_id: '',
    },
  });

  const htmlContent = form.watch('html_content');

  // Fetch real generated files from user_generated_files table
  const { data: files, isLoading: isLoadingFiles } = useQuery({
    queryKey: ['user_generated_files_for_product', product.id],
    queryFn: async () => {
      // Get user subscriptions for this product
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('product_name', product.name);

      if (subError) throw subError;
      if (!subscriptions || subscriptions.length === 0) return [];

      // Get generated files for these subscriptions
      const subscriptionIds = subscriptions.map(sub => sub.id);
      const { data: generatedFiles, error: filesError } = await supabase
        .from('user_generated_files')
        .select('*')
        .in('user_subscription_id', subscriptionIds)
        .order('created_at', { ascending: false });

      if (filesError) throw filesError;
      return generatedFiles || [];
    },
  });

  const { data: deployConfigs } = useQuery({
    queryKey: ['deploy_configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deploy_configs')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Regenerate files
  const regenerateFilesMutation = useMutation({
    mutationFn: async () => {
      // Simulate file regeneration - in real app this would regenerate files
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_generated_files_for_product', product.id] });
      toast({ title: 'File berhasil di-regenerate.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Download ZIP
  const downloadZipMutation = useMutation({
    mutationFn: async () => {
      if (!files || files.length === 0) {
        throw new Error('Tidak ada file untuk didownload');
      }

      // Dynamic import untuk JSZip
      const JSZip = (await import('jszip')).default;
      
      const zip = new JSZip();
      
      files.forEach(file => {
        zip.file(file.file_name, file.html_content || '');
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${product.name}-files.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true };
    },
    onSuccess: () => {
      toast({ title: 'ZIP file berhasil didownload.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Save file
  const saveFileMutation = useMutation({
    mutationFn: async (data: FileFormData) => {
      if (!editingFile) {
        throw new Error('Tidak ada file yang sedang diedit');
      }

      const { error } = await supabase
        .from('user_generated_files')
        .update({
          file_name: data.file_name,
          html_content: data.html_content,
        })
        .eq('id', editingFile.id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_generated_files_for_product', product.id] });
      setIsFormOpen(false);
      setEditingFile(null);
      form.reset();
      toast({ title: 'File berhasil diperbarui.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Delete file
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const { error } = await supabase
        .from('user_generated_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_generated_files_for_product', product.id] });
      toast({ title: 'File berhasil dihapus.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Deploy website
  const deployMutation = useMutation({
    mutationFn: async (data: DeployFormData) => {
      const deployConfig = deployConfigs?.find(config => config.id === data.deploy_config_id);
      if (!deployConfig) {
        throw new Error('Deploy configuration tidak ditemukan');
      }

      if (!files || files.length === 0) {
        throw new Error('Tidak ada file untuk di-deploy');
      }

      console.log('Starting deployment with config:', deployConfig);
      
      // Use the actual deploy service
      const result = await DeployService.deploy(deployConfig, files);
      
      if (!result.success) {
        throw new Error(result.error || result.message);
      }
      
      return result;
    },
    onSuccess: (result) => {
      toast({ 
        title: 'Deploy Berhasil!', 
        description: result.message
      });
      setIsDeployFormOpen(false);
      deployForm.reset();
    },
    onError: (error: any) => {
      console.error('Deploy error:', error);
      toast({ 
        title: 'Deploy Gagal', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  // Handle edit file
  const handleEdit = (file: UserGeneratedFile) => {
    setEditingFile(file);
    form.reset({
      file_name: file.file_name,
      html_content: file.html_content || '',
    });
    setIsFormOpen(true);
  };

  // Handle preview file
  const handlePreviewFile = (file: UserGeneratedFile) => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.open();
      newWindow.document.write(file.html_content || '');
      newWindow.document.close();
      newWindow.document.title = file.file_name;
    } else {
      toast({
        title: 'Gagal Membuka Preview',
        description: 'Browser Anda mungkin memblokir pop-up.',
        variant: 'destructive',
      });
    }
  };

  // Handle delete file
  const handleDelete = (fileId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus file ini?')) {
      deleteFileMutation.mutate(fileId);
    }
  };

  // Handle form submission
  const onSubmit = (data: FileFormData) => {
    saveFileMutation.mutate(data);
  };

  // Handle deploy form submission
  const onDeploySubmit = (data: DeployFormData) => {
    deployMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header with Deploy Actions */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">File Website yang Telah Di-generate ({files?.length || 0} file)</h3>
            <p className="text-sm text-gray-500">
              {files && files.length > 0 
                ? `Terakhir diperbarui: ${new Date(files[0].updated_at).toLocaleDateString('id-ID')}, ${new Date(files[0].updated_at).toLocaleTimeString('id-ID')}`
                : 'Belum ada file yang di-generate'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => regenerateFilesMutation.mutate()} disabled={regenerateFilesMutation.isPending}>
              {regenerateFilesMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Re-generate Files
            </Button>
            <Button 
              variant="outline" 
              onClick={() => downloadZipMutation.mutate()} 
              disabled={downloadZipMutation.isPending || !files || files.length === 0}
            >
              {downloadZipMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Download ZIP
            </Button>
          </div>
        </div>
      </div>

      {/* Template File Product Section with Tabs */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium">Manajemen Website & Deploy</h3>
            <p className="text-sm text-gray-500">File untuk: {product.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={isDeployFormOpen} onOpenChange={setIsDeployFormOpen}>
              <DialogTrigger asChild>
                <Button disabled={!files || files.length === 0}>
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy Website
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deploy Website</DialogTitle>
                </DialogHeader>
                <Form {...deployForm}>
                  <form onSubmit={deployForm.handleSubmit(onDeploySubmit)} className="space-y-4">
                    <FormField
                      control={deployForm.control}
                      name="deploy_config_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pilih Deploy Configuration</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih konfigurasi deploy" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {deployConfigs?.map((config) => (
                                <SelectItem key={config.id} value={config.id}>
                                  <div className="flex items-center">
                                    {config.type === 'github' ? (
                                      <Github className="h-4 w-4 mr-2" />
                                    ) : config.type === 'server' ? (
                                      <Server className="h-4 w-4 mr-2" />
                                    ) : (
                                      <HardDrive className="h-4 w-4 mr-2" />
                                    )}
                                    {config.name} ({config.type === 'github' ? config.github_repo : config.type === 'server' ? config.server_ip : 'Internal Server'})
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDeployFormOpen(false)}>
                        Batal
                      </Button>
                      <Button type="submit" disabled={deployMutation.isPending}>
                        {deployMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Deploy
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Edit File: {editingFile?.file_name}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6 flex-grow min-h-0 py-4">
                    <div className="space-y-4 flex flex-col">
                      <FormField
                        control={form.control}
                        name="file_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama File</FormLabel>
                            <FormControl>
                              <Input placeholder="contoh: index.html" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="html_content"
                        render={({ field }) => (
                          <FormItem className="flex flex-col flex-grow">
                            <FormLabel>Konten File</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Masukkan konten file..." {...field} className="min-h-[300px] flex-grow font-mono" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={saveFileMutation.isPending}>
                          Batal
                        </Button>
                        <Button type="submit" disabled={saveFileMutation.isPending}>
                          {saveFileMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          Perbarui
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col h-full">
                      <FormLabel>Preview</FormLabel>
                      <div className="border rounded-md mt-2 flex-grow bg-white">
                        <iframe
                          srcDoc={htmlContent || ''}
                          title="File Preview"
                          className="w-full h-full border-0"
                          sandbox="allow-scripts"
                        />
                      </div>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="files">Daftar File</TabsTrigger>
            <TabsTrigger value="ssh-keys">SSH Keys</TabsTrigger>
            <TabsTrigger value="deploy-configs">Deploy Config</TabsTrigger>
            <TabsTrigger value="history">Riwayat Deploy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="files" className="mt-4">
            {isLoadingFiles ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : files && files.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama File</TableHead>
                    <TableHead>Diperbarui</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">{file.file_name}</TableCell>
                      <TableCell>{new Date(file.updated_at).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handlePreviewFile(file)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(file)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDelete(file.id)}
                            disabled={deleteFileMutation.isPending}
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
                <p>Belum ada file yang di-generate untuk produk ini.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ssh-keys" className="mt-4">
            <SSHKeyManager />
          </TabsContent>
          
          <TabsContent value="deploy-configs" className="mt-4">
            <DeployConfigManager />
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <DeploymentHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
