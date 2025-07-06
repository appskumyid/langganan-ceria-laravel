import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Folder, 
  File, 
  Eye, 
  Download, 
  Loader2, 
  RefreshCw, 
  ChevronRight, 
  Home,
  ArrowLeft,
  Search,
  Users,
  Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type UserGeneratedFile = Tables<'user_generated_files'>;
type UserSubscription = Tables<'user_subscriptions'>;

interface FileWithSubscription extends UserGeneratedFile {
  user_subscriptions: UserSubscription;
}

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  children?: FileNode[];
  size?: number;
  subscription?: UserSubscription;
}

export const AdminFileManager = () => {
  const { toast } = useToast();
  const [currentPath, setCurrentPath] = useState('/');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<string>('all');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));

  // Fetch all generated files with subscription info
  const { data: filesWithSubs, isLoading, refetch } = useQuery({
    queryKey: ['admin_all_files', selectedSubscription, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('user_generated_files')
        .select(`
          *,
          user_subscriptions!inner(*)
        `)
        .order('created_at', { ascending: false });

      if (selectedSubscription !== 'all') {
        query = query.eq('user_subscription_id', selectedSubscription);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FileWithSubscription[] || [];
    },
  });

  // Fetch unique subscriptions for filter
  const { data: subscriptions } = useQuery({
    queryKey: ['admin_subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('id, product_name, customer_name, subscription_status')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Filter files based on search term
  const filteredFiles = filesWithSubs?.filter(file => 
    file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.user_subscriptions.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.user_subscriptions.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Build file tree structure
  const buildFileTree = (files: FileWithSubscription[]): FileNode[] => {
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
            size: file.html_content?.length || 0,
            subscription: file.user_subscriptions
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
    if (!filteredFiles) return [];
    
    const tree = buildFileTree(filteredFiles);
    
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
      case 'waiting_confirmation': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentContents = getCurrentDirectoryContents();
  const totalFiles = filteredFiles?.length || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Admin File Manager
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Kelola semua file yang di-deploy oleh pengguna ({totalFiles} file)
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari berdasarkan nama file, produk, atau customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedSubscription} onValueChange={setSelectedSubscription}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter berdasarkan langganan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Semua Langganan
                </div>
              </SelectItem>
              {subscriptions?.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {sub.product_name} - {sub.customer_name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
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
          <Button variant="outline" size="sm" onClick={navigateBack}>
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
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {item.type === 'folder' ? (
                    <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <File className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{item.name}</p>
                    {item.type === 'file' && (
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {item.size !== undefined && (
                          <span>{formatFileSize(item.size)}</span>
                        )}
                        {item.subscription && (
                          <div className="flex items-center gap-2">
                            <span>{item.subscription.customer_name}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getStatusColor(item.subscription.subscription_status)}`}
                            >
                              {item.subscription.subscription_status.replace(/_/g, ' ').toUpperCase()}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
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
            <p>
              {searchTerm || selectedSubscription !== 'all' 
                ? 'Tidak ada file yang sesuai dengan filter.' 
                : 'Tidak ada file di folder ini.'
              }
            </p>
            {currentPath === '/' && !searchTerm && selectedSubscription === 'all' && (
              <p className="text-sm mt-2">File yang di-deploy oleh pengguna akan muncul di sini.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};