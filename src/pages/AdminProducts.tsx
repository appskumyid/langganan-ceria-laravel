import { useState, useEffect } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { Loader2, Plus, Edit, Trash2, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ProductPagination } from '@/components/ProductPagination';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Tables, Json } from '@/integrations/supabase/types';

interface PricingPeriod {
  monthly: string;
  quarterly: string;
  semiAnnual: string;
  yearly: string;
}

type Product = Tables<'managed_products'>;

interface ProductFormData {
  name: string;
  description: string;
  type: 'Premium' | 'Non-Premium';
  category: string;
  monthlyPrice: string;
  quarterlyPrice: string;
  semiAnnualPrice: string;
  yearlyPrice: string;
  image: string;
  features: string;
  demoUrl: string;
}

const categories = [
  'E-Commerce',
  'Company Profile',
  'CV / Portfolio',
  'Undangan Digital',
  'Aplikasi Bisnis (ERP, POS, LMS, dll)'
];

const AdminProducts = () => {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(20);
  const queryClient = useQueryClient();

  const form = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      type: 'Non-Premium',
      category: '',
      monthlyPrice: '',
      quarterlyPrice: '',
      semiAnnualPrice: '',
      yearlyPrice: '',
      image: '',
      features: '',
      demoUrl: ''
    }
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['managed_products', currentPage, productsPerPage],
    queryFn: async () => {
      const from = (currentPage - 1) * productsPerPage;
      const to = from + productsPerPage - 1;

      const { data, error, count } = await supabase
        .from('managed_products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        throw new Error(error.message);
      }
      return { products: data, count };
    },
    enabled: !roleLoading && isAdmin,
  });
  
  const products = productsData?.products || [];
  const totalProducts = productsData?.count || 0;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const upsertProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const featuresArray = data.features.split(',').map(f => f.trim()).filter(f => f);
      const pricing: PricingPeriod = {
        monthly: data.monthlyPrice,
        quarterly: data.quarterlyPrice,
        semiAnnual: data.semiAnnualPrice,
        yearly: data.yearlyPrice
      };

      const productToUpsert = {
        id: editingProduct?.id,
        name: data.name,
        description: data.description,
        type: data.type,
        category: data.category,
        pricing: pricing as unknown as Json,
        image_url: data.image,
        features: featuresArray,
        demo_url: data.demoUrl,
      };

      const { error } = await supabase.from('managed_products').upsert(productToUpsert);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['managed_products'] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      form.reset();
      toast({
        title: `Produk berhasil ${editingProduct ? 'diperbarui' : 'ditambahkan'}`,
        description: `${data.name} telah ${editingProduct ? 'diperbarui' : 'ditambahkan'}.`
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Terjadi kesalahan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase.from('managed_products').delete().eq('id', productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managed_products'] });
      toast({
        title: "Produk berhasil dihapus",
        description: "Produk telah dihapus dari daftar."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal menghapus produk: ${error.message}`,
        variant: "destructive"
      });
    }
  });


  const onSubmit = (data: ProductFormData) => {
    upsertProductMutation.mutate(data);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const pricing = product.pricing as unknown as PricingPeriod;
    form.reset({
      name: product.name,
      description: product.description ?? '',
      type: product.type,
      category: product.category,
      monthlyPrice: pricing.monthly || '',
      quarterlyPrice: pricing.quarterly || '',
      semiAnnualPrice: pricing.semiAnnual || '',
      yearlyPrice: pricing.yearly || '',
      image: product.image_url ?? '',
      features: product.features?.join(', ') ?? '',
      demoUrl: product.demo_url ?? ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    form.reset();
    setIsDialogOpen(true);
  };

  if (roleLoading || (isAdmin && isLoadingProducts)) {
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
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Kelola Produk
          </h1>
          <p className="text-gray-600">
            Tambah, edit, dan hapus produk langganan
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Produk</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama produk" {...field} />
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
                        <Textarea placeholder="Masukkan deskripsi produk" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Type Produk</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Non-Premium" id="non-premium" />
                            <label htmlFor="non-premium" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Non Premium
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Premium" id="premium" />
                            <label htmlFor="premium" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Premium
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori produk" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Harga Berdasarkan Periode</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="monthlyPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Harga Bulanan</FormLabel>
                          <FormControl>
                            <Input placeholder="Rp 99.000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quarterlyPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Harga 3 Bulan</FormLabel>
                          <FormControl>
                            <Input placeholder="Rp 270.000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="semiAnnualPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Harga 6 Bulan</FormLabel>
                          <FormControl>
                            <Input placeholder="Rp 510.000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="yearlyPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Harga Tahunan</FormLabel>
                          <FormControl>
                            <Input placeholder="Rp 990.000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Gambar</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fitur (pisahkan dengan koma)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="5 User, 10GB Storage, Email Support" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="demoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Demo</FormLabel>
                      <FormControl>
                        <Input placeholder="https://demo.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={upsertProductMutation.isPending}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={upsertProductMutation.isPending}>
                    {upsertProductMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingProduct ? 'Perbarui' : 'Tambah'} Produk
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Produk</CardTitle>
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gambar</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Fitur</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.type === 'Premium' ? 'default' : 'secondary'}>
                      {product.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-semibold">Bulanan:</span> {(product.pricing as unknown as PricingPeriod).monthly}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">3 Bulan:</span> {(product.pricing as unknown as PricingPeriod).quarterly}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">6 Bulan:</span> {(product.pricing as unknown as PricingPeriod).semiAnnual}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Tahunan:</span> {(product.pricing as unknown as PricingPeriod).yearly}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(product.features || []).slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {(product.features?.length || 0) > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(product.features?.length || 0) - 3} lainnya
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        disabled={deleteProductMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
