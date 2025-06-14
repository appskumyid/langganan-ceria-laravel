
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const AdminSubscriptionDetail = () => {
  const { subscriptionId } = useParams();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Detail Langganan</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Langganan</CardTitle>
          <CardDescription>
            Detail untuk langganan dengan ID: {subscriptionId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Fitur untuk mengelola langganan ini akan segera tersedia di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptionDetail;
