import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState, useMemo } from 'react';
import { Loader2, FileCode } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';

interface ProductPreviewerProps {
  product: Tables<'managed_products'>;
}

const fetchProductFiles = async (productId: string) => {
  const { data, error } = await supabase
    .from('product_files')
    .select('*')
    .eq('product_id', productId)
    .order('file_name', { ascending: true });
  if (error) throw error;
  return data;
};

export const ProductPreviewer = ({ product }: ProductPreviewerProps) => {
  const [activeFile, setActiveFile] = useState<Tables<'product_files'> | null>(null);

  const { data: files, isLoading, error } = useQuery({
    queryKey: ['product_files_preview', product.id],
    queryFn: () => fetchProductFiles(product.id),
  });

  useEffect(() => {
    if (files && files.length > 0) {
      if (!activeFile) {
        const indexFile = files.find(f => f.file_name.toLowerCase() === 'index.html');
        setActiveFile(indexFile || files[0]);
      }
    }
  }, [files, activeFile]);

  const injectedScript = useMemo(() => `
    <script>
        document.addEventListener('click', function(e) {
            let target = e.target;
            while (target && target.tagName !== 'A') {
                target = target.parentElement;
            }
            if (target && target.tagName === 'A' && target.hasAttribute('href')) {
                const href = target.getAttribute('href');
                const url = new URL(href, window.location.origin);
                const isInternalNav = url.pathname.split('/').pop() !== '';
                
                if (isInternalNav && url.origin === window.location.origin && !href.startsWith('http')) {
                     e.preventDefault();
                     window.parent.postMessage({ type: 'navigate', href: href }, '*');
                }
            }
        });
    </script>
  `, []);

  useEffect(() => {
    const handleNavigation = (event: MessageEvent) => {
        if (event.data.type === 'navigate' && event.data.href) {
            const pathParts = event.data.href.split('/');
            const targetFileName = pathParts[pathParts.length - 1];
            const targetFile = files?.find(f => f.file_name === targetFileName);
            if (targetFile) {
                setActiveFile(targetFile);
            } else {
                console.warn("File not found for navigation: " + targetFileName);
            }
        }
    };
    window.addEventListener('message', handleNavigation);
    return () => window.removeEventListener('message', handleNavigation);
  }, [files]);

  if (isLoading) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="flex h-full w-full items-center justify-center"><p className="text-red-500">{error.message}</p></div>;
  if (!files || files.length === 0) return <div className="flex h-full w-full items-center justify-center"><p>Produk ini tidak memiliki file untuk ditampilkan.</p></div>;

  const srcDocContent = (activeFile?.html_content || '') + injectedScript;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4 h-full">
      <div className="border rounded-md p-2 overflow-y-auto bg-slate-50">
        <h4 className="font-semibold mb-2 p-2">Daftar File</h4>
        <ul className="space-y-1">
          {files.map(file => (
            <li key={file.id}>
              <Button
                variant={activeFile?.id === file.id ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left h-auto"
                onClick={() => setActiveFile(file)}
              >
                <FileCode className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{file.file_name}</span>
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <div className="border rounded-md h-full bg-white">
        {activeFile && (
          <iframe
            key={activeFile.id}
            srcDoc={srcDocContent}
            title={activeFile.file_name}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </div>
    </div>
  );
};
