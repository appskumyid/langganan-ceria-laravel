import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trash2, Globe } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Domain {
  id: string;
  domain_name: string;
  is_enabled: boolean;
  created_at: string;
}

const DomainManager = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchDomains();
    }
  }, [user]);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDomains(data || []);
    } catch (error) {
      console.error('Error fetching domains:', error);
      toast({
        title: "Error",
        description: "Gagal memuat domain",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('domains')
        .insert({
          user_id: user.id,
          domain_name: newDomain.trim(),
          is_enabled: domains.length === 0 // Enable first domain automatically
        });

      if (error) throw error;

      setNewDomain('');
      fetchDomains();
      toast({
        title: "Berhasil",
        description: "Domain berhasil ditambahkan"
      });
    } catch (error: any) {
      console.error('Error adding domain:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan domain",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDomain = async (domainId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('domains')
        .update({ is_enabled: true })
        .eq('id', domainId);

      if (error) throw error;

      fetchDomains();
      toast({
        title: "Berhasil",
        description: "Domain aktif berhasil diubah"
      });
    } catch (error: any) {
      console.error('Error updating domain:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal mengubah domain aktif",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteDomain = async (domainId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus domain ini?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;

      fetchDomains();
      toast({
        title: "Berhasil",
        description: "Domain berhasil dihapus"
      });
    } catch (error: any) {
      console.error('Error deleting domain:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus domain",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const enabledDomain = domains.find(d => d.is_enabled);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Manajemen Domain
        </CardTitle>
        <CardDescription>
          Kelola domain kustom untuk website Anda. Hanya satu domain yang dapat aktif pada satu waktu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Domain Form */}
        <form onSubmit={addDomain} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Tambah Domain Baru</Label>
            <div className="flex gap-2">
              <Input
                id="domain"
                type="text"
                placeholder="contoh: mydomain.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                disabled={isSubmitting}
                className="flex-1"
              />
              <Button type="submit" disabled={isSubmitting || !newDomain.trim()}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tambah
              </Button>
            </div>
          </div>
        </form>

        {/* Active Domain Info */}
        {enabledDomain && (
          <Alert>
            <Globe className="h-4 w-4" />
            <AlertDescription>
              Domain aktif: <strong>{enabledDomain.domain_name}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Domain List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Domain Terdaftar</h3>
          
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : domains.length === 0 ? (
            <p className="text-muted-foreground text-center p-4">
              Belum ada domain yang terdaftar
            </p>
          ) : (
            <RadioGroup
              value={enabledDomain?.id || ''}
              onValueChange={toggleDomain}
              className="space-y-3"
            >
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={domain.id} id={domain.id} />
                    <div>
                      <Label htmlFor={domain.id} className="font-medium cursor-pointer">
                        {domain.domain_name}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Ditambahkan: {new Date(domain.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {domain.is_enabled && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Aktif
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDomain(domain.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainManager;