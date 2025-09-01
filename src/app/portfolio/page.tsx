'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  Activity, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download
} from 'lucide-react';

// Mock data for demonstration
const portfolioSummary = {
  totalValue: 125000,
  dayPnl: 2500,
  dayPnlPercent: 2.04,
  totalPnl: 25000,
  totalPnlPercent: 25.0,
  cash: 75000,
  invested: 50000,
  margin: {
    available: 85000,
    used: 15000,
    total: 100000,
  },
};

const positions = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    quantity: 50,
    averagePrice: 2200.00,
    ltp: 2456.75,
    investedValue: 110000,
    currentValue: 122837.50,
    pnl: 12837.50,
    pnlPercent: 11.67,
    productType: 'CNC' as const,
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    quantity: 20,
    averagePrice: 3300.00,
    ltp: 3210.40,
    investedValue: 66000,
    currentValue: 64208.00,
    pnl: -1792.00,
    pnlPercent: -2.72,
    productType: 'CNC' as const,
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    quantity: 30,
    averagePrice: 1500.00,
    ltp: 1567.85,
    investedValue: 45000,
    currentValue: 47035.50,
    pnl: 2035.50,
    pnlPercent: 4.52,
    productType: 'MIS' as const,
  },
];

const orders = [
  {
    id: '1',
    symbol: 'HDFCBANK',
    orderType: 'LIMIT' as const,
    transactionType: 'BUY' as const,
    quantity: 25,
    price: 1600.00,
    status: 'OPEN' as const,
    timestamp: new Date(Date.now() - 3600000),
    productType: 'CNC' as const,
  },
  {
    id: '2',
    symbol: 'ITC',
    orderType: 'MARKET' as const,
    transactionType: 'SELL' as const,
    quantity: 100,
    price: 450.30,
    status: 'COMPLETE' as const,
    timestamp: new Date(Date.now() - 7200000),
    productType: 'CNC' as const,
    filledQuantity: 100,
    averagePrice: 450.30,
  },
  {
    id: '3',
    symbol: 'BAJFINANCE',
    orderType: 'SL' as const,
    transactionType: 'SELL' as const,
    quantity: 10,
    price: 6500.00,
    stopPrice: 6450.00,
    status: 'CANCELLED' as const,
    timestamp: new Date(Date.now() - 10800000),
    productType: 'CNC' as const,
  },
];

const trades = [
  {
    id: '1',
    symbol: 'RELIANCE',
    transactionType: 'BUY' as const,
    quantity: 25,
    price: 2200.00,
    timestamp: new Date(Date.now() - 86400000),
    value: 55000,
  },
  {
    id: '2',
    symbol: 'TCS',
    transactionType: 'BUY' as const,
    quantity: 20,
    price: 3300.00,
    timestamp: new Date(Date.now() - 172800000),
    value: 66000,
  },
  {
    id: '3',
    symbol: 'ITC',
    transactionType: 'SELL' as const,
    quantity: 100,
    price: 450.30,
    timestamp: new Date(Date.now() - 7200000),
    value: 45030,
  },
];

function getStatusIcon(status: string) {
  switch (status) {
    case 'COMPLETE':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'CANCELLED':
    case 'REJECTED':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'OPEN':
    case 'PENDING':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'COMPLETE':
      return 'text-green-600';
    case 'CANCELLED':
    case 'REJECTED':
      return 'text-red-600';
    case 'OPEN':
    case 'PENDING':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
}

export default function PortfolioPage() {
  const [selectedTab, setSelectedTab] = useState('positions');

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{portfolioSummary.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Invested: ₹{portfolioSummary.invested.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Day P&L</CardTitle>
              {portfolioSummary.dayPnl >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-danger-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                portfolioSummary.dayPnl >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {portfolioSummary.dayPnl >= 0 ? '+' : ''}₹{portfolioSummary.dayPnl.toLocaleString()}
              </div>
              <p className={`text-xs ${
                portfolioSummary.dayPnlPercent >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {portfolioSummary.dayPnlPercent >= 0 ? '+' : ''}{portfolioSummary.dayPnlPercent}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                portfolioSummary.totalPnl >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {portfolioSummary.totalPnl >= 0 ? '+' : ''}₹{portfolioSummary.totalPnl.toLocaleString()}
              </div>
              <p className={`text-xs ${
                portfolioSummary.totalPnlPercent >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {portfolioSummary.totalPnlPercent >= 0 ? '+' : ''}{portfolioSummary.totalPnlPercent}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Cash</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{portfolioSummary.cash.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Margin: ₹{portfolioSummary.margin.available.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-4">
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <TabsContent value="positions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Positions</CardTitle>
                <CardDescription>
                  Your current stock holdings with live P&L
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {positions.map((position) => (
                    <div key={position.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{position.symbol}</span>
                          <Badge variant="outline" className="text-xs">
                            {position.productType}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{position.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {position.quantity} • Avg: ₹{position.averagePrice} • LTP: ₹{position.ltp}
                        </p>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Value: </span>
                          <span className="font-medium">₹{position.currentValue.toLocaleString()}</span>
                        </div>
                        <div className={`text-sm font-medium ${
                          position.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {position.pnl >= 0 ? '+' : ''}₹{position.pnl.toLocaleString()} 
                          ({position.pnl >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Book</CardTitle>
                <CardDescription>
                  Track all your orders - pending, completed, and cancelled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{order.symbol}</span>
                          <Badge variant={order.transactionType === 'BUY' ? 'default' : 'destructive'} className="text-xs">
                            {order.transactionType}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {order.orderType}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Qty: {order.quantity} • Price: ₹{order.price}
                          {order.stopPrice && ` • Stop: ₹${order.stopPrice}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.timestamp.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1 text-sm ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </div>
                        {order.filledQuantity && (
                          <div className="text-xs text-muted-foreground">
                            Filled: {order.filledQuantity}/{order.quantity}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trades" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
                <CardDescription>
                  Complete history of your executed trades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trades.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{trade.symbol}</span>
                          <Badge variant={trade.transactionType === 'BUY' ? 'default' : 'destructive'} className="text-xs">
                            {trade.transactionType}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Qty: {trade.quantity} • Price: ₹{trade.price}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {trade.timestamp.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">₹{trade.value.toLocaleString()}</div>
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Executed
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Portfolio Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {positions.map((position) => {
                      const percentage = (position.currentValue / portfolioSummary.totalValue) * 100;
                      return (
                        <div key={position.symbol} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{position.symbol}</span>
                            <span>{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-brand-600 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-green-600">
                        {((positions.filter(p => p.pnl > 0).length / positions.length) * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-brand-600">3</div>
                      <div className="text-xs text-muted-foreground">Active Positions</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-brand-600">
                        ₹{(positions.reduce((sum, p) => sum + Math.abs(p.pnl), 0) / positions.length).toFixed(0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Avg P&L</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-brand-600">15</div>
                      <div className="text-xs text-muted-foreground">Total Trades</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
