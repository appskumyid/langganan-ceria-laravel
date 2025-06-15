
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { Subscription } from './utils';
import { ALL_STATUSES } from './utils';
import type { UseMutationResult } from '@tanstack/react-query';

interface EditSubscriptionDialogProps {
    subscription: Subscription | null;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    updateMutation: UseMutationResult<void, Error, { id: string; status: string; expires_at?: string | null | undefined; rejection_reason?: string | null | undefined; }, unknown>;
    sendEmailMutation: UseMutationResult<any, Error, { to: string; subject: string; message: string; customerName: string; }, unknown>;
}

export const EditSubscriptionDialog = ({ subscription, isOpen, onOpenChange, updateMutation, sendEmailMutation }: EditSubscriptionDialogProps) => {
    const { toast } = useToast();
    const [newStatus, setNewStatus] = React.useState('');
    const [emailSubject, setEmailSubject] = React.useState('');
    const [emailMessage, setEmailMessage] = React.useState('');
    
    React.useEffect(() => {
        if (subscription) {
            setNewStatus(subscription.subscription_status);
            setEmailSubject('');
            setEmailMessage('');
        }
    }, [subscription]);

    const handleSaveStatus = () => {
        if (subscription && newStatus) {
            updateMutation.mutate({ id: subscription.id, status: newStatus });
            if (!updateMutation.isPending) {
                onOpenChange(false);
            }
        }
    };
    
    const handleSendMessage = () => {
        if (subscription && emailSubject && emailMessage) {
            sendEmailMutation.mutate({
                to: subscription.customer_email,
                subject: emailSubject,
                message: emailMessage,
                customerName: subscription.customer_name,
            }, {
                onSuccess: () => {
                    setEmailSubject('');
                    setEmailMessage('');
                }
            });
        } else {
            toast({ title: 'Peringatan', description: 'Subjek dan isi pesan tidak boleh kosong.', variant: 'destructive' });
        }
    };

    if (!subscription) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Detail Langganan</DialogTitle>
              <DialogDescription>
                Kelola langganan untuk {subscription?.product_name} oleh {subscription?.customer_name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={newStatus}
                  onValueChange={(value) => setNewStatus(value)}
                >
                  <SelectTrigger id="status" className="col-span-3">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 py-4 border-t">
              <h3 className="text-md font-medium px-1">Kirim Pesan ke Pelanggan</h3>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email-subject" className="text-right">
                  Subjek
                </Label>
                <Input
                  id="email-subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="col-span-3"
                  placeholder="Subjek email..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email-message" className="text-right">
                  Pesan
                </Label>
                <Textarea
                  id="email-message"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="col-span-3"
                  placeholder="Tulis pesan Anda di sini..."
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row sm:justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
              <Button onClick={handleSaveStatus} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Simpan Status
              </Button>
              <Button onClick={handleSendMessage} disabled={sendEmailMutation.isPending}>
                {sendEmailMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Kirim Pesan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    );
}
