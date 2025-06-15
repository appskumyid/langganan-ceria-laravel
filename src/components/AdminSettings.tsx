
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function AdminSettings() {
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
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mailchimp-api-key">API Key</Label>
              <Input id="mailchimp-api-key" placeholder="Masukkan API Key Mailchimp Anda" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mailchimp-list-id">List ID</Label>
              <Input id="mailchimp-list-id" placeholder="Masukkan ID daftar email Anda" />
            </div>
            <Button>Simpan Pengaturan Mailchimp</Button>
          </form>
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
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gateway-secret-key">Secret Key</Label>
              <Input id="gateway-secret-key" placeholder="Masukkan Secret Key payment gateway" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gateway-public-key">Public Key</Label>
              <Input id="gateway-public-key" placeholder="Masukkan Public Key payment gateway" />
            </div>
            <Button>Simpan Pengaturan Gateway</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
