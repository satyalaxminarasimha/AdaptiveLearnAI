'use client';

import { FormEvent, useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Loader2, History, MessageSquarePlus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
import { apiGetJsonCached, invalidateApiCache } from '@/lib/api';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    if (authUser) {
      loadChatSessions();
    }
  }, [authUser]);

  useEffect(() => {
    if (showHistory) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, isLoading, showHistory]);

  const loadChatSessions = async () => {
    try {
      const data = await apiGetJsonCached<{ sessions: ChatSessionType[] }>('/api/chat-sessions?limit=5', {}, 30_000);
      setSessions(data.sessions || []);
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

      const token = localStorage.getItem('token');
      await fetch('/api/chat-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: chatTitle,
          messages: messages,
          userRole: authUser.role,
        }),
      });

      invalidateApiCache('/api/chat-sessions');
      await loadChatSessions();
    } catch (error) {
      console.error('Failed to save chat:', error);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat-sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const professorClassRaw = localStorage.getItem('professorClass');
      const professorClass = professorClassRaw ? (() => {
        try {
          return JSON.parse(professorClassRaw) as { batch?: string; section?: string; subject?: string; semester?: string; year?: string };
        } catch {
          return null;
        }
      })() : null;

      // Fetch real user data for context
      let studentQuizHistory = '';
      let weakAreas = '';
      
      const chatToken = localStorage.getItem('token');
      if (userRole === 'student') {
        try {
          // Fetch quiz attempts for context
          const quizResponse = await fetch('/api/quiz-attempts?limit=5', {
            headers: { Authorization: `Bearer ${chatToken}` },
          });
          if (quizResponse.ok) {
            const quizData = await quizResponse.json();
            if (quizData.length > 0) {
              studentQuizHistory = quizData.slice(0, 5).map((attempt: any) => 
                `${attempt.quizId?.title || 'Quiz'}: ${attempt.percentage}% (${attempt.status})`
              ).join(', ');
            }
          }
          
          // Fetch weak areas for context
          const weakAreasResponse = await fetch('/api/weak-areas', {
            headers: { Authorization: `Bearer ${chatToken}` },
          });
          if (weakAreasResponse.ok) {
            const weakAreasData = await weakAreasResponse.json();
            if (weakAreasData.weakAreas?.length > 0) {
              weakAreas = weakAreasData.weakAreas.slice(0, 5).map((wa: any) => 
                `${wa.topic} (${wa.subject}) - ${wa.status}`
              ).join(', ');
            }
          }
        } catch (fetchError) {
          console.log('Could not fetch user context data');
        }
      }

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${chatToken}`,
        },
        body: JSON.stringify({
          question: input,
          userRole: userRole,
          userName: authUser?.name || user.name,
          studentQuizHistory: studentQuizHistory || 'No quiz history available yet',
          subjectSyllabus: `${authUser?.batch || ''} ${authUser?.section || ''} curriculum`,
          weakAreas: weakAreas || 'No specific weak areas identified yet',
          difficultyLevel: 'medium',
          batch: professorClass?.batch || authUser?.batch || '',
          section: professorClass?.section || authUser?.section || '',
          subject: professorClass?.subject || '',
          year: professorClass?.year || '',
          semester: professorClass?.semester || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const compactText = (value: string, maxChars: number) => {
        const trimmed = value.trim();
        if (trimmed.length <= maxChars) return trimmed;
        const sliced = trimmed.slice(0, maxChars);
        const lastSpace = sliced.lastIndexOf(' ');
        return `${sliced.slice(0, Math.max(0, lastSpace))}...`;
      };

      const getResponseProfile = (question: string) => {
        const lowered = question.toLowerCase();
        const wantsShort = [
          'short',
          'brief',
          'summary',
          'summarize',
          'quick',
          'tldr',
          'concise',
        ].some((term) => lowered.includes(term));

        const wantsDetailed = [
          'detailed',
          'detail',
          'explain',
          'long',
          'in-depth',
          'elaborate',
          'step by step',
        ].some((term) => lowered.includes(term));

        if (wantsDetailed && !wantsShort) {
          return { explanation: 1400, recommendations: 800, studyPlan: 700 };
        }

        if (wantsShort && !wantsDetailed) {
          return { explanation: 420, recommendations: 240, studyPlan: 220 };
        }

        return { explanation: 700, recommendations: 400, studyPlan: 350 };
      };

      const profile = getResponseProfile(input);

      // Format AI response (tailor length to request)
      const explanation = compactText(data.explanation || '', profile.explanation);
      const recommendations = compactText(data.recommendations || '', profile.recommendations);
      const studyPlan = compactText(data.studyPlan || '', profile.studyPlan);

      const aiResponseText = `
    **Summary:**
    ${explanation}

    **Next steps:**
    ${recommendations}

    **Quick plan:**
    ${studyPlan}
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
        <Button variant="outline" className="gap-2">
          <Bot className="h-4 w-4" />
          AI Tutor
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col overflow-hidden border-l bg-gradient-to-b from-slate-50 via-white to-slate-100 p-0 sm:max-w-md">
        {showHistory ? (
          <>
            <SheetHeader className="border-b bg-white/80 px-4 py-3 backdrop-blur">
              <SheetTitle className="text-sm font-semibold tracking-wide text-slate-900">Chat History</SheetTitle>
              <SheetDescription className="text-xs text-slate-500">
                Recent conversations
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1">
              <div className="space-y-2 p-4">
                {sessions.length > 0 ? (
                  sessions.map((session) => (
                    <div
                      key={session._id}
                      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
                      onClick={() => loadSession(session._id)}
                    >
                      <div className="flex-1 truncate">
                        <p className="truncate text-sm font-medium text-slate-800">{session.title}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-slate-500">
                    No chat history yet
                  </p>
                )}
              </div>
            </ScrollArea>
            <Button
              variant="outline"
              onClick={() => setShowHistory(false)}
              className="m-4 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Back to Chat
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between border-b bg-white/80 px-4 py-3 backdrop-blur">
              <div>
                <SheetTitle className="text-sm font-semibold tracking-wide text-slate-900">AI Tutor</SheetTitle>
                <SheetDescription className="text-xs text-slate-500">
                  Clear answers with focused steps.
                </SheetDescription>
              </div>
              <div className="flex items-center gap-1">
                {currentSessionId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={startNewChat}
                    title="Start new chat"
                    className="h-8 w-8 text-slate-600 hover:bg-slate-100"
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(true)}
                  title="View chat history"
                  className="h-8 w-8 text-slate-600 hover:bg-slate-100"
                >
                  <History className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-4 p-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3",
                      msg.sender === 'user' && 'justify-end'
                    )}
                  >
                    {msg.sender === 'AI' && (
                      <Avatar className="mt-0.5 h-7 w-7 border border-slate-200 bg-white shadow-sm">
                        <AvatarFallback className="bg-slate-100 text-slate-600">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed shadow-sm",
                        msg.sender === 'user'
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 bg-white'
                      )}
                    >
                      {msg.sender === 'AI' ? (
                        <div className="flex flex-col gap-2 text-left text-slate-800">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => (
                                <h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-slate-600">
                                  {children}
                                </h3>
                              ),
                              h2: ({ children }) => (
                                <h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-slate-600">
                                  {children}
                                </h3>
                              ),
                              h3: ({ children }) => (
                                <h3 className="m-0 text-sm font-semibold uppercase tracking-wide text-slate-600">
                                  {children}
                                </h3>
                              ),
                              p: ({ children }) => (
                                <p className="m-0 text-sm leading-relaxed text-slate-800">
                                  {children}
                                </p>
                              ),
                              ul: ({ children }) => (
                                <ul className="m-0 list-disc space-y-1 pl-4 text-sm text-slate-800">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="m-0 list-decimal space-y-1 pl-4 text-sm text-slate-800">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="leading-relaxed">{children}</li>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-slate-900">
                                  {children}
                                </strong>
                              ),
                              code: ({ children }) => (
                                <code className="rounded bg-slate-100 px-1 py-0.5 text-[0.85em]">
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className="m-0 overflow-x-auto rounded-lg bg-slate-100 p-2 text-xs">
                                  {children}
                                </pre>
                              ),
                            }}
                          >
                            {msg.message}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      )}
                    </div>
                    {msg.sender === 'user' && (
                      <Avatar className="mt-0.5 h-7 w-7 border border-slate-200 bg-white shadow-sm">
                        <AvatarImage
                          src={user.avatarUrl}
                          alt={user.name}
                          data-ai-hint="person face"
                        />
                        <AvatarFallback className="bg-slate-100 text-slate-600">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <Avatar className="mt-0.5 h-7 w-7 border border-slate-200 bg-white shadow-sm">
                      <AvatarFallback className="bg-slate-100 text-slate-600">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-slate-500">
                          AI is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <SheetFooter className="border-t bg-white/80 p-3 backdrop-blur">
              <form
                onSubmit={handleSendMessage}
                className="flex w-full items-end gap-2"
              >
                <Textarea
                  placeholder="Ask a question..."
                  className="min-h-[44px] max-h-32 flex-1 resize-none rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-slate-300"
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
                  disabled={isLoading || !input.trim()}
                  className="h-10 w-10 rounded-2xl bg-slate-900 text-white hover:bg-slate-800"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

