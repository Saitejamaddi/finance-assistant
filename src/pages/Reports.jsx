import { useTransactions } from '../context/TransactionContext';
import { PieChart,Pie,Cell,Tooltip,Legend,ResponsiveContainer,BarChart,Bar,XAxis,YAxis,CartesianGrid } from 'recharts';
import './Reports.css';
import './PageStyles.css';
const COLORS = ['#f97316','#3b82f6','#ef4444','#a855f7','#ec4899','#10b981','#6b7280'];
const Reports = () => {
  const { transactions, totalCredits, totalDebits } = useTransactions();
  const catMap = {};
  transactions.filter((t) => t.type==='debit').forEach((t) => { catMap[t.category]=(catMap[t.category]||0)+t.amount; });
  const pieData = Object.entries(catMap).map(([name,value]) => ({name,value}));
  const monMap = {};
  transactions.filter((t) => t.type==='debit').forEach((t) => { const m=t.date?.slice(0,7)||'?'; monMap[m]=(monMap[m]||0)+t.amount; });
  const barData = Object.entries(monMap).sort(([a],[b]) => a.localeCompare(b)).map(([month,total]) => ({month,total}));
  if (!transactions.length) return <div className="page"><h1 className="page-heading">Reports</h1><div className="empty-reports">No transactions yet. Add some to see your reports!</div></div>;
  return (
    <div className="page">
      <h1 className="page-heading">Reports</h1>
      <div className="report-summary">
        <div className="summary-card"><span className="summary-label">Total Debits</span><span className="summary-value" style={{color:'#ef4444'}}>₹{totalDebits.toFixed(0)}</span></div>
        <div className="summary-card"><span className="summary-label">Total Credits</span><span className="summary-value" style={{color:'#10b981'}}>₹{totalCredits.toFixed(0)}</span></div>
        <div className="summary-card"><span className="summary-label">Transactions</span><span className="summary-value">{transactions.length}</span></div>
      </div>
      {pieData.length > 0 && <div className="chart-card"><h2 className="chart-title">Spending by Category</h2><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>{pieData.map((e,i) => <Cell key={e.name} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip formatter={(v)=>`₹${v.toFixed(0)}`}/><Legend/></PieChart></ResponsiveContainer></div>}
      {barData.length > 0 && <div className="chart-card"><h2 className="chart-title">Monthly Spending</h2><ResponsiveContainer width="100%" height={300}><BarChart data={barData} margin={{top:10,right:20,left:0,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/><XAxis dataKey="month" tick={{fontSize:13}}/><YAxis tick={{fontSize:13}}/><Tooltip formatter={(v)=>`₹${v.toFixed(0)}`}/><Bar dataKey="total" fill="#3b82f6" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div>}
    </div>
  );
};
export default Reports;
