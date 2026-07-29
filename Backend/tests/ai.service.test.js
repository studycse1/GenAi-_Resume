import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeInterviewReportResponse } from '../src/services/ai.service.js';

test('normalizes partial AI payload into a fixed canonical report shape', () => {
  const input = {
    interview_report: {
      match_score: 82,
      technical_questions: [
        {
          question: 'What is the event loop?',
          intention: 'Check JavaScript fundamentals',
          answer: 'Explain the event loop and callback queue.',
        },
      ],
      behavioral_questions: [
        {
          question: 'Tell me about a time you resolved conflict.',
          intention: 'Assess collaboration',
          answer: 'Use the STAR approach.',
        },
      ],
      preparation_plan: [
        {
          day: 1,
          focus: 'JavaScript fundamentals',
          tasks: ['Revise closures', 'Practice async patterns'],
        },
      ],
    },
  };

  const result = normalizeInterviewReportResponse(input);

  assert.equal(result.matchScore, 82);
  assert.deepEqual(result.technicalQuestions, [
    {
      question: 'What is the event loop?',
      intention: 'Check JavaScript fundamentals',
      answer: 'Explain the event loop and callback queue.',
    },
  ]);
  assert.deepEqual(result.behavioralQuestions, [
    {
      question: 'Tell me about a time you resolved conflict.',
      intention: 'Assess collaboration',
      answer: 'Use the STAR approach.',
    },
  ]);
  assert.deepEqual(result.preparationPlan, [
    {
      day: 1,
      focus: 'JavaScript fundamentals',
      tasks: ['Revise closures', 'Practice async patterns'],
    },
  ]);
  assert.equal(result.skillGaps.length, 1);
  assert.equal(result.skillGaps[0].skill, 'Strengthen core interview fundamentals');
});

test('falls back to a complete canonical report shape when the AI payload is incomplete', () => {
  const result = normalizeInterviewReportResponse({});

  assert.equal(result.matchScore, 0);
  assert.equal(result.technicalQuestions.length, 1);
  assert.equal(result.behavioralQuestions.length, 1);
  assert.equal(result.skillGaps.length, 1);
  assert.equal(result.preparationPlan.length, 3);
  assert.equal(result.preparationPlan[0].tasks.length > 0, true);
});
