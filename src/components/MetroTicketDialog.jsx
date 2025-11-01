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
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle>Metro Ticket</AlertDialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </AlertDialogHeader>

        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 space-y-4">
          {/* QR Code */}
          <div className="flex justify-center mb-4">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`KOLKATA METRO\nFrom: ${metroDetails.from}\nTo: ${metroDetails.to}\nFare: ₹${transaction.amount}\nValid: ${formatDateTime(validityDate)}`)}`}
              alt="Ticket QR Code"
              className="w-48 h-48 bg-white p-2 rounded-lg"
            />
          </div>

          {/* Ticket Details */}
          <div className="space-y-3 text-center">
            <div>
              <p className="text-sm text-muted-foreground">From</p>
              <p className="text-lg font-bold text-foreground">{metroDetails.from}</p>
            </div>
            <div className="text-2xl text-muted-foreground">↓</div>
            <div>
              <p className="text-sm text-muted-foreground">To</p>
              <p className="text-lg font-bold text-foreground">{metroDetails.to}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Line:</span>
              <span className="text-sm font-semibold text-foreground">{metroDetails.line}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Fare:</span>
              <span className="text-lg font-bold text-success">₹{transaction.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Booked At:</span>
              <span className="text-sm font-semibold text-foreground">{formatDateTime(transactionDate)}</span>
            </div>
            <div className="flex justify-between items-center bg-yellow-500/20 p-2 rounded">
              <span className="text-sm font-semibold text-foreground">Entry Valid Up To:</span>
              <span className="text-sm font-bold text-foreground">{formatDateTime(validityDate)}</span>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Present this QR code at the metro entry gate
          </p>
        </div>

        <Button
          className="w-full"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MetroTicketDialog;