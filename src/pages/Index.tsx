
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Selamat Datang di Sistem Absensi
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Halo, {user?.email}!
              </p>
              <p className="text-gray-500">
                Dashboard absensi akan segera hadir di sini.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
