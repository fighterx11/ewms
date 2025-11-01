import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PinVerification from "@/components/PinVerification";

const MetroBooking = () => {
  const navigate = useNavigate();
  const [selectedLine, setSelectedLine] = useState("");
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPinVerification, setShowPinVerification] = useState(false);
  const [calculatedFare, setCalculatedFare] = useState(0);
  const [showTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState(null);

  const metroLines = {
    blue: {
      name: "Blue Line (North-South)",
      color: "bg-blue-500",
      stations: [
        "Dakshineswar", "Baranagar", "Noapara", "Belgachia", "Shyambazar",
        "Shobhabazar Sutanuti", "Girish Park", "Mahatma Gandhi Road", "Central",
        "Chandni Chowk", "Esplanade", "Park Street", "Maidan", "Rabindra Sadan",
        "Netaji Bhawan", "Jatin Das Park", "Gitanjali", "Kavi Nazrul",
        "Ghatak Pukur", "Sonarpur", "Kamalgachi", "Kavi Subhash (New Garia)"
      ]
    },
    green: {
      name: "Green Line (East-West)",
      color: "bg-green-500",
      stations: [
        "Sector V", "Salt Lake Stadium", "Central Park", "City Centre",
        "Bidhannagar Road", "Phoolbagan", "Sealdah", "B.B.D. Bag",
        "Esplanade", "Mahakaran", "Howrah", "Howrah Maidan"
      ]
    },
    purple: {
      name: "Purple Line",
      color: "bg-purple-500",
      stations: [
        "Joka", "Thakurpukur", "Majerhat", "Kidderpore", "Park Circus",
        "Esplanade"
      ]
    },
    orange: {
      name: "Orange Line",
      color: "bg-orange-500",
      stations: [
        "New Garia", "Hemanta Mukhopadhyay", "Bansdroni", "Naktala",
        "Metropolitan", "Kudghat"
      ]
    }
  };

  const calculateFare = (line, from, to) => {
    if (!line || !from || !to || from === to) return 0;

    const stations = metroLines[line].stations;
    const fromIndex = stations.indexOf(from);
    const toIndex = stations.indexOf(to);

    if (fromIndex === -1 || toIndex === -1) return 0;

    const distance = Math.abs(toIndex - fromIndex);
    const totalStations = stations.length - 1;

    // Linear interpolation between min (5) and max (30) fare
    const rawFare = 5 + (distance / totalStations) * 25;

    // Round to nearest multiple of 5
    const fare = Math.round(rawFare / 5) * 5;

    return Math.max(5, Math.min(30, fare));
  };

  const handleStationChange = (type, station) => {
    if (type === "from") {
      setFromStation(station);
      if (toStation) {
        const fare = calculateFare(selectedLine, station, toStation);
        setCalculatedFare(fare);
      }
    } else {
      setToStation(station);
      if (fromStation) {
        const fare = calculateFare(selectedLine, fromStation, station);
        setCalculatedFare(fare);
      }
    }
  };

  const handleLineChange = (line) => {
    setSelectedLine(line);
    setFromStation("");
    setToStation("");
    setCalculatedFare(0);
  };

  const handleInitiateBooking = () => {
    const userId = sessionStorage.getItem("easypay_user_id");
    if (!userId) {
      navigate("/login");
      return;
    }

    if (!selectedLine || !fromStation || !toStation) {
      toast.error("Please select line and stations");
      return;
    }

    if (fromStation === toStation) {
      toast.error("Please select different stations");
      return;
    }

    setShowPinVerification(true);
  };

  const handleBooking = async () => {
    const userId = sessionStorage.getItem("easypay_user_id");
    const discountedFare = Math.round(calculatedFare * 0.9); // 10% discount

    setIsProcessing(true);

    // Get current balance
    const { data: userData } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId)
      .single();

    if (!userData || userData.balance < discountedFare) {
      toast.error(`Insufficient balance. You have ₹${userData?.balance || 0}`);
      setIsProcessing(false);
      return;
    }

    // Update balance
    await supabase
      .from("users")
      .update({ balance: userData.balance - discountedFare })
      .eq("id", userId);

    // Create transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      type: "bill",
      amount: discountedFare,
      counterparty_name: "Aamar Kolkata Metro",
      note: `Metro: ${fromStation} to ${toStation} (${metroLines[selectedLine].name})`
    });

    // Calculate validity time (45 minutes from now)
    const validityTime = new Date(Date.now() + 45 * 60 * 1000);

    // Set ticket data and show ticket
    setTicketData({
      from: fromStation,
      to: toStation,
      line: metroLines[selectedLine].name,
      fare: discountedFare,
      validUpto: validityTime.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      bookingTime: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    });

    setShowPinVerification(false);
    setShowTicket(true);
    setIsProcessing(false);
    toast.success("Metro ticket booked successfully!");
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

        {showTicket && ticketData ? (
          <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Metro Ticket</h2>
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-accent rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 space-y-4">
              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`KOLKATA METRO\nFrom: ${ticketData.from}\nTo: ${ticketData.to}\nFare: ₹${ticketData.fare}\nValid: ${ticketData.validUpto}`)}`}
                  alt="Ticket QR Code"
                  className="w-48 h-48 bg-white p-2 rounded-lg"
                />
              </div>

              {/* Ticket Details */}
              <div className="space-y-3 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="text-lg font-bold text-foreground">{ticketData.from}</p>
                </div>
                <div className="text-2xl text-muted-foreground">↓</div>
                <div>
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="text-lg font-bold text-foreground">{ticketData.to}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Line:</span>
                  <span className="text-sm font-semibold text-foreground">{ticketData.line}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fare:</span>
                  <span className="text-lg font-bold text-success">₹{ticketData.fare}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Booked At:</span>
                  <span className="text-sm font-semibold text-foreground">{ticketData.bookingTime}</span>
                </div>
                <div className="flex justify-between items-center bg-yellow-500/20 p-2 rounded">
                  <span className="text-sm font-semibold text-foreground">Entry Valid Up To:</span>
                  <span className="text-sm font-bold text-foreground">{ticketData.validUpto}</span>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Present this QR code at the metro entry gate
              </p>
            </div>

            <Button
              className="w-full mt-6"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </Card>
        ) : (
          <Card className="p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/kolkata-metro-logo.png"
                alt="Kolkata Metro"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Aamar Kolkata Metro</h1>
                <p className="text-sm text-muted-foreground">Book your metro ride (10% discount)</p>
              </div>
            </div>

          {/* Line Selection */}
          <div className="space-y-2 mb-6">
            <Label>Select Metro Line</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(metroLines).map(([key, line]) => (
                <Button
                  key={key}
                  variant={selectedLine === key ? "default" : "outline"}
                  onClick={() => handleLineChange(key)}
                  className="h-auto py-3 justify-start gap-2"
                >
                  <div className={`w-3 h-3 rounded-full ${line.color}`} />
                  <span className="text-sm font-semibold">{line.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {selectedLine && (
            <>
              {/* From Station */}
              <div className="space-y-2 mb-4">
                <Label>From Station</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                  {metroLines[selectedLine].stations.map((station) => (
                    <button
                      key={station}
                      onClick={() => handleStationChange("from", station)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        fromStation === station
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "hover:bg-accent"
                      }`}
                      disabled={toStation === station}
                    >
                      {station}
                    </button>
                  ))}
                </div>
              </div>

              {/* To Station */}
              <div className="space-y-2 mb-4">
                <Label>To Station</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                  {metroLines[selectedLine].stations.map((station) => (
                    <button
                      key={station}
                      onClick={() => handleStationChange("to", station)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        toStation === station
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "hover:bg-accent"
                      }`}
                      disabled={fromStation === station}
                    >
                      {station}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fare Display */}
              {calculatedFare > 0 && (
                <div className="mb-6 p-4 bg-accent/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Base Fare:</span>
                    <span className="text-lg font-semibold line-through text-muted-foreground">₹{calculatedFare}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-success">After 10% Discount:</span>
                    <span className="text-2xl font-bold text-success">₹{Math.round(calculatedFare * 0.9)}</span>
                  </div>
                </div>
              )}

              <Button
                className="w-full h-12 text-base font-semibold"
                onClick={handleInitiateBooking}
                disabled={isProcessing || !fromStation || !toStation || fromStation === toStation}
              >
                {isProcessing ? "Processing..." : "Book Metro Ticket"}
              </Button>
            </>
          )}

          <PinVerification
            open={showPinVerification}
            onOpenChange={setShowPinVerification}
            onSuccess={handleBooking}
            title="Verify PIN to Book Ticket"
          />

            <div className="mt-6 p-4 bg-accent/50 rounded-lg">
              <p className="text-xs text-center text-muted-foreground">
                <span className="font-semibold">Special Offer:</span> Get 10% discount on all metro bookings
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MetroBooking;