'use client';

import { FormEvent, useState, useEffect } from 'react';
import { Bot, Send, User, Loader2, History, X } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type Message = {
    sender: string;
    message: string;
};

type CurrentUser = {
    name: string;
    avatarUrl?: string;
};

type ChatSessionType = {
  _id: string;
  title: string;
  createdAt: string;
};

// Intro message for the AI tutor
const INTRO_MESSAGE = `Hello! 👋 I'm your AI Tutor, here to help you learn and grow. 

I can:
- 📚 Explain complex concepts in simple terms
- 💡 Provide study tips and learning strategies
- ❓ Answer your questions based on your role
- 📊 Give personalized recommendations

Feel free to ask me anything! Just type your question or say "hi" for a friendly greeting. How can I help you today?`;

// Function to detect if message is a simple greeting
function isGreeting(message: string): boolean {
  const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'howdy', 'sup'];
  const lowerMessage = message.toLowerCase().trim();
  return greetings.some(greeting => lowerMessage === greeting || lowerMessage.startsWith(greeting));
}

// Function to generate a greeting response
function getGreetingResponse(userName: string): string {
  const greetings = [
    `Hi there, ${userName}! 👋 How can I help you today?`,
    `Hello, ${userName}! Ready to learn something new? 📚`,
    `Hey ${userName}! What would you like to know? 🤔`,
    `Greetings, ${userName}! I'm here to assist you. What's on your mind?`,
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

export function AiChatTutor({ user }: { user: CurrentUser }) {
  const [messages, setMessages] = useState<Message[]>([{ sender: 'AI', message: INTRO_MESSAGE }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSessionType[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { user: authUser } = useAuth();

  // Load chat history on mount
  useEffect(() => {
    if (authUser) {
      loadChatSessions();
    }
  }, [authUser]);

  const loadChatSessions = async () => {
    try {
      const response = await fetch('/api/chat-sessions?limit=5');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    }
  };

  const saveCurrentChat = async () => {
    if (!authUser || messages.length <= 1) return; // Don't save if just intro

    try {
      const chatTitle = messages
        .find(m => m.sender === 'user')
        ?.message.substring(0, 50) || `Chat - ${new Date().toLocaleDateString()}`;

      await fetch('/api/chat-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: chatTitle,
          messages: messages,
          userRole: authUser.role,
        }),
      });

      await loadChatSessions();
    } catch (error) {
      console.error('Failed to save chat:', error);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat-sessions/${sessionId}`);
      if (response.ok) {
        const session = await response.json();
        setMessages(session.messages);
        setCurrentSessionId(sessionId);
        setShowHistory(false);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const startNewChat = () => {
    saveCurrentChat();
    setMessages([{ sender: 'AI', message: INTRO_MESSAGE }]);
    setCurrentSessionId(null);
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = { sender: 'user', message: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Check if it's a simple greeting
      if (isGreeting(input)) {
        const greetingResponse = getGreetingResponse(authUser?.name || user.name);
        const aiMessage: Message = { sender: 'AI', message: greetingResponse };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        return;
      }

      // For actual questions, call the AI endpoint
      const userRole = authUser?.role || 'student';

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          userRole: userRole,
          userName: authUser?.name || user.name,
          studentQuizHistory: 'Recent quiz performance analysis',
          subjectSyllabus: 'Current subject material',
          weakAreas: 'Topics to focus on',
          difficultyLevel: 'medium',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      // Format AI response
      const aiResponseText = `
**Explanation:**
${data.explanation}

**Recommendations:**
${data.recommendations}

**Study Plan:**
${data.studyPlan}
      `.trim();

      const aiMessage: Message = {
        sender: 'AI',
        message: aiResponseText,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        sender: 'AI',
        message: `⚠️ Error: ${error instanceof Error ? error.message : 'Failed to get response from AI. Please try again.'}`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Bot className="mr-2" />
          AI Tutor
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-2xl">
        {showHistory ? (
          <>
            <SheetHeader>
              <SheetTitle>Chat History</SheetTitle>
              <SheetDescription>
                View your previous conversations
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1 rounded-md border p-4">
              <div className="space-y-2">
                {sessions.length > 0 ? (
                  sessions.map((session) => (
                    <div
                      key={session._id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted cursor-pointer"
                      onClick={() => loadSession(session._id)}
                    >
                      <div className="flex-1 truncate">
                        <p className="font-medium truncate">{session.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    No chat history yet
                  </p>
                )}
              </div>
            </ScrollArea>
            <Button
              variant="outline"
              onClick={() => setShowHistory(false)}
              className="w-full"
            >
              Back to Chat
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>AI Chat Tutor</SheetTitle>
                <SheetDescription>
                  Ask questions, get explanations, and receive personalized study plans.
                </SheetDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(true)}
                  title="View chat history"
                >
                  <History className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 rounded-md border p-4">
              <div className="space-y-6">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-4",
                      msg.sender === 'user' && 'justify-end'
                    )}
                  >
                    {msg.sender === 'AI' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-lg p-3 text-sm",
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    {msg.sender === 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.avatarUrl}
                          alt={user.name}
                          data-ai-hint="person face"
                        />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          AI is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <SheetFooter>
              <div className="flex w-full flex-col gap-2">
                {currentSessionId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startNewChat}
                  >
                    + New Chat
                  </Button>
                )}
                <form
                  onSubmit={handleSendMessage}
                  className="flex w-full items-center gap-2"
                >
                  <Textarea
                    placeholder="Type your question here or say hi for a greeting..."
                    className="flex-1"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(
                          e as unknown as FormEvent
                        );
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    aria-label="Send message"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </form>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

