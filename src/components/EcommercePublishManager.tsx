import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Zap, Package, Globe } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EcommercePublishManagerProps {
  subscription: Tables<'user_subscriptions'>;
}

const fetchStoreDetails = async (subscriptionId: string) => {
  const { data, error } = await supabase
    .from('store_details')
    .select('*')
    .eq('user_subscription_id', subscriptionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }
  return data;
};

const fetchProductFiles = async (productName: string) => {
  const { data: product, error: productError } = await supabase
    .from('managed_products')
    .select('*')
    .eq('name', productName)
    .single();

  if (productError) {
    throw productError;
  }

  const { data: files, error: filesError } = await supabase
    .from('product_files')
    .select('*')
    .eq('product_id', product.id);

  if (filesError) {
    throw filesError;
  }

  return { product, files };
};

const generateUserFiles = async (subscription: Tables<'user_subscriptions'>, storeData: any, transactionCode: string) => {
  console.log("Starting file generation for subscription:", subscription.id);

  // Fetch store products
  const { data: storeProducts, error: productsError } = await supabase
    .from('store_products')
    .select('*')
    .eq('store_details_id', storeData.id)
    .eq('enabled', true) // Only fetch enabled products
    .order('name');

  if (productsError) {
    throw productsError;
  }

  console.log("Found store products:", storeProducts?.length || 0);

  // Fetch template files
  const { files } = await fetchProductFiles(subscription.product_name);
  console.log("Found template files:", files.length);

  // Generate data.json content
  const dataJson = {
    store: storeData,
    products: storeProducts || []
  };

  // Add data.json to the files list
  const allFiles = [
    ...files,
    {
      id: 'data-json',
      file_name: 'data.json',
      html_content: JSON.stringify(dataJson, null, 2),
      product_id: files[0]?.product_id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  console.log("Processing files with store data...");

  // Process each file with store data replacement
  for (const file of allFiles) {
    let processedContent = file.html_content || '';

    if (file.file_name !== 'data.json') {
      // Replace placeholders with actual store data
      processedContent = processedContent
        .replace(/\{\{store_name\}\}/g, storeData.store_name || '')
        .replace(/\{\{about_store\}\}/g, storeData.about_store || '')
        .replace(/\{\{phone_number\}\}/g, storeData.phone_number || '')
        .replace(/\{\{store_address\}\}/g, storeData.store_address || '')
        .replace(/\{\{facebook_url\}\}/g, storeData.facebook_url || '')
        .replace(/\{\{instagram_url\}\}/g, storeData.instagram_url || '')
        .replace(/\{\{linkedin_url\}\}/g, storeData.linkedin_url || '')
        .replace(/\{\{youtube_url\}\}/g, storeData.youtube_url || '');
    }

    // Generate file path with transaction code folder - preserve original file extension
    const fileName = `files/${transactionCode}/${file.file_name}`;

    console.log("Upserting file:", fileName);

    // Upsert the file to user_generated_files table
    const { error: upsertError } = await supabase
      .from('user_generated_files')
      .upsert({
        user_subscription_id: subscription.id,
        file_name: fileName,
        html_content: processedContent
      }, {
        onConflict: 'user_subscription_id,file_name'
      });

    if (upsertError) {
      console.error("Error upserting file:", fileName, upsertError);
      throw upsertError;
    }
  }

  console.log("File generation completed for subscription:", subscription.id);
};

export const EcommercePublishManager = ({ subscription }: EcommercePublishManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate transaction number
  const generateTransactionNumber = (id: string, createdAt: string) => {
    const date = new Date(createdAt);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const shortId = id.slice(0, 8).toUpperCase();
    return `TRX${year}${month}${day}${shortId}`;
  };

  const transactionNumber = generateTransactionNumber(subscription.id, subscription.created_at);

  const { data: storeDetails } = useQuery({
    queryKey: ['storeDetails', subscription.id],
    queryFn: () => fetchStoreDetails(subscription.id),
  });

  const { data: generatedFiles, isLoading: filesLoading } = useQuery({
    queryKey: ['user_generated_files', subscription.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_generated_files')
        .select('*')
        .eq('user_subscription_id', subscription.id)
        .like('file_name', `files/${transactionNumber}/%`)
        .order('file_name');

      if (error) throw error;
      return data || [];
    },
  });

  const { data: deploymentStatus } = useQuery({
    queryKey: ['deployment_status', subscription.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deployment_status')
        .select('*')
        .eq('subscription_id', subscription.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!storeDetails) {
        throw new Error("Detail toko belum diisi. Silakan isi detail toko terlebih dahulu.");
      }
      
      // First generate the files
      await generateUserFiles(subscription, storeDetails, transactionNumber);
      
      // Then call the publish edge function for subdomain and sync
      const { data, error } = await supabase.functions.invoke('publish-website', {
        body: { subscriptionId: subscription.id }
      });

      if (error) throw error;
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user_generated_files', subscription.id] });
      queryClient.invalidateQueries({ queryKey: ['deployment_status', subscription.id] });
      toast({
        title: 'Website sedang dalam persiapan',
        description: data?.message || 'Website dan domain Anda sedang dalam persiapan. Estimasi waktu aktif 1-10 menit.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Gagal publish website: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Publish Website Toko Online
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Kode Transaksi: <span className="font-mono font-semibold">#{transactionNumber}</span></p>
            <p>Folder Publikasi: <span className="font-mono">files/{transactionNumber}/</span></p>
            {subscription.subdomain && (
              <p>Domain: <span className="font-mono font-semibold">{subscription.subdomain}.appsku.my.id</span></p>
            )}
          </div>

          {/* Deployment Status */}
          {deploymentStatus && (
            <Alert className={
              deploymentStatus.status === 'completed' ? 'border-green-200 bg-green-50' :
              deploymentStatus.status === 'failed' ? 'border-red-200 bg-red-50' :
              'border-blue-200 bg-blue-50'
            }>
              <Globe className="h-4 w-4" />
              <AlertDescription>
                {deploymentStatus.status === 'preparing' && (
                  <>
                    <strong>Website sedang dalam persiapan...</strong>
                    <br />
                    Domain: {deploymentStatus.subdomain}.appsku.my.id (Estimasi aktif 1-10 menit)
                  </>
                )}
                {deploymentStatus.status === 'completed' && (
                  <>
                    <strong>Website berhasil dipublish!</strong>
                    <br />
                    Domain: <a 
                      href={`https://${deploymentStatus.subdomain}.appsku.my.id`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {deploymentStatus.subdomain}.appsku.my.id
                    </a>
                  </>
                )}
                {deploymentStatus.status === 'failed' && (
                  <>
                    <strong>Gagal mempublish website</strong>
                    <br />
                    Silakan coba lagi atau hubungi support jika masalah berlanjut.
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}

          {generatedFiles && generatedFiles.length > 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">✓ Website sudah dipublish</p>
                <p className="text-green-600 text-sm mt-1">
                  {generatedFiles.length} file telah digenerate di folder files/{transactionNumber}/
                </p>
              </div>
              <Button 
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending || !storeDetails}
                className="w-full"
              >
                {publishMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mempublish Ulang...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Publish Ulang Website
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-medium">Siap untuk dipublish</p>
                <p className="text-blue-600 text-sm mt-1">
                  Website akan digenerate dengan semua produk yang diaktifkan dan data toko Anda.
                </p>
              </div>
              <Button 
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending || !storeDetails}
                className="w-full"
              >
                {publishMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mempublish...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Publish Website
                  </>
                )}
              </Button>
            </div>
          )}

          {!storeDetails && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">⚠ Detail toko belum diisi</p>
              <p className="text-yellow-600 text-sm mt-1">
                Silakan isi detail toko terlebih dahulu di form di atas sebelum mempublish website.
              </p>
            </div>
          )}

          {filesLoading && (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Memuat status publikasi...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};