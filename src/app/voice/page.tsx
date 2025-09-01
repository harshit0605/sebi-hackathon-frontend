'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  Monitor,
  Settings,
  Bot,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
type ParticipantType = 'user' | 'agent';

type VoiceMessage = {
  id: string;
  type: ParticipantType;
  content: string;
  timestamp: Date;
  confidence?: number;
};

type AgentAction = {
  id: string;
  action: string;
  parameters: Record<string, any>;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  description: string;
};

export default function VoiceTutorPage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [micEnabled, setMicEnabled] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [allowAgentControl, setAllowAgentControl] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [roomId, setRoomId] = useState<string>('');

  // Mock data for demonstration
  const [transcript, setTranscript] = useState<VoiceMessage[]>([
    {
      id: '1',
      type: 'agent',
      content: 'Hello! I\'m your AI trading tutor. I can help you understand market concepts, analyze stocks, and guide you through paper trades. What would you like to learn today?',
      timestamp: new Date(Date.now() - 120000),
    },
    {
      id: '2',
      type: 'user',
      content: 'I want to learn about stop loss orders.',
      timestamp: new Date(Date.now() - 90000),
      confidence: 0.95,
    },
    {
      id: '3',
      type: 'agent',
      content: 'Great question! Stop loss orders are risk management tools that automatically sell your stock when it reaches a certain price. Let me show you how to set one up in the trading interface.',
      timestamp: new Date(Date.now() - 60000),
    },
  ]);

  const [agentActions, setAgentActions] = useState<AgentAction[]>([
    {
      id: '1',
      action: 'openOrderTicket',
      parameters: { symbol: 'RELIANCE' },
      timestamp: new Date(Date.now() - 30000),
      status: 'completed',
      description: 'Opened order ticket for RELIANCE to demonstrate stop loss setup',
    },
    {
      id: '2',
      action: 'setOrderField',
      parameters: { field: 'orderType', value: 'SL' },
      timestamp: new Date(Date.now() - 20000),
      status: 'completed',
      description: 'Set order type to Stop Loss (SL)',
    },
  ]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleConnect = async () => {
    if (connectionStatus === 'connected') {
      // Disconnect
      setConnectionStatus('disconnected');
      setMicEnabled(false);
      setIsRecording(false);
      setRoomId('');
      return;
    }

    try {
      setConnectionStatus('connecting');
      
      // Simulate API call to get LiveKit token
      const response = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: 'voice-tutor-' + Date.now(),
          participantName: 'Student',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get access token');
      }

      const { token, wsUrl, identity } = await response.json();
      
      // In a real implementation, you would use LiveKit SDK here
      // For now, simulate successful connection
      setTimeout(() => {
        setConnectionStatus('connected');
        setRoomId(identity);
        
        // Add welcome message from agent
        const welcomeMessage: VoiceMessage = {
          id: Date.now().toString(),
          type: 'agent',
          content: 'Connected! I\'m ready to help you learn. You can ask me about trading concepts, risk management, or request help with specific trades.',
          timestamp: new Date(),
        };
        setTranscript(prev => [...prev, welcomeMessage]);
      }, 2000);
      
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
      setTimeout(() => setConnectionStatus('disconnected'), 3000);
    }
  };

  const handleMicToggle = () => {
    if (connectionStatus !== 'connected') return;
    
    const newMicEnabled = !micEnabled;
    setMicEnabled(newMicEnabled);
    
    if (newMicEnabled) {
      setIsRecording(true);
      // Simulate voice recognition
      setTimeout(() => {
        if (micEnabled) {
          const userMessage: VoiceMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: 'How do I calculate position sizing?',
            timestamp: new Date(),
            confidence: 0.92,
          };
          setTranscript(prev => [...prev, userMessage]);
          
          // Agent response
          setTimeout(() => {
            const agentResponse: VoiceMessage = {
              id: (Date.now() + 1).toString(),
              type: 'agent',
              content: 'Position sizing is crucial for risk management. A common rule is to never risk more than 1-2% of your capital on a single trade. Let me calculate this for you based on your current portfolio.',
              timestamp: new Date(),
            };
            setTranscript(prev => [...prev, agentResponse]);
          }, 2000);
        }
        setIsRecording(false);
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'connecting': return <Clock className="h-4 w-4 animate-spin" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Voice Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Voice Tutor
                </CardTitle>
                <CardDescription>
                  Connect with your personal AI trading mentor for interactive learning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={getConnectionStatusColor()}>
                      {getConnectionStatusIcon()}
                    </span>
                    <span className="text-sm font-medium">
                      {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
                    </span>
                  </div>
                  {roomId && (
                    <Badge variant="outline" className="text-xs">
                      {roomId.slice(-8)}
                    </Badge>
                  )}
                </div>

                <Button
                  onClick={handleConnect}
                  className={`w-full ${
                    connectionStatus === 'connected' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-brand-600 hover:bg-brand-700'
                  }`}
                  disabled={connectionStatus === 'connecting'}
                >
                  {connectionStatus === 'connected' ? (
                    <>
                      <PhoneOff className="h-4 w-4 mr-2" />
                      Disconnect
                    </>
                  ) : connectionStatus === 'connecting' ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 mr-2" />
                      Connect to Tutor
                    </>
                  )}
                </Button>

                <Separator />

                {/* Audio Controls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mic-control">Microphone</Label>
                    <Button
                      variant={micEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={handleMicToggle}
                      disabled={connectionStatus !== 'connected'}
                      className={isRecording ? 'animate-pulse bg-red-500 hover:bg-red-600' : ''}
                    >
                      {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="speaker-control">Speaker</Label>
                    <Button
                      variant={speakerEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSpeakerEnabled(!speakerEnabled)}
                      disabled={connectionStatus !== 'connected'}
                    >
                      {speakerEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="screen-share">Screen Share</Label>
                    <Button
                      variant={screenShareEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setScreenShareEnabled(!screenShareEnabled)}
                      disabled={connectionStatus !== 'connected'}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Agent Control Settings */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="agent-control"
                      checked={allowAgentControl}
                      onCheckedChange={setAllowAgentControl}
                      disabled={connectionStatus !== 'connected'}
                    />
                    <Label htmlFor="agent-control" className="text-sm">
                      Allow AI to control trading interface
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    When enabled, the AI can interact with your trading interface to demonstrate concepts
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Agent Actions Log */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI Actions</CardTitle>
                <CardDescription>
                  Track what the AI is doing on your behalf
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {agentActions.map((action) => (
                      <div
                        key={action.id}
                        className="text-xs p-2 rounded bg-gray-50 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{action.action}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getActionStatusColor(action.status)}`}
                          >
                            {action.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{action.description}</p>
                        <p className="text-gray-400">
                          {action.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Conversation */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
                <CardDescription>
                  Real-time transcript of your conversation with the AI tutor
                </CardDescription>
              </CardHeader>
              <CardContent className="h-full">
                <ScrollArea className="h-[480px]" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {transcript.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.type === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-brand-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {message.type === 'user' ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Bot className="h-4 w-4" />
                            )}
                            <span className="text-xs font-medium">
                              {message.type === 'user' ? 'You' : 'AI Tutor'}
                            </span>
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                          {message.confidence && (
                            <div className="mt-2 text-xs opacity-70">
                              Confidence: {Math.round(message.confidence * 100)}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isRecording && (
                      <div className="flex justify-end">
                        <div className="bg-brand-100 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-brand-600">
                            <div className="animate-pulse">
                              <Mic className="h-4 w-4" />
                            </div>
                            <span className="text-sm">Listening...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
