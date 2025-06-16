
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Loader2, FileCode, Eye } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

export const UserGeneratedFileManager = ({ subscription }: UserGeneratedFileManagerProps) => {
  const [activeFile, setActiveFile] = useState<Tables<'user_generated_files'> | null>(null);

  const { data: files, isLoading, error } = useQuery({
    queryKey: ['user_generated_files', subscription.id],
    queryFn: () => fetchUserGeneratedFiles(subscription.id),
  });

  useEffect(() => {
    if (files && files.length > 0 && !activeFile) {
      const indexFile = files.find(f => f.file_name.toLowerCase() === 'index.html');
      setActiveFile(indexFile || files[0]);
    }
  }, [files, activeFile]);

  if (isLoading) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="flex h-full w-full items-center justify-center"><p className="text-red-500">{error.message}</p></div>;
  if (!files || files.length === 0) return <div className="flex h-full w-full items-center justify-center"><p>Belum ada file yang di-generate untuk langganan ini.</p></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          File Website yang Telah Di-generate ({files.length} file)
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};
