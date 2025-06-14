
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CompanyServiceManager from './company-profile/CompanyServiceManager';

const profileFormSchema = z.object({
  company_name: z.string().min(1, 'Nama perusahaan harus diisi.'),
  about: z.string().min(1, 'Tentang perusahaan harus diisi.'),
  phone_number: z.string()
    .min(1, 'Nomor HP harus diisi.')
    .startsWith('62', 'Nomor HP harus diawali dengan 62.'),
  office_phone_number: z.string().optional(),
  address: z.string().min(1, 'Alamat harus diisi.'),
  maps_url: z.string().url({ message: "URL tidak valid." }).or(z.literal('')).optional(),
  instagram_url: z.string().url({ message: "URL tidak valid." }).or(z.literal('')).optional(),
  youtube_url: z.string().url({ message: "URL tidak valid." }).or(z.literal('')).optional(),
  facebook_url: z.string().url({ message: "URL tidak valid." }).or(z.literal('')).optional(),
  linkedin_url: z.string().url({ message: "URL tidak valid." }).or(z.literal('')).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface CompanyProfileFormProps {
  subscription: Tables<'user_subscriptions'>;
}

const fetchCompanyProfile = async (subscriptionId: string) => {
  const { data, error } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('user_subscription_id', subscriptionId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
    throw error;
  }
  return data;
};

const CompanyProfileForm = ({ subscription }: CompanyProfileFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['companyProfile', subscription.id],
    queryFn: () => fetchCompanyProfile(subscription.id),
    enabled: !!subscription.id,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      company_name: '',
      about: '',
      phone_number: '',
      office_phone_number: '',
      address: '',
      maps_url: '',
      instagram_url: '',
      youtube_url: '',
      facebook_url: '',
      linkedin_url: '',
    },
  });

  useEffect(() => {
    if (profileData) {
      form.reset({
        company_name: profileData.company_name || '',
        about: profileData.about || '',
        phone_number: profileData.phone_number || '',
        office_phone_number: profileData.office_phone_number || '',
        address: profileData.address || '',
        maps_url: profileData.maps_url || '',
        instagram_url: profileData.instagram_url || '',
        youtube_url: profileData.youtube_url || '',
        facebook_url: profileData.facebook_url || '',
        linkedin_url: profileData.linkedin_url || '',
      });
    } else {
        form.reset({
            company_name: '',
            about: '',
            phone_number: '',
            office_phone_number: '',
            address: '',
            maps_url: '',
            instagram_url: '',
            youtube_url: '',
            facebook_url: '',
            linkedin_url: '',
        })
    }
  }, [profileData, form]);

  const upsertMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!user) throw new Error('User not authenticated.');

      const upsertData: TablesInsert<'company_profiles'> = {
        id: profileData?.id,
        user_subscription_id: subscription.id,
        user_id: user.id,
        company_name: values.company_name,
        about: values.about,
        phone_number: values.phone_number,
        address: values.address,
        office_phone_number: values.office_phone_number || null,
        maps_url: values.maps_url || null,
        instagram_url: values.instagram_url || null,
        youtube_url: values.youtube_url || null,
        facebook_url: values.facebook_url || null,
        linkedin_url: values.linkedin_url || null,
      };

      const { error } = await supabase.from('company_profiles').upsert(upsertData, {
        onConflict: 'user_subscription_id',
      }).select();
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Sukses', description: 'Profil perusahaan berhasil diperbarui.' });
      queryClient.invalidateQueries({ queryKey: ['companyProfile', subscription.id] });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Gagal memperbarui profil: ${error.message}`,
      });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    upsertMutation.mutate(data);
  };
  
  if (isLoadingProfile) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="space-y-8">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nama Perusahaan</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                
                <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tentang Perusahaan</FormLabel>
                    <FormControl><Textarea {...field} rows={4} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nomor HP (WhatsApp)</FormLabel>
                            <FormControl><Input placeholder="6281234567890" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="office_phone_number"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nomor Telepon Kantor (Opsional)</FormLabel>
                            <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                
                <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Alamat</FormLabel>
                    <FormControl><Textarea {...field} rows={2} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                    control={form.control}
                    name="maps_url"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Titik Google Maps (URL)</FormLabel>
                        <FormControl><Input placeholder="https://maps.app.goo.gl/..." {...field} value={field.value ?? ''} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Media Sosial</CardTitle>
                        <CardDescription>Masukkan tautan ke profil media sosial perusahaan Anda.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="instagram_url" render={({ field }) => (
                            <FormItem><FormLabel>Instagram</FormLabel><FormControl><Input placeholder="https://instagram.com/..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="youtube_url" render={({ field }) => (
                            <FormItem><FormLabel>YouTube</FormLabel><FormControl><Input placeholder="https://youtube.com/..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="facebook_url" render={({ field }) => (
                            <FormItem><FormLabel>Facebook</FormLabel><FormControl><Input placeholder="https://facebook.com/..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="linkedin_url" render={({ field }) => (
                            <FormItem><FormLabel>LinkedIn</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                <Button type="submit" disabled={upsertMutation.isPending}>
                    {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Perubahan Profil
                </Button>
                </div>
            </form>
        </Form>
        
        {profileData && (
            <div className="pt-8 border-t">
                <CompanyServiceManager companyProfile={profileData} />
            </div>
        )}
    </div>
  );
};

export default CompanyProfileForm;
