import { config } from 'dotenv';
config();

import '@/ai/flows/generate-quiz-from-syllabus.ts';
import '@/ai/flows/analyze-weak-areas.ts';
import '@/ai/flows/ai-chat-tutor.ts';
import '@/ai/flows/personalize-learning-path.ts';