'use server';

/**
 * @fileOverview A personalized learning path AI agent.
 *
 * - personalizeLearningPath - A function that handles the generation of a personalized learning path.
 * - PersonalizeLearningPathInput - The input type for the personalizeLearningPath function.
 * - PersonalizeLearningPathOutput - The return type for the personalizeLearningPath function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizeLearningPathInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  quizResults: z.array(
    z.object({
      quizId: z.string().describe('The ID of the quiz.'),
      score: z.number().describe('The student\'s score on the quiz.'),
      topic: z.string().describe('The topic of the quiz.'),
    })
  ).describe('The quiz results of the student.'),
  syllabus: z.string().describe('The syllabus of the course.'),
});

export type PersonalizeLearningPathInput = z.infer<typeof PersonalizeLearningPathInputSchema>;

const PersonalizeLearningPathOutputSchema = z.object({
  learningPath: z.string().describe('A personalized learning path for the student.'),
});

export type PersonalizeLearningPathOutput = z.infer<typeof PersonalizeLearningPathOutputSchema>;

export async function personalizeLearningPath(input: PersonalizeLearningPathInput): Promise<PersonalizeLearningPathOutput> {
  return personalizeLearningPathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizeLearningPathPrompt',
  input: {schema: PersonalizeLearningPathInputSchema},
  output: {schema: PersonalizeLearningPathOutputSchema},
  prompt: `You are an AI tutor that personalizes learning paths for students based on their quiz results and identified weak areas.

  Student ID: {{{studentId}}}
  Quiz Results: {{{quizResults}}}
  Syllabus: {{{syllabus}}}

  Based on the student's quiz results and the syllabus, create a personalized learning path for the student. The learning path should focus on the student's weak areas and provide recommendations for improving their understanding of specific topics.
  `,
});

const personalizeLearningPathFlow = ai.defineFlow(
  {
    name: 'personalizeLearningPathFlow',
    inputSchema: PersonalizeLearningPathInputSchema,
    outputSchema: PersonalizeLearningPathOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
