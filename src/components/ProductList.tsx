
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageCircle, Play } from "lucide-react";

const productsData = [
  {
    id: 1,
    name: "Paket Basic",
    description: "Paket langganan dasar dengan fitur lengkap untuk bisnis kecil",
    price: "Rp 99.000",
    period: "/bulan",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    features: ["5 User", "10GB Storage", "Email Support", "Basic Analytics"],
    demoUrl: "https://demo.example.com/basic"
  },
  {
    id: 2,
    name: "Paket Professional",
    description: "Paket untuk bisnis menengah dengan fitur advanced",
    price: "Rp 199.000",
    period: "/bulan",
    image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    features: ["25 User", "100GB Storage", "Priority Support", "Advanced Analytics", "API Access"],
    demoUrl: "https://demo.example.com/professional"
  },
  {
    id: 3,
    name: "Paket Enterprise",
    description: "Solusi lengkap untuk perusahaan besar",
    price: "Rp 499.000",
    period: "/bulan",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    features: ["Unlimited User", "1TB Storage", "24/7 Support", "Custom Analytics", "Full API", "Dedicated Manager"],
    demoUrl: "https://demo.example.com/enterprise"
  }
];

const ProductList = () => {
  const handleSubscribe = (productName: string) => {
    // Handle subscription logic
    console.log(`Subscribe to ${productName}`);
  };

  const handleDemo = (demoUrl: string) => {
    window.open(demoUrl, '_blank');
  };

  const handleDetail = (productId: number) => {
    // Handle detail navigation
    console.log(`View detail for product ${productId}`);
  };

  const handleWhatsApp = (productName: string) => {
    const message = `Halo, saya tertarik dengan ${productName}. Bisa minta informasi lebih lanjut?`;
    const whatsappUrl = `https://wa.me/6287886425562?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {productsData.map((product) => (
        <Card key={product.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="p-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
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
                  <Badge key={index} variant="secondary" className="text-xs">
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
  );
};

export default ProductList;
