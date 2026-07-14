import { BullionItem, BullionLog, Karat, GENERATE_ID, TIMESTAMP } from '../types';
import { SyncService, setStorageItem } from './storage';

const BULLIONS_KEY = 'gold_bullions';
const BULLION_LOGS_KEY = 'gold_bullion_logs';

const get = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const set = (key: string, value: any) => {
  setStorageItem(key, value);
  window.dispatchEvent(new Event('data-synced'));
};

export const BullionService = {
  getAll: (): BullionItem[] => {
    return get<BullionItem>(BULLIONS_KEY);
  },
  
  getLogs: (): BullionLog[] => {
    return get<BullionLog>(BULLION_LOGS_KEY).sort((a, b) => b.timestamp - a.timestamp);
  },

  addBullionType: (item: Omit<BullionItem, 'id' | 'totalWeight' | 'updatedAt'>) => {
    const items = BullionService.getAll();
    const currentShop = item.shop || localStorage.getItem('selected_shop') || 'المحل الأساسي';
    
    // Check if already exists
    const existing = items.find(i => 
      i.company === item.company && 
      i.bullionType === item.bullionType && 
      i.weight === item.weight &&
      (i.shop || 'المحل الأساسي') === currentShop
    );

    if (existing) {
      if (item.count !== 0) {
        const countChange = item.count;
        const weightChange = item.count * item.weight;
        existing.count += countChange;
        existing.totalWeight += weightChange;
        existing.updatedAt = TIMESTAMP();
        set(BULLIONS_KEY, items);

        // Add log
        const logs = BullionService.getLogs();
        const log: BullionLog = {
          id: GENERATE_ID(),
          bullionId: existing.id,
          company: existing.company,
          bullionType: existing.bullionType,
          weight: existing.weight,
          operation: countChange > 0 ? 'إضافة رصيد' : 'سحب رصيد',
          countChange,
          weightChange,
          isInOut: item.count > 0 ? 'IN' : 'OUT',
          timestamp: TIMESTAMP(),
          shop: existing.shop,
          updatedAt: TIMESTAMP()
        };
        logs.push(log);
        set(BULLION_LOGS_KEY, logs);
      }
      return existing;
    }

    const initialCount = item.count || 0;
    const newItem: BullionItem = {
      ...item,
      id: GENERATE_ID(),
      count: initialCount,
      totalWeight: initialCount * item.weight,
      shop: currentShop,
      updatedAt: TIMESTAMP()
    };
    
    items.push(newItem);
    set(BULLIONS_KEY, items);

    if (initialCount !== 0) {
      const logs = BullionService.getLogs();
      const log: BullionLog = {
        id: GENERATE_ID(),
        bullionId: newItem.id,
        company: newItem.company,
        bullionType: newItem.bullionType,
        weight: newItem.weight,
        operation: initialCount > 0 ? 'رصيد أول المدة' : 'سحب رصيد',
        countChange: initialCount,
        weightChange: initialCount * newItem.weight,
        isInOut: item.count > 0 ? 'IN' : 'OUT',
        timestamp: TIMESTAMP(),
        shop: newItem.shop,
        updatedAt: TIMESTAMP()
      };
      logs.push(log);
      set(BULLION_LOGS_KEY, logs);
    }

    return newItem;
  },

  updateInventory: (id: string, countChange: number, weightChange: number, operation: string, isInOut: 'IN' | 'OUT') => {
    const items = BullionService.getAll();
    const itemIndex = items.findIndex(i => i.id === id);
    if (itemIndex === -1) return false;

    const item = items[itemIndex];
    item.count += countChange;
    item.totalWeight += weightChange;
    item.updatedAt = TIMESTAMP();
    
    set(BULLIONS_KEY, items);

    // Create log
    const logs = BullionService.getLogs();
    const log: BullionLog = {
      id: GENERATE_ID(),
      bullionId: item.id,
      company: item.company,
      bullionType: item.bullionType,
      weight: item.weight,
      operation,
      countChange,
      weightChange,
      isInOut,
      timestamp: TIMESTAMP(),
      shop: item.shop,
      updatedAt: TIMESTAMP()
    };
    
    logs.push(log);
    set(BULLION_LOGS_KEY, logs);

    return true;
  },

  deleteBullionType: (id: string) => {
    const items = BullionService.getAll();
    const filtered = items.filter(i => i.id !== id);
    set(BULLIONS_KEY, filtered);
  }
};
