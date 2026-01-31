'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useProfessorSession } from '@/context/professor-session-context';
import { MessageCircle, Send, Users, Plus, Loader2, GraduationCap, BookOpen } from 'lucide-react';

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

export default function ProfessorDiscussionsPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoomSubject, setNewRoomSubject] = useState('');
  const [newRoomBatch, setNewRoomBatch] = useState('');
  const [newRoomSection, setNewRoomSection] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { availableClasses, selectedClass } = useProfessorSession();

  const fetchChatRooms = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch all subject rooms created by this professor
      const res = await fetch('/api/public-chat?roomType=subject', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Filter to show only rooms created by this professor
        const myRooms = data.filter((room: ChatRoom) => 
          room.professorId?._id === user?._id || room.professorId?._id === user?.id
        );
        setChatRooms(myRooms);
      }
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?._id, user?.id]);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Pre-fill from selected class
  useEffect(() => {
    if (selectedClass && isCreateDialogOpen) {
      setNewRoomSubject(selectedClass.subject);
      setNewRoomBatch(selectedClass.batch);
      setNewRoomSection(selectedClass.section);
    }
  }, [selectedClass, isCreateDialogOpen]);

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

  const createChatRoom = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/public-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomType: 'subject',
          subject: newRoomSubject,
          batch: newRoomBatch,
          section: newRoomSection,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Chat Room Created',
          description: 'Your discussion forum is now ready.',
        });
        setIsCreateDialogOpen(false);
        setNewRoomSubject('');
        setNewRoomBatch('');
        setNewRoomSection('');
        fetchChatRooms();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create chat room',
      });
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
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Discussions</h1>
          <p className="text-muted-foreground">Interact with your students in subject-based forums</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Create Forum
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Discussion Forum</DialogTitle>
              <DialogDescription>
                Create a new forum for your subject to interact with students.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={newRoomSubject}
                  onChange={(e) => setNewRoomSubject(e.target.value)}
                  placeholder="e.g., Data Structures"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Batch</Label>
                  <Select value={newRoomBatch} onValueChange={setNewRoomBatch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2021">2021</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select value={newRoomSection} onValueChange={setNewRoomSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Section A</SelectItem>
                      <SelectItem value="B">Section B</SelectItem>
                      <SelectItem value="C">Section C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createChatRoom} disabled={!newRoomSubject}>
                  Create Forum
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Room List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Your Forums</CardTitle>
            <CardDescription>Subject-based discussion rooms</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[450px]">
              {chatRooms.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No forums yet</p>
                  <p className="text-sm">Create your first discussion forum</p>
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
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <GraduationCap className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{room.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            Batch {room.batch} - Section {room.section}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2">
          {selectedRoom ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedRoom.subject}</CardTitle>
                    <CardDescription>
                      Batch {selectedRoom.batch} - Section {selectedRoom.section}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    <Users className="w-3 h-3 mr-1" />
                    {selectedRoom.participantCount || 0} participants
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[500px]">
                <ScrollArea className="flex-1 p-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the discussion with your students!</p>
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
                              <AvatarFallback>
                                {msg.senderName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-[70%] ${msg.senderId === user?.id ? 'order-first' : ''}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{msg.senderName}</span>
                              {msg.senderRole === 'student' && (
                                <Badge variant="outline" className="text-xs">Student</Badge>
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
              <h3 className="text-lg font-medium mb-2">Select a Forum</h3>
              <p className="text-center">Choose a discussion forum to interact with your students.</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
