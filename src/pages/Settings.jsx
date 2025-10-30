import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Fingerprint, LogOut, User, Shield } from "lucide-react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const navigate = useNavigate();
  const [showChangePIN, setShowChangePIN] = useState(false);
  const [currentPIN, setCurrentPIN] = useState("");
  const [newPIN, setNewPIN] = useState("");
  const [confirmPIN, setConfirmPIN] = useState("");
  const [step, setStep] = useState("current");

  const userName = sessionStorage.getItem("easypay_user_name") || "User";
  const userMobile = sessionStorage.getItem("easypay_user_mobile") || "";

  const handleChangePIN = () => {
    if (step === "current") {
      if (currentPIN !== "1234") {
        toast.error("Wrong PIN. Try 1234");
        setCurrentPIN("");
        return;
      }
      setStep("new");
    } else if (step === "new") {
      if (newPIN.length !== 4) {
        toast.error("PIN must be 4 digits");
        return;
      }
      setStep("confirm");
    } else {
      if (confirmPIN !== newPIN) {
        toast.error("PINs do not match");
        setConfirmPIN("");
        return;
      }
      toast.success("PIN changed successfully!");
      setShowChangePIN(false);
      setCurrentPIN("");
      setNewPIN("");
      setConfirmPIN("");
      setStep("current");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleSkipBiometric = () => {
    toast.info("Biometric authentication skipped for development");
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

        <Card className="p-6 shadow-lg mb-4">
          <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

          {/* Profile Section */}
          <div className="mb-6 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{userName}</h2>
                <p className="text-sm text-muted-foreground">{userMobile}</p>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5" />
              Security Settings
            </h3>

            {/* Change PIN */}
            {!showChangePIN ? (
              <Button
                variant="outline"
                className="w-full justify-start h-14"
                onClick={() => setShowChangePIN(true)}
              >
                <Lock className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <p className="font-semibold">Change PIN</p>
                  <p className="text-xs text-muted-foreground">Update your 4-digit PIN</p>
                </div>
              </Button>
            ) : (
              <Card className="p-4 bg-accent/50">
                <h4 className="font-semibold text-foreground mb-4">
                  {step === "current" && "Enter Current PIN"}
                  {step === "new" && "Enter New PIN"}
                  {step === "confirm" && "Confirm New PIN"}
                </h4>
                <div className="flex justify-center mb-4">
                  <InputOTP
                    maxLength={4}
                    value={
                      step === "current"
                        ? currentPIN
                        : step === "new"
                        ? newPIN
                        : confirmPIN
                    }
                    onChange={
                      step === "current"
                        ? setCurrentPIN
                        : step === "new"
                        ? setNewPIN
                        : setConfirmPIN
                    }
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowChangePIN(false);
                      setCurrentPIN("");
                      setNewPIN("");
                      setConfirmPIN("");
                      setStep("current");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleChangePIN}>
                    {step === "confirm" ? "Confirm" : "Continue"}
                  </Button>
                </div>
              </Card>
            )}

            {/* Biometric */}
            <Button
              variant="outline"
              className="w-full justify-start h-14"
              onClick={handleSkipBiometric}
            >
              <Fingerprint className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-semibold">Biometric Authentication</p>
                <p className="text-xs text-muted-foreground">Skip for Development</p>
              </div>
            </Button>
          </div>
        </Card>

        {/* Logout */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full h-12 text-base font-semibold">
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout? You'll need to login again to access your wallet.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="mt-4 p-4 bg-card rounded-lg shadow">
          <p className="text-xs text-center text-muted-foreground">
            <span className="font-semibold">Prototype Mode:</span> Current PIN is always 1234
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
