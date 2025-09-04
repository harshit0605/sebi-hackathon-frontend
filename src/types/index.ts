// User and Authentication types
export type User = {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: 'user' | 'admin';
  language: 'en' | 'hi';
  tradingLevel: 'beginner' | 'intermediate' | 'advanced';
  riskTolerance: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
};

export type Session = {
  user: User;
  token: string;
  expiresAt: Date;
};

// Trading types
export type Instrument = {
  symbol: string;
  name: string;
  exchange: string;
  instrumentType: 'EQUITY' | 'FUTURE' | 'OPTION' | 'CURRENCY' | 'COMMODITY';
  lotSize: number;
  tickSize: number;
  segment: string;
  tradingSymbol: string;
};

export type Quote = {
  symbol: string;
  ltp: number; // Last Traded Price
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
  isDelayed: boolean;
};

export type OrderType = 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
export type ProductType = 'CNC' | 'MIS' | 'NRML';
export type TransactionType = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'OPEN' | 'COMPLETE' | 'CANCELLED' | 'REJECTED';

export type Order = {
  id: string;
  symbol: string;
  orderType: OrderType;
  productType: ProductType;
  transactionType: TransactionType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: OrderStatus;
  filledQuantity: number;
  averagePrice?: number;
  timestamp: Date;
  userId: string;
};

export type Position = {
  symbol: string;
  quantity: number;
  averagePrice: number;
  ltp: number;
  pnl: number;
  pnlPercent: number;
  productType: ProductType;
  userId: string;
};

export type Portfolio = {
  totalValue: number;
  dayPnl: number;
  dayPnlPercent: number;
  totalPnl: number;
  totalPnlPercent: number;
  positions: Position[];
  cash: number;
  margin: {
    available: number;
    used: number;
    total: number;
  };
};

// Learning types
export type LessonType = 'video' | 'audio' | 'text' | 'interactive';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type Lesson = {
  id: string;
  title: string;
  description: string;
  content: string;
  type: LessonType;
  difficulty: DifficultyLevel;
  duration: number; // in minutes
  language: 'en' | 'hi';
  tags: string[];
  videoUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  isCompleted?: boolean;
  progress?: number; // 0-100
};

export type Quiz = {
  id: string;
  lessonId: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // in minutes
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

// LiveKit and Voice types
export type RoomParticipant = {
  id: string;
  name: string;
  isAgent: boolean;
  isSpeaking: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
};

export type VoiceRoomState = {
  isConnected: boolean;
  participants: RoomParticipant[];
  isRecording: boolean;
  transcript: string;
  allowAgentControl: boolean;
};

// CopilotKit types
export type CopilotAction = 
  | 'setSymbol'
  | 'setOrderField'
  | 'openOrderTicket'
  | 'explainField'
  | 'highlightRisk'
  | 'startLesson'
  | 'createCourseFromPdf';

export type CopilotContext = {
  currentSymbol?: string;
  orderForm: Partial<Order>;
  riskBudget: number;
  language: 'en' | 'hi';
  userProfile: Partial<User>;
  currentPage: string;
};

export type ActivityLog = {
  id: string;
  timestamp: Date;
  action: CopilotAction;
  description: string;
  userId: string;
  confirmed: boolean;
};

// UI State types
export type UIState = {
  sidebarOpen: boolean;
  currentTab: 'home' | 'learn' | 'trade' | 'copilot' | 'profile';
  language: 'en' | 'hi';
  theme: 'light' | 'dark';
  notifications: Notification[];
};

export type Notification = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
};

// API Response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}>;

// Form types
export type SignInForm = {
  email: string;
  password: string;
};

export type SignUpForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  language: 'en' | 'hi';
  tradingLevel: 'beginner' | 'intermediate' | 'advanced';
  riskTolerance: 'low' | 'medium' | 'high';
};

export type OrderForm = {
  symbol: string;
  orderType: OrderType;
  productType: ProductType;
  transactionType: TransactionType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  validity: 'DAY' | 'IOC';
};

// Risk Assessment types
export type RiskAssessment = {
  level: 'low' | 'medium' | 'high';
  factors: string[];
  recommendation: string;
  requiresConfirmation: boolean;
};
