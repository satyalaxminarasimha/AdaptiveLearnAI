'use server';

/**
 * @fileOverview AI-powered explanation of quiz questions and answers.
 * Provides detailed explanations for why an answer is correct/incorrect.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExplainQuizQuestionInputSchema = z.object({
  question: z.string().describe('The quiz question'),
  options: z.array(z.string()).describe('Available answer options'),
  selectedAnswer: z.number().describe('Index of selected option by student'),
  correctAnswer: z.number().describe('Index of correct answer'),
  topic: z.string().describe('Topic this question covers'),
  subtopic: z.string().optional().describe('Subtopic if applicable'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('Question difficulty level'),
  isCorrect: z.boolean().describe('Whether student answered correctly'),
});

export type ExplainQuizQuestionInput = z.infer<typeof ExplainQuizQuestionInputSchema>;

const ExplainQuizQuestionOutputSchema = z.object({
  explanation: z.string().describe('Detailed explanation of the answer'),
  whyCorrect: z.string().describe('Why the correct answer is right'),
  whyIncorrect: z.string().optional().describe('Why other options are wrong (if student was incorrect)'),
  keyPoints: z.array(z.string()).describe('Key concepts to remember'),
  relatedConcepts: z.array(z.string()).describe('Related topics to study'),
  studyTips: z.array(z.string()).describe('Personalized study tips for this topic'),
});

export type ExplainQuizQuestionOutput = z.infer<typeof ExplainQuizQuestionOutputSchema>;

export async function explainQuizQuestion(
  input: ExplainQuizQuestionInput
): Promise<ExplainQuizQuestionOutput> {
  return explainQuizQuestionFlow(input);
}

const explainPrompt = ai.definePrompt({
  name: 'explainQuizQuestionPrompt',
  input: { schema: ExplainQuizQuestionInputSchema },
  output: { schema: ExplainQuizQuestionOutputSchema },
  prompt: `You are an expert educational tutor providing detailed explanations for quiz questions.

QUESTION DETAILS:
Topic: {{{topic}}}
{{#if subtopic}}Subtopic: {{{subtopic}}}{{/if}}
Difficulty: {{{difficulty}}}

QUESTION: {{{question}}}

OPTIONS:
{{#each options}}
{{@index}}. {{{this}}}
{{/each}}

STUDENT'S ANSWER: Option {{selectedAnswer}} - "{{{options.[selectedAnswer]}}}"
CORRECT ANSWER: Option {{correctAnswer}} - "{{{options.[correctAnswer]}}}"
RESULT: {{#if isCorrect}}✓ CORRECT{{else}}✗ INCORRECT{{/if}}

PROVIDE DETAILED EXPLANATION:

1. **Overall Explanation** (2-3 sentences):
   - A clear, concise explanation of the concept being tested

2. **Why the Correct Answer is Right**:
   - {{#if isCorrect}}Explain why the student's answer (option {{selectedAnswer}}) is correct and the reasoning behind it{{else}}Explain why option {{correctAnswer}} is the correct answer and the reasoning behind it{{/if}}
   - Include relevant definitions or principles

3. {{#unless isCorrect}}**Why the Student's Answer is Incorrect**:
   - Identify which misconception or error led to selecting option {{selectedAnswer}}
   - Explain the difference between the selected and correct answer{{/unless}}

4. **Key Points to Remember** (2-3 bullet points):
   - Essential concepts for mastering this topic
   - Memory aids or mnemonics if helpful

5. **Related Concepts to Study**:
   - 2-3 related topics that build on this concept
   - Prerequisites that might need review

6. **Study Tips** (2-3 practical suggestions):
   - How to approach similar questions in the future
   - Resources or methods for deeper learning
   - {{#if isCorrect}}Congratulate the student and encourage them{{else}}Encourage the student and provide actionable steps for improvement{{/if}}

Keep the explanations clear, encouraging, and at an educational level appropriate for the difficulty level.`,
});

const explainQuizQuestionFlow = ai.defineFlow(
  {
    name: 'explainQuizQuestionFlow',
    inputSchema: ExplainQuizQuestionInputSchema,
    outputSchema: ExplainQuizQuestionOutputSchema,
  },
  async (input) => {
    const { output } = await explainPrompt(input);
    return output!;
  }
);
