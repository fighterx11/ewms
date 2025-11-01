import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import OTP from "./pages/OTP";
import SetPin from "./pages/SetPin";
import EnterPin from "./pages/EnterPin";
import KYC from "./pages/KYC";
import Dashboard from "./pages/Dashboard";
import AddMoney from "./pages/AddMoney";
import SendMoney from "./pages/SendMoney";
import MerchantPay from "./pages/MerchantPay";
import BillPay from "./pages/BillPay";
import MetroBooking from "./pages/MetroBooking";
import History from "./pages/History";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/set-pin" element={<SetPin />} />
          <Route path="/enter-pin" element={<EnterPin />} />
          <Route path="/kyc" element={<KYC />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-money" element={<AddMoney />} />
          <Route path="/send-money" element={<SendMoney />} />
          <Route path="/merchant-pay" element={<MerchantPay />} />
          <Route path="/bill-pay" element={<BillPay />} />
          <Route path="/metro-booking" element={<MetroBooking />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;