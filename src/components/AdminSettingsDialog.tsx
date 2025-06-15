
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

const settingsSchema = z.object({
  mailchimpApiKey: z.string().optional(),
  mailchimpAudienceId: z.string().optional(),
  paymentGateway: z.enum(["midtrans", "xendit"]).default("midtrans"),
  paymentClientKey: z.string().optional(),
  paymentServerKey: z.string().optional(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

interface AdminSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminSettingsDialog({ open, onOpenChange }: AdminSettingsDialogProps) {
  const { toast } = useToast()
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    // TODO: Load default values from a backend service in the future
    defaultValues: {
      paymentGateway: "midtrans",
    },
  })

  function onSubmit(data: SettingsFormValues) {
    // TODO: Implement actual API call to save settings securely
    console.log("Saving settings:", data)
    toast({
      title: "Pengaturan Disimpan",
      description: "Pengaturan Anda telah berhasil disimpan (simulasi).",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Pengaturan Admin</DialogTitle>
              <DialogDescription>
                Atur integrasi pihak ketiga seperti layanan email dan payment gateway di sini.
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="mailchimp" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mailchimp">Mailchimp</TabsTrigger>
                <TabsTrigger value="payment">Payment Gateway</TabsTrigger>
              </TabsList>
              <TabsContent value="mailchimp" className="pt-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="mailchimpApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key Mailchimp</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan API Key Mailchimp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mailchimpAudienceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Audience ID Mailchimp</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan Audience ID Mailchimp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              <TabsContent value="payment" className="pt-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentGateway"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Pilih Provider</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-row space-x-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="midtrans" />
                              </FormControl>
                              <FormLabel className="font-normal">Midtrans</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="xendit" />
                              </FormControl>
                              <FormLabel className="font-normal">Xendit</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="paymentClientKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Key</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan Client Key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="paymentServerKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Server Key</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan Server Key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Perubahan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
