import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Edit } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ProductCategory {
  id: string;
  name: string;
  domain_name?: string;
  description?: string;
}

const ProductCategoryManager = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([
    { id: "1", name: "Website", description: "Website dan aplikasi web" },
    { id: "2", name: "Mobile App", description: "Aplikasi mobile iOS dan Android" },
    { id: "3", name: "Digital Marketing", description: "Layanan pemasaran digital" },
    { id: "4", name: "Design", description: "Layanan desain grafis dan UI/UX" },
    { id: "5", name: "Consulting", description: "Konsultasi IT dan bisnis" },
    { id: "6", name: "Aplikasi Bisnis (ERP, POS, LMS, dll)", description: "Sistem aplikasi untuk bisnis" }
  ]);
  
  const [newCategory, setNewCategory] = useState({ name: "", domain_name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState({ name: "", domain_name: "", description: "" });

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Nama kategori tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    const category: ProductCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      domain_name: newCategory.domain_name,
      description: newCategory.description
    };

    setCategories([...categories, category]);
    setNewCategory({ name: "", domain_name: "", description: "" });
    
    toast({
      title: "Berhasil",
      description: "Kategori produk berhasil ditambahkan"
    });
  };

  const handleEditCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      setEditingId(id);
      setEditingCategory({ name: category.name, domain_name: category.domain_name || "", description: category.description || "" });
    }
  };

  const handleSaveEdit = () => {
    if (!editingCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Nama kategori tidak boleh kosong",
        variant: "destructive"
      });
      return;
    }

    setCategories(categories.map(c => 
      c.id === editingId 
        ? { ...c, name: editingCategory.name, domain_name: editingCategory.domain_name, description: editingCategory.description }
        : c
    ));
    
    setEditingId(null);
    setEditingCategory({ name: "", domain_name: "", description: "" });
    
    toast({
      title: "Berhasil",
      description: "Kategori produk berhasil diperbarui"
    });
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    toast({
      title: "Berhasil",
      description: "Kategori produk berhasil dihapus"
    });
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
          <Button onClick={handleAddCategory} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
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
                      <Button onClick={handleSaveEdit} size="sm">
                        Simpan
                      </Button>
                      <Button 
                        onClick={() => setEditingId(null)} 
                        variant="outline" 
                        size="sm"
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
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteCategory(category.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductCategoryManager;