'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotPopup } from '@copilotkit/react-ui';
import { useState } from 'react';

import { Toaster } from '@/components/ui/sonner';
import { CopilotProvider } from '@/components/copilot/copilot-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <CopilotKit publicApiKey={process.env.NEXT_PUBLIC_COPILKIT_PUBLIC_API_KEY} runtimeUrl="/api/copilotkit">
        <CopilotProvider>
          <CopilotPopup
            instructions="You are a trading mentor AI assistant. Help users learn about trading, make informed decisions, and navigate the TradeMentor platform. Always prioritize user education and risk management. You have access to trading actions like setting symbols, filling order forms, opening order tickets, explaining concepts, highlighting risks, and starting lessons. Always confirm with users before taking mutating actions."
            defaultOpen={false}
            labels={{
              title: "TradeMentor AI",
              initial: "Hello! I'm your trading mentor. How can I help you learn about trading today? I can help you understand market concepts, analyze stocks, and guide you through paper trades.",
            }}
          // className="w-96 max-w-[90vw] lg:max-w-96"
          >
            <div className="flex h-screen">
              <div className="flex-1 flex flex-col min-w-0">
                {children}
              </div>
            </div>
            <Toaster />
          </CopilotPopup>
        </CopilotProvider>
      </CopilotKit>
    </QueryClientProvider>
  );
}
