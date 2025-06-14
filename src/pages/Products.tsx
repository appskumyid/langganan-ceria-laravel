
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageCircle, Play, Crown } from "lucide-react";
import { NavLink } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  description: string;
  type: "Premium" | "Non-Premium";
  category: string;
  price: string;
  period: string;
  image: string;
  features: string[];
  demoUrl: string;
}

const productsData: Product[] = [
  // E-Commerce
  {
    id: 1,
    name: "Toko Online Basic",
    description: "Platform e-commerce sederhana untuk bisnis kecil",
    type: "Non-Premium",
    category: "E-Commerce",
    price: "Rp 199.000",
    period: "/bulan",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
    features: ["Katalog Produk", "Keranjang Belanja", "Payment Gateway", "Dashboard Admin"],
    demoUrl: "https://demo.example.com/ecommerce-basic"
  },
  {
    id: 2,
    name: "Toko Online Premium",
    description: "E-commerce lengkap dengan fitur advanced dan analitik",
    type: "Premium",
    category: "E-Commerce",
    price: "Rp 599.000",
    period: "/bulan",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
    features: ["Multi-vendor", "Advanced Analytics", "SEO Tools", "Multi-payment", "Mobile App"],
    demoUrl: "https://demo.example.com/ecommerce-premium"
  },
  // Company Profile
  {
    id: 3,
    name: "Company Profile Standard",
    description: "Website profil perusahaan yang profesional",
    type: "Non-Premium",
    category: "Company Profile",
    price: "Rp 99.000",
    period: "/bulan",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
    features: ["Responsive Design", "Company Info", "Contact Form", "Gallery"],
    demoUrl: "https://demo.example.com/company-basic"
  },
  {
    id: 4,
    name: "Company Profile Premium",
    description: "Website perusahaan dengan fitur lengkap dan animasi",
    type: "Premium",
    category: "Company Profile",
    price: "Rp 299.000",
    period: "/bulan",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
    features: ["Custom Animation", "Blog System", "Team Management", "Newsletter", "SEO Optimized"],
    demoUrl: "https://demo.example.com/company-premium"
  },
  // CV / Portfolio
  {
    id: 5,
    name: "Portfolio Personal",
    description: "Website portfolio untuk freelancer dan profesional",
    type: "Non-Premium",
    category: "CV / Portfolio",
    price: "Rp 79.000",
    period: "/bulan",
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
    features: ["Portfolio Gallery", "CV Online", "Contact Form", "Skills Section"],
    demoUrl: "https://demo.example.com/portfolio-basic"
  },
  // Undangan Digital
  {
    id: 6,
    name: "Undangan Digital Premium",
    description: "Undangan pernikahan digital yang elegan dan interaktif",
    type: "Premium",
    category: "Undangan Digital",
    price: "Rp 149.000",
    period: "/sekali",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
    features: ["Custom Design", "RSVP Online", "Gallery Photo", "Music Background", "Guest Book"],
    demoUrl: "https://demo.example.com/invitation"
  },
  // Aplikasi Bisnis
  {
    id: 7,
    name: "POS System Basic",
    description: "Sistem Point of Sale untuk retail dan restoran",
    type: "Non-Premium",
    category: "Aplikasi Bisnis (ERP, POS, LMS, dll)",
    price: "Rp 399.000",
    period: "/bulan",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
    features: ["Inventory Management", "Sales Reporting", "Barcode Scanner", "Multi-user"],
    demoUrl: "https://demo.example.com/pos-basic"
  },
  {
    id: 8,
    name: "ERP Enterprise",
    description: "Sistem ERP lengkap untuk perusahaan besar",
    type: "Premium",
    category: "Aplikasi Bisnis (ERP, POS, LMS, dll)",
    price: "Rp 1.999.000",
    period: "/bulan",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
    features: ["HR Management", "Finance Module", "CRM Integration", "Custom Reports", "API Access"],
    demoUrl: "https://demo.example.com/erp-enterprise"
  }
];

const categories = [
  "E-Commerce",
  "Company Profile", 
  "CV / Portfolio",
  "Undangan Digital",
  "Aplikasi Bisnis (ERP, POS, LMS, dll)"
];

const Products = () => {
  const handleSubscribe = (productName: string) => {
    console.log(`Subscribe to ${productName}`);
  };

  const handleDemo = (demoUrl: string) => {
    window.open(demoUrl, '_blank');
  };

  const handleDetail = (productId: number) => {
    console.log(`View detail for product ${productId}`);
  };

  const handleWhatsApp = (productName: string) => {
    const message = `Halo, saya tertarik dengan ${productName}. Bisa minta informasi lebih lanjut?`;
    const whatsappUrl = `https://wa.me/6287886425562?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
                className="text-primary font-medium px-3 py-2 rounded-md text-sm"
              >
                Product
              </NavLink>
              <NavLink 
                to="/services" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
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
            Produk Kami
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Temukan solusi digital terbaik untuk kebutuhan bisnis Anda dengan berbagai kategori produk yang tersedia
          </p>
        </div>
      </div>

      {/* Products by Category */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categories.map((category) => {
          const categoryProducts = productsData.filter(product => product.category === category);
          
          if (categoryProducts.length === 0) return null;

          return (
            <section key={category} className="mb-16">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {category}
                </h2>
                <p className="text-gray-600">
                  Solusi terbaik untuk kategori {category.toLowerCase()}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="p-0">
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute top-4 right-4 flex gap-2">
                          <Badge 
                            variant={product.type === "Premium" ? "default" : "secondary"}
                            className={product.type === "Premium" ? "bg-yellow-500 text-white" : ""}
                          >
                            {product.type === "Premium" && <Crown className="w-3 h-3 mr-1" />}
                            {product.type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                      <p className="text-gray-600 mb-4">{product.description}</p>
                      
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-primary">{product.price}</span>
                        <span className="text-gray-500">{product.period}</span>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Fitur:</h4>
                        <div className="flex flex-wrap gap-1">
                          {product.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button 
                          className="w-full" 
                          onClick={() => handleSubscribe(product.name)}
                        >
                          Add Subscribe
                        </Button>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDemo(product.demoUrl)}
                            className="flex items-center gap-1"
                          >
                            <Play className="h-3 w-3" />
                            Demo
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDetail(product.id)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Detail
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleWhatsApp(product.name)}
                            className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <MessageCircle className="h-3 w-3" />
                            WA
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
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

export default Products;
