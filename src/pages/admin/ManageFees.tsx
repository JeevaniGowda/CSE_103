import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndianRupee, Users, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';

const ManageFees = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, fullyPaid: 0 });

  useEffect(() => {
    const allFeesSaved = localStorage.getItem('all_student_fees');
    if (allFeesSaved) {
      const data = JSON.parse(allFeesSaved);
      const studentList = Object.keys(data).map(name => ({
        name,
        ...data[name],
        balance: data[name].totalFee - data[name].paidAmount
      }));
      setStudents(studentList);

      const totalCollected = studentList.reduce((acc, s) => acc + s.paidAmount, 0);
      const totalPending = studentList.reduce((acc, s) => acc + s.balance, 0);
      const paidCount = studentList.filter(s => s.balance === 0).length;
      
      setStats({
        total: totalCollected,
        pending: totalPending,
        fullyPaid: paidCount
      });
    }
  }, []);

  return (
    <div className="p-6 space-y-8 animate-fade-in bg-slate-50/20 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight tracking-tight">Financial Oversight</h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time status of university fee collections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-none shadow-xl rounded-3xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 text-slate-400 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <CardDescription className="font-bold uppercase tracking-widest text-[10px] text-slate-400">Total Collected</CardDescription>
            </div>
            <CardTitle className="text-4xl font-black text-white italic">₹{stats.total.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-white border-slate-100 shadow-xl rounded-3xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 text-amber-500 mb-2">
              <AlertCircle className="w-4 h-4" />
              <CardDescription className="font-bold uppercase tracking-widest text-[10px]">Outstanding Balance</CardDescription>
            </div>
            <CardTitle className="text-4xl font-black text-slate-800">₹{stats.pending.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white border-slate-100 shadow-xl rounded-3xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 text-primary mb-2">
              <Users className="w-4 h-4" />
              <CardDescription className="font-bold uppercase tracking-widest text-[10px]">Students fully paid</CardDescription>
            </div>
            <CardTitle className="text-4xl font-black text-slate-800">{stats.fullyPaid} <span className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Users</span></CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-white border-none shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
          <CardTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">Active Student Registry</CardTitle>
          <CardDescription className="font-medium">Fee status for Academic Year 2026</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="py-5 px-8">Student Name</th>
                  <th className="py-5 px-8">Paid to Date</th>
                  <th className="py-5 px-8">Pending Balance</th>
                  <th className="py-5 px-8">Status</th>
                  <th className="py-5 px-8 text-right">Records</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                         <Wallet className="w-10 h-10 text-slate-200" />
                       </div>
                       <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No activity recorded</p>
                    </td>
                  </tr>
                ) : students.map((s, i) => {
                  const status = s.balance === 0 ? "Fully Paid" : s.paidAmount > 0 ? "Partial" : "Pending";
                  const statusColor = s.balance === 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : s.paidAmount > 0 ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100";
                  
                  return (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 uppercase group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-lg uppercase tracking-tight">{s.name}</p>
                            <p className="text-xs font-bold text-slate-400">ENR-2026-00{i+1}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-8 font-black text-emerald-600">
                        ₹{s.paidAmount.toLocaleString()}
                      </td>
                      <td className="py-6 px-8 font-black text-slate-800">
                        ₹{s.balance.toLocaleString()}
                      </td>
                      <td className="py-6 px-8">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${statusColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600">Details</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageFees;
