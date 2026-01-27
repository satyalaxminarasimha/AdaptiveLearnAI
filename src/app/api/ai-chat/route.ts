import { NextRequest, NextResponse } from 'next/server';
import { aiChatTutor } from '@/ai/flows/ai-chat-tutor';

// Role-specific system prompts
const rolePrompts: Record<string, string> = {
  student: `You are a friendly AI tutor helping a student. Focus on:
- Explaining concepts in simple, easy-to-understand language
- Using analogies and real-world examples
- Providing practice problems or exercises
- Encouraging the student and building confidence
- Adapting explanations to the student's level
Keep your tone supportive and motivating.`,

  professor: `You are an AI assistant helping a professor. Focus on:
- Suggesting effective teaching methods and strategies
- Recommending assessment techniques
- Helping with curriculum design and course structure
- Providing insights on student learning patterns
- Suggesting resources for professional development
- Supporting classroom innovation
Keep your tone professional and evidence-based.`,

  admin: `You are an AI assistant helping a platform administrator. Focus on:
- System optimization and management strategies
- User analytics and insights
- Platform improvement recommendations
- Compliance and best practices
- Performance optimization
- Data-driven decision making
Keep your tone analytical and strategic.`,
};

export async function POST(request: NextRequest) {
  try {
    const { question, userRole = 'student', userName = 'User', studentQuizHistory, subjectSyllabus, weakAreas, difficultyLevel } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Get role-specific prompt
    const roleSpecificPrompt = rolePrompts[userRole] || rolePrompts.student;

    // Prepare input for the AI flow with role context
    const input = {
      studentQuizHistory: `User Role: ${userRole}\nUser Name: ${userName}\n${studentQuizHistory || 'No quiz history available'}`,
      subjectSyllabus: subjectSyllabus || 'General curriculum',
      difficultyLevel: difficultyLevel || 'medium',
      weakAreas: weakAreas || 'General topics',
      question: question,
    };

    // Call the AI Chat Tutor flow
    const response = await aiChatTutor(input);

    return NextResponse.json({
      success: true,
      explanation: response.explanation,
      recommendations: response.recommendations,
      studyPlan: response.studyPlan,
      role: userRole,
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process your question',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
