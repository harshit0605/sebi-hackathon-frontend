import type { 
  Stock, 
  LearningModule, 
  Lesson, 
  Portfolio, 
  Position, 
  Order, 
  Trade,
  Achievement
} from '@/types';

// Mock stock data with realistic Indian stocks
export const mockStocks: Stock[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    lastPrice: 2456.75,
    change: 23.45,
    changePercent: 0.96,
    volume: 4567890,
    marketCap: 16589000000000,
    high: 2478.90,
    low: 2445.20,
    open: 2450.00,
    previousClose: 2433.30,
    sector: 'Energy'
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd',
    lastPrice: 3234.50,
    change: -45.30,
    changePercent: -1.38,
    volume: 2345678,
    marketCap: 11789000000000,
    high: 3289.75,
    low: 3220.40,
    open: 3275.80,
    previousClose: 3279.80,
    sector: 'Information Technology'
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd',
    lastPrice: 1456.90,
    change: 12.35,
    changePercent: 0.85,
    volume: 3456789,
    marketCap: 6234000000000,
    high: 1467.50,
    low: 1445.20,
    open: 1448.30,
    previousClose: 1444.55,
    sector: 'Information Technology'
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    lastPrice: 1623.75,
    change: 8.90,
    changePercent: 0.55,
    volume: 5678901,
    marketCap: 12456000000000,
    high: 1635.40,
    low: 1618.50,
    open: 1620.25,
    previousClose: 1614.85,
    sector: 'Banking'
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd',
    lastPrice: 987.60,
    change: -5.70,
    changePercent: -0.57,
    volume: 4567890,
    marketCap: 6789000000000,
    high: 996.80,
    low: 982.30,
    open: 992.50,
    previousClose: 993.30,
    sector: 'Banking'
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd',
    lastPrice: 876.45,
    change: 15.60,
    changePercent: 1.81,
    volume: 3456789,
    marketCap: 4567000000000,
    high: 882.90,
    low: 865.20,
    open: 868.75,
    previousClose: 860.85,
    sector: 'Telecommunications'
  }
];

// Learning modules with comprehensive trading education
export const mockLearningModules: LearningModule[] = [
  {
    id: 'basics',
    title: 'Trading Basics',
    description: 'Learn the fundamentals of stock market and trading',
    icon: '📚',
    lessons: [
      {
        id: 'what-is-trading',
        title: 'What is Trading?',
        description: 'Understanding the basics of buying and selling stocks',
        duration: 10,
        difficulty: 'beginner',
        completed: true,
        content: 'Trading involves buying and selling financial instruments...',
        quiz: {
          questions: [
            {
              question: 'What is the primary goal of trading?',
              options: ['To lose money', 'To make profit', 'To have fun', 'To waste time'],
              correctAnswer: 1
            }
          ]
        }
      },
      {
        id: 'stock-market-basics',
        title: 'Stock Market Fundamentals',
        description: 'How stock markets work and key participants',
        duration: 15,
        difficulty: 'beginner',
        completed: false,
        content: 'The stock market is a platform where investors...',
      }
    ],
    totalLessons: 8,
    completedLessons: 1,
    estimatedTime: 120
  },
  {
    id: 'technical-analysis',
    title: 'Technical Analysis',
    description: 'Learn to read charts and identify trading patterns',
    icon: '📈',
    lessons: [
      {
        id: 'reading-charts',
        title: 'How to Read Stock Charts',
        description: 'Understanding candlestick patterns and trends',
        duration: 20,
        difficulty: 'intermediate',
        completed: false,
        content: 'Charts are visual representations of price movements...',
      }
    ],
    totalLessons: 12,
    completedLessons: 0,
    estimatedTime: 240
  },
  {
    id: 'risk-management',
    title: 'Risk Management',
    description: 'Protect your capital with proper risk management',
    icon: '🛡️',
    lessons: [
      {
        id: 'position-sizing',
        title: 'Position Sizing Strategies',
        description: 'How much to invest in each trade',
        duration: 18,
        difficulty: 'intermediate',
        completed: false,
        content: 'Position sizing is crucial for long-term success...',
      }
    ],
    totalLessons: 10,
    completedLessons: 0,
    estimatedTime: 180
  }
];

// Mock achievements system
export const mockAchievements: Achievement[] = [
  {
    id: 'first-trade',
    title: 'First Trade',
    description: 'Complete your first paper trade',
    icon: '🎯',
    category: 'trading',
    points: 100,
    unlocked: true,
    unlockedAt: new Date('2024-01-15')
  },
  {
    id: 'learning-enthusiast',
    title: 'Learning Enthusiast',
    description: 'Complete your first lesson',
    icon: '📚',
    category: 'learning',
    points: 50,
    unlocked: true,
    unlockedAt: new Date('2024-01-14')
  },
  {
    id: 'portfolio-diversifier',
    title: 'Portfolio Diversifier',
    description: 'Own stocks from 5 different sectors',
    icon: '🌟',
    category: 'portfolio',
    points: 200,
    unlocked: false
  },
  {
    id: 'risk-manager',
    title: 'Risk Manager',
    description: 'Use stop-loss orders in 10 trades',
    icon: '🛡️',
    category: 'risk',
    points: 150,
    unlocked: false
  }
];

// Mock portfolio data
export const mockPortfolio: Portfolio = {
  totalValue: 150000,
  cashBalance: 25000,
  investedValue: 125000,
  dayChange: 2340.50,
  dayChangePercent: 1.58,
  overallReturn: 15000,
  overallReturnPercent: 11.11,
  unrealizedPnl: 12500,
  realizedPnl: 2500
};

