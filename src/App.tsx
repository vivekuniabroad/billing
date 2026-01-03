import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProductProvider } from "./context/ProductContext";
import { SettingsProvider } from "./context/SettingsContext";
import { SalesHistoryProvider } from "./context/SalesHistoryContext";
import { CustomerProvider } from "./context/CustomerContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { Header } from "./components/layout/Header";
import Index from "./pages/Index";
import AdminPage from "./pages/AdminPage";
import SettingsPage from "./pages/SettingsPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import CustomersPage from "./pages/CustomersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="shop-ui-theme">
      <TooltipProvider>
        <SettingsProvider>
          <ProductProvider>
            <SalesHistoryProvider>
              <CustomerProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <div className="min-h-screen bg-background bg-pattern">
                    <Header />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/history" element={<SalesHistoryPage />} />
                      <Route path="/customers" element={<CustomersPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </BrowserRouter>
              </CustomerProvider>
            </SalesHistoryProvider>
          </ProductProvider>
        </SettingsProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
