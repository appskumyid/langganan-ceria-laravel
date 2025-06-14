
import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UploadCloud, Download } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type ProductCsvRow = Omit<Tables<'store_products'>, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'store_details_id'>;

interface CsvUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpload: (products: ProductCsvRow[]) => Promise<any>;
  isUploading: boolean;
}

export const CsvUploadDialog = ({ isOpen, onOpenChange, onUpload, isUploading }: CsvUploadDialogProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ProductCsvRow[]>([]);
  const [error, setError] = useState('');

  const handleDownloadTemplate = () => {
    const headers = ['name', 'price', 'category', 'description', 'image_url'];
    const exampleRow = ['Kaos Polos Keren', '75000', 'Pakaian', 'Kaos katun combed 30s, nyaman dipakai', 'https://example.com/image.jpg'];
    const csvContent = [headers.join(','), exampleRow.join(',')].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_produk.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setParsedData([]);

      Papa.parse<ProductCsvRow>(selectedFile, {
        header: true,
        skipEmptyLines: true,
        transform: (value, header) => {
            if (header === 'price') {
                return parseFloat(value);
            }
            return value;
        },
        complete: (results) => {
          if (results.errors.length) {
            setError('Gagal mem-parsing beberapa baris. Periksa format CSV Anda.');
            console.error(results.errors);
          }
          const validData = results.data.filter(row => row.name && row.price > 0);
          if (validData.length === 0 && results.data.length > 0) {
            setError('Data tidak valid. Pastikan file CSV memiliki kolom "name" dan "price" yang benar.');
          } else {
            setParsedData(validData);
          }
        },
        error: (err) => {
          setError(`Gagal mem-parsing file: ${err.message}`);
        },
      });
    }
  };

  const handleUploadClick = async () => {
    if (parsedData.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Tidak ada data',
        description: 'Tidak ada data produk yang valid untuk diunggah.',
      });
      return;
    }
    await onUpload(parsedData);
  };
  
  const handleClose = (open: boolean) => {
    if (!open) {
      setFile(null);
      setParsedData([]);
      setError('');
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Unggah Produk via CSV</DialogTitle>
          <DialogDescription>
            Pilih file CSV untuk mengunggah produk secara massal. Pastikan file Anda memiliki kolom header: 
            `name`, `price`, `category`, `description`, dan `image_url`. Kolom `name` dan `price` wajib diisi.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <Input type="file" accept=".csv" onChange={handleFileChange} className="flex-1" />
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Unduh Template
            </Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {parsedData.length > 0 && (
            <div className="rounded-md border max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Kategori</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 10).map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.price.toLocaleString('id-ID')}</TableCell>
                      <TableCell>{product.category || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedData.length > 10 && <p className="text-center text-sm text-muted-foreground p-2">Dan {parsedData.length - 10} produk lainnya...</p>}
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
          <Button type="button" onClick={handleUploadClick} disabled={isUploading || parsedData.length === 0}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Unggah {parsedData.length > 0 ? `${parsedData.length} Produk` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
