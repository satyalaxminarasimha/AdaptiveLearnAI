"""
Example: How to add Textbook Processing to Admin Dashboard

This shows where and how to integrate the TextbookProcessingPanel
into your existing admin dashboard.
"""

# File: src/app/dashboard/admin/content-management/page.tsx
# (Create this new route or add to existing admin page)

'use client';

import { useAuth } from '@/context/auth-context';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextbookProcessingPanel } from '@/components/textbook-processing-panel';
import { BookOpen, Upload, FileText } from 'lucide-react';

export default function ContentManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');

  if (user?.role !== 'admin') {
    return <div>Access Denied</div>;
  }

  return (
    <main className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground">
          Manage textbooks, syllabi, and processed content for the platform
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">
            <Upload className="mr-2 h-4 w-4" />
            Process Textbook
          </TabsTrigger>
          <TabsTrigger value="processed">
            <BookOpen className="mr-2 h-4 w-4" />
            Processed Books
          </TabsTrigger>
          <TabsTrigger value="search">
            <FileText className="mr-2 h-4 w-4" />
            Search Content
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Upload & Process */}
        <TabsContent value="upload" className="space-y-4">
          <TextbookProcessingPanel />
        </TabsContent>

        {/* Tab 2: View Processed Textbooks */}
        <TabsContent value="processed">
          <Card>
            <CardHeader>
              <CardTitle>Processed Textbooks</CardTitle>
              <CardDescription>
                View all textbooks that have been extracted and processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Add ProcessedTextbooksTable component */}
              <p className="text-muted-foreground">
                Processed textbooks list coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Search Content */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Semantic Search</CardTitle>
              <CardDescription>
                Search across all processed textbook content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Add SemanticSearchPanel component */}
              <p className="text-muted-foreground">
                Semantic search interface coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
