import type { OrderType, RiskLevel, Stock } from '@/types';

type RiskAssessmentResult = {
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  warnings: string[];
  nudges: string[];
  shouldConfirm: boolean;
  delaySeconds?: number;
};

type OrderRiskData = {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  orderType: OrderType;
  portfolioValue: number;
  availableCash: number;
  currentPosition?: {
    quantity: number;
    avgPrice: number;
  };
  stock?: Stock;
};

export class RiskAssessment {
  private static calculatePositionSize(orderValue: number, portfolioValue: number): number {
    return (orderValue / portfolioValue) * 100;
  }

  private static calculateVolatilityRisk(stock?: Stock): number {
    if (!stock) return 50;
    
    // Mock volatility calculation based on price change
    const changePercent = Math.abs(stock.changePercent || 0);
    if (changePercent > 10) return 90;
    if (changePercent > 5) return 70;
    if (changePercent > 2) return 50;
    return 30;
  }

  private static calculateLeverageRisk(
    orderValue: number, 
    availableCash: number
  ): number {
    const leverage = orderValue / availableCash;
    if (leverage > 2) return 90;
    if (leverage > 1.5) return 70;
    if (leverage > 1) return 50;
    return 20;
  }

  private static calculateConcentrationRisk(
    orderValue: number, 
    portfolioValue: number,
    currentPosition?: { quantity: number; avgPrice: number }
  ): number {
    let totalExposure = orderValue;
    
    if (currentPosition) {
      totalExposure += currentPosition.quantity * currentPosition.avgPrice;
    }
    
    const concentrationPercent = (totalExposure / portfolioValue) * 100;
    
    if (concentrationPercent > 25) return 90;
    if (concentrationPercent > 15) return 70;
    if (concentrationPercent > 10) return 50;
    return 30;
  }

  static assessOrderRisk(orderData: OrderRiskData): RiskAssessmentResult {
    const { 
      symbol, 
      side, 
      quantity, 
      price, 
      orderType, 
      portfolioValue, 
      availableCash,
      currentPosition,
      stock 
    } = orderData;

    const orderPrice = price || stock?.price || 0;
    const orderValue = quantity * orderPrice;

    // Calculate individual risk factors
    const volatilityRisk = this.calculateVolatilityRisk(stock);
    const leverageRisk = this.calculateLeverageRisk(orderValue, availableCash);
    const concentrationRisk = this.calculateConcentrationRisk(
      orderValue, 
      portfolioValue, 
      currentPosition
    );
    const positionSizePercent = this.calculatePositionSize(orderValue, portfolioValue);

    // Calculate overall risk score (weighted average)
    const riskScore = Math.round(
      (volatilityRisk * 0.3) + 
      (leverageRisk * 0.25) + 
      (concentrationRisk * 0.25) + 
      (positionSizePercent * 2) // Convert to 0-100 scale
    );

    // Determine risk level
    let riskLevel: RiskLevel;
    if (riskScore >= 80) riskLevel = 'high';
    else if (riskScore >= 50) riskLevel = 'medium';
    else riskLevel = 'low';

    // Generate warnings and nudges
    const warnings: string[] = [];
    const nudges: string[] = [];

    // Position size warnings
    if (positionSizePercent > 20) {
      warnings.push(`This order represents ${positionSizePercent.toFixed(1)}% of your portfolio`);
      nudges.push('Consider reducing position size to manage risk');
    }

    // Volatility warnings
    if (stock && Math.abs(stock.changePercent || 0) > 5) {
      warnings.push(`${symbol} has moved ${stock.changePercent?.toFixed(2)}% today`);
      nudges.push('High volatility detected - consider using limit orders');
    }

    // Concentration warnings
    const totalExposure = currentPosition 
      ? orderValue + (currentPosition.quantity * currentPosition.avgPrice)
      : orderValue;
    const concentrationPercent = (totalExposure / portfolioValue) * 100;
    
    if (concentrationPercent > 15) {
      warnings.push(`Total exposure to ${symbol} will be ${concentrationPercent.toFixed(1)}% of portfolio`);
      nudges.push('Consider diversifying across multiple stocks');
    }

    // Leverage warnings
    if (orderValue > availableCash) {
      warnings.push('Insufficient cash - this order may be rejected');
      nudges.push('Consider reducing order size or adding funds');
    }

    // Market order warnings
    if (orderType === 'MARKET' && riskLevel !== 'low') {
      warnings.push('Market orders execute at current market price');
      nudges.push('Consider using a limit order to control execution price');
    }

    // Determine if confirmation is needed
    const shouldConfirm = riskLevel === 'high' || warnings.length > 2;
    const delaySeconds = riskLevel === 'high' ? 5 : undefined;

    return {
      riskLevel,
      riskScore,
      warnings,
      nudges,
      shouldConfirm,
      delaySeconds,
    };
  }

