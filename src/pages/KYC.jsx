import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const KYC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSkip = async () => {
    const mobile = sessionStorage.getItem("easypay_mobile");
    if (!mobile) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    
    // Create user with minimal info
    const { data, error } = await supabase
      .from("users")
      .insert({
        mobile,
        kyc_status: "skipped",
        balance: 1000.00
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create account. Please try again.");
      setIsSubmitting(false);
      return;
    }

    sessionStorage.setItem("easypay_user_id", data.id);
    sessionStorage.setItem("easypay_user_mobile", data.mobile);
    sessionStorage.setItem("easypay_user_name", "User");
    
    toast.success("Account created! KYC can be completed later.");
    navigate("/dashboard");
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    const mobile = sessionStorage.getItem("easypay_mobile");
    if (!mobile) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("users")
      .insert({
        mobile,
        full_name: fullName,
        email: email || null,
        kyc_status: "pending",
        balance: 1000.00
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create account. Please try again.");
      setIsSubmitting(false);
      return;
    }

    sessionStorage.setItem("easypay_user_id", data.id);
    sessionStorage.setItem("easypay_user_mobile", data.mobile);
    sessionStorage.setItem("easypay_user_name", data.full_name || "User");
    
    toast.success("Account created successfully!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 shadow-lg">
        <button
          onClick={() => navigate("/set-pin")}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary mb-4">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Complete KYC</h1>
          <p className="text-muted-foreground">Help us verify your identity</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Document (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Aadhaar, PAN, or Driving License
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full h-12 text-base font-semibold"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              Submit KYC
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-12 text-base font-semibold"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip for Now
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-accent/50 rounded-lg">
          <p className="text-xs text-center text-muted-foreground">
            <span className="font-semibold">Prototype Mode:</span> You can skip KYC or just enter name
          </p>
        </div>
      </Card>
    </div>
  );
};

export default KYC;
