import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  PlusCircle, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Calendar, 
  Tag, 
  CreditCard, 
  CheckCircle2, 
  SlidersHorizontal,
  Smartphone,
  DollarSign,
  Building2,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

// Default Accounts Data with Interest Rates
const INITIAL_ACCOUNTS = [
  { id: 'nu', name: 'Nu Cajita', balance: 45200.50, APY: 13.5, color: '#8A05BE', type: 'inversion' },
  { id: 'cetes', name: 'CETES Directo', balance: 85000.00, APY: 11.0, color: '#008080', type: 'inversion' },
  { id: 'stori', name: 'Stori Inversión', balance: 24500.00, APY: 13.9, color: '#00C853', type: 'inversion' },
  { id: 'mp', name: 'Mercado Pago', balance: 12300.20, APY: 15.0, color: '#00A9E0', type: 'inversion' },
  { id: 'bbva', name: 'BBVA Débito', balance: 18450.00, APY: 0.0, color: '#004481', type: 'debito' },
  { id: 'efectivo', name: 'Efectivo', balance: 2500.00, APY: 0.0, color: '#FFB300', type: 'efectivo' },
];

const INITIAL_TRANSACTIONS = [
  { id: 't1', date: '2026-11-04', amount: 1450.00, type: 'Egreso', account: 'BBVA Débito', category: 'Supermercado', distribution: '50% Necesidad', notes: 'Despensa quincenal' },
  { id: 't2', date: '2026-11-03', amount: 350.00, type: 'Egreso', account: 'Mercado Pago', category: 'Entretenimiento', distribution: '30% Deseo', notes: 'Cine y golosinas' },
  { id: 't3', date: '2026-11-01', amount: 15000.00, type: 'Ingreso', account: 'BBVA Débito', category: 'Nómima', distribution: '20% Ahorro', notes: 'Pago Quincenal' },
  { id: 't4', date: '2026-10-30', amount: 899.00, type: 'Egreso', account: 'Nu Cajita', category: 'Servicios', distribution: '50% Necesidad', notes: 'Servicio de Internet' },
  { id: 't5', date: '2026-10-28', amount: 2000.00, type: 'Ingreso', account: 'Stori Inversión', category: 'Rendimientos', distribution: '20% Ahorro', notes: 'Rendimiento mensual' },
];

