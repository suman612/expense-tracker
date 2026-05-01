import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  BarElement,
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  BarElement
);

// ========== AUTHORIZED USERS ==========
const AUTHORIZED_USERS = [
  { email: "admin@aonenatraj.com", password: "a1natraj@2010", name: "Admin User", role: "admin" },
  { email: "office@onenatraj.com", password: "Office@123", name: "Office Manager", role: "manager" }
];

// ========== SMART CATEGORY OPTIONS ==========
const getCategoryOptions = (type) => {
  if (type === 'income') {
    return [
      { value: "Event Income", label: "🎪 Event Income" },
      { value: "Product Income", label: "📦 Product Income" },
      { value: "Dance Fees", label: "💃 Dance Fees" },
      { value: "Gymnastics Fees", label: "🤸 Gymnastics Fees" },
      { value: "Theatre Fee", label: "🎭 Theatre Fee" },
      { value: "Music Fee", label: "🎵 Music Fee" },
      { value: "Fitness Fee", label: "🎵 Fitness Fee" }
    ];
  } else {
    return [
      { value: "Groceries", label: "🛒 Groceries" },
      { value: "Rent", label: "🏠 Rent" },
      { value: "Transport", label: "🚗 Transport" },
      { value: "Entertainment", label: "🎬 Entertainment" },
      { value: "Healthcare", label: "🏥 Healthcare" },
      { value: "Education", label: "📚 Education" },
      { value: "Travel", label: "✈️ Travel" },
      { value: "Shopping", label: "🛍️ Shopping" },
      { value: "Utilities", label: "💡 Utilities" },
      { value: "Dining", label: "🍽️ Dining" },
      { value: "EMI", label: "💳 EMI" },
      { value: "Sanitary", label: "🧹 Sanitary" },
      { value: "Technician", label: "🔧 Technician" },
      { value: "ChatarPatar", label: "🍿 ChatarPatar" },
      { value: "Fuel", label: "⛽ Fuel" },
      { value: "Salary", label: "💰 Salary" },
      { value: "Gift", label: "🎁 Gift" },
      { value: "Miscellaneous", label: "📦 Miscellaneous" },
      { value: "Stationery", label: "✏️ Stationery" },
      { value: "Parking", label: "🅿️ Parking" },
      { value: "Cosmetic", label: "💄 Cosmetic" },
      { value: "Rapido/Ubar", label: "🛵 Rapido/Uber" }
    ];
  }
};

// Helper Functions
const formatCurrency = (amt) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amt);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateTime = () => {
  return new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
};

// Initial Data
const getInitialTransactions = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return [
    { id: '1', date: y + '-' + m + '-05', type: 'income', amount: 85000, category: 'Dance Fees', location: 'office', description: 'Monthly fees', createdAt: new Date().toISOString() },
    { id: '2', date: y + '-' + m + '-01', type: 'expense', amount: 25000, category: 'Rent', location: 'home', description: 'Studio rent', createdAt: new Date().toISOString() },
    { id: '3', date: y + '-' + m + '-10', type: 'expense', amount: 4500, category: 'Groceries', location: 'home', description: 'Weekly supplies', createdAt: new Date().toISOString() },
    { id: '4', date: y + '-' + m + '-15', type: 'income', amount: 12000, category: 'Event Income', location: 'office', description: 'Wedding', createdAt: new Date().toISOString() }
  ];
};

const getInitialBudgets = () => [
  { _id: 'b1', category: 'Rent', amount: 30000, spent: 25000, remaining: 5000, percentage: 83.3 },
  { _id: 'b2', category: 'Groceries', amount: 10000, spent: 4500, remaining: 5500, percentage: 45 }
];

