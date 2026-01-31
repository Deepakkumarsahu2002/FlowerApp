import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import ScrollToTop from "@/components/ScrollToTop"; // ✅ ADD THIS

import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryPage from "./pages/CategoryPage";
import OccasionPage from "./pages/OccasionPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop /> {/* ✅ ADD THIS */}
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/order-confirmation"
                element={<OrderConfirmationPage />}
              />
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route
                path="/categories"
                element={<Layout><CategoriesPage /></Layout>}
              />
              <Route
                path="/category/:id"
                element={<Layout><CategoryPage /></Layout>}
              />
              <Route
                path="/occasion/:id"
                element={<Layout><OccasionPage /></Layout>}
              />
              <Route
                path="/product/:id"
                element={<Layout><ProductPage /></Layout>}
              />
              <Route path="/cart" element={<Layout><CartPage /></Layout>} />
              <Route
                path="/checkout"
                element={<Layout><CheckoutPage /></Layout>}
              />
              <Route path="/about" element={<Layout><AboutPage /></Layout>} />
              <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
              <Route path="/profile" element={<Layout><ProfilePage /></Layout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
