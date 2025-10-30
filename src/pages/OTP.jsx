import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet } from "lucide-react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const OTP = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [mobile, setMobile] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const storedMobile = sessionStorage.getItem("easypay_mobile");
    const storedIsNewUser = sessionStorage.getItem("easypay_is_new_user") === "true";
    
    if (!storedMobile) {
      navigate("/login");
      return;
    }
    
    setMobile(storedMobile);
    setIsNewUser(storedIsNewUser);
  }, [navigate]);

  const handleVerify = () => {
    if (otp.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    if (otp !== "123456") {
      toast.error("Invalid OTP. Try 123456");
      return;
    }

    toast.success("OTP verified successfully!");
    navigate(isNewUser ? "/set-pin" : "/enter-pin");
  };

  const handleResend = () => {
    toast.success("OTP resent successfully!");
    setOtp("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 shadow-lg">
        <button
          onClick={() => navigate("/login")}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Verify OTP</h1>
          <p className="text-muted-foreground">
            Enter the 6-digit code sent to
            <br />
            <span className="font-semibold text-foreground">{mobile}</span>
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button 
            className="w-full h-12 text-base font-semibold"
            onClick={handleVerify}
          >
            Verify OTP
          </Button>

          <div className="text-center">
            <button
              onClick={handleResend}
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              Didn't receive OTP? Resend
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-accent/50 rounded-lg">
          <p className="text-xs text-center text-muted-foreground">
            <span className="font-semibold">Prototype Mode:</span> OTP is always <span className="font-mono">123456</span>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default OTP;
