
import { useState } from 'react';
import BannerSlide from '@/components/BannerSlide';
import ProductList from '@/components/ProductList';
import ServiceList from '@/components/ServiceList';
import { Button } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-bold text-gray-900">
              Sistem Langganan
            </div>
            <div className="flex space-x-4">
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

      {/* Banner Slide */}
      <BannerSlide />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Products Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Produk Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan berbagai produk berkualitas dengan sistem langganan yang fleksibel
            </p>
          </div>
          <ProductList />
        </section>

        {/* Services Section */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Layanan Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Layanan terbaik untuk mendukung kebutuhan bisnis Anda
            </p>
          </div>
          <ServiceList />
        </section>
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

export default Homepage;
