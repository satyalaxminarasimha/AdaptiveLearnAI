'use server';

/**
 * @fileOverview Generates a comprehensive quiz from a unit's topics using AI.
 * Creates 30 questions covering all topics in the unit with varying difficulty.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateUnitQuizInputSchema = z.object({
  unitName: z.string().describe('The name of the unit (e.g., "Unit I")'),
  subject: z.string().describe('The subject name'),
  topics: z.array(z.string()).describe('List of topics in this unit'),
  numberOfQuestions: z.number().default(30).describe('Number of questions to generate'),
});
export type GenerateUnitQuizInput = z.infer<typeof GenerateUnitQuizInputSchema>;

const QuestionSchema = z.object({
  question: z.string().describe('The quiz question text'),
  options: z.array(z.string()).length(4).describe('Four answer options'),
  correctAnswer: z.number().min(0).max(3).describe('Index of correct option (0-3)'),
  explanation: z.string().describe('Explanation for the correct answer'),
  topic: z.string().describe('The specific topic this question is about'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('Question difficulty'),
  subtopic: z.string().optional().describe('Specific subtopic or concept tested'),
  prerequisites: z.array(z.string()).optional().describe('Prerequisite concepts needed'),
});

const GenerateUnitQuizOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('Array of generated quiz questions'),
  unitSummary: z.string().describe('Brief summary of what this unit covers'),
  topicCoverage: z.array(z.object({
    topic: z.string(),
    questionCount: z.number(),
  })).describe('Number of questions per topic'),
});
export type GenerateUnitQuizOutput = z.infer<typeof GenerateUnitQuizOutputSchema>;

export async function generateUnitQuiz(input: GenerateUnitQuizInput): Promise<GenerateUnitQuizOutput> {
  return generateUnitQuizFlow(input);
}

const generateUnitQuizPrompt = ai.definePrompt({
  name: 'generateUnitQuizPrompt',
  input: { schema: GenerateUnitQuizInputSchema },
  output: { schema: GenerateUnitQuizOutputSchema },
  prompt: `You are an expert professor creating a comprehensive assessment quiz for university students.

Subject: {{{subject}}}
Unit: {{{unitName}}}
Number of Questions Required: {{{numberOfQuestions}}}

Topics to cover in this unit:
{{#each topics}}
- {{this}}
{{/each}}

IMPORTANT INSTRUCTIONS:
1. Generate EXACTLY {{{numberOfQuestions}}} multiple-choice questions
2. Distribute questions evenly across ALL topics listed above
3. For each topic, include questions of varying difficulty (easy, medium, hard)
4. Each question MUST have exactly 4 options
5. Provide clear explanations for correct answers
6. Identify the specific subtopic/concept being tested
7. List prerequisite concepts students should know
8. Questions should test conceptual understanding, not just memorization

For difficulty distribution:
- Easy (30%): Direct concept recall and basic understanding
- Medium (50%): Application of concepts and analysis
- Hard (20%): Complex problem-solving and synthesis of multiple concepts

Output a JSON object with:
- questions: Array of question objects
- unitSummary: Brief 2-3 sentence summary of the unit
- topicCoverage: Array showing how many questions per topic

Ensure questions are academically rigorous and test real understanding of the subject matter.`,
});

const generateUnitQuizFlow = ai.defineFlow(
  {
    name: 'generateUnitQuizFlow',
    inputSchema: GenerateUnitQuizInputSchema,
    outputSchema: GenerateUnitQuizOutputSchema,
  },
  async (input) => {
    const { output } = await generateUnitQuizPrompt(input);
    return output!;
  }
);
