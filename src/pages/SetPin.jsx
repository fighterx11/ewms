import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet } from "lucide-react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const SetPin = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState("set");

  const handleContinue = () => {
    if (step === "set") {
      if (pin.length !== 4) {
        toast.error("PIN must be 4 digits");
        return;
      }
      setStep("confirm");
    } else {
      if (confirmPin.length !== 4) {
        toast.error("Please confirm your PIN");
        return;
      }
      if (pin !== confirmPin) {
        toast.error("PINs do not match");
        setConfirmPin("");
        return;
      }
      toast.success("PIN set successfully!");
      navigate("/kyc");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 shadow-lg">
        <button
          onClick={() => step === "set" ? navigate("/otp") : setStep("set")}
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
            {step === "set" ? "Set Your PIN" : "Confirm PIN"}
          </h1>
          <p className="text-muted-foreground">
            {step === "set" 
              ? "Create a 4-digit PIN to secure your account"
              : "Re-enter your PIN to confirm"
            }
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={4}
              value={step === "set" ? pin : confirmPin}
              onChange={step === "set" ? setPin : setConfirmPin}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button 
            className="w-full h-12 text-base font-semibold"
            onClick={handleContinue}
          >
            {step === "set" ? "Continue" : "Confirm PIN"}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-accent/50 rounded-lg">
          <p className="text-xs text-center text-muted-foreground">
            <span className="font-semibold">Prototype Mode:</span> Use <span className="font-mono">1234</span> for quick testing
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SetPin;
