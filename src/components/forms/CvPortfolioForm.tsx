
import type { Tables } from '@/integrations/supabase/types';

interface CvPortfolioFormProps {
  subscription: Tables<'user_subscriptions'>;
}

const CvPortfolioForm = ({ subscription }: CvPortfolioFormProps) => {
  return (
    <div>
      <p>Formulir untuk CV / Portofolio akan segera tersedia di sini.</p>
      <p className="text-sm text-muted-foreground">Subscription ID: {subscription.id}</p>
    </div>
  );
};

export default CvPortfolioForm;
