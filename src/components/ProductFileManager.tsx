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
import { Loader2, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProductPreviewer } from './ProductPreviewer';

type Product = Tables<'managed_products'>;
type ProductFile = Tables<'product_files'>;

interface ProductFileManagerProps {
  product: Product;
}

interface ProductFileFormData {
  file_name: string;
  html_content: string;
}

export const ProductFileManager = ({ product }: ProductFileManagerProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<ProductFile | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const form = useForm<ProductFileFormData>({
    defaultValues: {
      file_name: '',
      html_content: '',
    },
  });

  const htmlContent = form.watch('html_content');

  const { data: files, isLoading: isLoadingFiles } = useQuery({
    queryKey: ['product_files', product.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_files')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const upsertFileMutation = useMutation({
    mutationFn: async (data: ProductFileFormData) => {
      const fileToUpsert = {
        id: editingFile?.id,
        product_id: product.id,
        file_name: data.file_name,
        html_content: data.html_content,
      };

      const { error } = await supabase.from('product_files').upsert(fileToUpsert);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_files', product.id] });
      setIsFormOpen(false);
      setEditingFile(null);
      form.reset();
      toast({ title: `File berhasil ${editingFile ? 'diperbarui' : 'ditambahkan'}.` });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const { error } = await supabase.from('product_files').delete().eq('id', fileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product_files', product.id] });
      toast({ title: 'File berhasil dihapus.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Gagal menghapus file: ${error.message}`, variant: 'destructive' });
    },
  });
  
  const handleAddNew = () => {
    setEditingFile(null);
    form.reset({ file_name: '', html_content: '' });
    setIsFormOpen(true);
  };

  const handleEdit = (file: ProductFile) => {
    setEditingFile(file);
    form.reset({
      file_name: file.file_name,
      html_content: file.html_content ?? '',
    });
    setIsFormOpen(true);
  };

  const handlePreviewFile = (file: ProductFile) => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.open();
      newWindow.document.write(file.html_content || '');
      newWindow.document.close();
      newWindow.document.title = file.file_name;
    } else {
      toast({
        title: 'Gagal Membuka Preview',
        description: 'Browser Anda mungkin memblokir pop-up. Mohon izinkan pop-up untuk situs ini.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (fileId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus file ini?')) {
      deleteFileMutation.mutate(fileId);
    }
  };
  
  const onSubmit = (data: ProductFileFormData) => {
    upsertFileMutation.mutate(data);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">File untuk: {product.name}</h3>
        <div className="flex items-center space-x-2">
          <Dialog open={isPreviewing} onOpenChange={setIsPreviewing}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Pratinjau Produk
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl w-full h-[90vh]">
              <DialogHeader>
                <DialogTitle>Pratinjau Produk: {product.name}</DialogTitle>
              </DialogHeader>
              <div className="h-[calc(90vh-100px)]">
                <ProductPreviewer product={product} />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah File
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>{editingFile ? 'Edit File' : 'Tambah File Baru'}</DialogTitle>
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
                          <FormLabel>Konten HTML</FormLabel>
                          <FormControl>
                            <Textarea placeholder="&lt;p&gt;Hello World&lt;/p&gt;" {...field} className="min-h-[300px] flex-grow" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={upsertFileMutation.isPending}>
                        Batal
                      </Button>
                      <Button type="submit" disabled={upsertFileMutation.isPending}>
                        {upsertFileMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {editingFile ? 'Perbarui' : 'Simpan'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col h-full">
                    <FormLabel>Preview</FormLabel>
                    <div className="border rounded-md mt-2 flex-grow bg-white">
                      <iframe
                        srcDoc={htmlContent || ''}
                        title="HTML Preview"
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

      {isLoadingFiles ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama File</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files?.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="font-medium">{file.file_name}</TableCell>
                <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex space-x-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handlePreviewFile(file)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(file)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(file.id)} disabled={deleteFileMutation.isPending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {files?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Belum ada file.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
