
import React, { useState, useEffect, useMemo } from 'react';
import { Button, Input, Modal } from '../components/UI';
import { CustomerService, TransactionService, SettingsService, AuthService, SyncService, PrintService } from '../services/storage';
import { Customer, Transaction, TransactionType, PaymentMethod, GENERATE_ID, TIMESTAMP } from '../types';
import { Search, User, ArrowRight, MessageCircle, Download, Clock, Wallet, HandCoins, Smartphone, X, Plus, Edit, Phone } from 'lucide-react';
import * as XLSX from 'xlsx';

// --- Types ---
interface CustomerStats {
    totalDebt: number;
    totalPaid: number;
    lastPaymentDate: number | null;
    visitCount: number;
}

const Customers = () => {
  const currentShop = localStorage.getItem('selected_shop') || 'المحل الأساسي';
  const storeProfile = SettingsService.getStoreProfile();
  const instapayAccount = storeProfile.instapayAccount || '';

  // --- View State ---
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);

  // --- Data State ---
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- Modal States ---
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // --- Forms ---
  const [paymentForm, setPaymentForm] = useState({ amount: '', notes: '', method: PaymentMethod.CASH as PaymentMethod });
  const [cashSplitAmount, setCashSplitAmount] = useState<string>('');
  const [instapaySplitAmount, setInstapaySplitAmount] = useState<string>('');
  const [customerForm, setCustomerForm] = useState({ id: '', name: '', phone: '' });

  // Sync paymentForm.amount with cash and instapay split sum when in split mode
  useEffect(() => {
    if (paymentForm.method === PaymentMethod.SPLIT) {
      setPaymentForm(prev => ({
        ...prev,
        amount: (Number(cashSplitAmount || 0) + Number(instapaySplitAmount || 0)).toString()
      }));
    }
  }, [cashSplitAmount, instapaySplitAmount, paymentForm.method]);

  // --- Initial Load ---
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
      setCustomers(CustomerService.getAll() || []);
      setTransactions(TransactionService.getAll() || []);
  };

  // --- Logic & Calculations ---
  const customerStats = useMemo(() => {
      const stats: Record<string, CustomerStats> = {};
      
      // Init
      customers.forEach(c => {
          stats[c.id] = { totalDebt: 0, totalPaid: 0, lastPaymentDate: null, visitCount: 0 };
      });

      // Process Transactions
      transactions.forEach(tx => {
          if (!tx.customerId || !stats[tx.customerId]) return;
          const stat = stats[tx.customerId];
          stat.visitCount++;

          if (tx.type === TransactionType.SALE) {
              const remaining = (tx.totalPrice || 0) - (tx.paidAmount || 0);
              if (remaining > 1) stat.totalDebt += remaining; // > 1 to ignore float fractions
          } else if (tx.type === TransactionType.DEBT_PAYMENT) {
              stat.totalDebt -= (tx.paidAmount || 0);
          }

          if ((tx.paidAmount || 0) > 0) {
              if (!stat.lastPaymentDate || tx.date > stat.lastPaymentDate) {
                  stat.lastPaymentDate = tx.date;
              }
          }
      });

      // Cleanup
      Object.keys(stats).forEach(k => {
          if (stats[k].totalDebt < 0) stats[k].totalDebt = 0;
      });

      return stats;
  }, [customers, transactions]);

  const filteredCustomers = useMemo(() => {
      if (!searchTerm) return customers;
      const lower = searchTerm.toLowerCase();
      return customers.filter(c => c.name.toLowerCase().includes(lower) || c.phone.includes(lower));
  }, [customers, searchTerm]);


  // --- Event Handlers ---

  const handleCardClick = (customer: Customer) => {
      setActiveCustomer(customer);
      setViewMode('DETAIL');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
      setActiveCustomer(null);
      setViewMode('LIST');
  };

  const handleEditClick = (c: Customer, e: React.MouseEvent) => {
      e.stopPropagation(); // CRITICAL: Stop card click
      setCustomerForm({ id: c.id, name: c.name, phone: c.phone });
      setShowEditModal(true);
  };

  const handlePaymentClick = (c: Customer, e?: React.MouseEvent) => {
      if(e) e.stopPropagation(); // CRITICAL: Stop card click
      setActiveCustomer(c); // Temporarily active for payment context
      setPaymentForm({ amount: '', notes: '', method: PaymentMethod.CASH });
      setCashSplitAmount('');
      setInstapaySplitAmount('');
      setShowPaymentModal(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
      e.preventDefault();
      if (!customerForm.name) return;

      const newC: Customer = {
          id: customerForm.id || GENERATE_ID(),
          name: customerForm.name,
          phone: customerForm.phone,
          totalPurchases: customerForm.id ? (customers.find(x => x.id === customerForm.id)?.totalPurchases || 0) : 0,
          lastVisit: customerForm.id ? (customers.find(x => x.id === customerForm.id)?.lastVisit || TIMESTAMP()) : TIMESTAMP(),
          updatedAt: TIMESTAMP()
      };

      CustomerService.addOrUpdate(newC);
      SyncService.sync();
      refreshData();
      setShowEditModal(false);
      
      // If editing active customer, update view
      if (activeCustomer && activeCustomer.id === newC.id) {
          setActiveCustomer(newC);
      }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!activeCustomer) return;

      const amount = Number(paymentForm.amount);
      const currentDebt = customerStats[activeCustomer.id]?.totalDebt || 0;

      if (amount <= 0) return alert('يرجى إدخال مبلغ صحيح');
      if (amount > currentDebt + 10) return alert('المبلغ أكبر من الدين المستحق');

      const tx: Transaction = {
          id: GENERATE_ID(),
          type: TransactionType.DEBT_PAYMENT,
          weight: 0, karat: 21, goldPricePerGram: 0, workmanship: 0, totalPrice: 0,
          paidAmount: amount,
          cashAmount: paymentForm.method === PaymentMethod.SPLIT ? Number(cashSplitAmount || 0) : (paymentForm.method === PaymentMethod.CASH ? amount : 0),
          instapayAmount: paymentForm.method === PaymentMethod.SPLIT ? Number(instapaySplitAmount || 0) : (paymentForm.method === PaymentMethod.INSTAPAY ? amount : 0),
          paymentMethod: paymentForm.method,
          customerName: activeCustomer.name,
          customerId: activeCustomer.id,
          date: TIMESTAMP(),
          createdBy: AuthService.getCurrentUser()?.name || 'Admin',
          itemName: 'سداد دفعة آجل',
          notes: paymentForm.notes
      };

      TransactionService.add(tx);
      SyncService.sync();
      
      if(confirm('طباعة إيصال؟')) {
          PrintService.printReceipt([{itemName: 'سداد دفعة', weight: 0, totalPrice: amount, karat: ''}], amount, activeCustomer.name, tx.createdBy, tx.id, 'إيصال نقدية');
      }

      refreshData();
      setCashSplitAmount('');
      setInstapaySplitAmount('');
      setShowPaymentModal(false);
  };

  const openWhatsApp = (c: Customer, e?: React.MouseEvent) => {
      if(e) e.stopPropagation();
      const store = SettingsService.getStoreProfile();
      const phone = c.phone.startsWith('0') ? '20' + c.phone.substring(1) : c.phone;
      const msg = encodeURIComponent(`مرحباً أستاذ ${c.name}،\nمعك ${store.name} للمجوهرات.`);
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const exportExcel = () => {
      const data = customers.map(c => ({
          'الاسم': c.name, 'موبايل': c.phone, 
          'مشتريات': c.totalPurchases, 
          'ديون': customerStats[c.id]?.totalDebt || 0
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "العملاء");
      XLSX.writeFile(wb, "Customers.xlsx");
  };

  // --- RENDER: DETAIL VIEW ---
  if (viewMode === 'DETAIL' && activeCustomer) {
      const stats = customerStats[activeCustomer.id] || { totalDebt: 0 };
      const customerTxs = transactions.filter(t => t.customerId === activeCustomer.id).sort((a,b) => b.date - a.date);

      return (
          <div className="p-4 space-y-6 animate-fade-in pb-20">
              {/* Header with Actions */}
              <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-4 sticky top-0 z-20 shadow-xl flex flex-col gap-4 safe-pt">
                  <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                          <Button variant="secondary" onClick={handleBack} className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                              <ArrowRight size={20} />
                          </Button>
                          <div>
                              <h2 className="text-xl font-bold text-white leading-none">{activeCustomer.name}</h2>
                              <div className="text-sm text-gray-400 font-mono mt-1">{activeCustomer.phone}</div>
                          </div>
                      </div>
                      <Button onClick={(e) => handleEditClick(activeCustomer, e)} variant="secondary" className="rounded-full w-10 h-10 p-0 flex items-center justify-center">
                          <Edit size={18} />
                      </Button>
                  </div>

                  <div className="flex gap-2">
                      <Button onClick={() => openWhatsApp(activeCustomer)} className="flex-1 bg-green-600 hover:bg-green-700 text-white border-none gap-2">
                          <MessageCircle size={18} /> واتساب
                      </Button>
                      
                      {/* --- PAY DEBT BUTTON (VISIBLE IF DEBT EXISTS) --- */}
                      {stats.totalDebt > 1 && (
                          <Button onClick={() => handlePaymentClick(activeCustomer)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none gap-2 shadow-lg shadow-blue-900/20">
                              <HandCoins size={18} /> سداد دين ({stats.totalDebt.toLocaleString()})
                          </Button>
                      )}
                  </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0a0e1a] p-4 rounded-xl border border-white/10 text-center">
                      <div className="text-xs text-gray-500 font-bold mb-1">الديون المستحقة</div>
                      <div className={`text-2xl font-black ${stats.totalDebt > 1 ? 'text-red-500' : 'text-green-500'}`}>
                          {stats.totalDebt.toLocaleString()}
                      </div>
                  </div>
                  <div className="bg-[#0a0e1a] p-4 rounded-xl border border-white/10 text-center">
                      <div className="text-xs text-gray-500 font-bold mb-1">إجمالي المشتريات</div>
                      <div className="text-2xl font-black text-[#f4c025]">
                          {activeCustomer.totalPurchases.toLocaleString()}
                      </div>
                  </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-[#1a1f2e] border border-white/5 rounded-xl overflow-hidden">
                  <div className="p-4 bg-[#0a0e1a] border-b border-white/5 font-bold text-white flex items-center gap-2">
                      <Clock size={18} className="text-[#f4c025]"/> سجل المعاملات
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-right">
                          <thead className="bg-[#0a0e1a] text-gray-500 text-xs uppercase">
                              <tr>
                                  <th className="p-3">التاريخ</th>
                                  <th className="p-3">نوع</th>
                                  <th className="p-3">بيان</th>
                                  <th className="p-3 text-center">مبلغ</th>
                                  <th className="p-3 text-center">مدفوع</th>
                                  <th className="p-3 text-center">باقي</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {customerTxs.map(tx => {
                                  const debt = (tx.totalPrice || 0) - (tx.paidAmount || 0);
                                  return (
                                      <tr key={tx.id} className="hover:bg-white/5">
                                          <td className="p-3 text-xs text-gray-400 font-mono whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                                          <td className="p-3">
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tx.type === 'SALE' ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'}`}>
                                                  {tx.type === 'SALE' ? 'مبيعات' : 'سداد'}
                                              </span>
                                          </td>
                                          <td className="p-3 font-bold text-white text-xs">{tx.itemName}</td>
                                          <td className="p-3 text-center font-mono">{tx.totalPrice > 0 ? tx.totalPrice.toLocaleString() : '-'}</td>
                                          <td className="p-3 text-center font-mono text-green-400">{tx.paidAmount?.toLocaleString()}</td>
                                          <td className="p-3 text-center font-mono text-red-400">{tx.type === 'SALE' && debt > 1 ? debt.toLocaleString() : '-'}</td>
                                      </tr>
                                  );
                              })}
                              {customerTxs.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">لا توجد حركات</td></tr>}
                          </tbody>
                      </table>
                  </div>
              </div>

              {/* Modals Injection */}
              {showPaymentModal && renderPaymentModal()}
              {showEditModal && renderCustomerModal()}
          </div>
      );
  }

  // --- RENDER: LIST VIEW ---
  return (
    <div className="p-4 space-y-6 animate-fade-in pb-24">
        {/* Header */}
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <User className="text-[#f4c025]" /> العملاء
                </h1>
                <p className="text-xs text-gray-500 mt-1">{customers.length} عميل مسجل</p>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => { setCustomerForm({id:'', name:'', phone:''}); setShowEditModal(true); }} className="gap-2 bg-[#f4c025] text-black hover:bg-[#d9aa20]">
                    <Plus size={18} /> إضافة
                </Button>
                <Button onClick={exportExcel} variant="secondary"><Download size={18}/></Button>
            </div>
        </div>

        {/* Search */}
        <div className="relative">
            <Search className="absolute right-4 top-3.5 text-gray-500" size={18} />
            <Input 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                placeholder="بحث بالاسم أو رقم الموبايل..." 
                className="pr-10 h-12 text-lg"
            />
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map(c => {
                const stats = customerStats[c.id] || { totalDebt: 0 };
                const hasDebt = stats.totalDebt > 1;

                return (
                    <div 
                        key={c.id}
                        // MAIN CLICK HANDLER - OPENS PROFILE
                        onClick={() => handleCardClick(c)}
                        className="bg-[#1a1f2e] border border-white/5 rounded-xl p-4 relative overflow-hidden cursor-pointer hover:border-[#f4c025]/50 transition-all active:scale-[0.98] shadow-sm group"
                    >
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#0a0e1a] border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-[#f4c025] transition-colors shadow-inner">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg group-hover:text-[#f4c025] transition-colors">{c.name}</h3>
                                    <div className="text-sm text-gray-500 font-mono flex items-center gap-1">
                                        <Phone size={12} /> {c.phone}
                                    </div>
                                </div>
                            </div>
                            
                            {/* EDIT BUTTON (Stops Propagation) */}
                            <button 
                                onClick={(e) => handleEditClick(c, e)} 
                                className="p-2 text-gray-600 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Edit size={18} />
                            </button>
                        </div>

                        <div className="flex gap-2 relative z-10">
                            {/* WHATSAPP BUTTON (Stops Propagation) */}
                            <button 
                                onClick={(e) => openWhatsApp(c, e)} 
                                className="flex-1 bg-[#0a0e1a] border border-white/10 hover:border-green-500/50 hover:text-green-500 text-gray-400 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={16} /> واتساب
                            </button>

                            {/* PAY BUTTON (Only if debt, Stops Propagation) */}
                            {hasDebt ? (
                                <button 
                                    onClick={(e) => handlePaymentClick(c, e)}
                                    className="flex-[1.5] bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                                >
                                    <HandCoins size={16} /> سداد {stats.totalDebt.toLocaleString()}
                                </button>
                            ) : (
                                <div className="flex-1 bg-[#0a0e1a] border border-white/10 py-2 rounded-lg text-xs font-bold text-gray-500 text-center">
                                    لا توجد ديون
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            
            {filteredCustomers.length === 0 && (
                <div className="col-span-full text-center py-20 text-gray-500">
                    <User size={48} className="mx-auto mb-4 opacity-20"/>
                    لا توجد نتائج
                </div>
            )}
        </div>

        {/* Modals */}
        {showEditModal && renderCustomerModal()}
        {showPaymentModal && renderPaymentModal()}
    </div>
  );

  // --- Sub-Renderers ---
  function renderCustomerModal() {
      return (
          <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={customerForm.id ? "تعديل بيانات" : "عميل جديد"}>
              <form onSubmit={handleSaveCustomer} className="space-y-4">
                  <Input label="الاسم" value={customerForm.name} onChange={e => setCustomerForm({...customerForm, name: e.target.value})} autoFocus required />
                  <Input label="الهاتف" value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} type="tel" />
                  <Button type="submit" className="w-full h-12 text-lg font-bold mt-2">حفظ</Button>
              </form>
          </Modal>
      );
  }

  function renderPaymentModal() {
      if(!activeCustomer) return null;
      const debt = customerStats[activeCustomer.id]?.totalDebt || 0;
      return (
          <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="سداد دفعة / استرداد">
              <div className="space-y-4">
                  <div className="bg-[#0a0e1a] p-4 rounded-xl border border-white/5 flex justify-between items-center text-sm">
                      <div>
                          <p className="text-gray-400">العميل</p>
                          <p className="font-bold text-white text-base">{activeCustomer.name}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-gray-400">الحساب الحالي</p>
                          <p className={`font-black text-base ${debt > 0 ? 'text-red-500' : debt < 0 ? 'text-green-500' : 'text-gray-400'}`}>
                              {Math.abs(debt).toLocaleString()} ج.م {debt > 0 ? '(دين عليه)' : debt < 0 ? '(له طرفنا)' : ''}
                          </p>
                      </div>
                  </div>

                  <form onSubmit={handleSubmitPayment} className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                          <button type="button" onClick={() => setPaymentForm({...paymentForm, method: PaymentMethod.CASH})} className={`py-3 rounded-lg border text-xs font-bold transition-all ${paymentForm.method === PaymentMethod.CASH ? 'bg-white text-black border-white shadow' : 'bg-[#0a0e1a] text-gray-500 border-white/10 hover:border-white/30'}`}>كاش</button>
                          <button type="button" onClick={() => setPaymentForm({...paymentForm, method: PaymentMethod.INSTAPAY})} className={`py-3 rounded-lg border text-xs font-bold transition-all ${paymentForm.method === PaymentMethod.INSTAPAY ? 'bg-purple-600 text-white border-purple-500 shadow' : 'bg-[#0a0e1a] text-gray-500 border-white/10 hover:border-white/30'}`}>InstaPay</button>
                          <button type="button" onClick={() => {
                              setPaymentForm({...paymentForm, method: PaymentMethod.SPLIT});
                              const total = Math.max(0, debt);
                              setCashSplitAmount(Math.floor(total / 2).toString());
                              setInstapaySplitAmount(Math.ceil(total / 2).toString());
                          }} className={`py-3 rounded-lg border text-xs font-bold transition-all ${paymentForm.method === PaymentMethod.SPLIT ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow' : 'bg-[#0a0e1a] text-gray-500 border-white/10 hover:border-white/30'}`}>مشترك</button>
                      </div>

                      {paymentForm.method === PaymentMethod.SPLIT && (
                          <div className="bg-[#0a0e1a] p-3 rounded-xl border border-white/5 space-y-2.5">
                              <div className="flex gap-2">
                                  <div className="flex-1">
                                      <label className="block text-[9px] text-gray-400 font-bold mb-1">المدفوع كاش</label>
                                      <input
                                          type="number"
                                          value={cashSplitAmount}
                                          onChange={e => {
                                              const val = e.target.value;
                                              setCashSplitAmount(val);
                                              const total = Math.max(0, debt);
                                              const cashVal = Number(val || 0);
                                              if (cashVal <= total) {
                                                  setInstapaySplitAmount((total - cashVal).toString());
                                              }
                                          }}
                                          className="w-full bg-[#1e293b]/50 border border-white/10 rounded-lg p-1.5 text-xs text-center font-black text-emerald-400 outline-none focus:border-emerald-500"
                                          placeholder="0"
                                      />
                                  </div>
                                  <div className="flex-1">
                                      <label className="block text-[9px] text-gray-400 font-bold mb-1">المدفوع InstaPay</label>
                                      <input
                                          type="number"
                                          value={instapaySplitAmount}
                                          onChange={e => {
                                              const val = e.target.value;
                                              setInstapaySplitAmount(val);
                                              const total = Math.max(0, debt);
                                              const instapayVal = Number(val || 0);
                                              if (instapayVal <= total) {
                                                  setCashSplitAmount((total - instapayVal).toString());
                                              }
                                          }}
                                          className="w-full bg-[#1e293b]/50 border border-white/10 rounded-lg p-1.5 text-xs text-center font-black text-purple-400 outline-none focus:border-purple-500"
                                          placeholder="0"
                                      />
                                  </div>
                              </div>
                              <div className="flex justify-between items-center text-[10px]">
                                  <button
                                      type="button"
                                      onClick={() => {
                                          const total = Math.max(0, debt);
                                          setCashSplitAmount(Math.floor(total / 2).toString());
                                          setInstapaySplitAmount(Math.ceil(total / 2).toString());
                                      }}
                                      className="text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/20 transition-all active:scale-95"
                                  >
                                      تقسيم بالتساوي 50/50
                                  </button>
                                  <div className="text-gray-400 font-bold">
                                      مجموع: <span className="text-white font-mono">{(Number(cashSplitAmount || 0) + Number(instapaySplitAmount || 0)).toLocaleString()}</span> ج.م
                                  </div>
                              </div>
                          </div>
                      )}

                      <Input type="number" label="المبلغ" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} disabled={paymentForm.method === PaymentMethod.SPLIT} autoFocus className="text-center font-bold text-xl h-14 disabled:opacity-50" placeholder="0.00" />
                      <Input label="ملاحظات" value={paymentForm.notes} onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})} />
                      <Button type="submit" className="w-full h-12 font-bold bg-green-600 hover:bg-green-700">تأكيد السداد</Button>
                  </form>
              </div>
          </Modal>
      );
  }
};

export default Customers;
