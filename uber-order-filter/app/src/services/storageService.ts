import AsyncStorage from '@react-native-async-storage/async-storage';
import { FilterCriteria, DriverDecision, AppSettings, UberOrder } from '../types';

const STORAGE_KEYS = {
  FILTERS: 'filters_list',
  ACTIVE_FILTER: 'active_filter',
  DECISIONS: 'driver_decisions',
  ORDERS: 'order_history',
  SETTINGS: 'app_settings',
};

// Filter operations
export const filterStorage = {
  async save(filter: FilterCriteria): Promise<void> {
    const filters = await filterStorage.getAll();
    const index = filters.findIndex(f => f.id === filter.id);

    if (index >= 0) {
      filters[index] = filter;
    } else {
      filters.push(filter);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
  },

  async getAll(): Promise<FilterCriteria[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FILTERS);
    return data ? JSON.parse(data) : [];
  },

  async getById(id: string): Promise<FilterCriteria | null> {
    const filters = await filterStorage.getAll();
    return filters.find(f => f.id === id) || null;
  },

  async delete(id: string): Promise<void> {
    const filters = await filterStorage.getAll();
    const filtered = filters.filter(f => f.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filtered));
  },

  async setActive(id: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_FILTER, id);
  },

  async getActive(): Promise<FilterCriteria | null> {
    const id = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_FILTER);
    if (!id) return null;
    return filterStorage.getById(id);
  },
};

// Decision history operations
export const decisionStorage = {
  async save(decision: DriverDecision): Promise<void> {
    const decisions = await decisionStorage.getAll();
    decisions.push(decision);
    await AsyncStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(decisions));
  },

  async getAll(): Promise<DriverDecision[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DECISIONS);
    return data ? JSON.parse(data) : [];
  },

  async getByDate(date: string): Promise<DriverDecision[]> {
    const decisions = await decisionStorage.getAll();
    return decisions.filter(d => d.timestamp.toString().startsWith(date));
  },

  async clear(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify([]));
  },
};

// Order history operations
export const orderStorage = {
  async save(order: UberOrder): Promise<void> {
    const orders = await orderStorage.getAll();
    orders.push(order);
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },

  async getAll(): Promise<UberOrder[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  },

  async getByDate(date: string): Promise<UberOrder[]> {
    const orders = await orderStorage.getAll();
    return orders.filter(o => o.timestamp.toString().startsWith(date));
  },

  async clear(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  },
};

// Settings operations
export const settingsStorage = {
  defaultSettings: {
    enableAudio: true,
    audioVolume: 80,
    audioType: 'chime',
    enableVibration: true,
    theme: 'auto',
    dataStorageMode: 'local',
    privacyMode: false,
  } as AppSettings,

  async get(): Promise<AppSettings> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return settingsStorage.defaultSettings;
    return { ...settingsStorage.defaultSettings, ...JSON.parse(data) };
  },

  async update(partial: Partial<AppSettings>): Promise<void> {
    const current = await settingsStorage.get();
    const updated = { ...current, ...partial };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  },
};

// Utility functions
export const exportData = async (): Promise<string> => {
  const filters = await filterStorage.getAll();
  const decisions = await decisionStorage.getAll();
  const orders = await orderStorage.getAll();
  const settings = await settingsStorage.get();

  return JSON.stringify(
    { filters, decisions, orders, settings },
    null,
    2
  );
};

export const clearAllData = async (): Promise<void> => {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
};
