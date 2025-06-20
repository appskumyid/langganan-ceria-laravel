
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Mail, X, MessageCircle } from "lucide-react";
import type { Subscription } from './utils';
import type { UseMutationResult } from '@tanstack/react-query';

interface EmailReminderDialogProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  sendEmailMutation: UseMutationResult<any, Error, { to: string, subject: string, message: string, customerName: string }, unknown>;
}

const emailTemplates = {
  'expiring': {
    subject: 'Masa Aktif Langganan Anda Akan Segera Berakhir',
    body: `Halo {{nama_pelanggan}},

Kami ingin menginformasikan bahwa langganan Anda untuk produk {{produk}} akan berakhir pada {{expired_date}}.

Silakan lakukan perpanjangan untuk terus menggunakan layanan kami tanpa gangguan.

Terima kasih,
Tim Sistem Langganan`
  },
  'renewal': {
    subject: 'Perpanjangan Langganan Dibutuhkan',
    body: `Halo {{nama_pelanggan}},

Langganan Anda untuk produk {{produk}} memerlukan perpanjangan.

Tanggal berakhir: {{expired_date}}

Segera perpanjang untuk tetap menggunakan layanan tanpa gangguan.

Terima kasih,
Tim Sistem Langganan`
  },
  'promo': {
    subject: 'Promo Khusus Perpanjangan Langganan',
    body: `Halo {{nama_pelanggan}},

Dapatkan promo khusus untuk perpanjangan langganan {{produk}} Anda!

Diskon 20% untuk perpanjangan sebelum {{expired_date}}.

Jangan lewatkan kesempatan ini!

Terima kasih,
Tim Sistem Langganan`
  }
};

export const EmailReminderDialog = ({ 
  subscription, 
  isOpen, 
  onOpenChange, 
  sendEmailMutation 
}: EmailReminderDialogProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [emailContent, setEmailContent] = useState<string>('');
  const [subject, setSubject] = useState<string>('');

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const template = emailTemplates[templateKey as keyof typeof emailTemplates];
    
    if (subscription && template) {
      const processedSubject = template.subject;
      const processedBody = template.body
        .replace(/{{nama_pelanggan}}/g, subscription.customer_name)
        .replace(/{{produk}}/g, subscription.product_name)
        .replace(/{{expired_date}}/g, subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString('id-ID') : 'Tidak ditentukan');
      
      setSubject(processedSubject);
      setEmailContent(processedBody);
    }
  };

  const handleSendEmail = () => {
    if (subscription && emailContent && subject) {
      sendEmailMutation.mutate({
        to: subscription.customer_email,
        subject: subject,
        message: emailContent,
        customerName: subscription.customer_name
      });
      onOpenChange(false);
      setSelectedTemplate('');
      setEmailContent('');
      setSubject('');
    }
  };

  const handleSendWhatsApp = () => {
    if (subscription && emailContent) {
      const whatsappMessage = `${subject}\n\n${emailContent}`;
      const phoneNumber = subscription.customer_phone?.replace(/[^0-9]/g, '');
      const whatsappUrl = `https://wa.me/62${phoneNumber?.startsWith('0') ? phoneNumber.substring(1) : phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedTemplate('');
    setEmailContent('');
    setSubject('');
  };

  if (!subscription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Kirim Peringatan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Detail Pelanggan:</h4>
            <p><strong>Email:</strong> {subscription.customer_email}</p>
            <p><strong>WhatsApp:</strong> {subscription.customer_phone}</p>
            <p><strong>Produk:</strong> {subscription.product_name}</p>
            <p><strong>Tanggal Expired:</strong> {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString('id-ID') : 'Tidak ditentukan'}</p>
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Template Pesan</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih template pesan..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expiring">Langganan akan berakhir</SelectItem>
                <SelectItem value="renewal">Perpanjangan dibutuhkan</SelectItem>
                <SelectItem value="promo">Promo khusus perpanjangan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          {selectedTemplate && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Subject pesan..."
              />
            </div>
          )}

          {/* Message Content */}
          {selectedTemplate && (
            <div className="space-y-2">
              <Label htmlFor="content">Isi Pesan</Label>
              <Textarea
                id="content"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                placeholder="Isi pesan..."
                className="min-h-[200px]"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button 
              onClick={handleSendWhatsApp} 
              disabled={!emailContent || !subject}
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Kirim WhatsApp
            </Button>
            <Button 
              onClick={handleSendEmail} 
              disabled={!emailContent || !subject || sendEmailMutation.isPending}
            >
              <Mail className="h-4 w-4 mr-2" />
              {sendEmailMutation.isPending ? 'Mengirim...' : 'Kirim Email'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
