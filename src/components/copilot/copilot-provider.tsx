'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import { toast } from 'sonner';

import type { CopilotContext, OrderForm, ActivityLog } from '@/types';

type CopilotProviderProps = {
  children: ReactNode;
};

type CopilotContextType = {
  context: CopilotContext;
  updateContext: (updates: Partial<CopilotContext>) => void;
  activityLog: ActivityLog[];
  addActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  confirmAction: (actionId: string) => void;
};

const CopilotContextProvider = createContext<CopilotContextType | null>(null);

export function CopilotProvider({ children }: CopilotProviderProps) {
  const [context, setContext] = useState<CopilotContext>({
    currentSymbol: undefined,
    orderForm: {},
    riskBudget: 10000,
    language: 'en',
    userProfile: {},
    currentPage: '/',
  });

  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  const updateContext = useCallback((updates: Partial<CopilotContext>) => {
    setContext(prev => ({ ...prev, ...updates }));
  }, []);

  const addActivity = useCallback((activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newActivity: ActivityLog = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date(),
      confirmed: false,
    };
    setActivityLog(prev => [newActivity, ...prev.slice(0, 9)]); // Keep last 10
  }, []);

  const confirmAction = useCallback((actionId: string) => {
    setActivityLog(prev => 
      prev.map(activity => 
        activity.id === actionId 
          ? { ...activity, confirmed: true }
          : activity
      )
    );
  }, []);

  // Make context readable by CopilotKit
  useCopilotReadable({
    description: 'Current trading context and user state',
    value: context,
  });

  useCopilotReadable({
    description: 'Recent AI actions and activity log',
    value: activityLog.slice(0, 5),
  });

  // Define CopilotKit actions
  useCopilotAction({
    name: 'setSymbol',
    description: 'Set the current trading symbol that the user is viewing or interested in',
    parameters: [
      {
        name: 'symbol',
        type: 'string',
        description: 'The stock symbol (e.g., RELIANCE, TCS, INFY)',
        required: true,
      },
    ],
    handler: async ({ symbol }) => {
      return new Promise((resolve) => {
        // Add to activity log first for confirmation
        addActivity({
          action: 'setSymbol',
          description: `Set current symbol to ${symbol}`,
          userId: context.userProfile.id || 'anonymous',
          confirmed: false,
        });

        // Show confirmation dialog
        toast.info(`Set symbol to ${symbol}?`, {
          action: {
            label: 'Confirm',
            onClick: () => {
              updateContext({ currentSymbol: symbol });
              confirmAction(Date.now().toString());
              toast.success(`Symbol set to ${symbol}`);
              resolve({ success: true, symbol });
            },
          },
          cancel: {
            label: 'Cancel',
            onClick: () => {
              resolve({ success: false, message: 'Action cancelled by user' });
            },
          },
        });
      });
    },
  });

  useCopilotAction({
    name: 'setOrderField',
    description: 'Set a specific field in the order form (quantity, price, order type, etc.)',
    parameters: [
      {
        name: 'field',
        type: 'string',
        description: 'The field name (quantity, price, orderType, transactionType, etc.)',
        required: true,
      },
      {
        name: 'value',
        type: 'string',
        description: 'The value to set for the field',
        required: true,
      },
    ],
    handler: async ({ field, value }) => {
      return new Promise((resolve) => {
        addActivity({
          action: 'setOrderField',
          description: `Set ${field} to ${value}`,
          userId: context.userProfile.id || 'anonymous',
          confirmed: false,
        });

        toast.info(`Set ${field} to ${value}?`, {
          action: {
            label: 'Confirm',
            onClick: () => {
              updateContext({
                orderForm: {
                  ...context.orderForm,
                  [field]: value,
                },
              });
              confirmAction(Date.now().toString());
              toast.success(`${field} set to ${value}`);
              resolve({ success: true, field, value });
            },
          },
          cancel: {
            label: 'Cancel',
            onClick: () => {
              resolve({ success: false, message: 'Action cancelled by user' });
            },
          },
        });
      });
    },
  });

  useCopilotAction({
    name: 'openOrderTicket',
    description: 'Open the order ticket modal or navigate to trading page',
    parameters: [],
    handler: async () => {
      return new Promise((resolve) => {
        addActivity({
          action: 'openOrderTicket',
          description: 'Open order ticket for trading',
          userId: context.userProfile.id || 'anonymous',
          confirmed: false,
        });

        toast.info('Open trading interface?', {
          action: {
            label: 'Confirm',
            onClick: () => {
              // In a real app, this would trigger navigation or modal
              window.location.href = '/trade';
              confirmAction(Date.now().toString());
              resolve({ success: true, message: 'Order ticket opened' });
            },
          },
          cancel: {
            label: 'Cancel',
            onClick: () => {
              resolve({ success: false, message: 'Action cancelled by user' });
            },
          },
        });
      });
    },
  });

  useCopilotAction({
    name: 'explainField',
    description: 'Explain a trading concept, field, or term to help user understand',
    parameters: [
      {
        name: 'field',
        type: 'string',
        description: 'The field, concept, or term to explain',
        required: true,
      },
    ],
    handler: async ({ field }) => {
      // This action doesn't need confirmation as it's educational
      addActivity({
        action: 'explainField',
        description: `Explained ${field}`,
        userId: context.userProfile.id || 'anonymous',
        confirmed: true,
      });

      const explanations: Record<string, string> = {
        'stop-loss': 'A stop-loss order automatically sells your stock when it reaches a predetermined price, helping limit your losses.',
        'limit-order': 'A limit order buys/sells stock only at a specific price or better, giving you price control but no guarantee of execution.',
        'market-order': 'A market order executes immediately at the best available price, guaranteeing execution but not price.',
        'quantity': 'The number of shares you want to buy or sell in your order.',
        'mis': 'MIS (Margin Intraday Square-off) allows intraday trading with leverage, but positions are automatically closed by end of day.',
        'cnc': 'CNC (Cash and Carry) is for delivery-based trades where you take actual possession of shares.',
        'p&l': 'Profit & Loss shows how much money you\'ve made or lost on your investments.',
        'portfolio': 'Your portfolio is the collection of all your investments and their current values.',
      };

      const explanation = explanations[field.toLowerCase()] || 
        `${field} is an important trading concept. Would you like me to provide more specific guidance?`;

      toast.info('Trading Concept Explained', {
        description: explanation,
        duration: 8000,
      });

      return {
        success: true,
        field,
        explanation,
      };
    },
  });

  useCopilotAction({
    name: 'highlightRisk',
    description: 'Highlight and explain a potential risk in the user\'s current trading decision',
    parameters: [
      {
        name: 'issue',
        type: 'string',
        description: 'The risk or issue to highlight',
        required: true,
      },
    ],
    handler: async ({ issue }) => {
      addActivity({
        action: 'highlightRisk',
        description: `Highlighted risk: ${issue}`,
        userId: context.userProfile.id || 'anonymous',
        confirmed: true,
      });

      toast.warning('Risk Warning', {
        description: issue,
        duration: 10000,
        action: {
          label: 'Learn More',
          onClick: () => {
            // Could open educational content
            window.location.href = '/learn?topic=risk-management';
          },
        },
      });

      return {
        success: true,
        issue,
        message: `Risk highlighted: ${issue}`,
      };
    },
  });

  useCopilotAction({
    name: 'startLesson',
    description: 'Start or recommend a specific educational lesson based on user needs',
    parameters: [
      {
        name: 'lessonId',
        type: 'string',
        description: 'The ID or topic of the lesson to start',
        required: true,
      },
    ],
    handler: async ({ lessonId }) => {
      return new Promise((resolve) => {
        addActivity({
          action: 'startLesson',
          description: `Start lesson: ${lessonId}`,
          userId: context.userProfile.id || 'anonymous',
          confirmed: false,
        });

        toast.info(`Start lesson: ${lessonId}?`, {
          action: {
            label: 'Start Learning',
            onClick: () => {
              window.location.href = `/learn/${lessonId}`;
              confirmAction(Date.now().toString());
              resolve({ success: true, lessonId });
            },
          },
          cancel: {
            label: 'Not Now',
            onClick: () => {
              resolve({ success: false, message: 'Lesson start cancelled by user' });
            },
          },
        });
      });
    },
  });

  const value: CopilotContextType = {
    context,
    updateContext,
    activityLog,
    addActivity,
    confirmAction,
  };

  return (
    <CopilotContextProvider.Provider value={value}>
      {children}
    </CopilotContextProvider.Provider>
  );
}

export function useCopilotContext() {
  const context = useContext(CopilotContextProvider);
  if (!context) {
    throw new Error('useCopilotContext must be used within a CopilotProvider');
  }
  return context;
}
