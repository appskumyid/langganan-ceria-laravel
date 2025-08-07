import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Edit, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProductCategory {
  id: string;
  name: string;
  domain_name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

const ProductCategoryManager = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", domain_name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState({ name: "", domain_name: "", description: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Gagal memuat kategori produk",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Nama kategori tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('product_categories')
        .insert({
          name: newCategory.name.trim(),
          domain_name: newCategory.domain_name.trim() || null,
          description: newCategory.description.trim() || null
        });

      if (error) throw error;

      setNewCategory({ name: "", domain_name: "", description: "" });
      fetchCategories();
      
      toast({
        title: "Berhasil",
        description: "Kategori produk berhasil ditambahkan"
      });
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan kategori",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      setEditingId(id);
      setEditingCategory({ name: category.name, domain_name: category.domain_name || "", description: category.description || "" });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Nama kategori tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('product_categories')
        .update({
          name: editingCategory.name.trim(),
          domain_name: editingCategory.domain_name.trim() || null,
          description: editingCategory.description.trim() || null
        })
        .eq('id', editingId);

      if (error) throw error;

      setEditingId(null);
      setEditingCategory({ name: "", domain_name: "", description: "" });
      fetchCategories();
      
      toast({
        title: "Berhasil",
        description: "Kategori produk berhasil diperbarui"
      });
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui kategori",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchCategories();
      toast({
        title: "Berhasil",
        description: "Kategori produk berhasil dihapus"
      });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus kategori",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Category */}
      <Card>
        <CardHeader>
          <CardTitle>Tambah Kategori Baru</CardTitle>
          <CardDescription>
            Tambahkan kategori produk baru untuk mengorganisir produk Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="categoryName">Nama Kategori</Label>
            <Input
              id="categoryName"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="Masukkan nama kategori"
            />
          </div>
          <div>
            <Label htmlFor="domainName">Nama Domain (Opsional)</Label>
            <Input
              id="domainName"
              value={newCategory.domain_name}
              onChange={(e) => setNewCategory({ ...newCategory, domain_name: e.target.value })}
              placeholder="contoh: example.com"
            />
          </div>
          <div>
            <Label htmlFor="categoryDescription">Deskripsi (Opsional)</Label>
            <Textarea
              id="categoryDescription"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              placeholder="Masukkan deskripsi kategori"
              rows={3}
            />
          </div>
          <Button onClick={handleAddCategory} className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Tambah Kategori
          </Button>
        </CardContent>
      </Card>

      {/* Category List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori Produk</CardTitle>
          <CardDescription>
            Kelola kategori produk yang sudah ada
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-muted-foreground text-center p-4">
              Belum ada kategori yang terdaftar
            </p>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4">
                {editingId === category.id ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`edit-name-${category.id}`}>Nama Kategori</Label>
                      <Input
                        id={`edit-name-${category.id}`}
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-domain-${category.id}`}>Nama Domain</Label>
                      <Input
                        id={`edit-domain-${category.id}`}
                        value={editingCategory.domain_name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, domain_name: e.target.value })}
                        placeholder="contoh: example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-desc-${category.id}`}>Deskripsi</Label>
                      <Textarea
                        id={`edit-desc-${category.id}`}
                        value={editingCategory.description}
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} size="sm" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Simpan
                      </Button>
                      <Button 
                        onClick={() => setEditingId(null)} 
                        variant="outline" 
                        size="sm"
                        disabled={loading}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{category.name}</h4>
                      {category.domain_name && (
                        <p className="text-blue-600 text-sm font-mono">
                          {category.domain_name}
                        </p>
                      )}
                      {category.description && (
                        <p className="text-muted-foreground text-sm mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleEditCategory(category.id)}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteCategory(category.id)}
                        variant="destructive"
                        size="sm"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductCategoryManager;