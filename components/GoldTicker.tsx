import React, { useState, useEffect } from 'react';
import { GoldPriceService } from '../services/storage';
import { Karat } from '../types';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Eye, EyeOff, Pencil } from 'lucide-react';

export const GoldTicker = () => {
  const [basePrice, setBasePrice] = useState(0);
  const [ouncePrice, setOuncePrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [isManual, setIsManual] = useState(false);
  
  // Persist visibility in localStorage so it survives page navigation
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('gold_ticker_visible') !== 'false';
  });

  // Manual Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editBase21, setEditBase21] = useState('');
  const [editManual, setEditManual] = useState(true);

  const toggleVisible = () => {
    const next = !isVisible;
    setIsVisible(next);
    localStorage.setItem('gold_ticker_visible', String(next));
  };

  const loadPrice = () => {
    const stored = GoldPriceService.getStoredPrice();
    setBasePrice(stored.base21);
    setOuncePrice(stored.ouncePriceUsd || 0);
    setIsManual(stored.manualOverride || false);
  };

  const handleFetch = async () => {
    setIsLoading(true);
    const oldPrice = basePrice;
    const { base21: newPrice } = await GoldPriceService.fetchLivePrice();
    if (newPrice > 0) {
      setTrend(newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : 'stable');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadPrice();
    window.addEventListener('gold-price-updated', loadPrice);
    
    // Auto refresh every 10 seconds
    const interval = setInterval(() => {
        const current = GoldPriceService.getStoredPrice();
        if (!current.manualOverride) {
            handleFetch();
        }
    }, 10000);

    return () => {
      window.removeEventListener('gold-price-updated', loadPrice);
      clearInterval(interval);
    };
  }, []);

  const openEditModal = () => {
    const stored = GoldPriceService.getStoredPrice();
    setEditBase21(stored.base21.toString());
    setEditManual(stored.manualOverride || false);
    setIsEditOpen(true);
  };

  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(editBase21, 10);
    if (isNaN(val) || val <= 0) {
      alert('الرجاء إدخال سعر صحيح');
      return;
    }
    
    GoldPriceService.setPrice(val, editManual);
    setIsEditOpen(false);
    alert('تم حفظ سعر الذهب بنجاح');
  };

  const p24 = GoldPriceService.calculatePrice(Karat.K24, basePrice);
  const p18 = GoldPriceService.calculatePrice(Karat.K18, basePrice);

  const displayValue = (val: string | number) => isVisible ? val : '••••';

  return (
    <div className="bg-[#0f172a] text-white p-4 border-b border-white/5 relative overflow-hidden font-sans">
      
      {/* Ticker Toolbar Row */}
      <div className="flex justify-between items-center mb-3">
          {/* Right side: Title and live pulse */}
          <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  أسعار البورصة الحرة {isManual && <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[8px] font-black mr-1">(يدوي)</span>}
              </span>
          </div>

          {/* Left side: Controls */}
          <div className="flex items-center gap-2">
              {/* Show/Hide Toggle */}
              <button 
                onClick={toggleVisible}
                className={`p-1.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95
                  ${isVisible 
                      ? 'bg-slate-800/80 border-white/10 text-gray-300 hover:text-white' 
                      : 'bg-gold-500/10 border-gold-500/20 text-gold-400'
                  }`}
              >
                  {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span className="text-[9px] font-bold">{isVisible ? 'إخفاء' : 'إظهار'}</span>
              </button>

              {/* Edit Gold Price */}
              <button 
                onClick={openEditModal}
                className={`p-1.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95
                  ${isManual 
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                    : 'bg-slate-800/80 border-white/10 text-gray-300 hover:text-white'
                  }`}
              >
                  <Pencil size={14} />
                  <span className="text-[9px] font-bold">تعديل</span>
              </button>

              {/* Manual Refresh */}
              <button 
                onClick={handleFetch}
                disabled={isLoading}
                className="p-1.5 rounded-xl bg-slate-800/80 border border-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin text-gold-500' : ''} />
                  <span className="text-[9px] font-bold">تحديث</span>
              </button>
          </div>
      </div>

      {/* Symmetrical Pricing Cards Grid (4 columns responsive on mobile) */}
      <div className="grid grid-cols-4 gap-2.5 overflow-x-auto no-scrollbar pb-1">
          
          {/* Card 1: Ounce */}
          <div className="bg-[#1e293b]/40 border border-blue-500/10 rounded-2xl p-2.5 text-center flex flex-col justify-between min-w-[75px] hover:border-blue-500/25 transition-all">
              <span className="text-blue-400 text-[9px] font-bold block mb-1">الأوقية $</span>
              <span className="font-mono font-black text-xs md:text-sm text-white block">
                  {displayValue(ouncePrice.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}))}
              </span>
          </div>

          {/* Card 2: 24k */}
          <div className="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-2.5 text-center flex flex-col justify-between min-w-[75px] hover:border-gold-500/15 transition-all">
              <span className="text-gray-400 text-[9px] font-bold block mb-1">عيار 24</span>
              <span className="font-mono font-black text-xs md:text-sm text-white block">
                  {displayValue(p24.toLocaleString())}
              </span>
          </div>

          {/* Card 3: 21k (Hero Card - Highlighted in Gold) */}
          <div className="bg-gold-500/5 border border-gold-500/30 rounded-2xl p-2.5 text-center flex flex-col justify-between min-w-[75px] hover:bg-gold-500/10 transition-all shadow-[0_0_15px_rgba(251,191,36,0.02)]">
              <span className="text-gold-500 text-[9px] font-black block mb-1">عيار 21 ✨</span>
              <span className="font-mono font-black text-sm md:text-base text-gold-400 block">
                  {displayValue(basePrice.toLocaleString())}
              </span>
          </div>

          {/* Card 4: 18k */}
          <div className="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-2.5 text-center flex flex-col justify-between min-w-[75px] hover:border-gold-500/15 transition-all">
              <span className="text-gray-400 text-[9px] font-bold block mb-1">عيار 18</span>
              <span className="font-mono font-black text-xs md:text-sm text-white block">
                  {displayValue(p18.toLocaleString())}
              </span>
          </div>

      </div>

      {/* Subtle Trend background indicator */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 opacity-[0.02] pointer-events-none">
         {trend === 'up' && <TrendingUp size={80} className="text-emerald-500" />}
         {trend === 'down' && <TrendingDown size={80} className="text-rose-500" />}
      </div>

      {/* Modal for editing gold price manually */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] border border-white/10 rounded-[2rem] w-full max-w-sm p-6 shadow-2xl relative animate-scale-in text-right" dir="rtl">
            <h3 className="text-lg font-bold text-white mb-2">تعديل سعر الذهب (البورصة الحرة)</h3>
            <p className="text-xs text-gray-400 mb-4">تحديث سعر جرام عيار 21 لحساب تكلفة المصوغات والمبيعات</p>
            
            <form onSubmit={handleSavePrice} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 block font-medium mr-1">سعر جرام عيار 21 (ج.م)</label>
                <div className="bg-[#0f172a] rounded-2xl p-4 border border-white/5 flex items-center gap-2">
                  <input 
                    type="number" 
                    value={editBase21} 
                    onChange={e => setEditBase21(e.target.value)}
                    required
                    placeholder="مثال: 3750"
                    className="w-full bg-transparent text-2xl font-black text-white outline-none text-center font-mono"
                  />
                  <span className="text-sm font-bold text-amber-500 shrink-0">ج.م</span>
                </div>
              </div>

              {/* Automation toggle card */}
              <div className="bg-[#0f172a]/60 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-white font-bold block">تثبيت السعر يدوياً</span>
                  <span className="text-[10px] text-gray-500 block">إيقاف التحديث التلقائي من الإنترنت</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditManual(!editManual)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${editManual ? 'bg-amber-500' : 'bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-[#1e293b] transition-transform duration-200 ${editManual ? 'mr-0' : 'mr-6'}`} />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-black py-3 rounded-xl text-xs active:scale-95 transition-transform"
                >
                  حفظ التعديلات
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-xs active:scale-95 transition-transform"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
