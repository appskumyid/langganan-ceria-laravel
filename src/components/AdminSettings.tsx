import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

// Schemas for form validation
const companyFormSchema = z.object({
  company_name: z.string().min(1, "Nama perusahaan wajib diisi."),
})

const contactFormSchema = z.object({
  contact_address: z.string().min(1, "Alamat wajib diisi."),
  contact_whatsapp_number: z.string().min(1, "Nomor WhatsApp wajib diisi."),
  contact_maps_embed_url: z.string().url("URL Google Maps tidak valid.").min(1, "URL Maps wajib diisi."),
})

const mailchimpFormSchema = z.object({
  mailchimp_api_key: z.string().min(1, "API Key wajib diisi."),
  mailchimp_list_id: z.string().min(1, "List ID wajib diisi."),
})

const gatewayFormSchema = z.object({
  gateway_secret_key: z.string().min(1, "Secret Key wajib diisi."),
  gateway_public_key: z.string().min(1, "Public Key wajib diisi."),
})

const footerFormSchema = z.object({
  footer_address: z.string().min(1, "Alamat wajib diisi."),
  footer_phone: z.string().min(1, "Nomor telepon wajib diisi."),
  footer_instagram_url: z.string().url("URL Instagram tidak valid.").optional().or(z.literal("")),
  footer_youtube_url: z.string().url("URL YouTube tidak valid.").optional().or(z.literal("")),
  footer_tiktok_url: z.string().url("URL TikTok tidak valid.").optional().or(z.literal("")),
})

const bannerFormSchema = z.object({
  banner_image_1: z.string().url("URL gambar 1 tidak valid.").min(1, "URL gambar 1 wajib diisi."),
  banner_image_2: z.string().url("URL gambar 2 tidak valid.").min(1, "URL gambar 2 wajib diisi."),
  banner_image_3: z.string().url("URL gambar 3 tidak valid.").min(1, "URL gambar 3 wajib diisi."),
})

const popupFormSchema = z.object({
  popup_enabled: z.boolean(),
  popup_title: z.string().min(1, "Judul popup wajib diisi."),
  popup_content: z.string().min(1, "Konten popup wajib diisi."),
  popup_image_url: z.string().url("URL gambar tidak valid.").optional().or(z.literal("")),
})

// Types
type CompanyFormValues = z.infer<typeof companyFormSchema>
type ContactFormValues = z.infer<typeof contactFormSchema>
type MailchimpFormValues = z.infer<typeof mailchimpFormSchema>
type GatewayFormValues = z.infer<typeof gatewayFormSchema>
type FooterFormValues = z.infer<typeof footerFormSchema>
type BannerFormValues = z.infer<typeof bannerFormSchema>
type PopupFormValues = z.infer<typeof popupFormSchema>

// Function to fetch settings
const fetchSettings = async () => {
  const { data, error } = await supabase.from("app_settings").select("key, value")
  if (error) throw new Error(error.message)
  
  // Transform array into a key-value object
  return data.reduce((acc, { key, value }) => {
    acc[key] = value
    return acc
  }, {} as Record<string, string>)
}

// Function to save settings
const saveSettings = async (settings: { key: string; value: string | null }[]) => {
  console.log("Upserting settings to Supabase:", settings)
  const { error } = await supabase.from("app_settings").upsert(settings)
  if (error) {
    console.error("Supabase upsert error:", error)
    throw new Error(error.message)
  }
}

