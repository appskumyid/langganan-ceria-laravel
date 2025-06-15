
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Phone } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useManagedServices } from "@/hooks/useManagedServices";
import { getIcon } from "@/lib/iconMap";
import { Skeleton } from "@/components/ui/skeleton";

const Services = () => {
  const { data: servicesData, isLoading, error } = useManagedServices();

  const handleConsultation = (serviceName: string) => {
    const message = `Halo, saya tertarik dengan layanan ${serviceName}. Bisa minta konsultasi lebih lanjut?`;
    const whatsappUrl = `https://wa.me/6287886425562?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleContact = (serviceName: string) => {
    console.log(`Contact for ${serviceName}`);
  };

  const categories = servicesData ? [...new Set(servicesData.map(s => s.category))] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-bold text-gray-900">
              Sistem Langganan
            </div>
            <div className="flex items-center space-x-6">
              <NavLink 
                to="/home" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </NavLink>
              <NavLink 
                to="/products" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Product
              </NavLink>
              <NavLink 
                to="/services" 
                className="text-primary font-medium px-3 py-2 rounded-md text-sm"
              >
                Service
              </NavLink>
              <NavLink 
                to="/auth" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Masuk
              </NavLink>
              <Button asChild>
                <NavLink to="/auth">
                  Daftar
                </NavLink>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Layanan Kami
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Solusi teknologi terdepan untuk mendukung transformasi digital bisnis Anda dengan layanan profesional berkualitas tinggi
          </p>
        </div>
      </div>

      {/* Services by Category */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading && Array.from({ length: 4 }).map((_, i) => (
            <section key={i} className="mb-16">
                 <div className="mb-8">
                    <Skeleton className="h-8 w-1/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, j) => (
                        <Card key={j}>
                            <CardHeader>
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-6 w-3/4 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full mt-2" />
                                <Skeleton className="h-4 w-2/3 mt-2" />
                                <div className="mt-4">
                                    <Skeleton className="h-6 w-1/2" />
                                    <Skeleton className="h-4 w-1/3 mt-1" />
                                </div>
                                <div className="mt-6 space-y-2">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        ))}

        {error && <div>Error fetching services: {error.message}</div>}

        {!isLoading && !error && categories.map((category) => {
          const categoryServices = servicesData.filter(service => service.category === category);
          
          if (categoryServices.length === 0) return null;

          return (
            <section key={category} className="mb-16">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {category}
                </h2>
                <p className="text-gray-600">
                  Layanan {category.toLowerCase()} yang komprehensif dan profesional
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryServices.map((service) => {
                  const IconComponent = getIcon(service.icon_name);
                  return (
                    <Card key={service.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <Badge variant="outline">{service.category}</Badge>
                        </div>
                        <CardTitle className="text-xl">{service.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{service.description}</p>
                        
                        <div className="mb-4">
                          <div className="text-lg font-semibold text-primary mb-1">{service.pricing}</div>
                          <div className="text-sm text-gray-500">Durasi: {service.duration}</div>
                        </div>

                        {service.features && service.features.length > 0 && (
                          <div className="mb-6">
                            <h4 className="font-semibold mb-2">Yang Anda Dapatkan:</h4>
                            <ul className="space-y-1">
                              {service.features.map((feature, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Button 
                            className="w-full" 
                            onClick={() => handleConsultation(service.name)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Konsultasi Gratis
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleContact(service.name)}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Hubungi Kami
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Butuh Layanan Khusus?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Kami siap membantu mengembangkan solusi custom sesuai kebutuhan spesifik bisnis Anda
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => handleConsultation("Custom Solution")}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Diskusi Kebutuhan Anda
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>&copy; 2024 Sistem Langganan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Services;
