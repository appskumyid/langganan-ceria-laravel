
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Users, Headphones, Globe, Cog, MessageCircle, Phone } from "lucide-react";
import { NavLink } from "react-router-dom";

interface Service {
  id: number;
  name: string;
  description: string;
  icon: any;
  category: string;
  features: string[];
  pricing: string;
  duration: string;
}

const servicesData: Service[] = [
  // Security Services
  {
    id: 1,
    name: "Cyber Security Audit",
    description: "Audit keamanan komprehensif untuk sistem dan infrastruktur IT Anda",
    icon: Shield,
    category: "Security",
    features: ["Vulnerability Assessment", "Penetration Testing", "Security Report", "Remediation Plan"],
    pricing: "Mulai dari Rp 5.000.000",
    duration: "2-4 minggu"
  },
  {
    id: 2,
    name: "Security Monitoring",
    description: "Layanan monitoring keamanan 24/7 untuk deteksi dini ancaman",
    icon: Shield,
    category: "Security",
    features: ["Real-time Monitoring", "Threat Detection", "Incident Response", "Monthly Reports"],
    pricing: "Rp 2.500.000/bulan",
    duration: "Ongoing"
  },
  {
    id: 3,
    name: "Data Protection Service",
    description: "Layanan perlindungan data dan compliance dengan regulasi",
    icon: Shield,
    category: "Security",
    features: ["Data Encryption", "Backup Solutions", "GDPR Compliance", "Access Control"],
    pricing: "Rp 3.000.000/bulan",
    duration: "Ongoing"
  },

  // Automation Services
  {
    id: 4,
    name: "Business Process Automation",
    description: "Otomatisasi proses bisnis untuk meningkatkan efisiensi operasional",
    icon: Zap,
    category: "Automation",
    features: ["Process Analysis", "Workflow Design", "System Integration", "Training"],
    pricing: "Mulai dari Rp 8.000.000",
    duration: "4-8 minggu"
  },
  {
    id: 5,
    name: "DevOps Automation",
    description: "Implementasi CI/CD pipeline dan infrastructure automation",
    icon: Zap,
    category: "Automation",
    features: ["CI/CD Setup", "Infrastructure as Code", "Monitoring Setup", "Documentation"],
    pricing: "Mulai dari Rp 6.000.000",
    duration: "3-6 minggu"
  },
  {
    id: 6,
    name: "Marketing Automation",
    description: "Otomatisasi campaign marketing dan customer engagement",
    icon: Zap,
    category: "Automation",
    features: ["Email Automation", "Lead Scoring", "Campaign Management", "Analytics"],
    pricing: "Mulai dari Rp 4.000.000",
    duration: "2-4 minggu"
  },

  // Development Services
  {
    id: 7,
    name: "Custom Web Development",
    description: "Pengembangan aplikasi web custom sesuai kebutuhan bisnis",
    icon: Globe,
    category: "Development Aplikasi",
    features: ["Full-stack Development", "Responsive Design", "API Integration", "Testing"],
    pricing: "Mulai dari Rp 15.000.000",
    duration: "8-16 minggu"
  },
  {
    id: 8,
    name: "Mobile App Development",
    description: "Pengembangan aplikasi mobile iOS dan Android",
    icon: Globe,
    category: "Development Aplikasi",
    features: ["Native Development", "Cross-platform", "App Store Deployment", "Maintenance"],
    pricing: "Mulai dari Rp 25.000.000",
    duration: "12-20 minggu"
  },
  {
    id: 9,
    name: "API Development",
    description: "Pengembangan REST API dan microservices architecture",
    icon: Globe,
    category: "Development Aplikasi",
    features: ["RESTful API", "Documentation", "Authentication", "Rate Limiting"],
    pricing: "Mulai dari Rp 8.000.000",
    duration: "4-8 minggu"
  },

  // Infrastructure Services
  {
    id: 10,
    name: "Cloud Migration",
    description: "Migrasi infrastruktur ke cloud dengan downtime minimal",
    icon: Cog,
    category: "Infrastructure",
    features: ["Migration Planning", "Data Transfer", "Testing", "Go-live Support"],
    pricing: "Mulai dari Rp 12.000.000",
    duration: "6-12 minggu"
  },
  {
    id: 11,
    name: "Infrastructure Management",
    description: "Pengelolaan infrastruktur IT dengan monitoring 24/7",
    icon: Cog,
    category: "Infrastructure",
    features: ["Server Management", "Network Monitoring", "Backup Management", "Security Updates"],
    pricing: "Rp 5.000.000/bulan",
    duration: "Ongoing"
  },
  {
    id: 12,
    name: "Disaster Recovery",
    description: "Implementasi solusi disaster recovery dan business continuity",
    icon: Cog,
    category: "Infrastructure",
    features: ["DR Planning", "Backup Strategy", "Recovery Testing", "Documentation"],
    pricing: "Mulai dari Rp 10.000.000",
    duration: "4-8 minggu"
  }
];

const categories = ["Security", "Automation", "Development Aplikasi", "Infrastructure"];

const Services = () => {
  const handleConsultation = (serviceName: string) => {
    const message = `Halo, saya tertarik dengan layanan ${serviceName}. Bisa minta konsultasi lebih lanjut?`;
    const whatsappUrl = `https://wa.me/6287886425562?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleContact = (serviceName: string) => {
    console.log(`Contact for ${serviceName}`);
  };

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
        {categories.map((category) => {
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
                  const IconComponent = service.icon;
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