const CATEGORIES = [
  'Alimentación / Super',
  'Vivienda & Servicios',
  'Transporte',
  'Entretenimiento',
  'Salud & Bienestar',
  'Educación',
  'Ropa & Calzado',
  'Nómima',
  'Otros Ingresos'
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'capture', 'accounts', 'analytics'
  const [darkMode, setDarkMode] = useState(true);
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [filterType, setFilterType] = useState('todos');

  // Form State
  const [form, setForm] = useState({
    type: 'Egreso',
    amount: '',
    account: 'Nu Cajita',
    category: 'Alimentación / Super',
    distribution: '50% Necesidad',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Calculations
  const totals = useMemo(() => {
    const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
    
    // Daily interest earned on active investment accounts
    const dailyYield = accounts.reduce((acc, curr) => {
      if (curr.type === 'inversion' && curr.APY > 0) {
        const dailyRate = (curr.APY / 100) / 365;
        return acc + (curr.balance * dailyRate);
      }
      return acc;
    }, 0);

    const monthlyYield = dailyYield * 30.41;

    return { totalBalance, dailyYield, monthlyYield };
  }, [accounts]);

  // Handle Form Submission
  const handleSubmitTransaction = (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) {
      showToast('Ingresa un monto válido');
      return;
    }

    const numAmount = parseFloat(form.amount);
    const newTx = {
      id: `t_${Date.now()}`,
      ...form,
      amount: numAmount
    };

    // Update Transactions list
    setTransactions([newTx, ...transactions]);

    // Update Account Balance
    setAccounts(prevAccounts => 
      prevAccounts.map(acc => {
        if (acc.name === form.account) {
          const newBal = form.type === 'Ingreso' 
            ? acc.balance + numAmount 
            : acc.balance - numAmount;
          return { ...acc, balance: Math.max(0, newBal) };
        }
        return acc;
      })
    );

    // Reset Form & Show Feedback
    setForm({
      type: 'Egreso',
      amount: '',
      account: 'Nu Cajita',
      category: 'Alimentación / Super',
      distribution: '50% Necesidad',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });

    showToast('¡Movimiento registrado con éxito!');
    setActiveTab('dashboard');
  };

  // Distribution 50/30/20 Calculations
  const distributionData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'Egreso');
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0) || 1;

    const counts = {
      '50% Necesidad': 0,
      '30% Deseo': 0,
      '20% Ahorro': 0
    };

    expenses.forEach(t => {
      if (counts[t.distribution] !== undefined) {
        counts[t.distribution] += t.amount;
      }
    });

    return [
      { name: '50% Necesidades', value: counts['50% Necesidad'], color: '#3B82F6', target: 50 },
      { name: '30% Deseos', value: counts['30% Deseo'], color: '#EC4899', target: 30 },
      { name: '20% Ahorro/Inv', value: counts['20% Ahorro'], color: '#10B981', target: 20 },
    ];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (filterType === 'todos') return transactions;
    return transactions.filter(t => t.type.toLowerCase() === filterType.toLowerCase());
  }, [transactions, filterType]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} transition-colors duration-200 font-sans pb-24 max-w-md mx-auto shadow-2xl relative border-x border-slate-800/20`}>
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <header className={`p-5 sticky top-0 z-30 backdrop-blur-md ${darkMode ? 'bg-slate-950/80 border-b border-slate-800/80' : 'bg-white/80 border-b border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-500/20">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">Finanzas Luis</h1>
              <p className="text-xs text-slate-400 mt-0.5">Control Automatizado</p>
            </div>
          </div>

          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Content Body */}
      <main className="p-4 space-y-6">

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            {/* Total Balance Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white shadow-xl shadow-indigo-950/30">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Patrimonio Total</span>
              <h2 className="text-3xl font-extrabold mt-1 tracking-tight">
                ${totals.totalBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </h2>

              {/* Yield Badges */}
              <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-white/15">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-200 uppercase block font-medium">Ganancia Diaria</span>
                    <span className="text-sm font-bold text-emerald-300">
                      +${totals.dailyYield.toFixed(2)}/día
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-400/20 text-purple-200 rounded-lg">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-200 uppercase block font-medium">Est. Mensual</span>
                    <span className="text-sm font-bold text-purple-200">
                      +${totals.monthlyYield.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Balances Grid */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm tracking-wide uppercase text-slate-400">Tus Cuentas & Rendimientos</h3>
                <span className="text-xs text-indigo-400 font-semibold">{accounts.length} Cuentas</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {accounts.map((acc) => {
                  const dailyGain = acc.type === 'inversion' ? (acc.balance * (acc.APY / 100)) / 365 : 0;
                  return (
                    <div 
                      key={acc.id} 
                      className={`p-3.5 rounded-2xl border transition-all ${
                        darkMode ? 'bg-slate-900 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: acc.color }}
                        />
                        {acc.APY > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {acc.APY}% RTA
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-medium text-slate-400 block truncate">{acc.name}</span>
                      <p className="text-base font-bold mt-0.5">${acc.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                      
                      {dailyGain > 0 ? (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-1 font-medium">
                          <ArrowUpRight className="w-3 h-3" /> +${dailyGain.toFixed(2)}/día
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 block mt-1">Sin interés</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats / 50-30-20 preview */}
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm tracking-wide uppercase text-slate-400">Regla 50 / 30 / 20</h3>
                <button onClick={() => setActiveTab('analytics')} className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                  Ver detalle <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-3">
                {distributionData.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{item.name}</span>
                      <span className="text-slate-400">${item.value.toLocaleString()}</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${Math.min(100, (item.value / (distributionData.reduce((a,b)=>a+b.value,0) || 1)) * 100)}%`,
                          backgroundColor: item.color 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions List */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm tracking-wide uppercase text-slate-400">Últimos Movimientos</h3>
                <div className="flex gap-1 text-xs">
                  {['todos', 'ingreso', 'egreso'].map(t => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-2 py-1 rounded-lg capitalize font-medium ${
                        filterType === t 
                          ? 'bg-indigo-600 text-white' 
                          : darkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {filteredTransactions.slice(0, 5).map((tx) => (
                  <div 
                    key={tx.id}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        tx.type === 'Ingreso' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {tx.type === 'Ingreso' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold leading-tight">{tx.category}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{tx.account} • {tx.notes || 'Sin nota'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${tx.type === 'Ingreso' ? 'text-emerald-400' : 'text-slate-100'}`}>
                        {tx.type === 'Ingreso' ? '+' : '-'}${tx.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-500 block">{tx.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: CAPTURE FORM (Mobile Forms equivalent) */}
        {activeTab === 'capture' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold">Captura Rápida de Movimiento</h2>
            </div>

            <form onSubmit={handleSubmitTransaction} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'Egreso' })}
                  className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
                    form.type === 'Egreso' ? 'bg-rose-600 text-white shadow' : 'text-slate-400'
                  }`}
                >
                  Egreso (-)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'Ingreso' })}
                  className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
                    form.type === 'Ingreso' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400'
                  }`}
                >
                  Ingreso (+)
                </button>
              </div>

              {/* Amount input */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Monto ($)</label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>

              {/* Account Dropdown */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Cuenta de Origen/Destino</label>
                <div className="relative">
                  <CreditCard className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={form.account}
                    onChange={(e) => setForm({ ...form, account: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300'
                    }`}
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.name}>{acc.name} (${acc.balance.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Categoría</label>
                <div className="relative">
                  <Tag className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300'
                    }`}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rule 50/30/20 Distribution */}
              {form.type === 'Egreso' && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Regla 50 / 30 / 20</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '50% Necesidad', label: '50% Necesidad' },
                      { id: '30% Deseo', label: '30% Deseo' },
                      { id: '20% Ahorro', label: '20% Ahorro' },
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setForm({ ...form, distribution: item.id })}
                        className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all ${
                          form.distribution === item.id
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Fecha</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={`w-full p-3 rounded-xl border text-xs font-medium focus:outline-none ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase mb-1 block">Nota / Detalle</label>
                  <input
                    type="text"
                    placeholder="Ej. Super Walmart"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className={`w-full p-3 rounded-xl border text-xs font-medium focus:outline-none ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> Guardar Registro
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: ACCOUNTS MANAGEMENT */}
        {activeTab === 'accounts' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold">Gestión de Cuentas & Tasas</h2>
            </div>

            <div className="space-y-3">
              {accounts.map((acc) => (
                <div 
                  key={acc.id}
                  className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: acc.color }} />
                      <h4 className="font-bold text-sm">{acc.name}</h4>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 capitalize">{acc.type}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/40">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Saldo Actual</span>
                      <span className="text-base font-extrabold">${acc.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Tasa Anual (APY %)</span>
                      <input 
                        type="number"
                        step="0.1"
                        value={acc.APY}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setAccounts(accounts.map(a => a.id === acc.id ? { ...a, APY: val } : a));
                        }}
                        className={`w-20 px-2 py-0.5 rounded border text-sm font-bold ${
                          darkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-slate-100 border-slate-300 text-emerald-600'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChartIcon className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold">Análisis de Gastos & Presupuesto</h2>
            </div>

            {/* Recharts Pie Chart */}
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Distribución 50 / 30 / 20</h3>
              
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => `$${val.toLocaleString()}`}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2">
                {distributionData.map(item => (
                  <div key={item.name} className="text-center">
                    <span className="text-[10px] text-slate-400 block truncate">{item.name}</span>
                    <span className="text-xs font-bold" style={{ color: item.color }}>${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Income vs Expense comparison */}
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Resumen de Flujo de Efectivo</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    {
                      name: 'Este Mes',
                      Ingresos: transactions.filter(t => t.type === 'Ingreso').reduce((a,b) => a + b.amount, 0),
                      Egresos: transactions.filter(t => t.type === 'Egreso').reduce((a,b) => a + b.amount, 0),
                    }
                  ]}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }} />
                    <Legend />
                    <Bar dataKey="Ingresos" fill="#10B981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Egresos" fill="#F43F5E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Bottom Mobile Navigation Bar */}
      <nav className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md backdrop-blur-lg border-t z-40 px-6 py-3 flex justify-between items-center ${
        darkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'
      }`}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'dashboard' ? 'text-indigo-400 scale-105' : 'text-slate-500'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Inicio</span>
        </button>

        <button
          onClick={() => setActiveTab('capture')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'capture' ? 'text-indigo-400 scale-105' : 'text-slate-500'
          }`}
        >
          <div className="p-2 -mt-7 bg-indigo-600 rounded-full text-white shadow-lg shadow-indigo-600/40 border-4 border-slate-950">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-semibold">Captura</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'accounts' ? 'text-indigo-400 scale-105' : 'text-slate-500'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Cuentas</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'analytics' ? 'text-indigo-400 scale-105' : 'text-slate-500'
          }`}
        >
          <PieChartIcon className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Reportes</span>
        </button>
      </nav>
    </div>
  );
}