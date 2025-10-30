import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AddMoney = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const quickAmounts = [500, 1000, 2000, 5000];

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handleDevModeAdd = async () => {
    const userId = sessionStorage.getItem("easypay_user_id");
    if (!userId) {
      navigate("/login");
      return;
    }

    setIsProcessing(true);

    // Get current balance
    const { data: userData } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single();

    if (!userData) {
      toast.error("Failed to fetch balance");
      setIsProcessing(false);
      return;
    }

    const newBalance = userData.balance + 500;

    // Update balance
    await supabase
      .from("users")
      .update({ balance: newBalance })
      .eq("id", userId);

    // Create transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      type: "add_money",
      amount: 500,
      note: "Added via Development Mode"
    });

    toast.success("₹500 added successfully!");
    setTimeout(() => navigate("/dashboard"), 1000);
  };

  const handleAddMoney = async () => {
    const userId = sessionStorage.getItem("easypay_user_id");
    if (!userId) {
      navigate("/login");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!cardNumber || cardNumber.replace(/\s/g, "") !== "1234123412341234") {
      toast.error("Try card: 1234 1234 1234 1234");
      return;
    }

    if (!cvv || cvv !== "123") {
      toast.error("Try CVV: 123");
      return;
    }

    if (!expiry) {
      toast.error("Please enter expiry date");
      return;
    }

    setIsProcessing(true);

    // Get current balance
    const { data: userData } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single();

    if (!userData) {
      toast.error("Failed to fetch balance");
      setIsProcessing(false);
      return;
    }

    const newBalance = userData.balance + amountNum;

    // Update balance
    await supabase
      .from("users")
      .update({ balance: newBalance })
      .eq("id", userId);

    // Create transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      type: "add_money",
      amount: amountNum,
      note: "Added via Card"
    });

    toast.success(`₹${amountNum} added successfully!`);
    setTimeout(() => navigate("/dashboard"), 1000);
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
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Add Money</h1>
              <p className="text-sm text-muted-foreground">Top up your wallet</p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-6 mb-6">
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

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((value) => (
                <Button
                  key={value}
                  variant="outline"
                  onClick={() => handleQuickAmount(value)}
                  className="h-12"
                >
                  ₹{value}
                </Button>
              ))}
            </div>
          </div>

          {/* Development Mode Button */}
          <div className="mb-6">
            <Button
              variant="secondary"
              className="w-full h-12 text-base font-semibold"
              onClick={handleDevModeAdd}
              disabled={isProcessing}
            >
              Add ₹500 for Development Mode
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Quick add without card details
            </p>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or use card</span>
            </div>
          </div>

          {/* Card Details */}
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Card Number
                </div>
              </Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 1234 1234 1234"
                maxLength={19}
                value={cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, "");
                  const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                  setCardNumber(formatted);
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input
                  id="expiry"
                  type="text"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={expiry}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + "/" + value.slice(2, 4);
                    }
                    setExpiry(value);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  maxLength={3}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
          </div>

          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handleAddMoney}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Add Money"}
          </Button>

          <div className="mt-6 p-4 bg-accent/50 rounded-lg">
            <p className="text-xs text-center text-muted-foreground">
              <span className="font-semibold">Prototype Mode:</span> Card: 1234123412341234 | CVV: 123
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AddMoney;
