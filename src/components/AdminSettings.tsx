
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
import { Loader2 } from "lucide-react"

// Schemas for form validation
const mailchimpFormSchema = z.object({
  mailchimp_api_key: z.string().min(1, "API Key wajib diisi."),
  mailchimp_list_id: z.string().min(1, "List ID wajib diisi."),
})

const gatewayFormSchema = z.object({
  gateway_secret_key: z.string().min(1, "Secret Key wajib diisi."),
  gateway_public_key: z.string().min(1, "Public Key wajib diisi."),
})

// Types
type MailchimpFormValues = z.infer<typeof mailchimpFormSchema>
type GatewayFormValues = z.infer<typeof gatewayFormSchema>

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
  const { error } = await supabase.from("app_settings").upsert(settings)
  if (error) throw new Error(error.message)
}

export default function AdminSettings() {
  const queryClient = useQueryClient()

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["app_settings"],
    queryFn: fetchSettings,
  })

  const { mutate, isPending } = useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      toast.success("Pengaturan berhasil disimpan!")
      queryClient.invalidateQueries({ queryKey: ["app_settings"] })
    },
    onError: (error) => {
      toast.error("Gagal menyimpan pengaturan:", {
        description: error.message,
      })
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

  useEffect(() => {
    if (settings) {
      mailchimpForm.reset({
        mailchimp_api_key: settings.mailchimp_api_key || "",
        mailchimp_list_id: settings.mailchimp_list_id || "",
      })
      gatewayForm.reset({
        gateway_secret_key: settings.gateway_secret_key || "",
        gateway_public_key: settings.gateway_public_key || "",
      })
    }
  }, [settings, mailchimpForm, gatewayForm])

  const onMailchimpSubmit = (values: MailchimpFormValues) => {
    const settingsToSave = Object.entries(values).map(([key, value]) => ({
      key,
      value,
    }))
    mutate(settingsToSave)
  }

  const onGatewaySubmit = (values: GatewayFormValues) => {
    const settingsToSave = Object.entries(values).map(([key, value]) => ({
      key,
      value,
    }))
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
    </div>
  )
}
