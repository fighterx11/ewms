import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Lock } from "lucide-react";

const PinVerification = ({ open, onOpenChange, onSuccess, title = "Verify PIN" }) => {
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);

  const handleVerify = () => {
    if (pin.length !== 4) {
      toast.error("PIN must be 4 digits");
      return;
    }

    if (pin !== "1234") {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 3) {
        toast.error("Too many incorrect attempts. Please try again later.");
        setPin("");
        onOpenChange(false);
        return;
      }

      toast.error(`Wrong PIN. ${3 - newAttempts} attempts remaining.`);
      setPin("");
      return;
    }

    // PIN correct
    setPin("");
    setAttempts(0);
    onSuccess();
  };

  const handleCancel = () => {
    setPin("");
    setAttempts(0);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Enter your 4-digit PIN to authorize this transaction
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
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

          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={attempts >= 3}
              className="flex-1"
            >
              {attempts >= 3 ? "Locked" : "Verify"}
            </Button>
          </div>
        </div>

        <div className="p-3 bg-accent/50 rounded-lg">
          <p className="text-xs text-center text-muted-foreground">
            <span className="font-semibold">Prototype Mode:</span> PIN is <span className="font-mono">1234</span>
          </p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PinVerification;