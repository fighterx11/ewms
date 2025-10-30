import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const OTP = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [mobile, setMobile] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [showDetectedBanner, setShowDetectedBanner] = useState(false);

  useEffect(() => {
    const storedMobile = sessionStorage.getItem("easypay_mobile");
    const storedIsNewUser = sessionStorage.getItem("easypay_is_new_user") === "true";

    if (!storedMobile) {
      navigate("/login");
      return;
    }

    setMobile(storedMobile);
    setIsNewUser(storedIsNewUser);

    // Simulate OTP detection after 1.5 seconds
    const detectionTimer = setTimeout(() => {
      setShowDetectedBanner(true);
      setIsAutoFilling(true);

      // Auto-fill OTP with staggered animation
      const otpDigits = "123456";
      let currentIndex = 0;

      const fillOtpInterval = setInterval(() => {
        if (currentIndex < otpDigits.length) {
          setOtp(otpDigits.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(fillOtpInterval);
          setIsAutoFilling(false);

          // Hide banner after completion
          setTimeout(() => {
            setShowDetectedBanner(false);
          }, 2000);
        }
      }, 100); // Faster typing effect

      return () => clearInterval(fillOtpInterval);
    }, 1500);

    return () => clearTimeout(detectionTimer);
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
    setShowDetectedBanner(false);

    // Trigger auto-fill again
    setTimeout(() => {
      setShowDetectedBanner(true);
      setIsAutoFilling(true);

      const otpDigits = "123456";
      let currentIndex = 0;

      const fillOtpInterval = setInterval(() => {
        if (currentIndex < otpDigits.length) {
          setOtp(otpDigits.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(fillOtpInterval);
          setIsAutoFilling(false);
          setTimeout(() => setShowDetectedBanner(false), 2000);
        }
      }, 100);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 shadow-lg relative overflow-hidden">
        {/* Auto-detected OTP Banner */}
        <div
          className={`absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 flex items-center gap-2 justify-center transition-all duration-500 ${
            showDetectedBanner ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="text-sm font-medium">OTP Detected Automatically</span>
        </div>

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
              className={isAutoFilling ? "pointer-events-none" : ""}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className={`transition-all duration-300 ${
                      otp[index] && isAutoFilling
                        ? "animate-bounce scale-110 bg-green-50 border-green-500"
                        : ""
                    }`}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handleVerify}
            disabled={isAutoFilling}
          >
            {isAutoFilling ? "Auto-filling..." : "Verify OTP"}
          </Button>

          <div className="text-center">
            <button
              onClick={handleResend}
              className="text-sm text-primary hover:text-primary-dark font-medium"
              disabled={isAutoFilling}
            >
              Didn't receive OTP? Resend
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-accent/50 rounded-lg">
          <p className="text-xs text-center text-muted-foreground">
            <span className="font-semibold">Prototype Mode:</span> OTP is always{" "}
            <span className="font-mono">123456</span>
          </p>
        </div>
      </Card>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default OTP;