// Transaction Modal Component
const TransactionModal = ({ editingTxn, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    date: editingTxn ? editingTxn.date : new Date().toISOString().slice(0, 10),
    type: editingTxn ? editingTxn.type : 'expense',
    amount: editingTxn ? editingTxn.amount : '',
    category: editingTxn ? editingTxn.category : '',
    location: editingTxn ? editingTxn.location : 'home',
    description: editingTxn ? editingTxn.description || '' : ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const categoryOptions = getCategoryOptions(newType);
    setFormData(prev => ({
      ...prev,
      type: newType,
      category: categoryOptions[0]?.value || ''
    }));
  };

  const handleSubmit = () => {
    if (!formData.date || !formData.amount || formData.amount <= 0 || !formData.category) {
      alert('Please fill all required fields');
      return;
    }
    onSave(formData);
    onClose();
  };

  const categoryOptions = getCategoryOptions(formData.type);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingTxn ? '✏️ Edit Transaction' : '➕ Add Transaction'}</h2>
          <button className="close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select name="type" className="form-select" value={formData.type} onChange={handleTypeChange}>
              <option value="expense">💸 Expense</option>
              <option value="income">💰 Income</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input type="number" name="amount" className="form-input" placeholder="Enter amount" value={formData.amount} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <div className="radio-group">
              <label className="radio-label"><input type="radio" name="location" value="home" checked={formData.location === 'home'} onChange={handleChange} /> 🏠 Home</label>
              <label className="radio-label"><input type="radio" name="location" value="office" checked={formData.location === 'office'} onChange={handleChange} /> 💼 Office</label>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input type="text" name="description" className="form-input" placeholder="Optional description" value={formData.description} onChange={handleChange} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="submit-btn" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
};

