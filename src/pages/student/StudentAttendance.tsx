import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, XCircle, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Html5Qrcode } from "html5-qrcode";

const StudentAttendance = () => {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const { role, token } = useAuth();

  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  const fetchAttendance = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/attendance/student', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setAttendanceData(data);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [token]);

  const startScanner = async () => {
    setScanResult(null);
    setScannerOpen(true);
  };

  useEffect(() => {
    if (!scannerOpen) return;

    let html5Qrcode: Html5Qrcode | null = null;

    const initScanner = async () => {
      await new Promise((r) => setTimeout(r, 300));
      html5Qrcode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5Qrcode;

      try {
        await html5Qrcode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            try {
              // Call Backend API to mark attendance
              const response = await fetch('http://localhost:5000/api/attendance/mark', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ qrData: decodedText })
              });

              const result = await response.json();

              if (response.ok) {
                setScanResult(result.class);
                toast({
                  title: "Attendance Marked!",
                  description: `Successfully marked present for ${result.class}`,
                });
                fetchAttendance(); // Refresh list
              } else {
                toast({
                  title: "Failed to mark attendance",
                  description: result.error || "Please try again",
                  variant: "destructive"
                });
              }
            } catch (err) {
               toast({
                title: "Scan Error",
                description: "Could not connect to the server",
                variant: "destructive"
              });
            }
            html5Qrcode?.stop().catch(() => {});
            setScannerOpen(false);
          },
          () => {}
        );
      } catch (err) {
        toast({
          title: "Camera Error",
          description: "Could not access camera. Please allow camera permissions.",
          variant: "destructive",
        });
        setScannerOpen(false);
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [scannerOpen, toast, token]);

  const closeScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScannerOpen(false);
    setScanResult(null);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Attendance</h1>
        <Button onClick={startScanner}>
          <Camera className="w-4 h-4 mr-2" /> Scan QR Code
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{attendanceData.length}</div>
          <div className="text-xs text-muted-foreground">Total Days</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-success">
            {attendanceData.filter(a => a.status === 'present').length}
          </div>
          <div className="text-xs text-muted-foreground">Present</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-destructive">
            {attendanceData.filter(a => a.status === 'absent').length}
          </div>
          <div className="text-xs text-muted-foreground">Absent</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-3 font-medium text-muted-foreground">Date/Time</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Class</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                  No attendance records found.
                </td>
              </tr>
            ) : attendanceData.map((row, idx) => (
              <tr key={idx} className="border-b border-border last:border-0">
                <td className="p-3 text-foreground">
                  <div>{row.date}</div>
                  <div className="text-[10px] text-muted-foreground">{row.time}</div>
                </td>
                <td className="p-3 text-foreground font-medium">{row.class}</td>
                <td className="p-3">
                  <span className="stat-badge bg-success/10 text-success"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* QR Scanner Dialog */}
      <Dialog open={scannerOpen} onOpenChange={(open) => { if (!open) closeScanner(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
          </DialogHeader>
          {scanResult ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Attendance Marked!</h3>
              <p className="text-sm text-muted-foreground">Class: {scanResult}</p>
              <Button className="mt-4" onClick={closeScanner}>Done</Button>
            </div>
          ) : (
            <div>
              <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />
              <p className="text-xs text-muted-foreground text-center mt-3">
                Point your camera at the QR code displayed by your teacher
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentAttendance;
