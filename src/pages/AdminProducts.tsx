
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
import { useForm } from 'react-hook-form';
import { Loader2, Plus, Edit, Trash2, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface PricingPeriod {
  monthly: string;
  quarterly: string;
  semiAnnual: string;
  yearly: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  pricing: PricingPeriod;
  image: string;
  features: string[];
  demoUrl: string;
}

interface ProductFormData {
  name: string;
  description: string;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
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

  // Mock data with new pricing structure and categories
  const mockProducts: Product[] = [
    {
      id: 1,
      name: "Paket Basic",
      description: "Paket langganan dasar dengan fitur lengkap untuk bisnis kecil",
      category: "E-Commerce",
      pricing: {
        monthly: "Rp 99.000",
        quarterly: "Rp 270.000",
        semiAnnual: "Rp 510.000",
        yearly: "Rp 990.000"
      },
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3",
      features: ["5 User", "10GB Storage", "Email Support", "Basic Analytics"],
      demoUrl: "https://demo.example.com/basic"
    },
    {
      id: 2,
      name: "Paket Professional",
      description: "Paket untuk bisnis menengah dengan fitur advanced",
      category: "Company Profile",
      pricing: {
        monthly: "Rp 199.000",
        quarterly: "Rp 540.000",
        semiAnnual: "Rp 1.020.000",
        yearly: "Rp 1.980.000"
      },
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3",
      features: ["25 User", "100GB Storage", "Priority Support", "Advanced Analytics", "API Access"],
      demoUrl: "https://demo.example.com/professional"
    },
    {
      id: 3,
      name: "Paket Enterprise",
      description: "Solusi lengkap untuk perusahaan besar",
      category: "Aplikasi Bisnis (ERP, POS, LMS, dll)",
      pricing: {
        monthly: "Rp 499.000",
        quarterly: "Rp 1.350.000",
        semiAnnual: "Rp 2.550.000",
        yearly: "Rp 4.950.000"
      },
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3",
      features: ["Unlimited User", "1TB Storage", "24/7 Support", "Custom Analytics", "Full API", "Dedicated Manager"],
      demoUrl: "https://demo.example.com/enterprise"
    }
  ];

  useEffect(() => {
    if (!roleLoading && isAdmin) {
      setProducts(mockProducts);
    }
  }, [isAdmin, roleLoading]);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      const featuresArray = data.features.split(',').map(f => f.trim()).filter(f => f);
      
      if (editingProduct) {
        // Update existing product
        const updatedProduct: Product = {
          ...editingProduct,
          name: data.name,
          description: data.description,
          category: data.category,
          pricing: {
            monthly: data.monthlyPrice,
            quarterly: data.quarterlyPrice,
            semiAnnual: data.semiAnnualPrice,
            yearly: data.yearlyPrice
          },
          image: data.image,
          features: featuresArray,
          demoUrl: data.demoUrl
        };
        
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
        toast({
          title: "Produk berhasil diperbarui",
          description: `${data.name} telah diperbarui.`
        });
      } else {
        // Add new product
        const newProduct: Product = {
          id: Date.now(),
          name: data.name,
          description: data.description,
          category: data.category,
          pricing: {
            monthly: data.monthlyPrice,
            quarterly: data.quarterlyPrice,
            semiAnnual: data.semiAnnualPrice,
            yearly: data.yearlyPrice
          },
          image: data.image,
          features: featuresArray,
          demoUrl: data.demoUrl
        };
        
        setProducts(prev => [...prev, newProduct]);
        toast({
          title: "Produk berhasil ditambahkan",
          description: `${data.name} telah ditambahkan ke daftar produk.`
        });
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan produk.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
      category: product.category,
      monthlyPrice: product.pricing.monthly,
      quarterlyPrice: product.pricing.quarterly,
      semiAnnualPrice: product.pricing.semiAnnual,
      yearlyPrice: product.pricing.yearly,
      image: product.image,
      features: product.features.join(', '),
      demoUrl: product.demoUrl
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast({
        title: "Produk berhasil dihapus",
        description: "Produk telah dihapus dari daftar."
      });
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    form.reset();
    setIsDialogOpen(true);
  };

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
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingProduct ? 'Perbarui' : 'Tambah'} Produk
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gambar</TableHead>
                <TableHead>Nama Produk</TableHead>
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
                      src={product.image}
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
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-semibold">Bulanan:</span> {product.pricing.monthly}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">3 Bulan:</span> {product.pricing.quarterly}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">6 Bulan:</span> {product.pricing.semiAnnual}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Tahunan:</span> {product.pricing.yearly}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {product.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.features.length - 3} lainnya
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
    </div>
  );
};

export default AdminProducts;
