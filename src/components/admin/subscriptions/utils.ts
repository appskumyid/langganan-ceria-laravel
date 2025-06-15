
import type { Tables } from '@/integrations/supabase/types';
import type { VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';

export type Subscription = Tables<'user_subscriptions'>;

export const ALL_STATUSES: Array<Subscription['subscription_status']> = [
  'active',
  'pending_payment',
  'waiting_confirmation',
  'expired',
  'cancelled',
];

export const getStatusVariant = (status: string): VariantProps<typeof badgeVariants>['variant'] => {
    switch (status) {
      case 'active': return 'success';
      case 'pending_payment': return 'warning';
      case 'waiting_confirmation': return 'info';
      case 'expired': return 'destructive';
      case 'cancelled': return 'secondary';
      default: return 'default';
    }
};
