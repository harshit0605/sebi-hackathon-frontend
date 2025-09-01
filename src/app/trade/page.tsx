'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search,
  TrendingUp, 
  TrendingDown,
  Plus,
  Star,
  AlertTriangle,
  Eye,
  ShoppingCart,
  BarChart3,
  Activity
} from 'lucide-react';

// Mock data for demonstration
const topStocks = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', ltp: 2456.75, change: 45.30, changePercent: 1.88, volume: 12543210 },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', ltp: 3210.40, change: -23.15, changePercent: -0.71, volume: 8734521 },
  { symbol: 'INFY', name: 'Infosys Ltd.', ltp: 1567.85, change: 12.90, changePercent: 0.83, volume: 9876543 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', ltp: 1623.20, change: -8.45, changePercent: -0.52, volume: 7654321 },
  { symbol: 'ITC', name: 'ITC Ltd.', ltp: 456.30, change: 5.20, changePercent: 1.15, volume: 15432876 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', ltp: 2789.45, change: -15.80, changePercent: -0.56, volume: 5432187 },
];

const watchlistStocks = [
  { symbol: 'RELIANCE', ltp: 2456.75, change: 45.30, changePercent: 1.88 },
  { symbol: 'TCS', ltp: 3210.40, change: -23.15, changePercent: -0.71 },
  { symbol: 'BAJFINANCE', ltp: 6789.20, change: 123.45, changePercent: 1.85 },
  { symbol: 'ASIANPAINT', ltp: 3456.80, change: -12.30, changePercent: -0.35 },
];

const marketIndices = [
  { name: 'NIFTY 50', value: 19567.85, change: 125.30, changePercent: 0.64 },
  { name: 'SENSEX', value: 65432.10, change: -89.45, changePercent: -0.14 },
  { name: 'NIFTY BANK', value: 43210.75, change: 234.50, changePercent: 0.55 },
];

type OrderFormData = {
  symbol: string;
  orderType: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  transactionType: 'BUY' | 'SELL';
  quantity: string;
  price: string;
  stopPrice: string;
  productType: 'CNC' | 'MIS';
};

export default function TradePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<typeof topStocks[0] | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderFormData>({
    symbol: '',
    orderType: 'MARKET',
    transactionType: 'BUY',
    quantity: '',
    price: '',
    stopPrice: '',
    productType: 'CNC',
  });

  const handleStockSelect = (stock: typeof topStocks[0]) => {
    setSelectedStock(stock);
    setOrderForm(prev => ({
      ...prev,
      symbol: stock.symbol,
      price: stock.ltp.toString(),
    }));
  };

  const handleOrderFormChange = (field: keyof OrderFormData, value: string) => {
    setOrderForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const filteredStocks = topStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateOrderValue = () => {
    const qty = parseFloat(orderForm.quantity) || 0;
    const price = parseFloat(orderForm.price) || 0;
    return qty * price;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Stock List & Watchlist */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Indices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Market Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {marketIndices.map((index) => (
                    <div key={index.name} className="text-center p-3 rounded-lg bg-gray-50">
                      <div className="font-medium text-sm text-gray-600">{index.name}</div>
                      <div className="text-lg font-bold">{index.value.toLocaleString()}</div>
                      <div className={`text-sm ${index.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {index.change >= 0 ? '+' : ''}{index.change} ({index.change >= 0 ? '+' : ''}{index.changePercent}%)
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="stocks" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stocks">All Stocks</TabsTrigger>
                <TabsTrigger value="watchlist">My Watchlist</TabsTrigger>
              </TabsList>

              <TabsContent value="stocks" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle>Stock Explorer</CardTitle>
                        <CardDescription>
                          Discover and trade popular stocks with delayed prices
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Delayed 15min
                      </Badge>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search stocks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {filteredStocks.map((stock) => (
                        <div
                          key={stock.symbol}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedStock?.symbol === stock.symbol ? 'bg-brand-50 border-brand-200' : ''
                          }`}
                          onClick={() => handleStockSelect(stock)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-semibold">{stock.symbol}</div>
                              <div className="text-right">
                                <div className="font-semibold">₹{stock.ltp}</div>
                                <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {stock.change >= 0 ? '+' : ''}₹{stock.change} ({stock.change >= 0 ? '+' : ''}{stock.changePercent}%)
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">{stock.name}</div>
                            <div className="text-xs text-gray-400">Vol: {stock.volume.toLocaleString()}</div>
                          </div>
                          <div className="ml-4 flex items-center space-x-2">
                            <Button size="sm" variant="ghost">
                              <Star className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="watchlist" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Watchlist</CardTitle>
                    <CardDescription>
                      Your favorite stocks for quick access
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {watchlistStocks.map((stock) => (
                        <div
                          key={stock.symbol}
                          className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
                          onClick={() => handleStockSelect(stock as any)}
                        >
                          <div>
                            <div className="font-medium">{stock.symbol}</div>
                            <div className="text-sm text-gray-500">₹{stock.ltp}</div>
                          </div>
                          <div className={`text-right ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            <div className="font-medium">
                              {stock.change >= 0 ? '+' : ''}₹{stock.change}
                            </div>
                            <div className="text-sm">
                              ({stock.change >= 0 ? '+' : ''}{stock.changePercent}%)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Order Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Place Order
                </CardTitle>
                {selectedStock && (
                  <CardDescription>
                    Trading {selectedStock.symbol} @ ₹{selectedStock.ltp}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedStock ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Select a stock to start trading</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="transactionType">Transaction Type</Label>
                      <Select
                        value={orderForm.transactionType}
                        onValueChange={(value) => handleOrderFormChange('transactionType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BUY">
                            <span className="text-green-600 font-medium">BUY</span>
                          </SelectItem>
                          <SelectItem value="SELL">
                            <span className="text-red-600 font-medium">SELL</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="Enter quantity"
                        value={orderForm.quantity}
                        onChange={(e) => handleOrderFormChange('quantity', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderType">Order Type</Label>
                      <Select
                        value={orderForm.orderType}
                        onValueChange={(value) => handleOrderFormChange('orderType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MARKET">Market</SelectItem>
                          <SelectItem value="LIMIT">Limit</SelectItem>
                          <SelectItem value="SL">Stop Loss</SelectItem>
                          <SelectItem value="SL-M">Stop Loss Market</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(orderForm.orderType === 'LIMIT' || orderForm.orderType === 'SL') && (
                      <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          placeholder="Enter price"
                          value={orderForm.price}
                          onChange={(e) => handleOrderFormChange('price', e.target.value)}
                        />
                      </div>
                    )}

                    {(orderForm.orderType === 'SL' || orderForm.orderType === 'SL-M') && (
                      <div className="space-y-2">
                        <Label htmlFor="stopPrice">Stop Price</Label>
                        <Input
                          id="stopPrice"
                          type="number"
                          step="0.01"
                          placeholder="Enter stop price"
                          value={orderForm.stopPrice}
                          onChange={(e) => handleOrderFormChange('stopPrice', e.target.value)}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="productType">Product Type</Label>
                      <Select
                        value={orderForm.productType}
                        onValueChange={(value) => handleOrderFormChange('productType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CNC">CNC (Delivery)</SelectItem>
                          <SelectItem value="MIS">MIS (Intraday)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {orderForm.quantity && orderForm.price && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>Order Value:</span>
                          <span className="font-medium">₹{calculateOrderValue().toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-yellow-800">
                        <strong>Risk Warning:</strong> This is a paper trading simulation. 
                        Real trades involve market risks and potential losses.
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="w-full">
                        Preview Order
                      </Button>
                      <Button 
                        className={`w-full ${
                          orderForm.transactionType === 'BUY' 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {orderForm.transactionType} {orderForm.symbol}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* AI Suggestion */}
            <Card className="border-brand-200 bg-brand-50">
              <CardHeader>
                <CardTitle className="text-brand-800">AI Trading Mentor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-brand-700 mb-3">
                  Need help with this trade? Ask our AI mentor for personalized guidance and risk assessment.
                </p>
                <Button variant="outline" size="sm" className="w-full border-brand-300 text-brand-700 hover:bg-brand-100">
                  Get AI Guidance
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
