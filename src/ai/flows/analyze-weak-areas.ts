'use server';

/**
 * @fileOverview An AI agent that analyzes student performance to identify weak areas.
 *
 * - analyzeWeakAreas - A function that handles the weak area analysis process.
 * - AnalyzeWeakAreasInput - The input type for the analyzeWeakAreas function.
 * - AnalyzeWeakAreasOutput - The return type for the analyzeWeakAreas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeWeakAreasInputSchema = z.object({
  studentQuizHistory: z.array(
    z.object({
      subject: z.string().describe('The subject of the quiz.'),
      topic: z.string().describe('The topic of the quiz.'),
      score: z.number().describe('The score of the quiz.'),
      totalQuestions: z.number().describe('The total number of questions in the quiz.'),
    })
  ).describe('The quiz history of the student, including subject, topic, score, and total questions.'),
  syllabus: z.array(
    z.object({
      subject: z.string().describe('The subject of the syllabus.'),
      topics: z.array(z.string()).describe('The topics covered in the syllabus.'),
    })
  ).describe('The syllabus of the course, including subject and topics.'),
});
export type AnalyzeWeakAreasInput = z.infer<typeof AnalyzeWeakAreasInputSchema>;

const AnalyzeWeakAreasOutputSchema = z.object({
  weakAreas: z.array(
    z.object({
      subject: z.string().describe('The subject in which the student is weak.'),
      topic: z.string().describe('The specific topic in which the student is weak.'),
      reason: z.string().describe('A simple, encouraging explanation of why this area might be challenging based on misunderstood concepts.'),
      recommendations: z.string().describe('A short, actionable list of recommendations for improvement.'),
    })
  ).describe('The weak areas of the student, including subject, topic, reason, and recommendations.'),
});
export type AnalyzeWeakAreasOutput = z.infer<typeof AnalyzeWeakAreasOutputSchema>;

export async function analyzeWeakAreas(input: AnalyzeWeakAreasInput): Promise<AnalyzeWeakAreasOutput> {
  return analyzeWeakAreasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeWeakAreasPrompt',
  input: {schema: AnalyzeWeakAreasInputSchema},
  output: {schema: AnalyzeWeakAreasOutputSchema},
  prompt: `You are a friendly and encouraging AI tutor for university students. Your goal is to analyze a student's quiz performance to identify conceptual weaknesses based on their wrong answers. A "weak area" is any topic where the student scores below 60%, which indicates a misunderstanding of core concepts.

For each identified weak area, you must infer the underlying concepts the student is struggling with and do the following:
1.  **Identify the Subject and Topic**: State the subject and the specific topic.
2.  **Explain the 'Why' (for the 'reason' field)**: Based on the topic, explain the core concepts the student likely misunderstood, leading to wrong answers. Be simple and encouraging. For example, 'In the "Trees" topic, a low score often means the concept of recursion is a bit tricky. This is a fundamental idea for how trees are processed.'
3.  **Provide Actionable Recommendations (for the 'recommendations' field)**: Give a short, bulleted or numbered list of 2-3 specific, easy-to-follow recommendations that directly address the conceptual weakness.

Keep your tone positive and supportive. Frame the weak areas as opportunities for growth.

Student Quiz History:
{{#each studentQuizHistory}}
- Subject: {{subject}}, Topic: {{topic}}, Score: {{score}} / {{totalQuestions}}
{{/each}}

Syllabus:
{{#each syllabus}}
- Subject: {{subject}}, Topics: {{#each topics}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}`,
});

const analyzeWeakAreasFlow = ai.defineFlow(
  {
    name: 'analyzeWeakAreasFlow',
    inputSchema: AnalyzeWeakAreasInputSchema,
    outputSchema: AnalyzeWeakAreasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
