import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, Zap, Droplet, Receipt } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BillPay = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [provider, setProvider] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const categories = [
    { id: "mobile", name: "Mobile Recharge", icon: Smartphone, color: "text-primary" },
    { id: "electricity", name: "Electricity", icon: Zap, color: "text-warning" },
    { id: "water", name: "Water", icon: Droplet, color: "text-secondary" }
  ];

  const providers = {
    mobile: ["Airtel", "Jio", "Vi", "BSNL"],
    electricity: ["MSEB", "Adani Power", "Tata Power"],
    water: ["Mumbai Water", "Delhi Jal Board"]
  };

  const handlePay = async () => {
    const userId = sessionStorage.getItem("easypay_user_id");
    if (!userId) {
      navigate("/login");
      return;
    }

    if (!category || !provider || !accountNumber) {
      toast.error("Please fill all fields");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

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

    // Update balance
    await supabase
      .from("users")
      .update({ balance: userData.balance - amountNum })
      .eq("id", userId);

    // Create transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      type: "bill",
      amount: amountNum,
      counterparty_name: `${provider} - ${category}`,
      note: `${category} payment for ${accountNumber}`
    });

    const categoryName = categories.find(c => c.id === category)?.name || category;
    toast.success(`₹${amountNum} paid for ${categoryName}!`);
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
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bill Payments</h1>
              <p className="text-sm text-muted-foreground">Pay bills & recharge</p>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2 mb-6">
            <Label>Select Category</Label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Button
                    key={cat.id}
                    variant={category === cat.id ? "default" : "outline"}
                    onClick={() => {
                      setCategory(cat.id);
                      setProvider("");
                    }}
                    className="flex-col h-auto py-4 gap-2"
                  >
                    <Icon className={`w-6 h-6 ${category === cat.id ? "" : cat.color}`} />
                    <span className="text-xs font-semibold">{cat.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {category && (
            <>
              {/* Provider Selection */}
              <div className="space-y-2 mb-4">
                <Label>Select Provider</Label>
                <div className="grid grid-cols-2 gap-2">
                  {providers[category]?.map((prov) => (
                    <Button
                      key={prov}
                      variant={provider === prov ? "default" : "outline"}
                      onClick={() => setProvider(prov)}
                      className="h-12"
                    >
                      {prov}
                    </Button>
                  ))}
                </div>
              </div>

              {provider && (
                <>
                  {/* Account Number */}
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="accountNumber">
                      {category === "mobile" ? "Mobile Number" : "Account/Consumer Number"}
                    </Label>
                    <Input
                      id="accountNumber"
                      type="text"
                      placeholder={category === "mobile" ? "9876543210" : "CON12345"}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>

                  {/* Amount */}
                  <div className="space-y-2 mb-6">
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

                  {/* Quick Amounts for Mobile Recharge */}
                  {category === "mobile" && (
                    <div className="grid grid-cols-4 gap-2 mb-6">
                      {[99, 149, 299, 499].map((value) => (
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
                  )}

                  <Button
                    className="w-full h-12 text-base font-semibold"
                    onClick={handlePay}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Pay Bill"}
                  </Button>
                </>
              )}
            </>
          )}

          <div className="mt-6 p-4 bg-accent/50 rounded-lg">
            <p className="text-xs text-center text-muted-foreground">
              <span className="font-semibold">Prototype Mode:</span> All providers are dummy
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BillPay;
