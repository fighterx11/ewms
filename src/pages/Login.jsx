import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const validateMobile = (num) => {
    const regex = /^\+91[0-9]{10}$/;
    return regex.test(num);
  };

  const handleContinue = () => {
    const formattedMobile = mobile.startsWith("+91") ? mobile : `+91${mobile}`;
    
    if (!validateMobile(formattedMobile)) {
      toast.error("Enter a valid Indian mobile number");
      return;
    }

    // Store mobile for OTP verification
    sessionStorage.setItem("easypay_mobile", formattedMobile);
    sessionStorage.setItem("easypay_is_new_user", isNewUser.toString());
    navigate("/otp");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 shadow-lg">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {isNewUser ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground">Enter your mobile number to continue</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <div className="flex gap-2">
              <div className="flex items-center px-4 py-2 bg-muted rounded-lg border border-input">
                <span className="text-foreground font-medium">+91</span>
              </div>
              <Input
                id="mobile"
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className="flex-1"
              />
            </div>
          </div>

          <Button 
            className="w-full h-12 text-base font-semibold"
            onClick={handleContinue}
          >
            Continue
          </Button>

          <div className="text-center">
            <button
              onClick={() => setIsNewUser(!isNewUser)}
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              {isNewUser ? "Already have an account? Login" : "New user? Create account"}
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-accent/50 rounded-lg">
          <p className="text-xs text-center text-muted-foreground">
            <span className="font-semibold">Prototype Mode:</span> Use any 10-digit number
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
