'use server';
/**
 * @fileOverview An AI chat tutor flow for students.
 *
 * - aiChatTutor - A function that handles the AI chat tutor process.
 * - AIChatTutorInput - The input type for the aiChatTutor function.
 * - AIChatTutorOutput - The return type for the aiChatTutor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatTutorInputSchema = z.object({
  studentQuizHistory: z.string().describe('The student\'s quiz history.'),
  subjectSyllabus: z.string().describe('The subject syllabus.'),
  difficultyLevel: z.string().describe('The difficulty level of the questions.'),
  weakAreas: z.string().describe('The student\'s weak areas.'),
  question: z.string().describe('The question asked by the student.'),
});
export type AIChatTutorInput = z.infer<typeof AIChatTutorInputSchema>;

const AIChatTutorOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the concept.'),
  recommendations: z.string().describe('The recommendations for further study.'),
  studyPlan: z.string().describe('The study plan for the student.'),
});
export type AIChatTutorOutput = z.infer<typeof AIChatTutorOutputSchema>;

export async function aiChatTutor(input: AIChatTutorInput): Promise<AIChatTutorOutput> {
  return aiChatTutorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatTutorPrompt',
  input: {schema: AIChatTutorInputSchema},
  output: {schema: AIChatTutorOutputSchema},
  system: `You are a helpful and knowledgeable AI assistant. Your responses will vary based on the user's role:

**For Students**: You are a friendly tutor. Help them understand concepts using simple language, analogies, and practical examples. Be encouraging and supportive. Provide study tips and practice suggestions.

**For Professors**: You are a professional colleague. Help with teaching strategies, curriculum design, student assessment, and educational best practices. Be evidence-based and forward-thinking.

**For Admins**: You are a strategic partner. Help with platform optimization, analytics insights, user management strategies, and data-driven improvements.

Analyze the context provided (including the user's role and quiz history) and provide:
1. A clear, relevant explanation tailored to the user's role
2. Actionable recommendations specific to their needs
3. A practical plan or next steps

Context:
- User Information: {{{studentQuizHistory}}}
- Subject Material: {{{subjectSyllabus}}}
- Focus Areas: {{{weakAreas}}}
- Difficulty Level: {{{difficultyLevel}}}
`,
  prompt: `The user asked: {{{question}}}

Based on their role, background, and the context provided, give a comprehensive response with:
1. **Explanation**: A clear, role-appropriate explanation or insight
2. **Recommendations**: Specific, actionable steps they can take
3. **Plan**: A concrete next-step plan or study/action plan

Tailor your response to match the user's role and needs.`,
});

const aiChatTutorFlow = ai.defineFlow(
  {
    name: 'aiChatTutorFlow',
    inputSchema: AIChatTutorInputSchema,
    outputSchema: AIChatTutorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
