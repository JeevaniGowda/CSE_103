import { useState, useMemo, useEffect } from "react";
import { QrCode, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCodeSVG } from "qrcode.react";
import { io } from "socket.io-client";

const QRAttendance = () => {
  const [classes, setClasses] = useState<string[]>(["Mathematics", "Physics", "Chemistry", "Computer Science"]); 
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrKey, setQrKey] = useState(0);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("attendance_marked", (data) => {
      // Only show if it matches the current teacher's class (simplified for this demo)
      setRecentScans((prev) => [data, ...prev].slice(0, 10));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const qrValue = useMemo(() => {
    if (!qrGenerated || !selectedClass) return "";
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(2, 8);
    return JSON.stringify({
      class: selectedClass,
      timestamp,
      sessionId: `${selectedClass}-${uniqueId}-${timestamp}`,
      type: "attendance",
    });
  }, [qrGenerated, selectedClass, qrKey]);

  return (
    <div className="page-container animate-fade-in">
      <h1 className="section-title mb-6">QR Attendance</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Generate QR Code</h2>
            <div className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold uppercase">Valid for 10 mins</div>
          </div>
          <div className="space-y-4">
            <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setQrGenerated(false); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button className="w-full" disabled={!selectedClass} onClick={() => { setQrGenerated(true); setQrKey((k) => k + 1); }}>
              <QrCode className="w-4 h-4 mr-2" /> Generate QR
            </Button>

            {qrGenerated && qrValue && (
              <div className="animate-slide-up">
                <div className="aspect-square max-w-[240px] mx-auto bg-white rounded-xl flex items-center justify-center p-6 border-2 border-dashed border-border shadow-inner">
                  <div className="text-center">
                    <QRCodeSVG
                      value={qrValue}
                      size={180}
                      level="H"
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#1a1a2e"
                    />
                    <p className="text-xs text-muted-foreground mt-2 font-medium">{selectedClass}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => { setQrKey((k) => k + 1); }}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-2">QR dynamic key updated. Old scans will expire soon.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Recent Scans (Live)</h2>
          <div className="space-y-2.5">
            {recentScans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">No students scanned yet.</p>
                <p className="text-[10px] text-slate-300 uppercase mt-1">Generate a QR code and ask students to scan</p>
              </div>
            ) : recentScans.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-transparent hover:border-primary/20 transition-all animate-in slide-in-from-right-2">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{s.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="text-primary font-medium">{s.class}</span> • {s.time}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-success/10 text-success px-2 py-1 rounded-full text-[10px] font-bold uppercase">
                   <CheckCircle2 className="w-3 h-3" /> Verified
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRAttendance;

