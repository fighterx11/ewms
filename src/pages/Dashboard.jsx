import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Wallet,
  Plus,
  Send,
  Receipt,
  History,
  Settings,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [userName, setUserName] = useState("User");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const userId = sessionStorage.getItem("easypay_user_id");
    const storedName = sessionStorage.getItem("easypay_user_name");

    if (!userId) {
      navigate("/login");
      return;
    }

    if (storedName) setUserName(storedName);
    loadUserData(userId);
  }, [navigate]);

  const loadUserData = async (userId) => {
    // Load balance
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("balance, full_name")
      .eq("id", userId)
      .single();

    if (!userError && userData) {
      setBalance(userData.balance);
      if (userData.full_name) setUserName(userData.full_name);
    }

    // Load recent transactions
    const { data: txnData, error: txnError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!txnError && txnData) {
      setRecentTransactions(txnData);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const userId = sessionStorage.getItem("easypay_user_id");
    if (userId) {
      await loadUserData(userId);
      toast.success("Balance refreshed!");
    }
    setIsRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6 pb-32">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">EasyPay</h1>
              <p className="text-sm text-primary-foreground/80">Hi, {userName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/history")}
              className="p-2 hover:bg-primary-foreground/10 rounded-full transition-colors"
            >
              <History className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="p-2 hover:bg-primary-foreground/10 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 -mt-24">
        {/* Balance Card */}
        <Card className="p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              <h2 className="text-4xl font-bold text-foreground">
                ₹{balance.toFixed(2)}
              </h2>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="flex-col h-auto py-4 gap-2"
              onClick={() => navigate("/add-money")}
            >
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-success" />
              </div>
              <span className="text-xs font-semibold">Add Money</span>
            </Button>

            <Button
              variant="outline"
              className="flex-col h-auto py-4 gap-2"
              onClick={() => navigate("/send-money")}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-semibold">Send</span>
            </Button>

            <Button
              variant="outline"
              className="flex-col h-auto py-4 gap-2"
              onClick={() => navigate("/merchant-pay")}
            >
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-xs font-semibold">Pay</span>
            </Button>
          </div>
        </Card>

        {/* Bill Pay Section */}
        <Card className="p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Pay Bills & Recharge</h3>
            <button
              onClick={() => navigate("/bill-pay")}
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              View All →
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { name: "Jio", logo: "/jio-logo.png" },
              { name: "Airtel", logo: "/airtel-logo.png" },
              { name: "Vi", logo: "/vi-logo.png" },
              { name: "BSNL", logo: "/bsnl-logo.png" },
              { name: "CESC", logo: "/cesc-logo.png" },
              { name: "Water", logo: "/kmc-water-logo.png" },
            ].map((provider) => (
              <button
                key={provider.name}
                onClick={() => navigate("/bill-pay")}
                className="flex flex-col items-center gap-2 min-w-[80px] p-3 hover:bg-accent/50 rounded-lg transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-background border border-border overflow-hidden flex items-center justify-center">
                  <img
                    src={provider.logo}
                    alt={provider.name}
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <span className="text-xs font-medium text-foreground">{provider.name}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Recent Transactions</h3>
            <button
              onClick={() => navigate("/history")}
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              View All →
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="text-sm text-muted-foreground mt-1">Start by adding money or sending to friends</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        txn.type === "received" || txn.type === "add_money"
                          ? "bg-success/10"
                          : "bg-destructive/10"
                      }`}
                    >
                      {txn.type === "received" || txn.type === "add_money" ? (
                        <ArrowDownLeft className="w-5 h-5 text-success" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {txn.counterparty_name || txn.merchant_id || txn.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(txn.created_at)}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-bold ${
                      txn.type === "received" || txn.type === "add_money"
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {txn.type === "received" || txn.type === "add_money" ? "+" : "-"}₹
                    {txn.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;