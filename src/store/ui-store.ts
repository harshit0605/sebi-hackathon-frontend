import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { UIState, Notification, OrderForm } from '@/types';

type UIStore = UIState & {
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setCurrentTab: (tab: UIState['currentTab']) => void;
  setLanguage: (language: 'en' | 'hi') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
};

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        sidebarOpen: false,
        currentTab: 'home',
        language: 'en',
        theme: 'light',
        notifications: [],

        // Actions
        setSidebarOpen: (open) =>
          set({ sidebarOpen: open }, false, 'setSidebarOpen'),

        setCurrentTab: (tab) =>
          set({ currentTab: tab }, false, 'setCurrentTab'),

        setLanguage: (language) =>
          set({ language }, false, 'setLanguage'),

        setTheme: (theme) =>
          set({ theme }, false, 'setTheme'),

        addNotification: (notification) =>
          set(
            (state) => ({
              notifications: [
                {
                  ...notification,
                  id: Date.now().toString(),
                  timestamp: new Date(),
                  read: false,
                },
                ...state.notifications.slice(0, 9), // Keep last 10
              ],
            }),
            false,
            'addNotification'
          ),

        removeNotification: (id) =>
          set(
            (state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }),
            false,
            'removeNotification'
          ),

        markNotificationAsRead: (id) =>
          set(
            (state) => ({
              notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
              ),
            }),
            false,
            'markNotificationAsRead'
          ),

        clearAllNotifications: () =>
          set({ notifications: [] }, false, 'clearAllNotifications'),
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          language: state.language,
          theme: state.theme,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
);

// Trading state store
type TradingStore = {
  // State
  selectedSymbol: string | null;
  orderForm: OrderForm;
  watchlist: string[];
  
  // Actions
  setSelectedSymbol: (symbol: string | null) => void;
  updateOrderForm: (updates: Partial<OrderForm>) => void;
  resetOrderForm: () => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
};

const initialOrderForm: OrderForm = {
  symbol: '',
  orderType: 'MARKET',
  productType: 'CNC',
  transactionType: 'BUY',
  quantity: 0,
  validity: 'DAY',
};

export const useTradingStore = create<TradingStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        selectedSymbol: null,
        orderForm: initialOrderForm,
        watchlist: ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK'],

        // Actions
        setSelectedSymbol: (symbol) =>
          set({ selectedSymbol: symbol }, false, 'setSelectedSymbol'),

        updateOrderForm: (updates) =>
          set(
            (state) => ({
              orderForm: { ...state.orderForm, ...updates },
            }),
            false,
            'updateOrderForm'
          ),

        resetOrderForm: () =>
          set({ orderForm: initialOrderForm }, false, 'resetOrderForm'),

        addToWatchlist: (symbol) =>
          set(
            (state) => ({
              watchlist: state.watchlist.includes(symbol)
                ? state.watchlist
                : [...state.watchlist, symbol],
            }),
            false,
            'addToWatchlist'
          ),

        removeFromWatchlist: (symbol) =>
          set(
            (state) => ({
              watchlist: state.watchlist.filter((s) => s !== symbol),
            }),
            false,
            'removeFromWatchlist'
          ),
      }),
      {
        name: 'trading-store',
        partialize: (state) => ({
          watchlist: state.watchlist,
        }),
      }
    ),
    {
      name: 'trading-store',
    }
  )
);
