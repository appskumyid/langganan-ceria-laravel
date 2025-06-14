
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const serviceFormSchema = z.object({
  name: z.string().min(1, 'Nama layanan/produk harus diisi.'),
  description: z.string().optional(),
  image_url: z.string().url({ message: "URL gambar tidak valid." }).or(z.literal("")).optional(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface CompanyServiceManagerProps {
  companyProfile: Tables<'company_profiles'>;
}

const CompanyServiceManager = ({ companyProfile }: CompanyServiceManagerProps) => {
  const queryClient = useQueryClient();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Tables<'company_services'> | null>(null);

  const { data: services, isLoading } = useQuery({
    queryKey: ['companyServices', companyProfile.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_services')
        .select('*')
        .eq('company_profile_id', companyProfile.id)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!companyProfile.id,
  });

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: { name: '', description: '', image_url: '' },
  });
  const imageUrl = form.watch('image_url');

  const upsertServiceMutation = useMutation({
    mutationFn: async (values: ServiceFormValues) => {
      const serviceToUpsert = {
        id: editingService?.id,
        company_profile_id: companyProfile.id,
        user_id: companyProfile.user_id,
        name: values.name,
        description: values.description,
        image_url: values.image_url,
      };

      const { error } = await supabase.from('company_services').upsert(serviceToUpsert, {
        onConflict: 'id'
      }).select();
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Sukses', description: `Layanan berhasil ${editingService ? 'diperbarui' : 'ditambahkan'}.` });
      queryClient.invalidateQueries({ queryKey: ['companyServices', companyProfile.id] });
      setIsFormDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: `Gagal menyimpan layanan: ${error.message}` });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase.from('company_services').delete().eq('id', serviceId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Sukses', description: 'Layanan berhasil dihapus.' });
      queryClient.invalidateQueries({ queryKey: ['companyServices', companyProfile.id] });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: `Gagal menghapus layanan: ${error.message}` });
    },
  });
  
  const handleAddNew = () => {
    setEditingService(null);
    form.reset({ name: '', description: '', image_url: '' });
    setIsFormDialogOpen(true);
  };

  const handleEdit = (service: Tables<'company_services'>) => {
    setEditingService(service);
    form.reset({
      name: service.name,
      description: service.description ?? '',
      image_url: service.image_url ?? '',
    });
    setIsFormDialogOpen(true);
  };
  
  const onSubmit = (values: ServiceFormValues) => {
    upsertServiceMutation.mutate(values);
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Layanan / Produk Perusahaan</h3>
            <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Tambah Baru</Button>
        </div>
        
        {isLoading ? (
            <div className="flex justify-center items-center h-40"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : services && services.length > 0 ? (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Gambar</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Deskripsi</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services.map((service) => (
                            <TableRow key={service.id}>
                                <TableCell>
                                    {service.image_url ? (
                                        <img src={service.image_url} alt={service.name} className="h-16 w-16 object-cover rounded-md" />
                                    ) : (
                                        <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">No Image</div>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{service.name}</TableCell>
                                <TableCell>{service.description}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}><Edit className="h-4 w-4" /></Button>
                                    
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                                                <AlertDialogDescription>Tindakan ini tidak bisa dibatalkan. Ini akan menghapus layanan secara permanen.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteServiceMutation.mutate(service.id)} disabled={deleteServiceMutation.isPending}>
                                                    {deleteServiceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Hapus
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p className="text-gray-500">Belum ada layanan/produk yang ditambahkan.</p>
                <Button variant="link" onClick={handleAddNew}>Tambahkan yang pertama</Button>
            </div>
        )}

        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}</DialogTitle>
                    <DialogDescription>Isi detail untuk layanan atau produk yang ditawarkan perusahaan Anda.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Nama</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Deskripsi</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="image_url" render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL Gambar</FormLabel>
                                <FormControl><Input placeholder="https://example.com/gambar.jpg" {...field} value={field.value ?? ''} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        {imageUrl && (
                            <div className="text-sm">
                                <p className="text-muted-foreground">Preview Gambar:</p>
                                <img src={imageUrl} alt="Service preview" className="w-24 h-24 object-cover mt-1 rounded" />
                            </div>
                        )}
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Batal</Button></DialogClose>
                            <Button type="submit" disabled={upsertServiceMutation.isPending}>
                                {upsertServiceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </div>
  )
};

export default CompanyServiceManager;
