import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Folder, 
  File, 
  Eye, 
  Download, 
  Loader2, 
  RefreshCw, 
  ChevronRight, 
  Home,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type UserGeneratedFile = Tables<'user_generated_files'>;

interface DeployedFileManagerProps {
  subscriptionId: string;
}

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileNode[];
  size?: number;
}

export const DeployedFileManager = ({ subscriptionId }: DeployedFileManagerProps) => {
  const { toast } = useToast();
  const [currentPath, setCurrentPath] = useState('/');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));

  // Fetch generated files for this subscription
  const { data: files, isLoading, refetch } = useQuery({
    queryKey: ['deployed_files', subscriptionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_generated_files')
        .select('*')
        .eq('user_subscription_id', subscriptionId)
        .order('file_name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Build file tree structure with files positioned as root folder
  const buildFileTree = (files: UserGeneratedFile[]): FileNode[] => {
    const tree: FileNode[] = [];
    
    files.forEach(file => {
      const pathParts = file.file_name.split('/').filter(part => part);
      let currentLevel = tree;
      let currentPath = '';
      
      // Navigate through path parts
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        currentPath += `/${part}`;
        
        // Check if this is the last part (actual file)
        if (i === pathParts.length - 1) {
          currentLevel.push({
            name: part,
            type: 'file',
            path: currentPath,
            content: file.html_content || '',
            size: file.html_content?.length || 0
          });
        } else {
          // This is a folder
          let folder = currentLevel.find(node => node.name === part && node.type === 'folder');
          if (!folder) {
            folder = {
              name: part,
              type: 'folder',
              path: currentPath,
              children: []
            };
            currentLevel.push(folder);
          }
          currentLevel = folder.children!;
        }
      }
    });

    return tree;
  };

  // Get current directory contents
  const getCurrentDirectoryContents = (): FileNode[] => {
    if (!files) return [];
    
    const tree = buildFileTree(files);
    
    if (currentPath === '/') {
      return tree;
    }
    
    const pathParts = currentPath.split('/').filter(part => part);
    let currentLevel = tree;
    
    for (const part of pathParts) {
      const folder = currentLevel.find(node => node.name === part && node.type === 'folder');
      if (folder && folder.children) {
        currentLevel = folder.children;
      } else {
        return [];
      }
    }
    
    return currentLevel;
  };

  // Navigate to folder
  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
    setExpandedFolders(prev => new Set([...prev, folderPath]));
  };

  // Navigate back
  const navigateBack = () => {
    if (currentPath === '/') return;
    
    const pathParts = currentPath.split('/').filter(part => part);
    pathParts.pop();
    const newPath = pathParts.length > 0 ? `/${pathParts.join('/')}` : '/';
    setCurrentPath(newPath);
  };

  // Preview file
  const previewFile = (file: FileNode) => {
    if (!file.content) {
      toast({
        title: 'Tidak Ada Konten',
        description: 'File ini tidak memiliki konten untuk ditampilkan.',
        variant: 'destructive'
      });
      return;
    }

    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.open();
      newWindow.document.write(file.content);
      newWindow.document.close();
      newWindow.document.title = file.name;
    } else {
      toast({
        title: 'Gagal Membuka Preview',
        description: 'Browser Anda mungkin memblokir pop-up.',
        variant: 'destructive',
      });
    }
  };

  // Download file
  const downloadFile = (file: FileNode) => {
    if (!file.content) {
      toast({
        title: 'Tidak Ada Konten',
        description: 'File ini tidak memiliki konten untuk diunduh.',
        variant: 'destructive'
      });
      return;
    }

    const blob = new Blob([file.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'File Diunduh',
      description: `${file.name} berhasil diunduh.`
    });
  };

  // Get breadcrumb path
  const getBreadcrumbs = () => {
    if (currentPath === '/') return [{ name: 'Root', path: '/' }];
    
    const parts = currentPath.split('/').filter(part => part);
    const breadcrumbs = [{ name: 'Root', path: '/' }];
    
    let currentBreadcrumbPath = '';
    for (const part of parts) {
      currentBreadcrumbPath += `/${part}`;
      breadcrumbs.push({ name: part, path: currentBreadcrumbPath });
    }
    
    return breadcrumbs;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const currentContents = getCurrentDirectoryContents();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              File Manager - Deployed Files
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Kelola dan lihat file yang telah di-deploy ({files?.length || 0} file)
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-lg">
          <Home className="h-4 w-4" />
          {getBreadcrumbs().map((crumb, index) => (
            <div key={crumb.path} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateToFolder(crumb.path)}
                className={`p-1 h-auto ${crumb.path === currentPath ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary'}`}
              >
                {crumb.name}
              </Button>
            </div>
          ))}
        </div>

        {/* Back Button */}
        {currentPath !== '/' && (
          <Button variant="outline" size="sm" onClick={navigateBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        )}

        {/* File/Folder List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Memuat file...</span>
          </div>
        ) : currentContents.length > 0 ? (
          <div className="space-y-2">
            {currentContents.map((item) => (
              <div
                key={item.path}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.type === 'folder' ? (
                    <Folder className="h-5 w-5 text-blue-500" />
                  ) : (
                    <File className="h-5 w-5 text-gray-500" />
                  )}
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.type === 'file' && item.size !== undefined && (
                      <p className="text-sm text-gray-500">{formatFileSize(item.size)}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {item.type === 'file' ? (
                    <>
                      <Badge variant="outline" className="text-xs">
                        {item.name.split('.').pop()?.toUpperCase() || 'FILE'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => previewFile(item)}
                        title="Preview file"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(item)}
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateToFolder(item.path)}
                    >
                      Buka Folder
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Folder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Tidak ada file di folder ini.</p>
            {currentPath === '/' && (
              <p className="text-sm mt-2">File yang di-deploy akan muncul di sini.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};