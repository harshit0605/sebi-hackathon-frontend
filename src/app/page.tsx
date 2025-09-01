import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BookOpen, Target, Award, ArrowRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Mock data for demonstration
const portfolioData = {
  totalValue: 125000,
  dayPnl: 2500,
  dayPnlPercent: 2.04,
  totalPnl: 25000,
  totalPnlPercent: 25.0,
};

const watchlistData = [
  { symbol: 'RELIANCE', ltp: 2456.75, change: 45.30, changePercent: 1.88 },
  { symbol: 'TCS', ltp: 3210.40, change: -23.15, changePercent: -0.71 },
  { symbol: 'INFY', ltp: 1567.85, change: 12.90, changePercent: 0.83 },
  { symbol: 'HDFCBANK', ltp: 1623.20, change: -8.45, changePercent: -0.52 },
];

const recentLessons = [
  { id: '1', title: 'Understanding Market Orders', progress: 75, duration: '5 min' },
  { id: '2', title: 'Risk Management Basics', progress: 45, duration: '8 min' },
  { id: '3', title: 'Reading Candlestick Charts', progress: 0, duration: '12 min' },
];

export default function Home() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back, Trader!</h1>
          <p className="text-brand-100 mb-4">
            Continue your learning journey and practice trading with our AI mentor
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary" size="sm">
              <Link href="/voice">
                <Target className="h-4 w-4 mr-2" />
                Start AI Session
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              <Link href="/learn">
                <BookOpen className="h-4 w-4 mr-2" />
                Continue Learning
              </Link>
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{portfolioData.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Paper trading account</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Day P&L</CardTitle>
              {portfolioData.dayPnl >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-danger-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${portfolioData.dayPnl >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {portfolioData.dayPnl >= 0 ? '+' : ''}₹{portfolioData.dayPnl.toLocaleString()}
              </div>
              <p className={`text-xs ${portfolioData.dayPnlPercent >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {portfolioData.dayPnlPercent >= 0 ? '+' : ''}{portfolioData.dayPnlPercent}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${portfolioData.totalPnl >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {portfolioData.totalPnl >= 0 ? '+' : ''}₹{portfolioData.totalPnl.toLocaleString()}
              </div>
              <p className={`text-xs ${portfolioData.totalPnlPercent >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {portfolioData.totalPnlPercent >= 0 ? '+' : ''}{portfolioData.totalPnlPercent}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning-600">Medium</div>
              <p className="text-xs text-muted-foreground">Based on your trades</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Watchlist */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Watchlist</CardTitle>
                <CardDescription>
                  Track your favorite stocks with delayed prices
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                Delayed 15min
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {watchlistData.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-muted-foreground">₹{stock.ltp}</div>
                    </div>
                    <div className={`text-right ${stock.change >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
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
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/trade">
                  View All Stocks <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Learning Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>
                Complete lessons to improve your trading skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLessons.map((lesson) => (
                  <div key={lesson.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{lesson.title}</div>
                      <Badge variant={lesson.progress === 0 ? "secondary" : "outline"} className="text-xs">
                        {lesson.duration}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-brand-600 h-2 rounded-full transition-all"
                          style={{ width: `${lesson.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {lesson.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/learn">
                  View All Lessons <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Trade Section */}
        <Card>
          <CardHeader>
            <CardTitle>Ready to Trade?</CardTitle>
            <CardDescription>
              Practice your trading skills in a safe paper trading environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="flex-1">
                <Link href="/trade">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Start Trading
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/portfolio">
                  View Portfolio
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
