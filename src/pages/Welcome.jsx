import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Wallet, Shield, Zap } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-4">
            <Wallet className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">EasyPay</h1>
          <p className="text-muted-foreground">India's Simplest E-Wallet App</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Instant Transfers</h3>
              <p className="text-sm text-muted-foreground">Send money to friends in seconds</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">100% Secure</h3>
              <p className="text-sm text-muted-foreground">Bank-grade security for your money</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={() => navigate("/login")}
          >
            Get Started
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Welcome;
