import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SendMoney = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientFound, setRecipientFound] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const quickAmounts = [100, 500, 1000, 2000];

  const handleMobileLookup = async () => {
    const formattedMobile = mobile.startsWith("+91") ? mobile : `+91${mobile}`;
    
    if (formattedMobile.length !== 13) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .select("full_name")
      .eq("mobile", formattedMobile)
      .single();

    if (error || !data) {
      toast.error("This number is not on EasyPay yet. Invite them!");
      setRecipientFound(false);
      setRecipientName("");
      return;
    }

    setRecipientName(data.full_name || "EasyPay User");
    setRecipientFound(true);
    toast.success(`Found: ${data.full_name || "EasyPay User"}`);
  };

  const handleSendMoney = async () => {
    const userId = sessionStorage.getItem("easypay_user_id");
    if (!userId) {
      navigate("/login");
      return;
    }

    if (!recipientFound) {
      toast.error("Please search for recipient first");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);

    // Get sender's current balance
    const { data: senderData } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single();

    if (!senderData || senderData.balance < amountNum) {
      toast.error(`Insufficient balance. You have ₹${senderData?.balance || 0}`);
      setIsProcessing(false);
      return;
    }

    const formattedMobile = mobile.startsWith("+91") ? mobile : `+91${mobile}`;

    // Get recipient data
    const { data: recipientData } = await supabase
      .from("users")
      .select("id, balance")
      .eq("mobile", formattedMobile)
      .single();

    if (!recipientData) {
      toast.error("Recipient not found");
      setIsProcessing(false);
      return;
    }

    // Update sender balance
    await supabase
      .from("users")
      .update({ balance: senderData.balance - amountNum })
      .eq("id", userId);

    // Update recipient balance
    await supabase
      .from("users")
      .update({ balance: recipientData.balance + amountNum })
      .eq("id", recipientData.id);

    // Create sender transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      type: "sent",
      amount: amountNum,
      counterparty_mobile: formattedMobile,
      counterparty_name: recipientName,
      note: note || null
    });

    // Create recipient transaction
    await supabase.from("transactions").insert({
      user_id: recipientData.id,
      type: "received",
      amount: amountNum,
      counterparty_mobile: sessionStorage.getItem("easypay_user_mobile") || "",
      counterparty_name: sessionStorage.getItem("easypay_user_name") || "User",
      note: note || null
    });

    toast.success(`₹${amountNum} sent to ${recipientName}!`);
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
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Send className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Send Money</h1>
              <p className="text-sm text-muted-foreground">Transfer to EasyPay users</p>
            </div>
          </div>

          {/* Mobile Input */}
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="mobile">Recipient's Mobile Number</Label>
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
                  onChange={(e) => {
                    setMobile(e.target.value.replace(/\D/g, ""));
                    setRecipientFound(false);
                    setRecipientName("");
                  }}
                  className="flex-1"
                />
                <Button onClick={handleMobileLookup}>Search</Button>
              </div>
            </div>

            {recipientFound && (
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{recipientName}</p>
                  <p className="text-xs text-muted-foreground">On EasyPay</p>
                </div>
              </div>
            )}
          </div>

          {recipientFound && (
            <>
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

              {/* Note */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="note">Add Note (Optional)</Label>
                <Textarea
                  id="note"
                  placeholder="What's this for?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>

              <Button
                className="w-full h-12 text-base font-semibold"
                onClick={handleSendMoney}
                disabled={isProcessing}
              >
                {isProcessing ? "Sending..." : "Send Money"}
              </Button>
            </>
          )}

          <div className="mt-6 p-4 bg-accent/50 rounded-lg">
            <p className="text-xs text-center text-muted-foreground">
              <span className="font-semibold">Try:</span> +919876543210, +919876543211, +919876543212
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SendMoney;