// Budget Modal Component
const BudgetModal = ({ editingBudget, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    category: editingBudget ? editingBudget.category : '',
    amount: editingBudget ? editingBudget.amount : ''
  });

  const handleSubmit = () => {
    if (!formData.category || !formData.amount || formData.amount <= 0) {
      alert('Please fill all fields');
      return;
    }
    onSave({ category: formData.category, amount: parseFloat(formData.amount) });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingBudget ? '✏️ Edit Budget' : '➕ Add Budget'}</h2>
          <button className="close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Category</label>
            <input type="text" className="form-input" placeholder="e.g., Rent, Groceries" value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Budget Amount (₹)</label>
            <input type="number" className="form-input" placeholder="Enter amount" value={formData.amount} onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="submit-btn" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const FinanceTracker = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [loginError, setLoginError] = useState('');
  const fileInputRef = useRef(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('expense_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.expiry > Date.now()) {
        setCurrentUser(parsed);
      } else {
        localStorage.removeItem('expense_user');
      }
    }

    const storedTx = localStorage.getItem('transactions');
    if (storedTx) {
      setTransactions(JSON.parse(storedTx));
    } else {
      setTransactions(getInitialTransactions());
    }

    const storedBudgets = localStorage.getItem('budgets');
    if (storedBudgets) {
      setBudgets(JSON.parse(storedBudgets));
    } else {
      setBudgets(getInitialBudgets());
    }

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setReportEndDate(today.toISOString().slice(0, 10));
    setReportStartDate(thirtyDaysAgo.toISOString().slice(0, 10));
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  useEffect(() => {
    if (budgets.length > 0) {
      localStorage.setItem('budgets', JSON.stringify(budgets));
    }
  }, [budgets]);

  // Update budget stats based on transactions
  const updateBudgetStats = useCallback(() => {
    setBudgets(prevBudgets => 
      prevBudgets.map(budget => {
        const spent = transactions
          .filter(t => t.type === 'expense' && t.category === budget.category)
          .reduce((sum, t) => sum + t.amount, 0);
        const remaining = budget.amount - spent;
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
        return { ...budget, spent, remaining, percentage };
      })
    );
  }, [transactions]);

  useEffect(() => {
    updateBudgetStats();
  }, [transactions, updateBudgetStats]);

  const validateLogin = (email, password) => {
    const user = AUTHORIZED_USERS.find(u => u.email === email && u.password === password);
    if (user) {
      const userData = { email: user.email, name: user.name, role: user.role, expiry: Date.now() + 86400000 };
      setCurrentUser(userData);
      localStorage.setItem('expense_user', JSON.stringify(userData));
      setLoginError('');
      return true;
    }
    setLoginError('Invalid credentials');
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('expense_user');
    setCurrentPage('dashboard');
  };

  // Transaction CRUD
  const addTransaction = (txnData) => {
    const newTxn = {
      id: Date.now().toString() + Math.random(),
      ...txnData,
      createdAt: new Date().toISOString()
    };
    setTransactions(prev => [newTxn, ...prev]);
  };

  const updateTransaction = (id, txnData) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...txnData } : t));
  };

  const deleteTransaction = (id) => {
    if (window.confirm('Delete this transaction?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // Budget CRUD
  const addBudget = (budgetData) => {
    const newBudget = {
      _id: Date.now().toString(),
      spent: 0,
      remaining: budgetData.amount,
      percentage: 0,
      ...budgetData
    };
    setBudgets(prev => [...prev, newBudget]);
  };

  const updateBudget = (id, budgetData) => {
    setBudgets(prev => prev.map(b => b._id === id ? { ...b, ...budgetData } : b));
  };

  const deleteBudget = (id) => {
    setBudgets(prev => prev.filter(b => b._id !== id));
  };

  // Import Excel
  const importExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);
      
      let imported = 0;
      rows.forEach(row => {
        const date = row['Date'] || row['date'] || '';
        const type = (row['Type'] || row['type'] || '').toString().toLowerCase();
        const amount = parseFloat(row['Amount'] || row['amount'] || 0);
        const category = row['Category'] || row['category'] || '';
        const location = (row['Location'] || row['location'] || 'home').toString().toLowerCase();
        const description = row['Description'] || row['description'] || '';
        
        if (date && (type === 'income' || type === 'expense') && amount > 0 && category) {
          const exists = transactions.some(t => t.date === date && t.category === category && Math.abs(t.amount - amount) < 0.01);
          if (!exists) {
            setTransactions(prev => [...prev, {
              id: Date.now() + Math.random(),
              date,
              type,
              amount,
              category,
              location,
              description
            }]);
            imported++;
          }
        }
      });
      
      if (imported) {
        alert(`Imported ${imported} transactions`);
      } else {
        alert('No new transactions to import');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadSampleExcel = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Date: "2025-01-15", Type: "income", Amount: 50000, Category: "Dance Fees", Location: "office", Description: "Monthly fees" }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample");
    XLSX.writeFile(wb, "sample_transactions.xlsx");
  };

  const exportToCSV = () => {
    const filtered = getFilteredTransactions();
    const filteredByDate = filtered.filter(t => {
      if (reportStartDate && t.date < reportStartDate) return false;
      if (reportEndDate && t.date > reportEndDate) return false;
      return true;
    });
    const csvData = filteredByDate.map(t => ({
      Date: t.date,
      Type: t.type,
      Amount: t.amount,
      Category: t.category,
      Location: t.location,
      Description: t.description || ''
    }));
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `transactions_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const clearAllData = () => {
    if (window.confirm('Delete ALL transactions and budgets? This cannot be undone.')) {
      setTransactions([]);
      setBudgets([]);
      localStorage.removeItem('transactions');
      localStorage.removeItem('budgets');
    }
  };

  // Filter transactions
  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterLocation !== 'all' && t.location !== filterLocation) return false;
      if (searchQuery && !t.category.toLowerCase().includes(searchQuery) && !(t.description || '').toLowerCase().includes(searchQuery)) return false;
      return true;
    });
  };

  // Dashboard calculations
  const getDashboardStats = () => {
    let totalIncome = 0, totalExpense = 0, homeExpense = 0, officeExpense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;
      if (t.type === 'expense' && t.location === 'home') homeExpense += t.amount;
      if (t.type === 'expense' && t.location === 'office') officeExpense += t.amount;
    });
    return { totalIncome, totalExpense, netBalance: totalIncome - totalExpense, homeExpense, officeExpense };
  };

  // Chart data for analytics
  const getChartData = () => {
    const categoryMap = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    return {
      labels: Object.keys(categoryMap),
      datasets: [{
        data: Object.values(categoryMap),
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec489a', '#06b6d4', '#84cc16'],
        borderWidth: 0
      }]
    };
  };

  const getMonthlyChartData = () => {
    const monthly = {};
    transactions.forEach(t => {
      const month = t.date.slice(0, 7);
      if (!monthly[month]) monthly[month] = { income: 0, expense: 0 };
      if (t.type === 'income') monthly[month].income += t.amount;
      else monthly[month].expense += t.amount;
    });
    const sortedMonths = Object.keys(monthly).sort();
    return {
      labels: sortedMonths,
      datasets: [
        { label: 'Income', data: sortedMonths.map(m => monthly[m].income), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 },
        { label: 'Expense', data: sortedMonths.map(m => monthly[m].expense), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 }
      ]
    };
  };

  // Render different pages
  const renderDashboard = () => {
    const stats = getDashboardStats();
    const recentTx = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    return (
      <>
        <div className="page-header">
          <h1>Dashboard</h1>
          <p style={{ color: 'white' }}>Welcome back, {currentUser?.name} 👋 | Last updated: {formatDateTime()}</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card income">
            <div className="stat-title">Total Income</div>
            <div className="stat-value">{formatCurrency(stats.totalIncome)}</div>
          </div>
          <div className="stat-card expense">
            <div className="stat-title">Total Expenses</div>
            <div className="stat-value">{formatCurrency(stats.totalExpense)}</div>
          </div>
          <div className="stat-card balance">
            <div className="stat-title">Net Balance</div>
            <div className="stat-value">{formatCurrency(stats.netBalance)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">🏠 Home Expenses</div>
            <div className="stat-value" style={{ color: '#8b5cf6' }}>{formatCurrency(stats.homeExpense)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">💼 Office Expenses</div>
            <div className="stat-value" style={{ color: '#f97316' }}>{formatCurrency(stats.officeExpense)}</div>
          </div>
        </div>
        <div className="glass-card">
          <h3 style={{ color: 'white' }}>Recent Transactions</h3>
          <div>
            {recentTx.length === 0 ? (
              <p>No transactions yet</p>
            ) : (
              recentTx.map(t => (
                <div key={t.id} className="recent-item">
                  <div>
                    <i className={`fas ${t.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                    <strong> {t.category}</strong>
                    <br />
                    <small>{formatDate(t.date)}</small>
                  </div>
                  <div className={`txn-amount ${t.type}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="nav-item" style={{ marginTop: '15px', background: 'rgba(255,255,255,0.1)', width: '100%' }} onClick={() => setCurrentPage('transactions')}>
            View All →
          </button>
        </div>
      </>
    );
  };

  const renderTransactions = () => {
    const filtered = getFilteredTransactions();
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
      <>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: 'white' }}>Transactions</h1>
          <button className="nav-item" style={{ background: '#f97316' }} onClick={() => { setEditingTxn(null); setShowTxnModal(true); }}>+ Add</button>
        </div>
        <div className="excel-import-zone">
          <i className="fas fa-file-excel" style={{ fontSize: '40px', color: '#10b981' }}></i>
          <h3 style={{ color: 'white' }}>Import Excel</h3>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".xlsx, .xls" onChange={(e) => { if (e.target.files[0]) importExcel(e.target.files[0]); e.target.value = ''; }} />
          <button className="excel-btn" onClick={() => fileInputRef.current?.click()}>Upload</button>
          <button className="excel-btn" style={{ background: '#f97316' }} onClick={downloadSampleExcel}>Sample</button>
        </div>
        <div className="filter-bar">
          <div className="filter-group">
            <button className={`filter-btn ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>ALL</button>
            <button className={`filter-btn ${filterType === 'income' ? 'active' : ''}`} onClick={() => setFilterType('income')}>INCOME</button>
            <button className={`filter-btn ${filterType === 'expense' ? 'active' : ''}`} onClick={() => setFilterType('expense')}>EXPENSE</button>
          </div>
          <div className="filter-group">
            <button className={`filter-btn ${filterLocation === 'all' ? 'active' : ''}`} onClick={() => setFilterLocation('all')}>All</button>
            <button className={`filter-btn ${filterLocation === 'home' ? 'active' : ''}`} onClick={() => setFilterLocation('home')}>🏠 Home</button>
            <button className={`filter-btn ${filterLocation === 'office' ? 'active' : ''}`} onClick={() => setFilterLocation('office')}>💼 Office</button>
          </div>
          <div className="search-box">
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value.toLowerCase())} />
          </div>
        </div>
        <div className="transaction-list">
          {sorted.length === 0 ? (
            <div className="empty-state-glass">No transactions found</div>
          ) : (
            sorted.map(t => (
              <div key={t.id} className="transaction-item">
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div className={`txn-icon ${t.type}`}>{t.type === 'income' ? '💰' : '💸'}</div>
                  <div>
                    <strong>{t.category}</strong>
                    <br />
                    <small>{formatDate(t.date)} | <span className={t.location === 'home' ? 'badge-home' : 'badge-office'}>{t.location}</span></small>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{t.description || ''}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`txn-amount ${t.type}`}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</span>
                  <div className="action-buttons">
                    <button className="edit-txn" onClick={() => { setEditingTxn(t); setShowTxnModal(true); }}><i className="fas fa-edit"></i></button>
                    <button className="delete-txn" onClick={() => deleteTransaction(t.id)}><i className="fas fa-trash"></i></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </>
    );
  };

  const renderBudget = () => {
    return (
      <>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: 'white' }}>Budget Planner</h1>
          <button className="add-budget-btn" onClick={() => { setEditingBudget(null); setShowBudgetModal(true); }}>+ New Budget</button>
        </div>
        <div className="budget-grid">
          {budgets.length === 0 ? (
            <div className="empty-state-glass">No budgets set. Click "New Budget" to get started.</div>
          ) : (
            budgets.map(b => (
              <div key={b._id} className="budget-card-glass">
                <h3>{b.category}</h3>
                <div>Budget: {formatCurrency(b.amount)}</div>
                <div>Spent: {formatCurrency(b.spent || 0)}</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(b.percentage || 0, 100)}%` }}></div>
                </div>
                <div>{(b.percentage || 0).toFixed(0)}% used</div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <button className="edit-txn" onClick={() => { setEditingBudget(b); setShowBudgetModal(true); }}>Edit</button>
                  <button className="delete-txn" onClick={() => deleteBudget(b._id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </>
    );
  };

  const renderAnalytics = () => {
    const pieData = getChartData();
    const lineData = getMonthlyChartData();
    
    return (
      <div className="analytics-grid">
        <div className="chart-card">
          <h3>Expense by Category</h3>
          {pieData.labels.length === 0 ? (
            <p style={{ color: 'white', textAlign: 'center' }}>No expense data available</p>
          ) : (
            <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: 'white' } } } }} />
          )}
        </div>
        <div className="chart-card">
          <h3>Monthly Income vs Expense</h3>
          {lineData.labels.length === 0 ? (
            <p style={{ color: 'white', textAlign: 'center' }}>No transaction data available</p>
          ) : (
            <Line data={lineData} options={{ responsive: true, plugins: { legend: { position: 'top', labels: { color: 'white' } } }, scales: { y: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } }, x: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } } } }} />
          )}
        </div>
      </div>
    );
  };

  const renderReports = () => {
    const filtered = getFilteredTransactions();
    const filteredByDate = filtered.filter(t => {
      if (reportStartDate && t.date < reportStartDate) return false;
      if (reportEndDate && t.date > reportEndDate) return false;
      return true;
    });
    
    const reportStats = filteredByDate.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });
    
    return (
      <>
        <div className="page-header">
          <h1 style={{ color: 'white' }}>Reports</h1>
        </div>
        <div className="date-range-container">
          <div>
            <label style={{ color: 'white', marginRight: '10px' }}>From:</label>
            <input type="date" className="date-input" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} />
          </div>
          <div>
            <label style={{ color: 'white', marginRight: '10px' }}>To:</label>
            <input type="date" className="date-input" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} />
          </div>
          <button className="apply-date-btn" onClick={exportToCSV}>Export to Excel</button>
          <button className="reset-date-btn" onClick={() => {
            const today = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);
            setReportEndDate(today.toISOString().slice(0, 10));
            setReportStartDate(thirtyDaysAgo.toISOString().slice(0, 10));
          }}>Reset to 30 Days</button>
        </div>
        <div className="glass-card">
          <h3 style={{ color: 'white', marginBottom: '20px' }}>Report Summary</h3>
          <div className="stats-grid" style={{ marginBottom: 0 }}>
            <div className="stat-card income">
              <div className="stat-title">Total Income</div>
              <div className="stat-value">{formatCurrency(reportStats.income)}</div>
            </div>
            <div className="stat-card expense">
              <div className="stat-title">Total Expenses</div>
              <div className="stat-value">{formatCurrency(reportStats.expense)}</div>
            </div>
            <div className="stat-card balance">
              <div className="stat-title">Net Balance</div>
              <div className="stat-value">{formatCurrency(reportStats.income - reportStats.expense)}</div>
            </div>
          </div>
        </div>
        <div className="transaction-list" style={{ marginTop: '20px' }}>
          <h3 style={{ color: 'white', padding: '20px 24px 0', marginBottom: '10px' }}>Transaction Details</h3>
          {filteredByDate.length === 0 ? (
            <div className="empty-state-glass">No transactions in selected date range</div>
          ) : (
            filteredByDate.sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => (
              <div key={t.id} className="transaction-item">
                <div>
                  <strong>{t.category}</strong>
                  <br />
                  <small>{formatDate(t.date)} | {t.location}</small>
                </div>
                <span className={`txn-amount ${t.type}`}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</span>
              </div>
            ))
          )}
        </div>
      </>
    );
  };

  const renderSettings = () => {
    return (
      <div className="glass-card">
        <h3 style={{ color: 'white', marginBottom: '20px' }}>Settings</h3>
        <p style={{ color: 'white', marginBottom: '10px' }}><strong>User:</strong> {currentUser?.name}</p>
        <p style={{ color: 'white', marginBottom: '10px' }}><strong>Email:</strong> {currentUser?.email}</p>
        <p style={{ color: 'white', marginBottom: '20px' }}><strong>Role:</strong> {currentUser?.role}</p>
        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />
        <button className="delete-txn" style={{ background: '#ef4444', color: 'white', padding: '12px 24px', borderRadius: '12px' }} onClick={clearAllData}>
          <i className="fas fa-trash"></i> Clear All Data
        </button>
      </div>
    );
  };

  // Render page content based on current page
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard': return renderDashboard();
      case 'transactions': return renderTransactions();
      case 'budget': return renderBudget();
      case 'analytics': return renderAnalytics();
      case 'reports': return renderReports();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  // Login Screen
  if (!currentUser) {
    return (
      <div className="auth-wrapper">
        <div className="auth-container">
          <h2><i className="fas fa-rupee-sign"></i> A One Natraj Academy</h2>
          <input id="loginEmail" className="auth-input" placeholder="Email" type="email" />
          <input id="loginPass" className="auth-input" placeholder="Password" type="password" />
          <button id="loginBtn" className="auth-btn" onClick={() => {
            const email = document.getElementById('loginEmail').value;
            const pass = document.getElementById('loginPass').value;
            validateLogin(email, pass);
          }}>Login</button>
          {loginError && <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '10px' }}>{loginError}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <i className="fas fa-rupee-sign"></i> A One Natraj Academy
          </div>
          <div className="navbar-menu">
            <button className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}>Dashboard</button>
            <button className={`nav-item ${currentPage === 'transactions' ? 'active' : ''}`} onClick={() => setCurrentPage('transactions')}>Transactions</button>
            <button className={`nav-item ${currentPage === 'budget' ? 'active' : ''}`} onClick={() => setCurrentPage('budget')}>Budget</button>
            <button className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`} onClick={() => setCurrentPage('analytics')}>Analytics</button>
            <button className={`nav-item ${currentPage === 'reports' ? 'active' : ''}`} onClick={() => setCurrentPage('reports')}>Reports</button>
            <button className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`} onClick={() => setCurrentPage('settings')}>Settings</button>
            <button className="nav-item" onClick={logout}><i className="fas fa-sign-out-alt"></i> Logout</button>
          </div>
        </div>
      </nav>
      <div id="pageContent">
        {renderPageContent()}
      </div>
      {showTxnModal && <TransactionModal editingTxn={editingTxn} onClose={() => { setShowTxnModal(false); setEditingTxn(null); }} onSave={(data) => editingTxn ? updateTransaction(editingTxn.id, data) : addTransaction(data)} />}
      {showBudgetModal && <BudgetModal editingBudget={editingBudget} onClose={() => { setShowBudgetModal(false); setEditingBudget(null); }} onSave={(data) => editingBudget ? updateBudget(editingBudget._id, data) : addBudget(data)} />}
    </div>
  );
};

export default FinanceTracker;