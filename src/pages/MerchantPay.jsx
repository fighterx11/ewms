import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Receipt, QrCode, Store } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PinVerification from "@/components/PinVerification";

const MerchantPay = () => {
  const navigate = useNavigate();
  const [merchantId, setMerchantId] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPinVerification, setShowPinVerification] = useState(false);

  const quickAmounts = [50, 100, 200, 500];
  const dummyMerchants = [
    { id: "MERCH123", name: "Cafe Coffee Day" },
    { id: "MERCH456", name: "Big Bazaar" },
    { id: "MERCH789", name: "Pizza Hut" }
  ];

  const handleInitiatePay = () => {
    const userId = sessionStorage.getItem("easypay_user_id");
    if (!userId) {
      navigate("/login");
      return;
    }

    if (!merchantId.trim()) {
      toast.error("Please enter merchant ID or scan QR");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Show PIN verification before processing
    setShowPinVerification(true);
  };

  const handlePay = async () => {
    const userId = sessionStorage.getItem("easypay_user_id");
    const amountNum = parseFloat(amount);

    setIsProcessing(true);

    // Get current balance
    const { data: userData } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single();

    if (!userData || userData.balance < amountNum) {
      toast.error(`Insufficient balance. You have ₹${userData?.balance || 0}`);
      setIsProcessing(false);
      return;
    }

    // Find merchant name
    const merchant = dummyMerchants.find(m => m.id === merchantId);
    const merchantName = merchant?.name || merchantId;

    // Update balance
    await supabase
      .from("users")
      .update({ balance: userData.balance - amountNum })
      .eq("id", userId);

    // Create transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      type: "merchant",
      amount: amountNum,
      merchant_id: merchantId,
      counterparty_name: merchantName,
      note: `Payment to ${merchantName}`
    });

    toast.success(`₹${amountNum} paid to ${merchantName}!`);
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </button>

        <Card className="p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Merchant Payment</h1>
              <p className="text-sm text-muted-foreground">Pay at stores & restaurants</p>
            </div>
          </div>

          {/* QR Scanner Placeholder */}
          <div className="mb-6 p-8 bg-gradient-to-br from-muted to-muted/50 rounded-lg border-2 border-dashed border-border">
            <div className="text-center">
              <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">Scan QR Code</p>
              <p className="text-xs text-muted-foreground">Point camera at merchant's QR</p>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or enter manually</span>
            </div>
          </div>

          {/* Manual Entry */}
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="merchantId">Merchant ID</Label>
              <Input
                id="merchantId"
                type="text"
                placeholder="MERCH123"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value.toUpperCase())}
              />
            </div>

            {/* Quick Merchant Selection */}
            <div className="space-y-2">
              <Label>Quick Select</Label>
              <div className="grid grid-cols-1 gap-2">
                {dummyMerchants.map((merchant) => (
                  <Button
                    key={merchant.id}
                    variant="outline"
                    onClick={() => setMerchantId(merchant.id)}
                    className="justify-start h-auto py-3"
                  >
                    <Store className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <p className="font-semibold">{merchant.name}</p>
                      <p className="text-xs text-muted-foreground">{merchant.id}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Enter Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-foreground">
                  ₹
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-2xl font-bold pl-8 h-14"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((value) => (
                <Button
                  key={value}
                  variant="outline"
                  onClick={() => setAmount(value.toString())}
                  className="h-12"
                >
                  ₹{value}
                </Button>
              ))}
            </div>
          </div>

          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handleInitiatePay}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Pay Now"}
          </Button>

          <PinVerification
            open={showPinVerification}
            onOpenChange={setShowPinVerification}
            onSuccess={handlePay}
            title="Verify PIN to Pay Merchant"
          />

          <div className="mt-6 p-4 bg-accent/50 rounded-lg">
            <p className="text-xs text-center text-muted-foreground">
              <span className="font-semibold">Prototype Mode:</span> Use dummy merchant IDs above
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MerchantPay;