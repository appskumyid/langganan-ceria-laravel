
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Products from "./pages/Products";
import Services from "./pages/Services";
import Payment from "./pages/Payment";
import Contact from "./pages/Contact";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminServices from "./pages/AdminServices";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import MySubscriptions from "./pages/MySubscriptions";
import AdminSubscriptionDetail from './pages/AdminSubscriptionDetail';
import SubscriptionDetail from './pages/SubscriptionDetail';
import AdminUserDetail from "./pages/AdminUserDetail";
import TransactionHistory from "./pages/TransactionHistory";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route 
            path="/payment/:subscriptionId" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Payment />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Index />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/products" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminProducts />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/services" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminServices />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/subscription/:subscriptionId" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminSubscriptionDetail />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users/:userId" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminUserDetail />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-subscriptions" 
            element={
              <ProtectedRoute>
                <Layout>
                  <MySubscriptions />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-subscriptions/:subscriptionId" 
            element={
              <ProtectedRoute>
                <Layout>
                  <SubscriptionDetail />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transaction-history" 
            element={
              <ProtectedRoute>
                <Layout>
                  <TransactionHistory />
                </Layout>
              </ProtectedRoute>
            } 
          />
          {/* Placeholder for renewal page - you can implement this later */}
          <Route 
            path="/renew/:subscriptionId" 
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="p-6 text-center">
                    <h1 className="text-2xl font-bold mb-4">Perpanjangan Langganan</h1>
                    <p className="text-gray-600">Fitur perpanjangan langganan akan segera tersedia.</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
