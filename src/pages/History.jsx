import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import MetroTicketDialog from "@/components/MetroTicketDialog";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter
} from "lucide-react";

const History = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filteredTxns, setFilteredTxns] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedMetroTicket, setSelectedMetroTicket] = useState(null);
  const [showMetroTicket, setShowMetroTicket] = useState(false);

  useEffect(() => {
    const userId = sessionStorage.getItem("easypay_user_id");
    if (!userId) {
      navigate("/login");
      return;
    }

    loadTransactions(userId);
  }, [navigate]);

  useEffect(() => {
    let filtered = transactions;

    if (filter !== "all") {
      filtered = filtered.filter(txn => {
        if (filter === "sent") return txn.type === "sent";
        if (filter === "received") return txn.type === "received" || txn.type === "add_money";
        if (filter === "bills") return txn.type === "bill" || txn.type === "merchant";
        return true;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(txn =>
        txn.counterparty_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.merchant_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.counterparty_mobile?.includes(searchQuery)
      );
    }

    setFilteredTxns(filtered);
  }, [transactions, filter, searchQuery]);

  const loadTransactions = async (userId) => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTransactions(data);
      setFilteredTxns(data);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const filterButtons = [
    { id: "all", label: "All" },
    { id: "sent", label: "Sent" },
    { id: "received", label: "Received" },
    { id: "bills", label: "Bills" }
  ];

  const isMetroTransaction = (txn) => {
    return txn.counterparty_name === "Aamar Kolkata Metro" && txn.note?.includes("Metro:");
  };

  const handleTransactionClick = (txn) => {
    if (isMetroTransaction(txn)) {
      setSelectedMetroTicket(txn);
      setShowMetroTicket(true);
    }
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
          <h1 className="text-2xl font-bold text-foreground mb-6">Transaction History</h1>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, mobile, or merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {filterButtons.map((btn) => (
              <Button
                key={btn.id}
                variant={filter === btn.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(btn.id)}
                className="flex-shrink-0"
              >
                {btn.label}
              </Button>
            ))}
          </div>

          {/* Transactions List */}
          {filteredTxns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTxns.map((txn) => {
                const isPositive = txn.type === "received" || txn.type === "add_money";
                const displayName = txn.counterparty_name || txn.merchant_id || txn.type;

                return (
                  <div
                    key={txn.id}
                    onClick={() => handleTransactionClick(txn)}
                    className="flex items-center justify-between p-4 hover:bg-accent/50 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isPositive ? "bg-success/10" : "bg-destructive/10"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowDownLeft className="w-6 h-6 text-success" />
                        ) : (
                          <ArrowUpRight className="w-6 h-6 text-destructive" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(txn.created_at)}
                        </p>
                        {txn.note && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {txn.note}
                          </p>
                        )}
                        {txn.counterparty_mobile && (
                          <p className="text-xs text-muted-foreground">
                            {txn.counterparty_mobile}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p
                        className={`font-bold text-base ${
                          isPositive ? "text-success" : "text-destructive"
                        }`}
                      >
                        {isPositive ? "+" : "-"}₹{txn.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {txn.status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <MetroTicketDialog
          open={showMetroTicket}
          onOpenChange={setShowMetroTicket}
          transaction={selectedMetroTicket}
        />
      </div>
    </div>
  );
};

export default History;