export default function AdminSettings() {
  const queryClient = useQueryClient()

  const { data: settings, isLoading: isLoadingSettings, error: settingsError } = useQuery({
    queryKey: ["app_settings"],
    queryFn: fetchSettings,
  })

  useEffect(() => {
    if (settingsError) {
      console.error("Error fetching settings:", settingsError)
      toast.error("Gagal memuat pengaturan.", {
        description: settingsError.message,
      })
    }
  }, [settingsError])

  const { mutate, isPending } = useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      console.log("Settings saved successfully!")
      toast.success("Pengaturan berhasil disimpan!")
      queryClient.invalidateQueries({ queryKey: ["app_settings"] })
      queryClient.invalidateQueries({ queryKey: ["company_name"] })
      queryClient.invalidateQueries({ queryKey: ["contact_settings"] })
      queryClient.invalidateQueries({ queryKey: ["footer_settings"] })
      queryClient.invalidateQueries({ queryKey: ["banner_settings"] })
      queryClient.invalidateQueries({ queryKey: ["popup_settings"] })
    },
    onError: (error) => {
      console.error("Failed to save settings mutation:", error)
      toast.error("Gagal menyimpan pengaturan:", {
        description: error.message,
      })
    },
  })

  const companyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      company_name: "",
    },
  })

  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      contact_address: "",
      contact_whatsapp_number: "",
      contact_maps_embed_url: "",
    },
  })

  const mailchimpForm = useForm<MailchimpFormValues>({
    resolver: zodResolver(mailchimpFormSchema),
    defaultValues: {
      mailchimp_api_key: "",
      mailchimp_list_id: "",
    },
  })

  const gatewayForm = useForm<GatewayFormValues>({
    resolver: zodResolver(gatewayFormSchema),
    defaultValues: {
      gateway_secret_key: "",
      gateway_public_key: "",
    },
  })

  const footerForm = useForm<FooterFormValues>({
    resolver: zodResolver(footerFormSchema),
    defaultValues: {
      footer_address: "",
      footer_phone: "",
      footer_instagram_url: "",
      footer_youtube_url: "",
      footer_tiktok_url: "",
    },
  })

  const bannerForm = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      banner_image_1: "",
      banner_image_2: "",
      banner_image_3: "",
    },
  })

  const popupForm = useForm<PopupFormValues>({
    resolver: zodResolver(popupFormSchema),
    defaultValues: {
      popup_enabled: false,
      popup_title: "",
      popup_content: "",
      popup_image_url: "",
    },
  })

  useEffect(() => {
    if (settings) {
      console.log("Settings loaded, resetting forms:", settings)
      companyForm.reset({
        company_name: settings.company_name || "",
      })
      contactForm.reset({
        contact_address: settings.contact_address || "",
        contact_whatsapp_number: settings.contact_whatsapp_number || "",
        contact_maps_embed_url: settings.contact_maps_embed_url || "",
      })
      mailchimpForm.reset({
        mailchimp_api_key: settings.mailchimp_api_key || "",
        mailchimp_list_id: settings.mailchimp_list_id || "",
      })
      gatewayForm.reset({
        gateway_secret_key: settings.gateway_secret_key || "",
        gateway_public_key: settings.gateway_public_key || "",
      })
      footerForm.reset({
        footer_address: settings.footer_address || "",
        footer_phone: settings.footer_phone || "",
        footer_instagram_url: settings.footer_instagram_url || "",
        footer_youtube_url: settings.footer_youtube_url || "",
        footer_tiktok_url: settings.footer_tiktok_url || "",
      })
      bannerForm.reset({
        banner_image_1: settings.banner_image_1 || "",
        banner_image_2: settings.banner_image_2 || "",
        banner_image_3: settings.banner_image_3 || "",
      })
      popupForm.reset({
        popup_enabled: settings.popup_enabled === 'true',
        popup_title: settings.popup_title || "",
        popup_content: settings.popup_content || "",
        popup_image_url: settings.popup_image_url || "",
      })
    }
  }, [settings, companyForm, contactForm, mailchimpForm, gatewayForm, footerForm, bannerForm, popupForm])

  const onCompanySubmit = (values: CompanyFormValues) => {
    const settingsToSave = Object.entries(values).map(([key, value]) => ({
      key,
      value,
    }))
    console.log("Attempting to save Company settings:", settingsToSave)
    mutate(settingsToSave)
  }

  const onContactSubmit = (values: ContactFormValues) => {
    const settingsToSave = Object.entries(values).map(([key, value]) => ({
      key,
      value,
    }))
    console.log("Attempting to save Contact settings:", settingsToSave)
    mutate(settingsToSave)
  }

  const onMailchimpSubmit = (values: MailchimpFormValues) => {
    const settingsToSave = Object.entries(values).map(([key, value]) => ({
      key,
      value,
    }))
    console.log("Attempting to save Mailchimp settings:", settingsToSave)
    mutate(settingsToSave)
  }

  const onGatewaySubmit = (values: GatewayFormValues) => {
    const settingsToSave = Object.entries(values).map(([key, value]) => ({
      key,
      value,
    }))
    console.log("Attempting to save Gateway settings:", settingsToSave)
    mutate(settingsToSave)
  }

  const onFooterSubmit = (values: FooterFormValues) => {
    const settingsToSave = Object.entries(values).map(([key, value]) => ({
      key,
      value: value || "",
    }))
    console.log("Attempting to save Footer settings:", settingsToSave)
    mutate(settingsToSave)
  }

  const onBannerSubmit = (values: BannerFormValues) => {
    const settingsToSave = Object.entries(values).map(([key, value]) => ({
      key,
      value,
    }))
    console.log("Attempting to save Banner settings:", settingsToSave)
    mutate(settingsToSave)
  }

  const onPopupSubmit = (values: PopupFormValues) => {
    const settingsToSave = Object.entries(values).map(([key, value]) => ({
      key,
      value: typeof value === 'boolean' ? value.toString() : value,
    }))
    console.log("Attempting to save Popup settings:", settingsToSave)
    mutate(settingsToSave)
  }
  
  const isSaving = isPending;

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Memuat pengaturan...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Perusahaan</CardTitle>
          <CardDescription>
            Atur nama perusahaan yang akan ditampilkan di website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...companyForm}>
            <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
              <FormField
                control={companyForm.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Perusahaan</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama perusahaan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Pengaturan Perusahaan
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Kontak</CardTitle>
          <CardDescription>
            Atur informasi kontak yang akan ditampilkan di halaman contact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...contactForm}>
            <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4">
              <FormField
                control={contactForm.control}
                name="contact_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Masukkan alamat lengkap" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="contact_whatsapp_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="628xxxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="contact_maps_embed_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Google Maps Embed</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.google.com/maps/embed?pb=..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Pengaturan Kontak
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Footer</CardTitle>
          <CardDescription>
            Atur informasi footer yang akan ditampilkan di halaman website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...footerForm}>
            <form onSubmit={footerForm.handleSubmit(onFooterSubmit)} className="space-y-4">
              <FormField
                control={footerForm.control}
                name="footer_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Masukkan alamat perusahaan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={footerForm.control}
                name="footer_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nomor telepon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={footerForm.control}
                name="footer_instagram_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={footerForm.control}
                name="footer_youtube_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL YouTube</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com/@username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={footerForm.control}
                name="footer_tiktok_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL TikTok</FormLabel>
                    <FormControl>
                      <Input placeholder="https://tiktok.com/@username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Pengaturan Footer
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Banner</CardTitle>
          <CardDescription>
            Atur gambar banner yang akan ditampilkan di halaman home.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...bannerForm}>
            <form onSubmit={bannerForm.handleSubmit(onBannerSubmit)} className="space-y-4">
              <FormField
                control={bannerForm.control}
                name="banner_image_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Gambar Banner 1</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image1.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bannerForm.control}
                name="banner_image_2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Gambar Banner 2</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image2.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bannerForm.control}
                name="banner_image_3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Gambar Banner 3</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image3.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Pengaturan Banner
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrasi Mailchimp</CardTitle>
          <CardDescription>
            Hubungkan akun Mailchimp Anda untuk sinkronisasi daftar email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...mailchimpForm}>
            <form onSubmit={mailchimpForm.handleSubmit(onMailchimpSubmit)} className="space-y-4">
              <FormField
                control={mailchimpForm.control}
                name="mailchimp_api_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan API Key Mailchimp Anda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={mailchimpForm.control}
                name="mailchimp_list_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>List ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan ID daftar email Anda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Pengaturan Mailchimp
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway</CardTitle>
          <CardDescription>
            Atur koneksi ke payment gateway seperti Midtrans atau Xendit.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Form {...gatewayForm}>
            <form onSubmit={gatewayForm.handleSubmit(onGatewaySubmit)} className="space-y-4">
              <FormField
                control={gatewayForm.control}
                name="gateway_secret_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secret Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Masukkan Secret Key payment gateway" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={gatewayForm.control}
                name="gateway_public_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Public Key</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan Public Key payment gateway" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Pengaturan Gateway
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Popup</CardTitle>
          <CardDescription>
            Atur popup yang akan muncul ketika pengguna pertama kali masuk ke website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...popupForm}>
            <form onSubmit={popupForm.handleSubmit(onPopupSubmit)} className="space-y-4">
              <FormField
                control={popupForm.control}
                name="popup_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Aktifkan Popup</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Tampilkan popup ketika pengguna pertama kali masuk
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={popupForm.control}
                name="popup_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Popup</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan judul popup" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={popupForm.control}
                name="popup_content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konten Popup</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Masukkan konten popup" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={popupForm.control}
                name="popup_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Gambar Popup (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Pengaturan Popup
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
