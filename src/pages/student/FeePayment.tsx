import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, CheckCircle2, IndianRupee, History, Wallet, ArrowRight } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface FeeData {
  totalFee: number;
  paidAmount: number;
  paymentHistory: any[];
}

const TOTAL_EXPECTED_FEE = 52500; // Updated to match previous UI total (45000+2500+5000)

const FeePayment = () => {
  const { toast } = useToast();
  const { userName, token } = useAuth();
  const [feeData, setFeeData] = useState<FeeData>({
    totalFee: TOTAL_EXPECTED_FEE,
    paidAmount: 0,
    paymentHistory: []
  });
  const [payAmount, setPayAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Sync fee data from backend or fallback to local
  const fetchFeeStatus = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/fees/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setFeeData({
          totalFee: data.tuitionFee + data.libraryFee + data.labFee,
          paidAmount: data.feesPaid ? (data.tuitionFee + data.libraryFee + data.labFee) : 0,
          paymentHistory: data.paymentHistory || []
        });
      }
    } catch (err) {
      console.error('Error fetching fee status:', err);
    }
  };

  useEffect(() => {
    fetchFeeStatus();
  }, [token]);

  const payNow = async () => {
    const amount = parseInt(payAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount to pay.", variant: "destructive" });
      return;
    }

    const remaining = feeData.totalFee - feeData.paidAmount;
    if (amount > remaining) {
      toast({ title: "Overpayment", description: `You only need to pay ₹${remaining}.`, variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on backend
      const res = await fetch('http://localhost:5000/api/fees/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      
      const order = await res.json();
      if (!res.ok) throw new Error(order.error || "Failed to create order");

      // 2. Options for Razorpay
      const options = {
        key: "rzp_test_SbTdn6R53UiK1S", // Test Key ID
        amount: order.amount,
        currency: order.currency,
        name: "SmartCampus Portal",
        description: "Student Fee Payment",
        order_id: order.id,
        handler: async (response: any) => {
          // 3. Verify payment on backend
          try {
            const verifyRes = await fetch('http://localhost:5000/api/fees/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyRes.ok) {
              toast({ title: "Payment Successful", description: `₹${amount} has been successfully paid.` });
              fetchFeeStatus();
              setPayAmount("");
            } else {
              toast({ title: "Verification Failed", description: "Payment verification failed. Please contact admin.", variant: "destructive" });
            }
          } catch (err) {
            toast({ title: "Error", description: "Something went wrong during verification.", variant: "destructive" });
          }
        },
        prefill: {
          name: userName,
        },
        theme: {
          color: "#0F172A"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast({ title: "Payment Failed", description: response.error.description, variant: "destructive" });
      });
      rzp.open();
    } catch (err: any) {
      toast({ title: "Order Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const balance = feeData.totalFee - feeData.paidAmount;
  const isFullyPaid = balance === 0;

  return (
    <div className="p-6 space-y-8 animate-fade-in bg-slate-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fee Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your academic finances and payments</p>
        </div>
        {isFullyPaid && (
          <div className="flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl border-2 border-emerald-100 shadow-sm animate-bounce">
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-black text-sm uppercase tracking-wider">Fees Fully Paid</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-none shadow-2xl rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <IndianRupee className="w-24 h-24 text-white" />
            </div>
            <CardHeader className="relative z-10">
              <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Semester Fee</CardDescription>
              <CardTitle className="text-4xl font-black text-white">₹{feeData.totalFee.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-white border-slate-100 shadow-xl rounded-3xl overflow-hidden relative group">
            <CardHeader>
              <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Amount Paid</CardDescription>
              <CardTitle className="text-4xl font-black text-emerald-600">₹{feeData.paidAmount.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-white border-slate-100 shadow-xl rounded-3xl overflow-hidden relative group">
             <CardHeader>
              <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Pending Balance</CardDescription>
              <CardTitle className={`text-4xl font-black ${balance > 0 ? 'text-amber-500' : 'text-slate-300'}`}>₹{balance.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">Make a Payment</CardTitle>
                  <CardDescription className="font-medium">Secure Payment Gateway Integration</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-black text-slate-500 uppercase tracking-widest ml-1">Payment Amount (INR)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <IndianRupee className="h-6 w-6 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    type="number"
                    placeholder="Enter amount to pay..."
                    className="pl-14 h-20 text-3xl font-black rounded-3xl bg-slate-50 border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    disabled={isFullyPaid}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[1000, 5000, 10000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPayAmount(amt.toString())}
                    disabled={isFullyPaid || amt > balance}
                    className="py-3 px-4 rounded-xl border-2 border-slate-100 text-slate-600 font-bold text-sm hover:border-primary hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    + ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-8 bg-slate-50/50">
              <Button
                className="w-full h-16 text-xl font-black rounded-2xl gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.01]"
                onClick={payNow}
                disabled={isFullyPaid || loading || !payAmount}
              >
                {loading ? "Initializing Razorpay..." : isFullyPaid ? "Paid in Full" : "Finalize Payment"}
                {!isFullyPaid && !loading && <ArrowRight className="w-6 h-6" />}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-slate-400" />
                <CardTitle className="text-lg font-bold">Transaction History</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-y-auto">
              {feeData.paymentHistory.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No transactions yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {feeData.paymentHistory.map((payment, i) => (
                    <div key={i} className="p-6 hover:bg-slate-50/50 transition-colors flex justify-between items-center group">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <p className="font-black text-slate-800">₹{payment.amount.toLocaleString()}</p>
                           <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Success</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono font-bold tracking-tight">{payment.orderId || payment.id}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(payment.date).toLocaleDateString()} • {new Date(payment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                  )).reverse()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FeePayment;
