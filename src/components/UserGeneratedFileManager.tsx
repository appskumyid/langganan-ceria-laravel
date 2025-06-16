
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Loader2, FileCode, Eye, Download, Zap } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface UserGeneratedFileManagerProps {
  subscription: Tables<'user_subscriptions'>;
}

const fetchUserGeneratedFiles = async (subscriptionId: string) => {
  const { data, error } = await supabase
    .from('user_generated_files')
    .select('*')
    .eq('user_subscription_id', subscriptionId)
    .order('file_name', { ascending: true });
  if (error) throw error;
  return data;
};

const generateFilesForSubscription = async (subscriptionId: string) => {
  console.log('Generating files for subscription:', subscriptionId);
  
  // Get subscription details
  const { data: subscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .single();
  
  if (subError) throw subError;
  
  // Get store details for this subscription
  const { data: storeData, error: storeError } = await supabase
    .from('store_details')
    .select('*')
    .eq('user_subscription_id', subscriptionId)
    .maybeSingle();
  
  if (storeError) throw storeError;
  
  // Get product files (templates)
  const { data: product, error: productError } = await supabase
    .from('managed_products')
    .select('*')
    .eq('name', subscription.product_name)
    .single();
  
  if (productError) throw productError;
  
  const { data: productFiles, error: filesError } = await supabase
    .from('product_files')
    .select('*')
    .eq('product_id', product.id);
  
  if (filesError) throw filesError;
  
  // Generate files by replacing placeholders
  const generatedFiles = [];
  
  for (const file of productFiles) {
    let content = file.html_content || '';
    
    if (storeData) {
      // Replace placeholders with actual data
      content = content
        .replace(/\[nama\]/g, storeData.store_name || 'Nama Toko')
        .replace(/\[nomor hp\]/g, storeData.phone_number || 'Nomor HP')
        .replace(/\[about\]/g, storeData.about_store || 'Tentang Toko')
        .replace(/\[alamat\]/g, storeData.store_address || 'Alamat Toko')
        .replace(/\[link instagram\]/g, storeData.instagram_url || '#')
        .replace(/\[facebook\]/g, storeData.facebook_url || '#')
        .replace(/\[youtube\]/g, storeData.youtube_url || '#')
        .replace(/\[linkedin\]/g, storeData.linkedin_url || '#');
    }
    
    // Save to user_generated_files table
    const { error: insertError } = await supabase
      .from('user_generated_files')
      .upsert({
        user_subscription_id: subscriptionId,
        file_name: file.file_name,
        html_content: content
      }, {
        onConflict: 'user_subscription_id,file_name'
      });
    
    if (insertError) throw insertError;
    
    generatedFiles.push({
      name: file.file_name,
      content: content
    });
  }
  
  return generatedFiles;
};

const downloadAsZip = async (files: Tables<'user_generated_files'>[]) => {
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
  a.download = 'website-files.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const UserGeneratedFileManager = ({ subscription }: UserGeneratedFileManagerProps) => {
  const [activeFile, setActiveFile] = useState<Tables<'user_generated_files'> | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: files, isLoading, error } = useQuery({
    queryKey: ['user_generated_files', subscription.id],
    queryFn: () => fetchUserGeneratedFiles(subscription.id),
  });

  const generateFilesMutation = useMutation({
    mutationFn: () => generateFilesForSubscription(subscription.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_generated_files', subscription.id] });
      toast({
        title: 'Sukses',
        description: 'File website berhasil digenerate!'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Gagal generate files: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  const handleDownloadZip = async () => {
    if (!files || files.length === 0) return;
    
    try {
      await downloadAsZip(files);
      toast({
        title: 'Download Berhasil',
        description: 'File ZIP telah didownload'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Gagal download ZIP: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (files && files.length > 0 && !activeFile) {
      const indexFile = files.find(f => f.file_name.toLowerCase() === 'index.html');
      setActiveFile(indexFile || files[0]);
    }
  }, [files, activeFile]);

  if (isLoading) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="flex h-full w-full items-center justify-center"><p className="text-red-500">{error.message}</p></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          File Website yang Telah Di-generate ({files?.length || 0} file)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!files || files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-gray-500">Belum ada file yang di-generate untuk langganan ini.</p>
            <Button 
              onClick={() => generateFilesMutation.mutate()}
              disabled={generateFilesMutation.isPending}
              className="flex items-center gap-2"
            >
              {generateFilesMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Generate Files
            </Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <Button 
                onClick={() => generateFilesMutation.mutate()}
                disabled={generateFilesMutation.isPending}
                variant="outline"
                className="flex items-center gap-2"
              >
                {generateFilesMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                Re-generate Files
              </Button>
              <Button 
                onClick={handleDownloadZip}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download ZIP
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4 h-96">
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
                    srcDoc={activeFile.html_content || ''}
                    title={activeFile.file_name}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                  />
                )}
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Terakhir diperbarui:</strong> {activeFile ? new Date(activeFile.updated_at).toLocaleString('id-ID') : '-'}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
