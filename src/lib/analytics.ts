'use client';

type EventProperties = Record<string, any>;

type TrackingEvent = {
  name: string;
  properties?: EventProperties;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  url: string;
  userAgent: string;
};

type AnalyticsConfig = {
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  userId?: string;
  debug?: boolean;
};

class Analytics {
  private config: AnalyticsConfig;
  private sessionId: string;
  private queue: TrackingEvent[] = [];
  private isInitialized = false;

  constructor() {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      debug: process.env.NODE_ENV === 'development',
    };
    this.sessionId = this.generateSessionId();
  }

  initialize(config: Partial<AnalyticsConfig>) {
    this.config = { ...this.config, ...config };
    this.isInitialized = true;

    // Process queued events
    this.processQueue();

    if (this.config.debug) {
      console.log('Analytics initialized:', this.config);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private processQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.sendEvent(event);
      }
    }
  }

  private async sendEvent(event: TrackingEvent) {
    if (!this.config.enabled && !this.config.debug) return;

    if (this.config.debug) {
      console.log('Analytics Event:', event);
    }

    if (this.config.endpoint && this.config.enabled) {
      try {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
          },
          body: JSON.stringify(event),
        });
      } catch (error) {
        console.error('Failed to send analytics event:', error);
      }
    }
  }

  private createEvent(name: string, properties?: EventProperties): TrackingEvent {
    return {
      name,
      properties,
      userId: this.config.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };
  }

  track(eventName: string, properties?: EventProperties) {
    const event = this.createEvent(eventName, properties);

    if (this.isInitialized) {
      this.sendEvent(event);
    } else {
      this.queue.push(event);
    }
  }

  // Page tracking
  page(pageName?: string, properties?: EventProperties) {
    this.track('page_view', {
      page: pageName || (typeof window !== 'undefined' ? window.location.pathname : ''),
      ...properties,
    });
  }

  // User identification
  identify(userId: string, traits?: EventProperties) {
    this.config.userId = userId;
    this.track('user_identify', {
      userId,
      traits,
    });
  }

  // Trading specific events
  orderPlaced(orderData: {
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    orderType: string;
    price?: number;
  }) {
    this.track('order_placed', orderData);
  }

  lessonStarted(lessonData: { lessonId: string; moduleId: string; lessonTitle: string }) {
    this.track('lesson_started', lessonData);
  }

  lessonCompleted(lessonData: {
    lessonId: string;
    moduleId: string;
    lessonTitle: string;
    duration: number;
    score?: number;
  }) {
    this.track('lesson_completed', lessonData);
  }

  copilotInteraction(interactionData: {
    action: string;
    context: string;
    confirmed?: boolean;
  }) {
    this.track('copilot_interaction', interactionData);
  }

  voiceSessionStarted(sessionData: { roomId: string; duration?: number }) {
    this.track('voice_session_started', sessionData);
  }

  voiceSessionEnded(sessionData: {
    roomId: string;
    duration: number;
    questionsAsked?: number;
    actionsTriggered?: number;
  }) {
    this.track('voice_session_ended', sessionData);
  }

  // Error tracking
  error(errorData: {
    message: string;
    stack?: string;
    component?: string;
    action?: string;
  }) {
    this.track('error_occurred', {
      ...errorData,
      severity: 'error',
    });
  }

  // Performance tracking
  performance(performanceData: {
    metric: string;
    value: number;
    unit: string;
    context?: string;
  }) {
    this.track('performance_metric', performanceData);
  }

  // Feature usage tracking
  featureUsed(featureData: { feature: string; context?: string; value?: any }) {
    this.track('feature_used', featureData);
  }
}

// Singleton instance
export const analytics = new Analytics();

// React hooks
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    page: analytics.page.bind(analytics),
    identify: analytics.identify.bind(analytics),
    orderPlaced: analytics.orderPlaced.bind(analytics),
    lessonStarted: analytics.lessonStarted.bind(analytics),
    lessonCompleted: analytics.lessonCompleted.bind(analytics),
    copilotInteraction: analytics.copilotInteraction.bind(analytics),
    voiceSessionStarted: analytics.voiceSessionStarted.bind(analytics),
    voiceSessionEnded: analytics.voiceSessionEnded.bind(analytics),
    error: analytics.error.bind(analytics),
    performance: analytics.performance.bind(analytics),
    featureUsed: analytics.featureUsed.bind(analytics),
  };
}

// Initialize analytics (call this in your app initialization)
export function initializeAnalytics(config: Partial<AnalyticsConfig>) {
  analytics.initialize(config);
}

// Export analytics instance and types
export type { EventProperties, TrackingEvent, AnalyticsConfig };
