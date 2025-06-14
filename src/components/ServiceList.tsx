
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Users, Headphones, Globe, Cog } from "lucide-react";

const servicesData = [
  {
    id: 1,
    name: "Konsultasi IT",
    description: "Layanan konsultasi teknologi informasi untuk optimalisasi bisnis",
    icon: Cog,
    category: "Consulting",
    features: ["Strategy Planning", "Technology Assessment", "Digital Transformation"]
  },
  {
    id: 2,
    name: "Keamanan Sistem",
    description: "Layanan keamanan komprehensif untuk melindungi data dan sistem",
    icon: Shield,
    category: "Security",
    features: ["Security Audit", "Penetration Testing", "Compliance Management"]
  },
  {
    id: 3,
    name: "Support 24/7",
    description: "Tim support profesional siap membantu Anda kapan saja",
    icon: Headphones,
    category: "Support",
    features: ["Live Chat", "Phone Support", "Remote Assistance"]
  },
  {
    id: 4,
    name: "Integrasi Sistem",
    description: "Layanan integrasi dengan berbagai platform dan sistem existing",
    icon: Zap,
    category: "Integration",
    features: ["API Integration", "Data Migration", "System Synchronization"]
  },
  {
    id: 5,
    name: "Training & Workshop",
    description: "Pelatihan komprehensif untuk tim Anda",
    icon: Users,
    category: "Training",
    features: ["User Training", "Admin Training", "Best Practices Workshop"]
  },
  {
    id: 6,
    name: "Cloud Infrastructure",
    description: "Layanan infrastruktur cloud yang scalable dan reliable",
    icon: Globe,
    category: "Infrastructure",
    features: ["Cloud Migration", "Auto Scaling", "Backup & Recovery"]
  }
];

const ServiceList = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {servicesData.map((service) => {
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
              
              <div>
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ServiceList;
