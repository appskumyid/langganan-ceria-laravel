
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Youtube, Facebook, Linkedin } from "lucide-react";
import { Instagram } from "lucide-react";


const formSchema = z.object({
  store_name: z.string().min(1, "Nama toko wajib diisi."),
  about_store: z.string().optional(),
  phone_number: z.string().min(1, "Nomor HP wajib diisi.").refine(val => val.startsWith("62"), {
    message: "Nomor HP harus diawali dengan 62.",
  }),
  store_address: z.string().min(1, "Alamat wajib diisi."),
  instagram_url: z.string().url({ message: "URL Instagram tidak valid." }).or(z.literal("")).optional(),
  youtube_url: z.string().url({ message: "URL Youtube tidak valid." }).or(z.literal("")).optional(),
  facebook_url: z.string().url({ message: "URL Facebook tidak valid." }).or(z.literal("")).optional(),
  linkedin_url: z.string().url({ message: "URL LinkedIn tidak valid." }).or(z.literal("")).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EcommerceStoreFormProps {
  subscription: Tables<'user_subscriptions'>;
}

const fetchStoreDetails = async (subscriptionId: string) => {
  const { data, error } = await supabase
    .from('store_details')
    .select('*')
    .eq('user_subscription_id', subscriptionId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

const EcommerceStoreForm = ({ subscription }: EcommerceStoreFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: storeDetails, isLoading } = useQuery({
    queryKey: ['storeDetails', subscription.id],
    queryFn: () => fetchStoreDetails(subscription.id),
    enabled: !!subscription.id,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      store_name: storeDetails?.store_name ?? "",
      about_store: storeDetails?.about_store ?? "",
      phone_number: storeDetails?.phone_number ?? "",
      store_address: storeDetails?.store_address ?? "",
      instagram_url: storeDetails?.instagram_url ?? "",
      youtube_url: storeDetails?.youtube_url ?? "",
      facebook_url: storeDetails?.facebook_url ?? "",
      linkedin_url: storeDetails?.linkedin_url ?? "",
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from('store_details')
        .upsert({
          id: storeDetails?.id, // Let Supabase handle ID generation on insert
          user_subscription_id: subscription.id,
          user_id: user.id,
          ...values,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sukses!",
        description: "Detail toko berhasil disimpan.",
      });
      queryClient.invalidateQueries({ queryKey: ['storeDetails', subscription.id] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error!",
        description: `Gagal menyimpan data: ${error.message}`,
      });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(data => upsertMutation.mutate(data))} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="store_name" render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Toko</FormLabel>
              <FormControl><Input placeholder="Contoh: Toko Barokah" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone_number" render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor HP</FormLabel>
              <FormControl><Input placeholder="Contoh: 6281234567890" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="about_store" render={({ field }) => (
          <FormItem>
            <FormLabel>Tentang Toko</FormLabel>
            <FormControl><Textarea placeholder="Jelaskan sedikit tentang toko Anda" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="store_address" render={({ field }) => (
          <FormItem>
            <FormLabel>Alamat Toko</FormLabel>
            <FormControl><Textarea placeholder="Masukkan alamat lengkap toko" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <h3 className="text-lg font-medium pt-4">Tautan Media Sosial (Opsional)</h3>
        <div className="space-y-6">
          <FormField control={form.control} name="instagram_url" render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><Instagram className="h-4 w-4" /> Instagram</FormLabel>
              <FormControl><Input placeholder="https://instagram.com/tokoanda" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="facebook_url" render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><Facebook className="h-4 w-4" /> Facebook</FormLabel>
              <FormControl><Input placeholder="https://facebook.com/tokoanda" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="youtube_url" render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><Youtube className="h-4 w-4" /> Youtube</FormLabel>
              <FormControl><Input placeholder="https://youtube.com/c/tokoanda" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="linkedin_url" render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><Linkedin className="h-4 w-4" /> LinkedIn</FormLabel>
              <FormControl><Input placeholder="https://linkedin.com/company/tokoanda" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        
        <div className="pt-4">
          <h3 className="text-lg font-medium">Produk Toko</h3>
          <p className="text-sm text-muted-foreground mb-4">Fitur untuk menambah dan mengelola produk akan segera tersedia.</p>
          <Button type="button" variant="outline" disabled>Kelola Produk (Segera Hadir)</Button>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={upsertMutation.isPending}>
            {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EcommerceStoreForm;
