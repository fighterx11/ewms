import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";

const MetroTicketDialog = ({ open, onOpenChange, transaction }) => {
  if (!transaction) return null;

  // Parse metro details from transaction note
  // Format: "Metro: FromStation to ToStation (Line Name)"
  const parseMetroDetails = () => {
    const note = transaction.note || "";
    const match = note.match(/Metro: (.+?) to (.+?) \((.+?)\)/);

    if (match) {
      return {
        from: match[1],
        to: match[2],
        line: match[3]
      };
    }
    return null;
  };

  const metroDetails = parseMetroDetails();
  if (!metroDetails) return null;

  // Calculate validity time (45 minutes from transaction time)
  const transactionDate = new Date(transaction.created_at);
  const validityDate = new Date(transactionDate.getTime() + 45 * 60 * 1000);

  const formatDateTime = (date) => {
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md max-h-[85vh] p-0 gap-0 overflow-hidden">
        <div className="sticky top-0 bg-background border-b px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <AlertDialogTitle className="text-xl font-bold">Metro Ticket</AlertDialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-120px)] p-6">
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 space-y-4 shadow-inner">
            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`KOLKATA METRO\nFrom: ${metroDetails.from}\nTo: ${metroDetails.to}\nFare: ₹${transaction.amount}\nValid: ${formatDateTime(validityDate)}`)}`}
                  alt="Ticket QR Code"
                  className="w-44 h-44"
                />
              </div>
            </div>

            {/* Ticket Details */}
            <div className="bg-background/50 rounded-lg p-4 space-y-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">From</p>
                <p className="text-lg font-bold text-foreground">{metroDetails.from}</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="text-xl text-primary font-bold">↓</div>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">To</p>
                <p className="text-lg font-bold text-foreground">{metroDetails.to}</p>
              </div>
            </div>

            <div className="bg-background/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Line</span>
                <span className="text-sm font-semibold text-foreground">{metroDetails.line}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Fare Paid</span>
                <span className="text-xl font-bold text-success">₹{transaction.amount}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Booked At</span>
                <span className="text-sm font-semibold text-foreground">{formatDateTime(transactionDate)}</span>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-foreground">Valid Until</span>
                  <span className="text-sm font-bold text-foreground">{formatDateTime(validityDate)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Entry expires 45 minutes after booking</p>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                📱 Present this QR code at the metro entry gate
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-background border-t p-4">
          <Button
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MetroTicketDialog;