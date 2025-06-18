
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';

const fetchContactSettings = async () => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', [
      'contact_address', 
      'contact_maps_embed_url', 
      'contact_whatsapp_number',
      'company_name'
    ]);
  
  if (error) throw new Error(error.message);
  
  return data.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
};

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    nomorHp: '',
    message: ''
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['contact_settings'],
    queryFn: fetchContactSettings,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama || !formData.email || !formData.nomorHp || !formData.message) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive"
      });
      return;
    }

    const whatsappNumber = settings?.contact_whatsapp_number || '6287886425562';
    const message = `Halo, saya ${formData.nama}%0A%0AEmail: ${formData.email}%0ANomor HP: ${formData.nomorHp}%0A%0APesan:%0A${encodeURIComponent(formData.message)}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Berhasil!",
      description: "Anda akan diarahkan ke WhatsApp"
    });

    // Reset form
    setFormData({
      nama: '',
      email: '',
      nomorHp: '',
      message: ''
    });
  };

  const companyName = settings?.company_name || 'KSAinovasi';
  const contactAddress = settings?.contact_address || 'Alamat belum diatur';
  const mapsEmbedUrl = settings?.contact_maps_embed_url || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hubungi Kami
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kami siap membantu Anda. Hubungi tim {companyName} untuk konsultasi dan informasi lebih lanjut.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Kirim Pesan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <Input
                    id="nama"
                    name="nama"
                    type="text"
                    value={formData.nama}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama lengkap Anda"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="nama@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="nomorHp" className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor HP
                  </label>
                  <Input
                    id="nomorHp"
                    name="nomorHp"
                    type="tel"
                    value={formData.nomorHp}
                    onChange={handleInputChange}
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Pesan
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tulis pesan Anda di sini..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Kirim via WhatsApp
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info & Map */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Kontak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900">Alamat</h3>
                    <p className="text-gray-600">{contactAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900">WhatsApp</h3>
                    <p className="text-gray-600">+{settings?.contact_whatsapp_number || '6287886425562'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600">info@ksainovasi.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google Maps */}
            {!isLoading && mapsEmbedUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Lokasi Kami</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="w-full h-64 rounded-b-lg overflow-hidden">
                    <iframe
                      src={mapsEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Lokasi KSAinovasi"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
};

export default Contact;
