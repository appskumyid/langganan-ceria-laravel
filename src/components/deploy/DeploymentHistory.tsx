
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Github, Server, Calendar, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeploymentRecord {
  id: string;
  config_name: string;
  deploy_type: 'github' | 'server';
  target_url: string;
  deployed_files: string[];
  deployment_status: 'success' | 'failed';
  deployed_at: string;
  error_message?: string;
}

export const DeploymentHistory = () => {
  const { toast } = useToast();

  // Mock data for deployment history - in real app this would come from database
  const { data: deployments, isLoading } = useQuery({
    queryKey: ['deployment_history'],
    queryFn: async () => {
      // This would be a real query to deployment_history table
      // For now, returning mock data
      const mockDeployments: DeploymentRecord[] = [
        {
          id: '1',
          config_name: 'Production GitHub',
          deploy_type: 'github',
          target_url: 'https://github.com/username/repo',
          deployed_files: ['index.html', 'style.css', 'script.js', 'data.json'],
          deployment_status: 'success',
          deployed_at: new Date().toISOString(),
        },
        {
          id: '2',
          config_name: 'Staging Server',
          deploy_type: 'server',
          target_url: 'http://192.168.1.100',
          deployed_files: ['index.html', 'data.json'],
          deployment_status: 'failed',
          deployed_at: new Date(Date.now() - 86400000).toISOString(),
          error_message: 'SSH connection failed',
        },
      ];
      
      return mockDeployments;
    },
  });

  const handleViewDeployment = (deployment: DeploymentRecord) => {
    if (deployment.target_url) {
      window.open(deployment.target_url, '_blank');
    } else {
      toast({
        title: 'URL tidak tersedia',
        description: 'URL deployment tidak dapat diakses',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Berhasil</Badge>;
      case 'failed':
        return <Badge variant="destructive">Gagal</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'github':
        return <Github className="h-4 w-4" />;
      case 'server':
        return <Server className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Riwayat Deployment
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p>Loading deployment history...</p>
          </div>
        ) : deployments && deployments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Konfigurasi</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.map((deployment) => (
                <TableRow key={deployment.id}>
                  <TableCell className="font-medium">
                    {deployment.config_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(deployment.deploy_type)}
                      <span className="capitalize">{deployment.deploy_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={deployment.target_url}>
                      {deployment.target_url}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {deployment.deployed_files.length} file(s)
                      <div className="text-xs text-gray-500 mt-1">
                        {deployment.deployed_files.slice(0, 2).join(', ')}
                        {deployment.deployed_files.length > 2 && '...'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {getStatusBadge(deployment.deployment_status)}
                      {deployment.error_message && (
                        <div className="text-xs text-red-500 mt-1">
                          {deployment.error_message}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(deployment.deployed_at).toLocaleDateString('id-ID')}
                      <div className="text-xs text-gray-500">
                        {new Date(deployment.deployed_at).toLocaleTimeString('id-ID')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDeployment(deployment)}
                        disabled={deployment.deployment_status === 'failed'}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Lihat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDeployment(deployment)}
                        disabled={deployment.deployment_status === 'failed'}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada riwayat deployment.</p>
            <p className="text-sm">Deployment pertama Anda akan muncul di sini.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
