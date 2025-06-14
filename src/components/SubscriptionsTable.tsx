
import type { Tables } from '@/integrations/supabase/types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge, badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface SubscriptionsTableProps {
  subscriptions: Tables<'user_subscriptions'>[];
}

const getStatusVariant = (status: string): VariantProps<typeof badgeVariants>['variant'] => {
  switch (status) {
    case 'active':
      return 'success';
    case 'pending_payment':
      return 'warning';
    case 'waiting_confirmation':
      return 'info';
    case 'expired':
      return 'destructive';
    case 'cancelled':
      return 'secondary';
    default:
      return 'default';
  }
};

const SubscriptionsTable = ({ subscriptions }: SubscriptionsTableProps) => {
    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px]">Produk</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tgl. Langganan</TableHead>
                            <TableHead>Tgl. Berakhir</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscriptions.map(sub => (
                            <TableRow key={sub.id}>
                                <TableCell className="font-medium">{sub.product_name}</TableCell>
                                <TableCell>{sub.product_price}{sub.product_period}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(sub.subscription_status)}>
                                        {sub.subscription_status.replace(/_/g, ' ').toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>{sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString('id-ID') : '-'}</TableCell>
                                <TableCell>{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString('id-ID') : '-'}</TableCell>
                                <TableCell className="text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link to={`/my-subscriptions/${sub.id}`}>
                                            Detail
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default SubscriptionsTable;
