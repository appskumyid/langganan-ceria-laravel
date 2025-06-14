
import type { Tables } from '@/integrations/supabase/types';
import EcommerceStoreForm from '@/components/forms/EcommerceStoreForm';
import CompanyProfileForm from '@/components/forms/CompanyProfileForm';
import CvPortfolioForm from '@/components/forms/CvPortfolioForm';
import DigitalInvitationForm from '@/components/forms/DigitalInvitationForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SubscriptionManagementFormProps {
  subscription: Tables<'user_subscriptions'>;
}

const SubscriptionManagementForms = ({ subscription }: SubscriptionManagementFormProps) => {
  let formComponent = null;
  let title = "Kelola Langganan";
  let description = "Perbarui detail untuk langganan Anda.";

  switch (subscription.product_category) {
    case 'E-Commerce':
      if (subscription.product_type === 'Non-Premium') {
        formComponent = <EcommerceStoreForm subscription={subscription} />;
        title = "Kelola Toko Online Anda";
        description = "Isi detail toko Anda untuk ditampilkan kepada pelanggan.";
      }
      break;
    case 'Company Profile':
      formComponent = <CompanyProfileForm subscription={subscription} />;
      title = "Kelola Profil Perusahaan";
      description = "Lengkapi profil perusahaan Anda.";
      break;
    case 'CV / Portfolio':
      formComponent = <CvPortfolioForm subscription={subscription} />;
      title = "Kelola CV / Portofolio";
      description = "Perbarui informasi CV dan portofolio Anda.";
      break;
    case 'Undangan Digital':
      formComponent = <DigitalInvitationForm subscription={subscription} />;
      title = "Kelola Undangan Digital";
      description = "Atur detail acara untuk undangan Anda.";
      break;
  }

  if (!formComponent) {
    return null; // Atau tampilkan pesan default jika tidak ada form yang cocok
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {formComponent}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagementForms;
