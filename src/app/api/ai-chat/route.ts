import { NextRequest, NextResponse } from 'next/server';
import { aiChatTutor } from '@/ai/flows/ai-chat-tutor';
import { checkRateLimit, getClientIP, rateLimitResponse, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { buildKnowledgeContext, getProfessorClassContext } from '@/lib/knowledge-context';

// Retry configuration for external API calls
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // Start with 1 second

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isTransientProviderError(error: any): boolean {
  const msg = String(error?.message || '').toLowerCase();
  const status = error?.status;
  const code = error?.code;

  return (
    status === 503 ||
    code === 503 ||
    status === 'UNAVAILABLE' ||
    msg.includes('503') ||
    msg.includes('service unavailable') ||
    msg.includes('currently experiencing high demand') ||
    msg.includes('unavailable') ||
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('econnreset') ||
    msg.includes('eai_again') ||
    msg.includes('gateway timeout')
  );
}

async function callWithRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimitError = 
        error?.message?.includes('429') || 
        error?.message?.includes('rate limit') ||
        error?.message?.includes('quota') ||
        error?.message?.includes('Too Many Requests') ||
        error?.status === 429;
      
      const isTransientError = isTransientProviderError(error);

      if ((isRateLimitError || isTransientError) && attempt < retries) {
        // Exponential backoff: 1s, 2s, 4s...
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`AI provider temporary error, retrying in ${delay}ms (attempt ${attempt}/${retries})`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

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
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting per IP
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(`ai-chat:${clientIP}`, RATE_LIMIT_CONFIGS.aiChat);
    
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetIn);
    }

    await dbConnect();

    const body = await request.json();
    const { question, userRole = payload.role || 'student', userName = 'User', studentQuizHistory, subjectSyllabus, weakAreas, difficultyLevel, batch, section, subject, unitName, unitNumber } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(payload.userId).select('name role batch section classesTeaching').lean();
    const resolvedClass = userRole === 'professor'
      ? await getProfessorClassContext(payload.userId, { batch, section, subject })
      : {
          batch: user?.batch || batch,
          section: user?.section || section,
          subject: subject || undefined,
        };

    const knowledgeContext = await buildKnowledgeContext(request.nextUrl.origin, {
      batch: resolvedClass?.batch || batch || user?.batch,
      section: resolvedClass?.section || section || user?.section,
      subject: resolvedClass?.subject || subject,
      unitName,
      unitNumber,
      question,
      limit: 6,
    });

    // Prepare input for the AI flow with role context
    const input = {
      studentQuizHistory: `User Role: ${userRole}\nUser Name: ${userName}\n${studentQuizHistory || 'No quiz history available'}`,
      subjectSyllabus: subjectSyllabus || knowledgeContext.syllabusSummary || 'General curriculum',
      knowledgeContext: knowledgeContext.textbookContext || 'No retrieved textbook context available',
      difficultyLevel: difficultyLevel || 'medium',
      weakAreas: weakAreas || 'General topics',
      question: question,
    };

    // Call the AI Chat Tutor flow with retry logic
    const response = await callWithRetry(() => aiChatTutor(input));

    return NextResponse.json({
      success: true,
      explanation: response.explanation,
      recommendations: response.recommendations,
      studyPlan: response.studyPlan,
      role: userRole,
    });
  } catch (error: any) {
    console.error('AI Chat error:', error);
    
    const msg = error?.message || String(error);

    // Check if API key is expired/invalid
    if (msg.includes('API key expired') || msg.includes('API_KEY_INVALID')) {
      return NextResponse.json(
        { 
          error: 'Google AI API key has expired. Please renew the GOOGLE_API_KEY in your .env.local file.',
        },
        { status: 503 }
      );
    }
    
    // Check if it's a rate limit error from the AI provider
    const isRateLimitError = 
      msg.includes('429') || 
      msg.includes('rate limit') ||
      msg.includes('quota') ||
      msg.includes('Too Many Requests');
    
    if (isRateLimitError) {
      return NextResponse.json(
        { 
          error: 'AI service is currently busy',
          message: 'Too many requests to AI service. Please wait a moment and try again.',
          retryAfter: 30
        },
        { 
          status: 429,
          headers: { 'Retry-After': '30' }
        }
      );
    }

    if (isTransientProviderError(error)) {
      return NextResponse.json(
        {
          error: 'AI model is temporarily overloaded',
          message: 'The AI provider is experiencing high demand. Please try again in a few moments.',
          retryAfter: 20,
        },
        {
          status: 503,
          headers: { 'Retry-After': '20' },
        }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to process your question',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
