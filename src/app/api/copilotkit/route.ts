import {
  CopilotRuntime,
  LangGraphAgent,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import { NextRequest } from 'next/server';
import { ExperimentalEmptyAdapter } from '@copilotkit/runtime';

import { auth } from '@/lib/auth';

// const serviceAdapter = new OpenAIAdapter();
const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  agents: {
    'chunking_orchestrator': new LangGraphAgent({
      deploymentUrl: 'http://localhost:8000',
      graphId: 'chunking_orchestrator',
      langsmithApiKey: process.env.LANGCHAIN_API_KEY,
    }),
    'enhanced_lesson_creator': new LangGraphAgent({
      deploymentUrl: 'http://localhost:8000',
      graphId: 'enhanced_lesson_creator',
      langsmithApiKey: process.env.LANGCHAIN_API_KEY,
    }),
  },
  actions: [
    {
      name: 'setSymbol',
      description: 'Set the current trading symbol',
      parameters: [
        {
          name: 'symbol',
          type: 'string',
          description: 'The trading symbol to set (e.g., RELIANCE, TCS)',
          required: true,
        },
      ],
      handler: async ({ symbol }) => {
        // This will be handled on the client side
        return {
          success: true,
          symbol,
          message: `Symbol set to ${symbol}`,
        };
      },
    },
    {
      name: 'setOrderField',
      description: 'Set a field in the order form',
      parameters: [
        {
          name: 'field',
          type: 'string',
          description: 'The field to set (quantity, price, orderType, etc.)',
          required: true,
        },
        {
          name: 'value',
          type: 'string',
          description: 'The value to set',
          required: true,
        },
      ],
      handler: async ({ field, value }) => {
        return {
          success: true,
          field,
          value,
          message: `Order ${field} set to ${value}`,
        };
      },
    },
    {
      name: 'openOrderTicket',
      description: 'Open the order ticket modal',
      parameters: [],
      handler: async () => {
        return {
          success: true,
          message: 'Order ticket opened',
        };
      },
    },
    {
      name: 'explainField',
      description: 'Explain a trading field or concept',
      parameters: [
        {
          name: 'field',
          type: 'string',
          description: 'The field or concept to explain',
          required: true,
        },
      ],
      handler: async ({ field }) => {
        // This could fetch explanations from a knowledge base
        const explanations: Record<string, string> = {
          'stop-loss': 'Stop-loss is an order to sell a security when it reaches a particular price point.',
          'limit-order': 'A limit order is an order to buy or sell a stock at a specific price or better.',
          'market-order': 'A market order is an order to buy or sell immediately at the best available price.',
          'quantity': 'Quantity refers to the number of shares you want to buy or sell.',
          'mis': 'MIS (Margin Intraday Square-off) allows intraday trading with leverage but positions are auto-squared off.',
          'cnc': 'CNC (Cash and Carry) is for delivery-based trades where you take actual delivery of shares.',
        };

        return {
          success: true,
          field,
          explanation: explanations[field.toLowerCase()] || `${field} is a trading concept that requires further explanation.`,
        };
      },
    },
    {
      name: 'highlightRisk',
      description: 'Highlight a trading risk',
      parameters: [
        {
          name: 'issue',
          type: 'string',
          description: 'The risk issue to highlight',
          required: true,
        },
      ],
      handler: async ({ issue }) => {
        return {
          success: true,
          issue,
          message: `Risk highlighted: ${issue}`,
        };
      },
    },
    {
      name: 'startLesson',
      description: 'Start a specific lesson',
      parameters: [
        {
          name: 'lessonId',
          type: 'string',
          description: 'The ID of the lesson to start',
          required: true,
        },
      ],
      handler: async ({ lessonId }) => {
        return {
          success: true,
          lessonId,
          message: `Starting lesson: ${lessonId}`,
        };
      },
    },
  ],
});

export async function POST(req: NextRequest) {
  // Check authentication
  try {
    // const session = await auth.api.getSession({
    //   headers: req.headers,
    // });

    // if (!session) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    const {handleRequest} = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: '/api/copilotkit',
    });

    return handleRequest(req);
  } catch (error) {
    console.error('Copilot API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
