'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, AlertTriangle, Info, Wrench, Megaphone } from 'lucide-react';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/api';

interface ContentItem {
  _id: string;
  title: string;
  content: string;
  type: 'announcement' | 'system-update' | 'policy' | 'maintenance' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  publishedAt: string;
  createdBy: { name: string };
}

interface ContentDisplayProps {
  limit?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export function ContentDisplay({ limit = 5, showHeader = true, compact = false }: ContentDisplayProps) {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContents();
  }, [limit]);

  const fetchContents = async () => {
    try {
      const response = await apiRequest(`/api/content?limit=${limit}`);
      const data = await response.json();
      setContents(data.contents || []);
    } catch (err) {
      setError('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Megaphone className="h-4 w-4" />;
      case 'system-update': return <Info className="h-4 w-4" />;
      case 'policy': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'system-update': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'policy': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'maintenance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Announcements
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Announcements
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (contents.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Announcements
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-sm text-muted-foreground">No announcements at this time.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Announcements
          </CardTitle>
          <CardDescription>
            Latest updates and important notices
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <ScrollArea className={compact ? "h-64" : "h-96"}>
          <div className="space-y-4">
            {contents.map((item) => (
              <div key={item._id} className="border-l-4 border-l-primary/20 pl-4 py-2">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(item.type)}
                    <Badge className={getTypeColor(item.type)}>
                      {item.type.replace('-', ' ')}
                    </Badge>
                    <Badge variant={getPriorityColor(item.priority)} className="text-xs">
                      {item.priority}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(item.publishedAt), 'MMM dd')}
                  </span>
                </div>
                <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.content}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  By {item.createdBy.name}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
        {contents.length >= limit && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" className="w-full">
              View All Announcements
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}