// Mock positions
export const mockPositions: Position[] = [
  {
    id: 'pos1',
    symbol: 'RELIANCE',
    quantity: 50,
    avgPrice: 2400.00,
    currentPrice: 2456.75,
    marketValue: 122837.50,
    unrealizedPnl: 2837.50,
    unrealizedPnlPercent: 2.36,
    side: 'long',
    entryDate: new Date('2024-01-10')
  },
  {
    id: 'pos2',
    symbol: 'TCS',
    quantity: 10,
    avgPrice: 3300.00,
    currentPrice: 3234.50,
    marketValue: 32345.00,
    unrealizedPnl: -655.00,
    unrealizedPnlPercent: -1.98,
    side: 'long',
    entryDate: new Date('2024-01-12')
  }
];

// Mock orders
export const mockOrders: Order[] = [
  {
    id: 'order1',
    symbol: 'INFY',
    side: 'buy',
    quantity: 25,
    orderType: 'limit',
    price: 1450.00,
    status: 'pending',
    createdAt: new Date('2024-01-16T10:30:00'),
    expiresAt: new Date('2024-01-17T15:30:00'),
    estimatedValue: 36250.00
  },
  {
    id: 'order2',
    symbol: 'HDFCBANK',
    side: 'sell',
    quantity: 15,
    orderType: 'market',
    status: 'executed',
    createdAt: new Date('2024-01-15T14:20:00'),
    executedAt: new Date('2024-01-15T14:20:15'),
    executedPrice: 1620.50,
    estimatedValue: 24307.50
  }
];

// Mock trades history
export const mockTrades: Trade[] = [
  {
    id: 'trade1',
    symbol: 'RELIANCE',
    side: 'buy',
    quantity: 50,
    price: 2400.00,
    value: 120000.00,
    executedAt: new Date('2024-01-10T11:45:00'),
    orderId: 'order_rel_001'
  },
  {
    id: 'trade2',
    symbol: 'TCS',
    side: 'buy',
    quantity: 10,
    price: 3300.00,
    value: 33000.00,
    executedAt: new Date('2024-01-12T13:20:00'),
    orderId: 'order_tcs_001'
  },
  {
    id: 'trade3',
    symbol: 'HDFCBANK',
    side: 'sell',
    quantity: 15,
    price: 1620.50,
    value: 24307.50,
    executedAt: new Date('2024-01-15T14:20:15'),
    orderId: 'order2'
  }
];

// Helper functions to generate realistic market data
export class DemoDataGenerator {
  static generateRealtimePrice(stock: Stock): Stock {
    const volatility = 0.02; // 2% volatility
    const change = (Math.random() - 0.5) * 2 * volatility * stock.lastPrice;
    const newPrice = Math.max(stock.lastPrice + change, 1);
    const priceChange = newPrice - stock.previousClose;
    
    return {
      ...stock,
      lastPrice: Math.round(newPrice * 100) / 100,
      change: Math.round(priceChange * 100) / 100,
      changePercent: Math.round((priceChange / stock.previousClose) * 10000) / 100,
      volume: stock.volume + Math.floor(Math.random() * 10000),
    };
  }

  static generateMarketData() {
    return mockStocks.map(stock => this.generateRealtimePrice(stock));
  }

  static generateRandomTrade(): Trade {
    const stocks = mockStocks;
    const stock = stocks[Math.floor(Math.random() * stocks.length)];
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const quantity = Math.floor(Math.random() * 100) + 1;
    const price = stock.lastPrice * (0.98 + Math.random() * 0.04); // ±2% from current price
    
    return {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol: stock.symbol,
      side,
      quantity,
      price: Math.round(price * 100) / 100,
      value: Math.round(quantity * price * 100) / 100,
      executedAt: new Date(),
      orderId: `order_${Date.now()}`
    };
  }

  // Generate educational content for different trading levels
  static getEducationalContent(tradingLevel: string) {
    const content = {
      beginner: {
        tips: [
          "Start with small positions to learn the market",
          "Always use stop-loss orders to limit losses",
          "Diversify your portfolio across different sectors",
          "Don't invest money you can't afford to lose"
        ],
        warnings: [
          "Avoid trading on emotions",
          "Don't chase trending stocks without research",
          "Be wary of tips from social media",
          "Market can be volatile - stay patient"
        ]
      },
      intermediate: {
        tips: [
          "Use technical analysis to time your entries",
          "Consider market trends and sector rotation",
          "Monitor volume along with price movements",
          "Keep a trading journal to track performance"
        ],
        warnings: [
          "Don't overtrade or chase every opportunity",
          "Respect your risk management rules",
          "Be careful with leverage and margin",
          "Markets can remain irrational longer than expected"
        ]
      },
      advanced: {
        tips: [
          "Use options for hedging and income generation",
          "Consider pairs trading and market neutral strategies",
          "Monitor institutional flows and sentiment",
          "Adjust position sizes based on market volatility"
        ],
        warnings: [
          "Complex strategies require thorough understanding",
          "Don't risk more than your edge allows",
          "Be prepared for black swan events",
          "Continuous learning is essential in changing markets"
        ]
      }
    };

    return content[tradingLevel as keyof typeof content] || content.beginner;
  }
}

// Export all mock data
export {
  mockStocks,
  mockLearningModules,
  mockAchievements,
  mockPortfolio,
  mockPositions,
  mockOrders,
  mockTrades
};
