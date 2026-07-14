
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { TransactionService, CustomerService, SettingsService, AuthService, SyncService, InventoryService, GoldPriceService, GhawayeshService } from '../services/storage';
import { BullionService } from '../services/bullion';
import { FeedbackService } from '../services/feedback';
import { useNavigate } from 'react-router-dom';
import { Transaction, TransactionType, PaymentMethod, Karat, GENERATE_ID, TIMESTAMP, Customer, Item, ItemStatus, GhawayeshEntry, BullionItem } from '../types';
import { UserPlus, Search, X, Plus, Save, ArrowDown, ArrowUp, Trash2, Smartphone, Banknote, ShoppingCart, Scale, Coins, User, QrCode, Package, AlertTriangle, Wallet } from 'lucide-react';
import { Modal, Input, Button, convertArabicToEnglishNums } from '../components/UI';
import { BullionSearchPanel } from '../components/BullionSearchPanel';

interface CartItem {
  tempId: string;
  itemId: string;
  itemName: string;
  weight: string | number;
  karat: Karat;
  totalPrice: string | number;
  type: TransactionType;
  linkedItemId?: string;
  linkedBullionId?: string;
  qty?: string | number;
}


const ProductSearchPanel = ({ onSelect, onClose, currentShop }: { onSelect: (item: Item) => void; onClose: () => void; currentShop: string }) => {
  const [query, setQuery] = useState('');
  const [mode, setMode]   = useState<'name' | 'weight'>('name');
  const [results, setResults] = useState<Item[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 150); }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const stock = InventoryService.getAll().filter(i => (i.shop || 'المحل الأساسي') === currentShop && i.status === ItemStatus.IN_STORE && i.quantity > 0);
    if (mode === 'name') {
      const q = query.toLowerCase().trim();
      setResults(stock.filter(i => 
        i.name.toLowerCase().includes(q) || 
        i.type.toLowerCase().includes(q) ||
        (i.barcode && i.barcode.toLowerCase().includes(q))
      ).slice(0, 12));
    } else {
      const target = parseFloat(query);
      if (isNaN(target)) { setResults([]); return; }
      setResults(stock.map(i => ({ i, d: Math.abs(i.weight - target) })).sort((a, b) => a.d - b.d).slice(0, 12).map(x => x.i));
    }
  }, [query, mode, currentShop]);

  return (
    <div className="fixed inset-0 z-[150] bg-[#080f1e]/96 backdrop-blur-xl flex flex-col" dir="rtl">
      <div className="p-4 border-b border-white/10 flex items-center gap-3 shrink-0">
        <button onClick={onClose} className="p-2 rounded-full bg-white/10 text-white shrink-0 active:scale-95"><X size={20}/></button>
        <span className="text-white font-bold flex-1">بحث في المخزون</span>
        <div className="flex bg-[#1e293b] rounded-xl p-1 gap-1">
          {(['name','weight'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setQuery(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode===m ? 'bg-gold-500 text-black' : 'text-gray-400'}`}>
              {m==='name' ? 'بالاسم' : 'بالوزن'}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 py-3 shrink-0">
        <div className="relative">
          <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input ref={inputRef} type="text" inputMode={mode==='weight'?'decimal':undefined} pattern={mode==='weight'?'[0-9.]*':undefined} value={query} onChange={e => setQuery(convertArabicToEnglishNums(e.target.value))}
            placeholder={mode==='name' ? 'اكتب اسم الصنف...' : 'اكتب الوزن (مثال: 4.50 جم)'}
            style={{ background:'rgba(30,41,59,0.9)', border:'2px solid rgba(251,191,36,0.3)', borderRadius:'16px', color:'#fff', padding:'13px 48px 13px 16px', width:'100%', fontSize:'16px', fontWeight:'700', outline:'none' }} />
        </div>
        {mode==='weight' && query && <p className="text-[11px] text-gold-400/70 mt-2 pr-1">مرتبة من الأقرب للوزن: <strong>{query} جم</strong></p>}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-3 custom-scrollbar">
        {results.length === 0 && (
          <div className="text-center py-16 opacity-30 flex flex-col items-center gap-3">
            <Package size={48} />
            <p className="font-bold text-sm">{query ? 'لا توجد نتائج' : mode==='name' ? 'ابدأ الكتابة للبحث' : 'أدخل وزنًا للبحث'}</p>
          </div>
        )}
        {results.map((item, i) => {
          const diff = mode==='weight' && query ? Math.abs(item.weight - parseFloat(query)) : null;
          return (
            <button key={item.id} onClick={() => onSelect(item)}
              className="w-full text-right p-4 rounded-2xl border border-white/10 flex items-center gap-4 active:scale-[0.98] transition-all animate-scale-in"
              style={{ background:'rgba(30,41,59,0.9)', animationDelay:`${i*40}ms` }}>
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0 text-gold-500"><Package size={22}/></div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-white text-sm truncate">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.type} • عيار {item.karat} • {item.weight.toFixed(2)} جم</p>
                {diff !== null && (
                  <span className={`text-[10px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${diff<0.01?'bg-emerald-500/20 text-emerald-400':diff<2?'bg-gold-500/20 text-gold-400':'bg-white/5 text-gray-500'}`}>
                    {diff<0.01 ? 'تطابق تام ✓' : `فرق: ${diff.toFixed(2)} جم`}
                  </span>
                )}
              </div>
              <div className="text-left shrink-0">
                <span className="text-[10px] text-gray-500 block">الكمية</span>
                <span className="font-black text-white text-lg">{item.quantity}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Sales = () => {
  const navigate    = useNavigate();
  const currentShop = localStorage.getItem('selected_shop') || 'المحل الأساسي';
  const storeProfile = SettingsService.getStoreProfile();
  const instapayAccount = storeProfile.instapayAccount || '';

  const [mode, setMode] = useState<TransactionType>(TransactionType.SALE);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerSearch, setCustomerSearch]         = useState('');
  const [searchResults, setSearchResults]           = useState<Customer[]>([]);
  const [showDropdown, setShowDropdown]             = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen]   = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen]   = useState(false);
  const [newCustomerForm, setNewCustomerForm]       = useState({ name: '', phone: '' });
  const [showScanner, setShowScanner]               = useState(false);
  const [showProductSearch, setShowProductSearch]   = useState(false);
  const [showBullionSearch, setShowBullionSearch]   = useState(false);
  const [paymentMethod, setPaymentMethod]           = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paidAmount, setPaidAmount]                 = useState<string>('');
  const [cashSplitAmount, setCashSplitAmount]       = useState<string>('');
  const [instapaySplitAmount, setInstapaySplitAmount] = useState<string>('');
  const [isPaidManuallySet, setIsPaidManuallySet]   = useState(false);
  const [currentUser, setCurrentUser]               = useState('');
  const [currentInvoiceId, setCurrentInvoiceId]     = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const u = AuthService.getCurrentUser();
    if (u) setCurrentUser(u.name);
    setCurrentInvoiceId(Date.now().toString().slice(-8));
    
    // Physical barcode scanner listener
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is inside an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const currentTime = Date.now();
      
      // If time between keys is too long, assume it's not a scanner and clear buffer
      if (currentTime - lastKeyTime > 50) {
        barcodeBuffer = '';
      }
      lastKeyTime = currentTime;
      
      if (e.key === 'Enter') {
        if (barcodeBuffer.length > 3) {
          e.preventDefault();
          const code = barcodeBuffer;
          barcodeBuffer = '';
          handleBarcodeDetected(code);
        }
      } else if (e.key.length === 1) { // Normal character
        barcodeBuffer += e.key;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', handleKeyDown); };
  }, []);

  const recalcTotal = (c: CartItem[]) => c.reduce((s, it) => { const v = Number(it.totalPrice||0); return s + (it.type===TransactionType.SALE?v:-v); }, 0);
  const totalAmount = recalcTotal(cart);
  const totalWeight = cart.reduce((s, it) => s + Number(it.weight||0), 0);
  const isDebt      = Number(paidAmount) < Math.abs(totalAmount) && totalAmount !== 0;

  // Auto-sync paidAmount when totalAmount changes if not set manually by the user
  useEffect(() => {
    if (!isPaidManuallySet && paymentMethod !== PaymentMethod.SPLIT) {
      setPaidAmount(Math.abs(totalAmount).toString());
    }
  }, [totalAmount, isPaidManuallySet, paymentMethod]);

  // Sync paidAmount with cash and instapay split sum when in split mode
  useEffect(() => {
    if (paymentMethod === PaymentMethod.SPLIT) {
      setPaidAmount((Number(cashSplitAmount || 0) + Number(instapaySplitAmount || 0)).toString());
    }
  }, [cashSplitAmount, instapaySplitAmount, paymentMethod]);

  const updateItem = (id: string, field: keyof CartItem, value: any) => {
    const newCart = cart.map(it => it.tempId===id ? {...it,[field]:value} : it);
    setCart(newCart);
  };

  const removeItem = (id: string) => {
    FeedbackService.vibrateLight();
    const newCart = cart.filter(it => it.tempId!==id);
    setCart(newCart);
  };

  const addManualItem = () => {
    FeedbackService.vibrateLight();
    setCart([{ tempId:GENERATE_ID(), itemId:GENERATE_ID(), itemName:'', weight:'', karat:Karat.K21, totalPrice:'', type:mode, qty: '1' }, ...cart]);
  };

  const addFromInventory = (inv: Item) => {
    FeedbackService.vibrateLight();
    setCart([{ tempId:GENERATE_ID(), itemId:inv.id, itemName:inv.name, weight:inv.weight, karat:inv.karat, totalPrice:'', type:mode, linkedItemId:inv.id, qty: '1' }, ...cart]);
    setShowProductSearch(false); setShowScanner(false);
  };

  const addFromBullions = (inv: BullionItem) => {
    FeedbackService.vibrateLight();
    setCart([{ tempId:GENERATE_ID(), itemId:inv.id, itemName:`${inv.company} - ${inv.bullionType}`, weight:inv.weight, karat:inv.karat, totalPrice:'', type:mode, linkedBullionId:inv.id, qty: '1' }, ...cart]);
    setShowBullionSearch(false);
  };

  const handleBarcodeDetected = (code: string) => {
    setShowScanner(false);
    const found = InventoryService.getByBarcode(code);
    if (found) addFromInventory(found);
    else alert(`⚠️ الباركود: ${code}\nلم يتم العثور على صنف مطابق في مخزون هذا الفرع.`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setCustomerSearch(v); setSearchResults(v ? CustomerService.search(v) : []); setShowDropdown(!!v);
    if (selectedCustomerId) setSelectedCustomerId(null);
  };
  const selectCustomer = (c: Customer) => { setCustomerSearch(c.name); setSelectedCustomerId(c.id); setShowDropdown(false); };

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name || !newCustomerForm.phone) return;
    const nc: Customer = { id:GENERATE_ID(), name:newCustomerForm.name, phone:newCustomerForm.phone, totalPurchases:0, lastVisit:TIMESTAMP() };
    CustomerService.addOrUpdate(nc); SyncService.sync(); selectCustomer(nc);
    setIsAddCustomerOpen(false); setNewCustomerForm({ name:'', phone:'' });
  };

  const handleExit = () => {
    if (cart.length > 0) {
      setIsExitConfirmOpen(true);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSave = () => {
    if (cart.length===0) return;
    if (cart.some(i => Number(i.weight)<=0 || Number(i.totalPrice)<=0 || Number(i.qty ?? 1)<=0)) { alert('يرجى إدخال العدد والوزن والسعر لجميع الأصناف'); return; }
    const paid = Number(paidAmount); const absTotal = Math.abs(totalAmount);
    if (paid < absTotal && !selectedCustomerId && !customerSearch.match(/^\d{10,}$/)) { alert('⚠️ يوجد مبلغ آجل. يجب اختيار عميل مسجل.'); return; }
    const invoiceId    = `GMM${currentInvoiceId}`;
    const goldPrice    = GoldPriceService.getStoredPrice().base21;
    cart.forEach((ci, idx) => {
      const isFirst = idx === 0;
      const instapayId = currentShop === 'المحل الثاني' ? 'SAFE_INSTAPAY_2' : 'SAFE_INSTAPAY_1';
      const cashId     = currentShop === 'المحل الثاني' ? 'SAFE_2' : 'SAFE_1';
      const qtyVal = Number(ci.qty ?? 1);
      const tx: Transaction = {
        id:GENERATE_ID(), invoiceId, type:ci.type, itemId:ci.itemId, itemName:ci.itemName,
        weight:Number(ci.weight), qty:qtyVal, karat:ci.karat, goldPricePerGram:goldPrice, workmanship:0,
        totalPrice:Number(ci.totalPrice),
        paidAmount: isFirst ? paid : 0,
        cashAmount: isFirst ? (paymentMethod === PaymentMethod.SPLIT ? Number(cashSplitAmount || 0) : (paymentMethod === PaymentMethod.CASH ? paid : 0)) : 0,
        instapayAmount: isFirst ? (paymentMethod === PaymentMethod.SPLIT ? Number(instapaySplitAmount || 0) : (paymentMethod === PaymentMethod.INSTAPAY ? paid : 0)) : 0,
        paymentMethod, customerName:customerSearch||undefined,
        customerId:selectedCustomerId||undefined, date:Date.now(), createdBy:currentUser, source:'MOBILE', shop:currentShop,
        safeId:paymentMethod===PaymentMethod.INSTAPAY ? instapayId : cashId, updatedAt:TIMESTAMP()
      };
      TransactionService.add(tx);
      if (ci.linkedItemId) InventoryService.deductQuantity(ci.linkedItemId, qtyVal, Number(ci.weight));
      
      if (ci.linkedBullionId) {
        const countChange = ci.type === TransactionType.SALE ? -qtyVal : qtyVal;
        const weightChange = ci.type === TransactionType.SALE ? -Number(ci.weight) : Number(ci.weight);
        const opName = ci.type === TransactionType.SALE ? `فاتورة بيع (${invoiceId})` : `فاتورة شراء (${invoiceId})`;
        BullionService.updateInventory(ci.linkedBullionId, countChange, weightChange, opName, ci.type === TransactionType.SALE ? 'OUT' : 'IN');
      } else {
        const isBullionName = (name: string): boolean => {
          const normalized = name.trim().toLowerCase();
          return normalized.includes('سبيك') || normalized.includes('جنيه') || normalized.includes('انصة') || normalized.includes('أونصة');
        };
        if (isBullionName(ci.itemName)) {
          const countChange = ci.type === TransactionType.SALE ? -qtyVal : qtyVal;
          const weight = Number(ci.weight);
          const weightPerUnit = qtyVal > 0 ? (weight / qtyVal) : weight;
          
          BullionService.addBullionType({
              company: ci.itemName,
              bullionType: ci.itemName.includes('جنيه') ? 'جنيه' : 'سبيكة',
              weight: weightPerUnit,
              karat: ci.karat || Karat.K24,
              count: countChange,
              shop: currentShop
          });
        }
      }

      // Auto Ghawayesh deduction for SALE transactions
      const isGhawayeshName = (name: string): boolean => {
        const normalized = name.trim().toLowerCase();
        return normalized.includes('غويش') || normalized.includes('غوايش') || normalized.includes('غواش');
      };

      if (ci.type === TransactionType.SALE && isGhawayeshName(ci.itemName)) {
        const entry: GhawayeshEntry = {
          id: GENERATE_ID(),
          day: new Date().toLocaleDateString('ar-EG', { weekday: 'long' }),
          dateStr: new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
          timestamp: Date.now() + idx,
          operation: `بيع تلقائي: ${ci.itemName} (فاتورة #${invoiceId})`,
          countChange: -qtyVal,
          currentCount: 0,
          weightChange: -Number(ci.weight),
          currentWeight: 0,
          type: 'OUT',
          shop: currentShop
        };
        GhawayeshService.addEntry(entry);
      }
    });
    if (selectedCustomerId) CustomerService.updateStats(selectedCustomerId, absTotal);
    SyncService.sync();
    FeedbackService.triggerSuccess();
    alert('✅ تم حفظ العملية بنجاح');
    setCart([]); setCustomerSearch(''); setSelectedCustomerId(null);
    setPaymentMethod(PaymentMethod.CASH); setPaidAmount('');
    setCashSplitAmount(''); setInstapaySplitAmount('');
    setIsPaidManuallySet(false);
    setCurrentInvoiceId(Date.now().toString().slice(-8));
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] text-white font-sans" dir="rtl">
      {showScanner && <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setShowScanner(false)} />}
      {showProductSearch && <ProductSearchPanel onSelect={addFromInventory} onClose={() => setShowProductSearch(false)} currentShop={currentShop} />}
      {showBullionSearch && <BullionSearchPanel onSelect={addFromBullions} onClose={() => setShowBullionSearch(false)} currentShop={currentShop} />}

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/96 backdrop-blur-xl border-b border-white/5 p-3 shadow-2xl shrink-0">
        <div className="flex justify-between items-center mb-2">
          <button onClick={handleExit} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold active:scale-95 transition-all">
            <X size={14}/> إلغاء وخروج
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {currentShop}
            </span>
            <span className="text-[10px] text-gray-400 font-mono bg-white/5 px-2.5 py-1 rounded-xl border border-white/5">فاتورة #{currentInvoiceId}</span>
          </div>
        </div>

        <div className="flex gap-1.5 relative" ref={searchRef}>
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
              <Search size={15} className={`transition-colors ${selectedCustomerId?'text-emerald-400':'text-gray-500 group-focus-within:text-gold-500'}`}/>
            </div>
            <input className={`w-full bg-[#1e293b] border rounded-xl pr-9 pl-3 h-11 text-xs font-bold text-white placeholder:text-gray-600 outline-none transition-all ${selectedCustomerId?'border-emerald-500/50':'border-white/5 focus:border-gold-500/40'}`}
              placeholder="ابحث عن عميل (اسم / موبايل)..." value={customerSearch} onChange={handleSearchChange}
              onFocus={() => { if(customerSearch) setShowDropdown(true); }}/>
            {showDropdown && searchResults.length>0 && (
              <div className="absolute top-full mt-1.5 inset-x-0 bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-52 overflow-y-auto">
                {searchResults.map(c => (
                  <button key={c.id} onClick={() => selectCustomer(c)} className="w-full text-right px-3.5 py-2.5 hover:bg-white/5 flex items-center gap-2.5 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-500 flex items-center justify-center shrink-0"><User size={12}/></div>
                    <div><p className="font-bold text-xs text-white">{c.name}</p><p className="text-[10px] text-gray-500 font-mono">{c.phone}</p></div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setIsAddCustomerOpen(true)} className="w-11 h-11 rounded-xl bg-[#1e293b] border border-white/5 flex items-center justify-center text-gray-400 hover:text-gold-400 hover:border-gold-500/30 transition-all active:scale-90 shrink-0">
            <UserPlus size={16}/>
          </button>
        </div>
      </header>

      {/* CART */}
      <main className="flex-1 overflow-y-auto px-3 pt-2 pb-3 custom-scrollbar">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center gap-1.5 text-xs text-gray-500 font-bold">
            <ShoppingCart size={13}/><span>السلة ({cart.length})</span>
            {cart.length>0 && <span className="text-gold-400">• {totalWeight.toFixed(2)} جم</span>}
          </div>
          <button onClick={() => setShowScanner(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold active:scale-95 transition-all shrink-0">
            <QrCode size={12}/> سكان
          </button>
          <button onClick={() => setShowProductSearch(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-bold active:scale-95 transition-all shrink-0">
            <Package size={12}/> المنتجات
          </button>
          <button onClick={() => setShowBullionSearch(true)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold active:scale-95 transition-all shrink-0">
            <Coins size={12}/> السبائك
          </button>
          <button onClick={addManualItem} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gold-500 text-black text-[11px] font-black active:scale-95 transition-all shadow-lg shadow-gold-900/20 shrink-0">
            <Plus size={12} strokeWidth={3}/> حر
          </button>
        </div>

        {cart.length===0 && (
          <div className="text-center py-10 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/3 border border-white/5 flex items-center justify-center opacity-25"><ShoppingCart size={22}/></div>
            <p className="text-gray-500 font-bold text-xs">السلة فارغة</p>
            <div className="flex gap-2.5 mt-1">
              <button onClick={() => setShowScanner(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/12 text-blue-400 border border-blue-500/20 text-xs font-bold active:scale-95">
                <QrCode size={13}/> باركود
              </button>
              <button onClick={() => setShowProductSearch(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/12 text-purple-400 border border-purple-500/20 text-xs font-bold active:scale-95">
                <Package size={13}/> المنتجات
              </button>
              <button onClick={() => setShowBullionSearch(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/12 text-amber-400 border border-amber-500/20 text-xs font-bold active:scale-95">
                <Coins size={13}/> السبائك
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {cart.map((item, idx) => (
            <div key={item.tempId} className="rounded-2xl border border-white/10 overflow-hidden animate-scale-in" style={{ animationDelay:`${idx*55}ms`, background:'rgba(30,41,59,0.95)' }}>
              <div className="p-3 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <input value={item.itemName} onChange={e => updateItem(item.tempId,'itemName',e.target.value)}
                    style={{ background:'rgba(15,23,42,0.85)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'#fff', padding:'6px 10px', flex:'1', fontSize:'13px', fontWeight:'700', outline:'none' }}
                    placeholder="اسم الصنف (مثال: خاتم)"
                    onFocus={e=>{e.target.style.borderColor='rgba(251,191,36,0.5)';e.target.style.boxShadow='0 0 0 3px rgba(251,191,36,0.1)';}}
                    onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';e.target.style.boxShadow='none';}}/>
                  <button onClick={() => removeItem(item.tempId)} className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all active:scale-90 shrink-0">
                    <Trash2 size={13}/>
                  </button>
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-bold mb-1 block">العيار</label>
                  <div className="flex bg-[#0f172a] rounded-lg border border-white/10 p-0.5 h-8">
                    {[18,21,24].map(k => (
                      <button key={k} onClick={() => updateItem(item.tempId,'karat',k)}
                        className={`flex-1 text-[11px] font-bold rounded-md transition-all ${item.karat===k?'bg-gold-500 text-black shadow':'text-gray-500 hover:text-white'}`}>
                        {k}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="h-px bg-white/5 mx-3"/>
              <div className="grid grid-cols-3 gap-2 p-3 pt-2">
                <div>
                  <label className="text-[9px] text-gray-500 font-bold mb-1 flex items-center gap-1"><ShoppingCart size={8}/> العدد</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" value={item.qty ?? '1'} onChange={e => updateItem(item.tempId,'qty',convertArabicToEnglishNums(e.target.value))}
                    style={{ background:'rgba(15,23,42,0.85)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'#fff', padding:'6px 10px', width:'100%', fontSize:'15px', fontWeight:'900', outline:'none', fontFamily:'monospace' }}
                    placeholder="1"
                    onFocus={e=>{e.target.style.borderColor='rgba(251,191,36,0.5)';e.target.style.boxShadow='0 0 0 3px rgba(251,191,36,0.1)'; e.target.select();}}
                    onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';e.target.style.boxShadow='none';}}/>
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-bold mb-1 flex items-center gap-1"><Scale size={8}/> الوزن (جم)</label>
                  <input type="text" inputMode="decimal" pattern="[0-9.]*" value={item.weight} onChange={e => updateItem(item.tempId,'weight',convertArabicToEnglishNums(e.target.value))}
                    style={{ background:'rgba(15,23,42,0.85)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:'#fff', padding:'6px 10px', width:'100%', fontSize:'15px', fontWeight:'900', outline:'none', fontFamily:'monospace' }}
                    placeholder="0.00"
                    onFocus={e=>{e.target.style.borderColor='rgba(251,191,36,0.5)';e.target.style.boxShadow='0 0 0 3px rgba(251,191,36,0.1)'; e.target.select();}}
                    onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';e.target.style.boxShadow='none';}}/>
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-bold mb-1 flex items-center gap-1"><Coins size={8}/> السعر الإجمالي</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" value={item.totalPrice} onChange={e => updateItem(item.tempId,'totalPrice',convertArabicToEnglishNums(e.target.value))}
                    style={{ background:'rgba(15,23,42,0.85)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:'10px', color:item.type===TransactionType.SALE?'#34d399':'#f87171', padding:'6px 10px', width:'100%', fontSize:'15px', fontWeight:'900', outline:'none', fontFamily:'monospace' }}
                    placeholder="0"
                    onFocus={e=>{e.target.style.borderColor='rgba(251,191,36,0.5)';e.target.style.boxShadow='0 0 0 3px rgba(251,191,36,0.1)'; e.target.select();}}
                    onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';e.target.style.boxShadow='none';}}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="shrink-0 bg-[#0b1120] border-t border-white/10 p-3 pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
        <div className="space-y-2.5">
          <div className="flex gap-2.5">
            <div className="flex bg-[#1e293b] p-0.5 rounded-xl border border-white/5 flex-1 h-[50px]">
              <button onClick={() => { setPaymentMethod(PaymentMethod.CASH); setIsPaidManuallySet(false); }}
                className={`flex-1 py-0.5 rounded-lg font-bold text-[9px] flex flex-col items-center justify-center gap-0.5 transition-all ${paymentMethod===PaymentMethod.CASH?'bg-white text-black shadow':'text-gray-400'}`}>
                <Banknote size={12}/> كاش
              </button>
              <button onClick={() => { setPaymentMethod(PaymentMethod.INSTAPAY); setIsPaidManuallySet(false); }}
                className={`flex-1 py-0.5 rounded-lg font-bold text-[9px] flex flex-col items-center justify-center gap-0.5 transition-all ${paymentMethod===PaymentMethod.INSTAPAY?'bg-purple-600 text-white shadow':'text-gray-400'}`}>
                <Smartphone size={12}/> InstaPay
              </button>
              <button onClick={() => {
                setPaymentMethod(PaymentMethod.SPLIT);
                setIsPaidManuallySet(true);
                const total = Math.abs(totalAmount);
                setCashSplitAmount(Math.floor(total / 2).toString());
                setInstapaySplitAmount(Math.ceil(total / 2).toString());
              }}
                className={`flex-1 py-0.5 rounded-lg font-bold text-[9px] flex flex-col items-center justify-center gap-0.5 transition-all ${paymentMethod===PaymentMethod.SPLIT?'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow':'text-gray-400'}`}>
                <Wallet size={12}/> مشترك
              </button>
            </div>
            <div className="w-[35%] bg-[#1e293b] rounded-xl border border-white/5 flex flex-col items-center justify-center px-1.5 relative overflow-hidden h-[50px]">
              <div className={`absolute inset-0 opacity-10 ${totalAmount>=0?'bg-emerald-500':'bg-rose-500'}`}/>
              <span className="text-[8px] text-gray-400 font-bold z-10 leading-none">الإجمالي</span>
              <span className={`text-sm font-black z-10 mt-1 ${totalAmount>=0?'text-gold-400':'text-rose-400'}`}>{Math.abs(totalAmount).toLocaleString()}</span>
            </div>
          </div>
          {paymentMethod === PaymentMethod.SPLIT && (
            <div className="bg-[#1e293b]/50 p-2.5 rounded-xl border border-white/5 space-y-2.5">
              <div className="flex gap-2.5">
                <div className="flex-1">
                  <label className="block text-[8px] text-gray-400 font-bold mb-1">المدفوع كاش</label>
                  <input
                    type="number"
                    value={cashSplitAmount}
                    onChange={e => {
                      const val = e.target.value;
                      setCashSplitAmount(val);
                      const total = Math.abs(totalAmount);
                      const cashVal = Number(val || 0);
                      if (cashVal <= total) {
                        setInstapaySplitAmount((total - cashVal).toString());
                      }
                    }}
                    className="w-full bg-[#0a0e1a]/80 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-center font-black text-emerald-400 outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[8px] text-gray-400 font-bold mb-1">المدفوع InstaPay</label>
                  <input
                    type="number"
                    value={instapaySplitAmount}
                    onChange={e => {
                      const val = e.target.value;
                      setInstapaySplitAmount(val);
                      const total = Math.abs(totalAmount);
                      const instapayVal = Number(val || 0);
                      if (instapayVal <= total) {
                        setCashSplitAmount((total - instapayVal).toString());
                      }
                    }}
                    className="w-full bg-[#0a0e1a]/80 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-center font-black text-purple-400 outline-none focus:border-purple-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center text-[9px]">
                <button
                  type="button"
                  onClick={() => {
                    const total = Math.abs(totalAmount);
                    setCashSplitAmount(Math.floor(total / 2).toString());
                    setInstapaySplitAmount(Math.ceil(total / 2).toString());
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/20 transition-all active:scale-95"
                >
                  تقسيم بالتساوي 50/50
                </button>
                <div className="text-gray-400 font-bold">
                  مجموع المدفوع: <span className="text-white font-mono">{(Number(cashSplitAmount || 0) + Number(instapaySplitAmount || 0)).toLocaleString()}</span> ج.م
                </div>
              </div>
            </div>
          )}
          {isDebt && (
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-rose-400 bg-rose-900/20 py-1 rounded-lg border border-rose-500/20">
              ⚠️ متبقي (آجل): {(Math.abs(totalAmount)-Number(paidAmount)).toLocaleString()} ج.م
            </div>
          )}
          <button onClick={handleSave} disabled={cart.length===0}
            className="w-full bg-gradient-to-r from-gold-600 to-gold-500 text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 text-base shadow-[0_0_15px_rgba(234,179,8,0.2)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:grayscale">
            <Save size={16}/><span>حفظ وإنهاء العملية</span>
          </button>
        </div>
      </footer>

      <Modal isOpen={isAddCustomerOpen} onClose={() => setIsAddCustomerOpen(false)} title="إضافة عميل جديد">
        <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
          <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-2xl text-sm text-blue-200 flex items-start gap-3">
            <div className="bg-blue-500/20 p-2 rounded-full shrink-0"><User size={18} className="text-blue-400"/></div>
            <div>يجب إدخال اسم العميل ورقم الهاتف لتسجيل المبيعات الآجلة في دفتر الديون.</div>
          </div>
          <Input label="اسم العميل" value={newCustomerForm.name} onChange={e => setNewCustomerForm({...newCustomerForm,name:e.target.value})} required autoFocus className="h-14 text-lg"/>
          <Input label="رقم الهاتف" type="tel" value={newCustomerForm.phone} onChange={e => setNewCustomerForm({...newCustomerForm,phone:e.target.value})} required className="h-14 text-lg font-mono"/>
          <button type="submit" className="w-full bg-gold-500 text-black font-bold py-4 rounded-xl text-lg shadow-lg">حفظ واختيار</button>
        </form>
      </Modal>

      <Modal isOpen={isExitConfirmOpen} onClose={() => setIsExitConfirmOpen(false)} title="تأكيد الخروج">
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h3 className="text-base font-black text-white">هل أنت متأكد من الخروج وإلغاء الفاتورة؟</h3>
            <p className="text-xs text-gray-400 mt-2 font-medium">سيتم فقدان جميع العناصر المضافة في السلة.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1 text-xs py-3" onClick={() => { setIsExitConfirmOpen(false); navigate('/dashboard'); }}>
              نعم، إلغاء وخروج
            </Button>
            <Button variant="secondary" className="flex-1 text-xs py-3" onClick={() => setIsExitConfirmOpen(false)}>
              رجوع وإكمال الفاتورة
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Sales;
