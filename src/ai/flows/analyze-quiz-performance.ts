'use server';

/**
 * @fileOverview AI-powered analysis of student quiz performance.
 * Identifies weak topics, subtopics, and prerequisites for teacher review.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeQuizPerformanceInputSchema = z.object({
  studentName: z.string().describe('Name of the student'),
  subject: z.string().describe('Subject name'),
  unitName: z.string().describe('Unit name'),
  totalQuestions: z.number().describe('Total questions in quiz'),
  score: z.number().describe('Student score'),
  questionResults: z.array(z.object({
    question: z.string(),
    topic: z.string(),
    subtopic: z.string().optional(),
    prerequisites: z.array(z.string()).optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    isCorrect: z.boolean(),
    selectedOption: z.number(),
    correctOption: z.number(),
  })).describe('Detailed results for each question'),
});
export type AnalyzeQuizPerformanceInput = z.infer<typeof AnalyzeQuizPerformanceInputSchema>;

const AnalyzeQuizPerformanceOutputSchema = z.object({
  overallAnalysis: z.string().describe('Overall performance summary'),
  strengthAreas: z.array(z.object({
    topic: z.string(),
    accuracy: z.number(),
    comment: z.string(),
  })).describe('Topics where student performed well'),
  weakAreas: z.array(z.object({
    topic: z.string(),
    subtopics: z.array(z.string()),
    prerequisites: z.array(z.string()),
    accuracy: z.number(),
    severity: z.enum(['critical', 'needs_work', 'minor']),
    recommendation: z.string(),
  })).describe('Topics where student needs improvement'),
  difficultyAnalysis: z.object({
    easy: z.object({ correct: z.number(), total: z.number() }),
    medium: z.object({ correct: z.number(), total: z.number() }),
    hard: z.object({ correct: z.number(), total: z.number() }),
  }).describe('Performance by difficulty level'),
  recommendations: z.array(z.string()).describe('Personalized study recommendations'),
  predictedGrade: z.string().describe('Predicted grade based on performance'),
  improvementPlan: z.string().describe('Suggested improvement plan'),
});
export type AnalyzeQuizPerformanceOutput = z.infer<typeof AnalyzeQuizPerformanceOutputSchema>;

export async function analyzeQuizPerformance(input: AnalyzeQuizPerformanceInput): Promise<AnalyzeQuizPerformanceOutput> {
  return analyzeQuizPerformanceFlow(input);
}

const analyzePrompt = ai.definePrompt({
  name: 'analyzeQuizPerformancePrompt',
  input: { schema: AnalyzeQuizPerformanceInputSchema },
  output: { schema: AnalyzeQuizPerformanceOutputSchema },
  prompt: `You are an expert educational analyst helping identify student weaknesses for personalized learning.

Student: {{{studentName}}}
Subject: {{{subject}}}
Unit: {{{unitName}}}
Score: {{{score}}} / {{{totalQuestions}}} ({{percentage}}%)

Question-by-Question Results:
{{#each questionResults}}
{{@index}}. Topic: {{topic}}{{#if subtopic}} | Subtopic: {{subtopic}}{{/if}}
   Difficulty: {{difficulty}} | Result: {{#if isCorrect}}✓ Correct{{else}}✗ Wrong (Selected: {{selectedOption}}, Correct: {{correctOption}}){{/if}}
   {{#if prerequisites}}Prerequisites: {{#each prerequisites}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{/each}}

ANALYSIS REQUIREMENTS:

1. Overall Analysis: Provide a comprehensive summary of performance (2-3 sentences)

2. Strength Areas: Identify topics where accuracy >= 70%
   - Include accuracy percentage and encouraging comment

3. Weak Areas: Identify topics where accuracy < 60%
   - List specific subtopics that need work
   - Identify prerequisite concepts that may be missing
   - Assign severity: critical (<30%), needs_work (30-50%), minor (50-60%)
   - Provide specific recommendations for each weak area

4. Difficulty Analysis: Calculate correct/total for each difficulty level

5. Recommendations: Provide 3-5 actionable study recommendations

6. Predicted Grade: Based on score percentage:
   - A: >= 90%
   - B: 80-89%
   - C: 70-79%
   - D: 60-69%
   - F: < 60%

7. Improvement Plan: A detailed paragraph on how the student should approach studying the weak areas

Be specific, constructive, and encouraging while being honest about areas needing improvement.`,
});

const analyzeQuizPerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeQuizPerformanceFlow',
    inputSchema: AnalyzeQuizPerformanceInputSchema,
    outputSchema: AnalyzeQuizPerformanceOutputSchema,
  },
  async (input) => {
    // Calculate percentage for the prompt
    const percentage = Math.round((input.score / input.totalQuestions) * 100);
    const { output } = await analyzePrompt({ ...input, percentage } as any);
    return output!;
  }
);