  // Beginner-specific assessments
  static assessBeginnerRisk(
    orderData: OrderRiskData, 
    userTradingLevel: string
  ): RiskAssessmentResult {
    const baseAssessment = this.assessOrderRisk(orderData);

    if (userTradingLevel === 'beginner') {
      // More conservative approach for beginners
      baseAssessment.riskScore = Math.min(baseAssessment.riskScore + 20, 100);
      
      if (baseAssessment.riskLevel === 'low') {
        baseAssessment.riskLevel = 'medium';
      } else if (baseAssessment.riskLevel === 'medium') {
        baseAssessment.riskLevel = 'high';
      }

      // Additional beginner nudges
      baseAssessment.nudges.push(
        'New to trading? Start with smaller positions to learn',
        'Consider paper trading first to practice strategies'
      );

      // Always require confirmation for beginners after conservative adjustments
      baseAssessment.shouldConfirm = true;
      baseAssessment.delaySeconds = 8;
    }

    return baseAssessment;
  }

  // Generate educational content based on risk factors
  static generateEducationalContent(assessment: RiskAssessmentResult): {
    title: string;
    content: string;
    learnMoreUrl?: string;
  } {
    const { riskLevel, warnings } = assessment;

    if (riskLevel === 'high') {
      return {
        title: 'High-Risk Trade Detected',
        content: 'This trade has elevated risk factors. Consider reviewing your strategy and position sizing. High-risk trades can lead to significant losses.',
        learnMoreUrl: '/learn/risk-management',
      };
    }

    if (warnings.some(w => w.includes('volatility'))) {
      return {
        title: 'Understanding Volatility',
        content: 'This stock is experiencing high volatility. Volatile stocks can move quickly in either direction, creating both opportunities and risks.',
        learnMoreUrl: '/learn/volatility-trading',
      };
    }

    if (warnings.some(w => w.includes('concentration'))) {
      return {
        title: 'Portfolio Diversification',
        content: 'You have significant exposure to this stock. Diversification across multiple assets can help reduce overall portfolio risk.',
        learnMoreUrl: '/learn/diversification',
      };
    }

    return {
      title: 'Trade Analysis Complete',
      content: 'Your trade has been analyzed for risk factors. Always remember to trade within your risk tolerance.',
      learnMoreUrl: '/learn/trading-basics',
    };
  }
}

// React hook for risk assessment
export function useRiskAssessment() {
  const assessOrderRisk = (orderData: OrderRiskData) => {
    return RiskAssessment.assessOrderRisk(orderData);
  };

  const assessBeginnerRisk = (orderData: OrderRiskData, userTradingLevel: string) => {
    return RiskAssessment.assessBeginnerRisk(orderData, userTradingLevel);
  };

  const getEducationalContent = (assessment: RiskAssessmentResult) => {
    return RiskAssessment.generateEducationalContent(assessment);
  };

  return {
    assessOrderRisk,
    assessBeginnerRisk,
    getEducationalContent,
  };
}
