
import type { Tables } from '@/integrations/supabase/types';

interface DigitalInvitationFormProps {
  subscription: Tables<'user_subscriptions'>;
}

const DigitalInvitationForm = ({ subscription }: DigitalInvitationFormProps) => {
  return (
    <div>
      <p>Formulir untuk Undangan Digital akan segera tersedia di sini.</p>
      <p className="text-sm text-muted-foreground">Subscription ID: {subscription.id}</p>
    </div>
  );
};

export default DigitalInvitationForm;
