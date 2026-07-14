import React, { useState, useEffect } from 'react';
import { Search, X, Package } from 'lucide-react';
import { BullionService } from '../services/bullion';
import { BullionItem } from '../types';

interface BullionSearchPanelProps {
  onSelect: (item: BullionItem) => void;
  onClose: () => void;
  currentShop: string;
}

export const BullionSearchPanel: React.FC<BullionSearchPanelProps> = ({ onSelect, onClose, currentShop }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bullions, setBullions] = useState<BullionItem[]>([]);

  useEffect(() => {
    setBullions(BullionService.getAll().filter(b => (b.shop || 'المحل الأساسي') === currentShop));
  }, [currentShop]);

  const filtered = bullions.filter(b => 
    b.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.bullionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.weight.toString().includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-[#1e293b] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-slide-up">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Package className="text-gold-500" size={20} />
            اختيار سبيكة / جنيه من الدفتر
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-3.5 text-gray-400" size={18} />
            <input 
              autoFocus
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pr-10 pl-4 text-white placeholder-gray-500 focus:border-gold-500/50 outline-none"
              placeholder="ابحث بالشركة، النوع أو الوزن..."
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">لا توجد نتائج مطابقة</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filtered.map(b => (
                <button
                  key={b.id}
                  onClick={() => onSelect(b)}
                  className="flex flex-col text-right p-4 rounded-xl border border-white/5 hover:border-gold-500/30 hover:bg-gold-500/5 transition-all group"
                >
                  <div className="font-bold text-white group-hover:text-gold-400 transition-colors">
                    {b.company} - {b.bullionType} ({b.weight}g)
                  </div>
                  <div className="flex justify-between items-center mt-2 w-full">
                     <div className="text-xs text-gray-400">العيار: {b.karat}K</div>
                     <div className="text-xs bg-white/5 px-2 py-1 rounded text-gray-300">
                        متاح: {b.count}
                     </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
