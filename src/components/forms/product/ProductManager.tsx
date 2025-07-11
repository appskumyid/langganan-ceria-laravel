import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle, Pencil, Trash2, Upload } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { v4 as uuidv4 } from 'uuid';
import { CsvUploadDialog } from './CsvUploadDialog';
import { ProductPagination } from '@/components/ProductPagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductManagerProps {
  storeDetails: Tables<'store_details'> | null;
}

const productFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nama produk wajib diisi.'),
  category: z.string().optional(),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Harga harus angka positif.')
  ),
  description: z.string().optional(),
  image_url: z.string().url({ message: "URL gambar tidak valid." }).or(z.literal("")).optional(),
  enabled: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productFormSchema>;
type ProductCsvRow = Omit<Tables<'store_products'>, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'store_details_id'>;

const fetchProducts = async (storeId: string, page: number, limit: number) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('store_products')
    .select('*', { count: 'exact' })
    .eq('store_details_id', storeId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { products: data || [], count };
};

const ProductManager = ({ storeDetails }: ProductManagerProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Tables<'store_products'> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(20);

  const { data, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', storeDetails?.id, currentPage, productsPerPage],
    queryFn: () => fetchProducts(storeDetails!.id, currentPage, productsPerPage),
    enabled: !!storeDetails,
  });

  const products = data?.products || [];
  const totalProducts = data?.count || 0;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: '', price: 0, description: '', category: '', image_url: '', enabled: true },
  });
  const imageUrl = form.watch('image_url');

  const upsertProductMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (!storeDetails) throw new Error('Detail toko tidak ditemukan.');
      
      const productToUpsert = {
        id: editingProduct?.id,
        store_details_id: storeDetails.id,
        user_id: storeDetails.user_id,
        name: values.name,
        price: values.price,
        description: values.description,
        category: values.category,
        image_url: values.image_url,
        enabled: values.enabled,
      };

      const { data, error } = await supabase
        .from('store_products')
        .upsert(productToUpsert)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Sukses', description: `Produk berhasil ${editingProduct ? 'diperbarui' : 'ditambahkan'}.` });
      queryClient.invalidateQueries({ queryKey: ['products', storeDetails?.id] });
      setIsFormDialogOpen(false);
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const bulkUpsertMutation = useMutation({
    mutationFn: async (newProducts: ProductCsvRow[]) => {
      if (!storeDetails) throw new Error('Detail toko tidak ditemukan.');
      
      const productsToUpsert = newProducts.map(p => ({
        ...p,
        price: Number(p.price) || 0,
        enabled: p.enabled !== undefined ? p.enabled : true,
        store_details_id: storeDetails.id,
        user_id: storeDetails.user_id,
      }));

      const { data, error } = await supabase
        .from('store_products')
        .upsert(productsToUpsert)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({ title: 'Sukses', description: `${data?.length} produk berhasil diunggah.` });
      queryClient.invalidateQueries({ queryKey: ['products', storeDetails?.id] });
      setIsCsvDialogOpen(false);
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: `Gagal mengunggah produk: ${error.message}` });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (product: Tables<'store_products'>) => {
      if (product.image_url && product.image_url.includes('/storage/v1/object/public/product-images/')) {
        const path = new URL(product.image_url).pathname.split('/product-images/')[1];
        if (path) {
          await supabase.storage.from('product-images').remove([path]);
        }
      }
      const { error } = await supabase.from('store_products').delete().eq('id', product.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Sukses', description: 'Produk berhasil dihapus.' });
      queryClient.invalidateQueries({ queryKey: ['products', storeDetails?.id] });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: 'Error', description: `Gagal menghapus produk: ${error.message}` });
    },
  });

  const handleAddNew = () => {
    setEditingProduct(null);
    form.reset({ name: '', price: 0, description: '', image_url: '', category: '', enabled: true });
    setIsFormDialogOpen(true);
  };
  
  const handleEdit = (product: Tables<'store_products'>) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      price: product.price,
      description: product.description ?? '',
      image_url: product.image_url ?? '',
      category: product.category ?? '',
      enabled: product.enabled ?? true,
    });
    setIsFormDialogOpen(true);
  };

  if (!storeDetails) {
    return (
      <div className="pt-4">
        <h3 className="text-lg font-medium">Produk Toko</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Silakan simpan detail toko terlebih dahulu sebelum menambahkan produk.
        </p>
        <Button type="button" variant="outline" disabled>Kelola Produk</Button>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium">Produk Toko</h3>
          <p className="text-sm text-muted-foreground">Tambah dan kelola produk yang Anda jual.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCsvDialogOpen(true)} type="button" variant="outline"><Upload className="mr-2 h-4 w-4" /> Unggah CSV</Button>
          <Button onClick={handleAddNew} type="button"><PlusCircle className="mr-2 h-4 w-4" /> Tambah Produk</Button>
        </div>
      </div>

      <div className="flex justify-end items-center mb-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Item per halaman:</p>
          <Select
            value={String(productsPerPage)}
            onValueChange={(value) => {
              setProductsPerPage(Number(value));
              setCurrentPage(1); // Reset to first page
            }}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoadingProducts ? (
        <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : products && products.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Gambar</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category || '-'}</TableCell>
                  <TableCell>Rp{product.price.toLocaleString('id-ID')}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.enabled ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{product.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteProductMutation.mutate(product)} disabled={deleteProductMutation.isPending}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">Anda belum memiliki produk.</p>
          <p className="text-sm text-muted-foreground">Klik "Tambah Produk" untuk mulai menjual.</p>
        </div>
      )}

      {products && products.length > 0 && totalPages > 1 && (
        <div className="mt-4">
          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Ubah Produk' : 'Tambah Produk Baru'}</DialogTitle>
            <DialogDescription>
              Isi detail produk Anda di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => upsertProductMutation.mutate(data))} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nama Produk</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Kategori Produk</FormLabel><FormControl><Input placeholder="Contoh: Makanan" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem><FormLabel>Harga</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Deskripsi</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="image_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Gambar Produk</FormLabel>
                  <FormControl><Input placeholder="https://example.com/gambar.jpg" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="enabled" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Status Produk</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Produk akan ditampilkan di toko jika diaktifkan
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )} />
              {imageUrl && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Preview Gambar:</p>
                  <img src={imageUrl} alt="Product preview" className="w-24 h-24 object-cover mt-1 rounded" />
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                <Button type="submit" disabled={upsertProductMutation.isPending}>
                  {upsertProductMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {storeDetails && (
        <CsvUploadDialog
          isOpen={isCsvDialogOpen}
          onOpenChange={setIsCsvDialogOpen}
          onUpload={bulkUpsertMutation.mutateAsync}
          isUploading={bulkUpsertMutation.isPending}
        />
      )}
    </div>
  );
};

export default ProductManager;
