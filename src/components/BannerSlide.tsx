
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const bannerData = [
  {
    id: 1,
    title: "Selamat Datang di Sistem Langganan",
    subtitle: "Kelola langganan Anda dengan mudah dan efisien",
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    description: "Platform terpercaya untuk mengelola semua kebutuhan langganan digital Anda"
  },
  {
    id: 2,
    title: "Teknologi Modern",
    subtitle: "Solusi digital terdepan untuk bisnis Anda",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    description: "Gunakan teknologi terkini untuk mengoptimalkan pengalaman langganan"
  },
  {
    id: 3,
    title: "Tim Profesional",
    subtitle: "Didukung oleh tim ahli berpengalaman",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    description: "Tim profesional siap membantu Anda 24/7"
  }
];

const BannerSlide = () => {
  return (
    <div className="relative">
      <Carousel className="w-full">
        <CarouselContent>
          {bannerData.map((banner) => (
            <CarouselItem key={banner.id}>
              <Card className="border-0 rounded-none">
                <CardContent className="relative h-[500px] p-0">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="text-center text-white max-w-4xl px-4">
                      <h1 className="text-5xl font-bold mb-4">{banner.title}</h1>
                      <p className="text-xl mb-2">{banner.subtitle}</p>
                      <p className="text-lg opacity-90">{banner.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
};

export default BannerSlide;
