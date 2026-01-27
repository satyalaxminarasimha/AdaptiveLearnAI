'use server';

/**
 * @fileOverview Generates a quiz from a syllabus topic using an LLM.
 *
 * - generateQuizFromSyllabus - A function that handles the quiz generation process.
 * - GenerateQuizFromSyllabusInput - The input type for the generateQuizFromSyllabus function.
 * - GenerateQuizFromSyllabusOutput - The return type for the generateQuizFromSyllabus function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizFromSyllabusInputSchema = z.object({
  syllabusTopic: z
    .string()
    .describe('The specific syllabus topic to generate a quiz for.'),
  difficultyLevel: z
    .string()
    .describe('The desired difficulty level of the quiz (e.g., easy, medium, hard).'),
  numberOfQuestions: z
    .number()
    .describe('The number of questions to generate for the quiz.'),
});
export type GenerateQuizFromSyllabusInput = z.infer<typeof GenerateQuizFromSyllabusInputSchema>;

const GenerateQuizFromSyllabusOutputSchema = z.object({
  quizQuestions: z.array(
    z.object({
      question: z.string().describe('The text of the quiz question.'),
      options: z.array(z.string()).describe('The possible answer options for the question.'),
      correctAnswer: z.string().describe('The correct answer to the question.'),
    })
  ).describe('A list of quiz questions generated from the syllabus topic.'),
});
export type GenerateQuizFromSyllabusOutput = z.infer<typeof GenerateQuizFromSyllabusOutputSchema>;

export async function generateQuizFromSyllabus(input: GenerateQuizFromSyllabusInput): Promise<GenerateQuizFromSyllabusOutput> {
  return generateQuizFromSyllabusFlow(input);
}

const generateQuizPrompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizFromSyllabusInputSchema},
  output: {schema: GenerateQuizFromSyllabusOutputSchema},
  prompt: `You are a quiz generator for professors. Generate a quiz with the specified number of questions, difficulty level, and topic.

Syllabus Topic: {{{syllabusTopic}}}
Difficulty Level: {{{difficultyLevel}}}
Number of Questions: {{{numberOfQuestions}}}

Output a JSON array of quiz questions. Each question object in the array must have the fields 'question', 'options', and 'correctAnswer'. The 'options' field should be a JSON array of strings.

Ensure that the questions are relevant to the syllabus topic and appropriate for the specified difficulty level.`,
});

const generateQuizFromSyllabusFlow = ai.defineFlow(
  {
    name: 'generateQuizFromSyllabusFlow',
    inputSchema: GenerateQuizFromSyllabusInputSchema,
    outputSchema: GenerateQuizFromSyllabusOutputSchema,
  },
  async input => {
    const {output} = await generateQuizPrompt(input);
    return output!;
  }
);
