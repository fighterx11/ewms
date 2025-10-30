import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet } from "lucide-react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";

const EnterPin = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    const storedMobile = sessionStorage.getItem("easypay_mobile");
    if (!storedMobile) {
      navigate("/login");
      return;
    }
    setMobile(storedMobile);
  }, [navigate]);

  const handleLogin = async () => {
    if (pin.length !== 4) {
      toast.error("PIN must be 4 digits");
      return;
    }

    if (pin !== "1234") {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 3) {
        toast.error("Account locked. Please refresh to retry.");
        setPin("");
        return;
      }

      toast.error(`Wrong PIN. Try 1234. ${3 - newAttempts} attempts remaining.`);
      setPin("");
      return;
    }

    // Check if user exists
    const { data: userData, error } = await supabase
      .from("users")
      .select("*")
      .eq("mobile", mobile)
      .single();

    if (error || !userData) {
      toast.error("User not found. Please register first.");
      navigate("/login");
      return;
    }

    // Store user session
    sessionStorage.setItem("easypay_user_id", userData.id);
    sessionStorage.setItem("easypay_user_mobile", userData.mobile);
    sessionStorage.setItem("easypay_user_name", userData.full_name || "User");

    toast.success("Login successful!");
    navigate("/dashboard");
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Enter Your PIN</h1>
          <p className="text-muted-foreground">
            Enter your 4-digit PIN to login
            <br />
            <span className="font-semibold text-foreground">{mobile}</span>
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={4}
              value={pin}
              onChange={setPin}
              render={({ slots }) => (
                <InputOTPGroup>
                  {slots.map((slot, index) => (
                    <InputOTPSlot key={index} index={index} className="[&>*]:text-[0px]">
                      {slot.char ? "●" : ""}
                    </InputOTPSlot>
                  ))}
                </InputOTPGroup>
              )}
            />
          </div>

          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handleLogin}
            disabled={attempts >= 3}
          >
            {attempts >= 3 ? "Account Locked" : "Login"}
          </Button>

          <div className="text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              Use different mobile number
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-accent/50 rounded-lg">
          <p className="text-xs text-center text-muted-foreground">
            <span className="font-semibold">Prototype Mode:</span> PIN is always <span className="font-mono">1234</span>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default EnterPin;