
import type { Tables } from '@/integrations/supabase/types';

interface CompanyProfileFormProps {
  subscription: Tables<'user_subscriptions'>;
}

const CompanyProfileForm = ({ subscription }: CompanyProfileFormProps) => {
  return (
    <div>
      <p>Formulir untuk Profil Perusahaan akan segera tersedia di sini.</p>
      <p className="text-sm text-muted-foreground">Subscription ID: {subscription.id}</p>
    </div>
  );
};

export default CompanyProfileForm;
