import React, { useState, useEffect } from 'react';
import { BullionService } from '../services/bullion';
import { BullionItem, BullionLog, Karat } from '../types';
import { Package, Plus, Search, LogIn, LogOut, ArrowRightLeft, FileText, Trash2, ChevronDown, ChevronUp, Building2, Layers, Coins, Award, Scale } from 'lucide-react';
import { Modal, Input, Select, Button } from '../components/UI';

const Bullions = () => {
  const [items, setItems] = useState<BullionItem[]>([]);
  const [logs, setLogs] = useState<BullionLog[]>([]);
  const [currentShop, setCurrentShop] = useState(localStorage.getItem('selected_shop') || 'المحل الأساسي');
  
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'LOGS'>('INVENTORY');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    company: 'BTC',
    bullionType: 'سبيكة',
    weight: '',
    karat: 24 as Karat,
    count: '',
  });

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    id: '',
    operation: 'شراء جديد',
    count: '',
    isInOut: 'IN' as 'IN' | 'OUT'
  });

  const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);

  const loadData = () => {
    setItems(BullionService.getAll());
    setLogs(BullionService.getLogs());
  };

  useEffect(() => {
    loadData();
    const handleShopChanged = () => {
      setCurrentShop(localStorage.getItem('selected_shop') || 'المحل الأساسي');
      loadData();
    };
    window.addEventListener('shop-changed', handleShopChanged);
    return () => window.removeEventListener('shop-changed', handleShopChanged);
  }, []);

  const filteredItems = items.filter(i => (i.shop || 'المحل الأساسي') === currentShop);
  const filteredLogs = logs.filter(l => (l.shop || 'المحل الأساسي') === currentShop);

  const summary = React.useMemo(() => {
    let totalCount = 0;
    let totalWeight = 0;
    let weight24K = 0;
    let weight21K = 0;

    filteredItems.forEach(item => {
      totalCount += item.count;
      totalWeight += item.totalWeight;
      if (item.karat === 24) {
        weight24K += item.totalWeight;
      } else if (item.karat === 21) {
        weight21K += item.totalWeight;
      }
    });

    return { totalCount, totalWeight, weight24K, weight21K };
  }, [filteredItems]);

  const getArabicLabel = (type: string, weight: number) => {
    if (type === 'جنيه') return 'جنيه ذهب';
    if (type === 'نصف جنيه') return 'نصف جنيه ذهب';
    if (type === 'ربع جنيه') return 'ربع جنيه ذهب';
    
    // For bullions
    if (weight === 0.25) return 'سبيكة ربع جرام';
    if (weight === 0.5) return 'سبيكة نصف جرام';
    if (weight === 1) return 'سبيكة جرام';
    if (weight === 2.5) return 'سبيكة ٢.٥ جرام';
    if (weight === 5) return 'سبيكة ٥ جرام';
    if (weight === 10) return 'سبيكة ١٠ جرام';
    if (weight === 20) return 'سبيكة ٢٠ جرام';
    if (weight === 31.1) return 'سبيكة أونصة (٣١.١ جم)';
    if (weight === 50) return 'سبيكة ٥٠ جرام';
    if (weight === 100) return 'سبيكة ١٠٠ جرام';
    
    return `سبيكة ${weight} جرام`;
  };

  const { poundsGroup, bullionsGroup } = React.useMemo(() => {
    const groups: {
      [key: string]: {
        bullionType: string;
        weight: number;
        karat: Karat;
        totalCount: number;
        totalWeight: number;
        items: BullionItem[];
      }
    } = {};

    filteredItems.forEach(item => {
      const key = `${item.bullionType}-${item.weight}-${item.karat}`;
      if (!groups[key]) {
        groups[key] = {
          bullionType: item.bullionType,
          weight: item.weight,
          karat: item.karat,
          totalCount: 0,
          totalWeight: 0,
          items: []
        };
      }
      groups[key].totalCount += item.count;
      groups[key].totalWeight += item.totalWeight;
      groups[key].items.push(item);
    });

    // Define standard categories requested by user
    const standardPounds = [
      { bullionType: 'جنيه', weight: 8, karat: 21 as Karat, displayName: 'جنيه ذهب' },
      { bullionType: 'نصف جنيه', weight: 4, karat: 21 as Karat, displayName: 'نصف جنيه ذهب' },
      { bullionType: 'ربع جنيه', weight: 2, karat: 21 as Karat, displayName: 'ربع جنيه ذهب' },
    ];

    const standardBullions = [
      { bullionType: 'سبيكة', weight: 0.25, karat: 24 as Karat, displayName: 'سبيكة ربع جرام' },
      { bullionType: 'سبيكة', weight: 0.5, karat: 24 as Karat, displayName: 'سبيكة نصف جرام' },
      { bullionType: 'سبيكة', weight: 1, karat: 24 as Karat, displayName: 'سبيكة جرام' },
      { bullionType: 'سبيكة', weight: 2.5, karat: 24 as Karat, displayName: 'سبيكة ٢.٥ جرام' },
      { bullionType: 'سبيكة', weight: 5, karat: 24 as Karat, displayName: 'سبيكة ٥ جرام' },
      { bullionType: 'سبيكة', weight: 10, karat: 24 as Karat, displayName: 'سبيكة ١٠ جرام' },
      { bullionType: 'سبيكة', weight: 20, karat: 24 as Karat, displayName: 'سبيكة ٢٠ جرام' },
      { bullionType: 'سبيكة', weight: 31.1, karat: 24 as Karat, displayName: 'سبيكة أونصة (٣١.١ جم)' },
      { bullionType: 'سبيكة', weight: 50, karat: 24 as Karat, displayName: 'سبيكة ٥٠ جرام' },
      { bullionType: 'سبيكة', weight: 100, karat: 24 as Karat, displayName: 'سبيكة ١٠٠ جرام' },
    ];

    // Identify any custom weights entered by user
    const customPounds: typeof standardPounds = [];
    const customBullions: typeof standardBullions = [];

    Object.values(groups).forEach(g => {
      if (g.bullionType === 'سبيكة') {
        const isStandard = standardBullions.some(b => b.weight === g.weight);
        if (!isStandard) {
          customBullions.push({
            bullionType: g.bullionType,
            weight: g.weight,
            karat: g.karat,
            displayName: `سبيكة ${g.weight} جرام`
          });
        }
      } else {
        const isStandard = standardPounds.some(p => p.bullionType === g.bullionType && p.weight === g.weight);
        if (!isStandard) {
          customPounds.push({
            bullionType: g.bullionType,
            weight: g.weight,
            karat: g.karat,
            displayName: `${g.bullionType} ${g.weight} جرام`
          });
        }
      }
    });

    // Sort custom items
    customPounds.sort((a, b) => b.weight - a.weight);
    customBullions.sort((a, b) => a.weight - b.weight);

    // Merge standard + custom
    const finalPounds = [...standardPounds];
    customPounds.forEach(cp => {
      const idx = finalPounds.findIndex(p => p.weight < cp.weight);
      if (idx === -1) finalPounds.push(cp);
      else finalPounds.splice(idx, 0, cp);
    });

    const finalBullions = [...standardBullions];
    customBullions.forEach(cb => {
      const idx = finalBullions.findIndex(b => b.weight > cb.weight);
      if (idx === -1) finalBullions.push(cb);
      else finalBullions.splice(idx, 0, cb);
    });

    // Map each to final display group with counts and items list
    const mappedPounds = finalPounds.map(p => {
      const key = `${p.bullionType}-${p.weight}-${p.karat}`;
      const groupData = groups[key] || { totalCount: 0, totalWeight: 0, items: [] };
      return {
        ...p,
        totalCount: groupData.totalCount,
        totalWeight: groupData.totalWeight,
        items: groupData.items
      };
    });

    const mappedBullions = finalBullions.map(b => {
      const key = `${b.bullionType}-${b.weight}-${b.karat}`;
      const groupData = groups[key] || { totalCount: 0, totalWeight: 0, items: [] };
      return {
        ...b,
        totalCount: groupData.totalCount,
        totalWeight: groupData.totalWeight,
        items: groupData.items
      };
    });

    return { poundsGroup: mappedPounds, bullionsGroup: mappedBullions };
  }, [filteredItems]);

  const handleTypeChange = (type: string) => {
    let defaultKarat = addForm.karat;
    let defaultWeight = addForm.weight;

    if (type === 'جنيه') {
      defaultKarat = 21;
      defaultWeight = '8';
    } else if (type === 'نصف جنيه') {
      defaultKarat = 21;
      defaultWeight = '4';
    } else if (type === 'ربع جنيه') {
      defaultKarat = 21;
      defaultWeight = '2';
    } else if (type === 'سبيكة') {
      defaultKarat = 24;
      defaultWeight = '';
    }

    setAddForm(prev => ({
      ...prev,
      bullionType: type,
      karat: defaultKarat as Karat,
      weight: defaultWeight
    }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.weight) {
      alert('يرجى إدخال الوزن');
      return;
    }
    const finalCount = addForm.count === '' ? 1 : Number(addForm.count);
    BullionService.addBullionType({
      company: addForm.company,
      bullionType: addForm.bullionType,
      weight: Number(addForm.weight),
      karat: addForm.karat,
      count: finalCount,
    });
    loadData();
    setIsAddOpen(false);
    setAddForm({ company: 'BTC', bullionType: 'سبيكة', weight: '', karat: 24, count: '' });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateForm.id) return;
    
    const finalCount = updateForm.count === '' ? 1 : Number(updateForm.count);
    const countChange = updateForm.isInOut === 'IN' ? finalCount : -finalCount;
    const item = items.find(i => i.id === updateForm.id);
    if (!item) return;
    
    const weightChange = countChange * item.weight;
    
    if (updateForm.isInOut === 'OUT' && item.count < finalCount) {
      alert('الكمية المتاحة غير كافية');
      return;
    }

    BullionService.updateInventory(
      updateForm.id,
      countChange,
      weightChange,
      updateForm.operation,
      updateForm.isInOut
    );
    loadData();
    setIsUpdateOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الصنف من دفتر السبائك؟')) {
      BullionService.deleteBullionType(id);
      loadData();
    }
  };

  const handleQuickAdd = (type: string, weight: number, karat: Karat) => {
    setAddForm({
      company: 'BTC',
      bullionType: type,
      weight: String(weight),
      karat: karat,
      count: '1'
    });
    setIsAddOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Package className="text-gold-500" size={32} />
            دفتر السبائك والجنيهات
          </h1>
          <p className="text-gray-400 mt-1">إدارة المخزون من السبائك والجنيهات الذهبية لجميع الشركات</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex-1 md:flex-none bg-gold-500 hover:bg-gold-600 text-black px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            إضافة صنف جديد
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 bg-[#0a0e1a] p-1 rounded-xl border border-white/5 w-fit">
        <button 
          onClick={() => setActiveTab('INVENTORY')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'INVENTORY' ? 'bg-[#1e293b] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          <Package size={16} /> المخزون الحالي
        </button>
        <button 
          onClick={() => setActiveTab('LOGS')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'LOGS' ? 'bg-[#1e293b] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          <FileText size={16} /> حركة الدفتر
        </button>
      </div>

      {activeTab === 'INVENTORY' && (
        <div className="space-y-6">
          {/* Summary Dashboard Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1e293b] p-5 rounded-3xl border border-white/5 shadow-lg flex items-center gap-4 hover:border-gold-500/20 transition-all duration-300">
              <div className="p-3 bg-gold-500/10 rounded-2xl text-gold-500">
                <Package size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold">إجمالي القطع بالمخزن</p>
                <p className="text-xl font-black text-white mt-1">{summary.totalCount} <span className="text-xs text-gray-400">قطعة</span></p>
              </div>
            </div>

            <div className="bg-[#1e293b] p-5 rounded-3xl border border-white/5 shadow-lg flex items-center gap-4 hover:border-gold-500/20 transition-all duration-300">
              <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500">
                <Scale size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold">الوزن الإجمالي بالمخزن</p>
                <p className="text-xl font-black text-yellow-500 mt-1">{summary.totalWeight.toFixed(2)} <span className="text-xs text-gray-400">جم</span></p>
              </div>
            </div>

            <div className="bg-[#1e293b] p-5 rounded-3xl border border-white/5 shadow-lg flex items-center gap-4 hover:border-gold-500/20 transition-all duration-300">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold">إجمالي ذهب عيار 24</p>
                <p className="text-xl font-black text-amber-400 mt-1">{summary.weight24K.toFixed(2)} <span className="text-xs text-gray-400">جم</span></p>
              </div>
            </div>

            <div className="bg-[#1e293b] p-5 rounded-3xl border border-white/5 shadow-lg flex items-center gap-4 hover:border-gold-500/20 transition-all duration-300">
              <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold">إجمالي ذهب عيار 21</p>
                <p className="text-xl font-black text-orange-400 mt-1">{summary.weight21K.toFixed(2)} <span className="text-xs text-gray-400">جم</span></p>
              </div>
            </div>
          </div>

          {/* Grouped Stock View */}
          <div className="space-y-8">
            
            {/* 1. الجنيهات الذهبية (عيار ٢١) */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-r-4 border-yellow-500 pr-3.5 py-1">
                <Coins className="text-yellow-500" size={24} />
                <div>
                  <h2 className="text-xl font-black text-white">الجنيهات الذهبية (عيار ٢١)</h2>
                  <p className="text-xs text-gray-400 font-bold">جميع فئات وأوزان الجنيهات المتوفرة بالمخزن</p>
                </div>
                <span className="mr-auto text-xs text-gray-400 bg-white/5 border border-white/5 px-3 py-1.5 rounded-2xl font-bold font-mono">
                  {poundsGroup.reduce((sum, g) => sum + g.totalCount, 0)} قطعة
                </span>
              </div>

              <div className="space-y-3">
                {poundsGroup.map(group => {
                  const groupKey = `${group.bullionType}-${group.weight}-${group.karat}`;
                  const isExpanded = expandedGroupKey === groupKey;
                  const displayName = group.displayName;

                  return (
                    <div 
                      key={groupKey}
                      className={`bg-[#1e293b] rounded-3xl border shadow-md overflow-hidden transition-all duration-300 ${
                        isExpanded ? 'border-yellow-500/40 ring-1 ring-yellow-500/20' : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      {/* Accordion Row Header */}
                      <div 
                        onClick={() => setExpandedGroupKey(isExpanded ? null : groupKey)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${group.totalCount > 0 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-500/10 text-gray-400'}`}>
                            <Coins size={22} />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-white">{displayName}</h3>
                            <p className="text-xs text-gray-400 font-bold mt-0.5">{group.weight} جرام - عيار {group.karat}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 text-left justify-end">
                            <span className={`text-xs font-black px-3 py-1.5 rounded-xl font-mono ${
                              group.totalCount > 0 
                                ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' 
                                : 'bg-gray-500/10 text-gray-400 border border-white/5'
                            }`}>
                              العدد: {group.totalCount} قطعة
                            </span>
                            {group.totalCount > 0 && (
                              <span className="text-xs font-black px-3 py-1.5 rounded-xl font-mono bg-white/5 text-gray-300 border border-white/5">
                                الوزن: {group.totalWeight.toFixed(2)} جم
                              </span>
                            )}
                          </div>
                          <div className="text-gray-400">
                            {isExpanded ? <ChevronUp size={20} className="text-yellow-500" /> : <ChevronDown size={20} />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="bg-black/20 border-t border-white/5 p-5 space-y-4">
                          {group.totalCount > 0 ? (
                            <>
                              <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5 px-1">
                                <Building2 size={14} className="text-yellow-500" /> توزيع المخزون حسب الشركات المصنعة:
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {group.items.map(item => (
                                  <div 
                                    key={item.id}
                                    className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 flex items-center justify-between transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-[#1e293b] border border-white/10 flex items-center justify-center text-xs font-black text-yellow-500">
                                        {item.company}
                                      </div>
                                      <div>
                                        <span className="text-sm font-bold text-white block">{item.company}</span>
                                        <span className="text-xs text-gray-400 font-mono font-bold">الكمية الحالية: {item.count} قطع</span>
                                      </div>
                                    </div>

                                    
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="py-6 text-center space-y-3">
                              <p className="text-sm text-gray-400 font-bold">لا يوجد رصيد حالياً من أي شركة لهذا الصنف.</p>
                              <button
                                onClick={() => handleQuickAdd(group.bullionType, group.weight, group.karat)}
                                className="inline-flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 px-4 py-2 rounded-xl text-xs font-bold border border-yellow-500/25 transition-all"
                              >
                                <Plus size={14} /> إضافة رصيد سريع لهذا الصنف
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. السبائك الذهبية (عيار ٢٤) */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 border-r-4 border-amber-500 pr-3.5 py-1">
                <Layers className="text-amber-500 animate-pulse" size={24} />
                <div>
                  <h2 className="text-xl font-black text-white">السبائك الذهبية (عيار ٢٤)</h2>
                  <p className="text-xs text-gray-400 font-bold">جميع أوزان سبائك الذهب المتوفرة بالمخزن</p>
                </div>
                <span className="mr-auto text-xs text-gray-400 bg-white/5 border border-white/5 px-3 py-1.5 rounded-2xl font-bold font-mono">
                  {bullionsGroup.reduce((sum, g) => sum + g.totalCount, 0)} قطعة
                </span>
              </div>

              <div className="space-y-3">
                {bullionsGroup.map(group => {
                  const groupKey = `${group.bullionType}-${group.weight}-${group.karat}`;
                  const isExpanded = expandedGroupKey === groupKey;
                  const displayName = group.displayName;

                  return (
                    <div 
                      key={groupKey}
                      className={`bg-[#1e293b] rounded-3xl border shadow-md overflow-hidden transition-all duration-300 ${
                        isExpanded ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      {/* Accordion Row Header */}
                      <div 
                        onClick={() => setExpandedGroupKey(isExpanded ? null : groupKey)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${group.totalCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'}`}>
                            <Layers size={22} />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-white">{displayName}</h3>
                            <p className="text-xs text-gray-400 font-bold mt-0.5">{group.weight} جرام - عيار {group.karat}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 text-left justify-end">
                            <span className={`text-xs font-black px-3 py-1.5 rounded-xl font-mono ${
                              group.totalCount > 0 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                : 'bg-gray-500/10 text-gray-400 border border-white/5'
                            }`}>
                              العدد: {group.totalCount} قطعة
                            </span>
                            {group.totalCount > 0 && (
                              <span className="text-xs font-black px-3 py-1.5 rounded-xl font-mono bg-white/5 text-gray-300 border border-white/5">
                                الوزن: {group.totalWeight.toFixed(2)} جم
                              </span>
                            )}
                          </div>
                          <div className="text-gray-400">
                            {isExpanded ? <ChevronUp size={20} className="text-amber-500" /> : <ChevronDown size={20} />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="bg-black/20 border-t border-white/5 p-5 space-y-4">
                          {group.totalCount > 0 ? (
                            <>
                              <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5 px-1">
                                <Building2 size={14} className="text-amber-500" /> توزيع المخزون حسب الشركات المصنعة:
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {group.items.map(item => (
                                  <div 
                                    key={item.id}
                                    className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 flex items-center justify-between transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-[#1e293b] border border-white/10 flex items-center justify-center text-xs font-black text-amber-400">
                                        {item.company}
                                      </div>
                                      <div>
                                        <span className="text-sm font-bold text-white block">{item.company}</span>
                                        <span className="text-xs text-gray-400 font-mono font-bold">الكمية الحالية: {item.count} قطع</span>
                                      </div>
                                    </div>

                                    
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="py-6 text-center space-y-3">
                              <p className="text-sm text-gray-400 font-bold">لا يوجد رصيد حالياً من أي شركة لهذا الصنف.</p>
                              <button
                                onClick={() => handleQuickAdd(group.bullionType, group.weight, group.karat)}
                                className="inline-flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-4 py-2 rounded-xl text-xs font-bold border border-amber-500/25 transition-all"
                              >
                                <Plus size={14} /> إضافة رصيد سريع لهذا الصنف
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {poundsGroup.length === 0 && bullionsGroup.length === 0 && (
              <div className="bg-[#1e293b] p-12 text-center rounded-3xl border border-white/5 shadow-xl">
                <Package className="text-gray-500 mx-auto mb-4" size={48} />
                <p className="text-gray-400 font-bold">لا توجد أصناف مسجلة في هذا المحل حالياً</p>
                <p className="text-sm text-gray-500 mt-1">اضغط على زر "إضافة صنف جديد" للبدء في تعبئة المخزون.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="bg-[#1e293b] rounded-3xl overflow-hidden border border-white/5 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-black/20 text-gray-400 text-sm">
                  <th className="p-4 font-bold">التاريخ والوقت</th>
                  <th className="p-4 font-bold">العملية</th>
                  <th className="p-4 font-bold">الصنف</th>
                  <th className="p-4 font-bold">حركة العدد</th>
                  <th className="p-4 font-bold">حركة الوزن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-gray-300">
                      <div className="flex flex-col">
                        <span className="text-white">{new Date(log.timestamp).toLocaleDateString('ar-EG')}</span>
                        <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString('ar-EG')}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{log.operation}</td>
                    <td className="p-4 text-white font-bold">{log.company} - {log.bullionType} ({log.weight}g)</td>
                    <td className={`p-4 font-bold ${log.isInOut === 'IN' ? 'text-green-400' : 'text-red-400'}`}>
                      {log.isInOut === 'IN' ? '+' : '-'}{log.countChange}
                    </td>
                    <td className={`p-4 font-bold ${log.isInOut === 'IN' ? 'text-green-400' : 'text-red-400'}`}>
                      {log.isInOut === 'IN' ? '+' : '-'}{log.weightChange}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">لا توجد حركات مسجلة</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="إضافة صنف سبائك وجنيهات جديد">
        <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="الشركة المصنعة" 
              value={addForm.company} 
              onChange={e => setAddForm({...addForm, company: e.target.value})}
            >
              <option value="BTC">BTC</option>
              <option value="SAM">SAM</option>
              <option value="MB">MB</option>
              <option value="PAMP">PAMP</option>
              <option value="OTHER">شركة أخرى</option>
            </Select>
            <Select 
              label="النوع" 
              value={addForm.bullionType} 
              onChange={e => handleTypeChange(e.target.value)}
            >
              <option value="سبيكة">سبيكة</option>
              <option value="جنيه">جنيه ذهب</option>
              <option value="نصف جنيه">نصف جنيه</option>
              <option value="ربع جنيه">ربع جنيه</option>
            </Select>
            <Input 
              label="الوزن (جرام)" 
              type="number"
              step="0.01" 
              required
              value={addForm.weight} 
              onChange={e => setAddForm({...addForm, weight: e.target.value})} 
            />
            <Select 
              label="العيار (محدد تلقائياً)" 
              value={addForm.karat.toString()} 
              onChange={e => setAddForm({...addForm, karat: Number(e.target.value) as Karat})}
              disabled
              className="opacity-75 cursor-not-allowed bg-black/10"
            >
              {addForm.bullionType === 'سبيكة' ? (
                <option value="24">عيار 24</option>
              ) : (
                <option value="21">عيار 21</option>
              )}
            </Select>

            <div className="col-span-2">
              <Input 
                label="العدد الأولي" 
                type="number"
                step="1" 
                min="0"
                placeholder="1"
                value={addForm.count} 
                onChange={e => setAddForm({...addForm, count: e.target.value})} 
                onFocus={e => e.target.select()}
              />
            </div>

            {addForm.bullionType === 'سبيكة' && (
              <div className="col-span-2 space-y-2.5 bg-black/20 p-4 rounded-2xl border border-white/5 animate-scale-in">
                <label className="text-xs font-bold text-gold-400 mr-1 block">الأوزان الشائعة للسبائك</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: '0.25', label: 'ربع جرام' },
                    { value: '0.5', label: 'نصف جرام' },
                    { value: '1', label: '١ جرام' },
                    { value: '2.5', label: '٢.٥ جرام' },
                    { value: '5', label: '٥ جرام' },
                    { value: '10', label: '١٠ جرام' },
                    { value: '20', label: '٢٠ جرام' },
                    { value: '50', label: '٥٠ جرام' },
                    { value: '100', label: '١٠٠ جرام' }
                  ].map(w => {
                    const isSelected = addForm.weight === w.value;
                    return (
                      <button
                        key={w.value}
                        type="button"
                        onClick={() => setAddForm(prev => ({ ...prev, weight: w.value }))}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-gold-500/20 text-gold-400 border-gold-500/50 shadow-md scale-[1.03]'
                            : 'bg-[#1e293b]/50 text-gray-300 border-white/5 hover:border-gold-500/25 hover:text-white'
                        }`}
                      >
                        {w.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <Button type="submit" className="w-full h-12 bg-gold-500 hover:bg-gold-600 text-black font-bold mt-6">
            حفظ الصنف
          </Button>
        </form>
      </Modal>

      <Modal isOpen={isUpdateOpen} onClose={() => setIsUpdateOpen(false)} title={updateForm.isInOut === 'IN' ? 'إضافة للرصيد' : 'خصم من الرصيد'}>
        <form onSubmit={handleUpdateSubmit} className="space-y-4 mt-4">
          <Input 
            label="العملية (البيان)" 
            required
            value={updateForm.operation} 
            onChange={e => setUpdateForm({...updateForm, operation: e.target.value})} 
          />
          <Input 
            label="العدد" 
            type="number"
            step="1"
            min="1"
            placeholder="1"
            value={updateForm.count} 
            onChange={e => setUpdateForm({...updateForm, count: e.target.value})} 
            onFocus={e => e.target.select()}
          />
          <Button type="submit" className={`w-full h-12 font-bold mt-6 ${updateForm.isInOut === 'IN' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
            تأكيد {updateForm.isInOut === 'IN' ? 'الإضافة' : 'الخصم'}
          </Button>
        </form>
      </Modal>

    </div>
  );
};

export default Bullions;
