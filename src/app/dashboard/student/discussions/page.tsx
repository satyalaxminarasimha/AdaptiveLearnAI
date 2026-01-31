'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useStudentSession } from '@/context/student-session-context';
import { MessageCircle, Send, Users, BookOpen, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChatRoom {
  _id: string;
  roomType: 'class' | 'subject';
  batch?: string;
  section?: string;
  subject?: string;
  professorId?: { _id: string; name: string; expertise: string };
  participantCount?: number;
}

interface Message {
  _id?: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'professor';
  message: string;
  timestamp: string;
}

export default function StudentPublicChatPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('class');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { session } = useStudentSession();

  const fetchChatRooms = useCallback(async () => {
    if (!session?.batch || !session?.section) {
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // For class discussions, filter by student's batch and section
      let url = `/api/public-chat?roomType=${activeTab}`;
      if (activeTab === 'class') {
        url += `&batch=${session.batch}&section=${session.section}`;
      }
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // For subject discussions, filter to show only rooms relevant to student's batch
        let filteredRooms = data;
        if (activeTab === 'subject') {
          filteredRooms = data.filter((room: ChatRoom) => 
            room.batch === session.batch && room.section === session.section
          );
        }
        setChatRooms(filteredRooms);
      }
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, session?.batch, session?.section]);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages();
      // Poll for new messages every 5 seconds
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    if (!selectedRoom) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/public-chat/${selectedRoom._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  // Create class discussion room for student's batch/section if it doesn't exist
  const createClassRoom = async () => {
    if (!session?.batch || !session?.section) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/public-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomType: 'class',
          batch: session.batch,
          section: session.section,
        }),
      });

      if (res.ok) {
        fetchChatRooms();
        toast({
          title: 'Success',
          description: 'Class discussion room created!',
        });
      }
    } catch (error) {
      console.error('Failed to create class room:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;
    
    setIsSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/public-chat/${selectedRoom._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (res.ok) {
        setNewMessage('');
        fetchMessages();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to send message',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Network error. Please try again.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const getRoomName = (room: ChatRoom) => {
    if (room.roomType === 'subject') {
      return `${room.subject} - ${room.professorId?.name || 'Professor'}`;
    }
    return `Batch ${room.batch} - Section ${room.section}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show alert if session info is missing
  if (!session?.batch || !session?.section) {
    return (
      <div className="space-y-6 animate-fadeIn p-4 md:p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discussion Forums</h1>
          <p className="text-muted-foreground">Chat with your professors and classmates</p>
        </div>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your batch and section information is not set. Please contact an administrator to update your profile.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Discussion Forums</h1>
        <p className="text-muted-foreground">
          Chat with your professors and classmates in{' '}
          <Badge variant="outline">{session.batch} - Section {session.section}</Badge>
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Room List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Chat Rooms</CardTitle>
            <CardDescription>
              Discussions for your class session only
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full rounded-none border-b">
                <TabsTrigger value="class" className="flex-1 gap-2">
                  <Users className="w-4 h-4" /> Class
                </TabsTrigger>
                <TabsTrigger value="subject" className="flex-1 gap-2">
                  <BookOpen className="w-4 h-4" /> Subjects
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="m-0">
                <ScrollArea className="h-[400px]">
                  {chatRooms.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="mb-2">No chat rooms available</p>
                      {activeTab === 'class' && (
                        <Button variant="outline" size="sm" onClick={createClassRoom}>
                          Create Class Discussion
                        </Button>
                      )}
                      {activeTab === 'subject' && (
                        <p className="text-sm">Ask your professor to create a subject discussion forum.</p>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y">
                      {chatRooms.map((room) => (
                        <button
                          key={room._id}
                          className={`w-full p-4 text-left hover:bg-muted transition-colors ${
                            selectedRoom?._id === room._id ? 'bg-primary/5 border-l-2 border-primary' : ''
                          }`}
                          onClick={() => setSelectedRoom(room)}
                        >
                          <p className="font-medium">{getRoomName(room)}</p>
                          <p className="text-sm text-muted-foreground">
                            {room.roomType === 'subject' ? room.professorId?.expertise : `${room.batch} Students`}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2">
          {selectedRoom ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{getRoomName(selectedRoom)}</CardTitle>
                    <CardDescription>
                      {selectedRoom.roomType === 'subject' 
                        ? `Professor: ${selectedRoom.professorId?.name}`
                        : `Class discussion forum`
                      }
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    <Users className="w-3 h-3 mr-1" />
                    {selectedRoom.participantCount || 0} members
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[500px]">
                <ScrollArea className="flex-1 p-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex gap-3 ${msg.senderId === user?.id ? 'justify-end' : ''}`}
                        >
                          {msg.senderId !== user?.id && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className={msg.senderRole === 'professor' ? 'bg-primary text-primary-foreground' : ''}>
                                {msg.senderName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-[70%] ${msg.senderId === user?.id ? 'order-first' : ''}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{msg.senderName}</span>
                              {msg.senderRole === 'professor' && (
                                <Badge variant="secondary" className="text-xs">Professor</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className={`rounded-lg p-3 ${
                              msg.senderId === user?.id 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              {msg.message}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
                <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isSending}
                  />
                  <Button type="submit" disabled={isSending || !newMessage.trim()}>
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
              <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a Chat Room</h3>
              <p className="text-center">Choose a subject or class chat to start discussing with your professors and classmates.</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
