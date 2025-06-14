
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

export const ProductSearch = ({ searchTerm, onSearchTermChange }: { searchTerm: string; onSearchTermChange: (term: string) => void }) => (
  <div className="mb-8">
    <div className="relative max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder="Cari produk..."
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        className="pl-10"
      />
    </div>
  </div>
);

export const CategoryTabs = ({ categories }: { categories: string[] }) => (
  <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8">
    {categories.map((category) => (
      <TabsTrigger key={category} value={category} className="text-xs md:text-sm">
        {category === "Aplikasi Bisnis (ERP, POS, LMS, dll)" ? "Aplikasi Bisnis" : category}
      </TabsTrigger>
    ))}
  </TabsList>
);
