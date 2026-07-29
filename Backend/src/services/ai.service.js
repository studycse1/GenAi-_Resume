import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "A score between 0 and 100 indicating how well the candidate's resume and self-description match the job description, with higher scores indicating a better match.",
    ),
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question will be asked in the interview"),
        intention: z
          .string()
          .describe("The intention behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question effectively and what points to cover in the answer",
          ),
      }),
    )
    .describe(
      "A list of technical questions that are likely to be asked in the interview, along with the intention behind each question and guidance on how to answer them effectively.",
    ),
  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe(
            "The behavioral question will be asked in the interview",
          ),
        intention: z
          .string()
          .describe("The intention behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question effectively and what points to cover in the answer",
          ),
      }),
    )
    .describe(
      "A list of behavioral questions that are likely to be asked in the interview, along with the intention behind each question and guidance on how to answer them effectively.",
    ),
  skillGaps: z
    .array(
      z.object({
        skill: z
          .string()
          .describe(
            "The skill gap that the candidate needs to work on to improve their chances of success in the interview",
          ),
        severity: z
          .enum(["Low", "Medium", "High"])
          .describe(
            "The severity of the skill gap, indicating how critical it is for the candidate to address it before the interview",
          ),
        context: z
          .string()
          .describe("A short explanation of why this skill gap matters"),
      }),
    )
    .describe(
      "A list of skill gaps that the candidate needs to work on to improve their chances of success in the interview, along with an assessment of the severity of each gap.",
    ),
  preparationPlan: z
    .array(
      z.object({
        day: z
          .number()
          .describe(
            "The day number in the preparation plan, indicating how many days are left until the interview",
          ),
        focus: z
          .string()
          .describe(
            "The main focus or theme for that day of preparation, such as technical skills, behavioral questions, or mock interviews",
          ),
        tasks: z
          .array(z.string())
          .describe(
            "A list of specific tasks or activities that the candidate should complete on that day to effectively prepare for the interview",
          ),
      }),
    )
    .describe(
      "A structured preparation plan that outlines specific tasks and activities for each day leading up to the interview, helping the candidate to systematically prepare and improve their chances of success.",
    ),
});

const getFirstMeaningful = (...values) => values.find((value) => {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim() !== '';
  }

  return true;
});

const normalizeText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const buildFallbackQuestionItems = (count, fallbackIntention = '') => {
  return Array.from({ length: count }, (_, index) => ({
    question: `Practice a ${index === 0 ? 'core' : 'advanced'} interview response relevant to the role.`,
    intention: fallbackIntention || 'Assess role readiness',
    answer: 'Use a structured explanation that highlights relevant experience, impact, and learning mindset.',
  }));
};

const normalizeQuestionItems = (items, fallbackIntention = '') => {
  if (!Array.isArray(items)) {
    return buildFallbackQuestionItems(1, fallbackIntention);
  }

  const normalized = items.flatMap((item) => {
    if (typeof item === 'string') {
      return [{ question: item, intention: fallbackIntention, answer: '' }];
    }

    if (!item || typeof item !== 'object') {
      return [];
    }

    const questionValues = Array.isArray(item.questions)
      ? item.questions
      : Array.isArray(item.question)
        ? item.question
        : [item.question ?? item.questions].filter(Boolean);

    const intention = getFirstMeaningful(
      item.intention,
      item.Intention,
      item.topic,
      item.category,
      item.scenario,
      fallbackIntention,
    );
    const answer = getFirstMeaningful(item.answer, item.guidance, item.sampleAnswer, item.sample_answer, '');

    if (questionValues.length === 0) {
      return [{ question: '', intention, answer }];
    }

    return questionValues.map((question) => ({
      question: normalizeText(typeof question === 'string' ? question : ''),
      intention,
      answer,
    }));
  });

  return normalized.length > 0 ? normalized : buildFallbackQuestionItems(1, fallbackIntention);
};

const normalizeSkillGaps = (items) => {
  if (!Array.isArray(items)) {
    return [{ skill: 'Strengthen core interview fundamentals', severity: 'Medium', context: 'Build confidence with structured answers and role-specific examples.' }];
  }

  const normalized = items.map((item) => {
    if (typeof item === 'string') {
      return { skill: item, severity: 'Medium', context: '' };
    }

    if (!item || typeof item !== 'object') {
      return { skill: '', severity: 'Medium', context: '' };
    }

    const severityValue = normalizeText(item.severity || item.level || '').toLowerCase();
    const severity = severityValue === 'low' ? 'Low' : severityValue === 'high' ? 'High' : 'Medium';

    return {
      skill: normalizeText(item.skill || item.skillGap || item.skill_name || item.gap || item.description || ''),
      severity,
      context: normalizeText(item.context || item.detail || item.reason || item.justification || ''),
    };
  }).filter((item) => item.skill);

  return normalized.length > 0 ? normalized : [{ skill: 'Strengthen core interview fundamentals', severity: 'Medium', context: 'Build confidence with structured answers and role-specific examples.' }];
};

const normalizePreparationPlan = (value) => {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [
        { day: 1, focus: 'Review core fundamentals', tasks: ['Revisit the job description', 'List your strongest examples'] },
        { day: 2, focus: 'Practice communication', tasks: ['Answer 3 behavioral questions', 'Refine your STAR stories'] },
        { day: 3, focus: 'Prepare for delivery', tasks: ['Do a mock interview', 'Record and review your answers'] },
      ];
    }

    return value.map((item, index) => {
      const tasks = Array.isArray(item?.tasks)
        ? item.tasks
        : Array.isArray(item?.actions)
          ? item.actions
          : typeof item?.tasks === 'string'
            ? [item.tasks]
            : typeof item?.actions === 'string'
              ? [item.actions]
              : [];

      return {
        day: Number(item?.day) || index + 1,
        focus: normalizeText(item?.focus || item?.phase || item?.title || `Day ${index + 1}`),
        tasks: tasks.map((task) => normalizeText(task)).filter(Boolean),
      };
    });
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value).map(([key, entry], index) => {
      const tasks = Array.isArray(entry?.tasks)
        ? entry.tasks
        : Array.isArray(entry?.actions)
          ? entry.actions
          : typeof entry?.tasks === 'string'
            ? [entry.tasks]
            : typeof entry?.actions === 'string'
              ? [entry.actions]
              : [];

      return {
        day: Number(entry?.day) || index + 1,
        focus: normalizeText(entry?.focus || entry?.phase || entry?.title || key.replace(/_/g, ' ')),
        tasks: tasks.map((task) => normalizeText(task)).filter(Boolean),
      };
    });

    return entries.length > 0 ? entries : [
      { day: 1, focus: 'Review core fundamentals', tasks: ['Revisit the job description', 'List your strongest examples'] },
      { day: 2, focus: 'Practice communication', tasks: ['Answer 3 behavioral questions', 'Refine your STAR stories'] },
      { day: 3, focus: 'Prepare for delivery', tasks: ['Do a mock interview', 'Record and review your answers'] },
    ];
  }

  return [
    { day: 1, focus: 'Review core fundamentals', tasks: ['Revisit the job description', 'List your strongest examples'] },
    { day: 2, focus: 'Practice communication', tasks: ['Answer 3 behavioral questions', 'Refine your STAR stories'] },
    { day: 3, focus: 'Prepare for delivery', tasks: ['Do a mock interview', 'Record and review your answers'] },
  ];
};

export const normalizeInterviewReportResponse = (response) => {
  const outerReport = response?.interview_report || response?.interviewReport || response || {};
  const report = outerReport.interview_report || outerReport.interviewReport || outerReport || {};
  const candidateInfo = report.candidate_info || report.candidateInfo || report.candidate_profile || report.candidateProfile || {};

  return {
    matchScore: Number(getFirstMeaningful(report.match_score, report.matchScore, 0)) || 0,
    technicalQuestions: normalizeQuestionItems(
      report.technical_questions ?? report.technicalQuestions ?? report.technical_questions_with_answers ?? report.technicalQuestionsWithAnswers,
      getFirstMeaningful(candidateInfo.target_role, 'Assess technical depth'),
    ),
    behavioralQuestions: normalizeQuestionItems(
      report.behavioral_questions ?? report.behavioralQuestions ?? report.behavioral_questions_with_answers ?? report.behavioralQuestionsWithAnswers,
      getFirstMeaningful(candidateInfo.company, 'Assess communication and ownership'),
    ),
    skillGaps: normalizeSkillGaps(
      report.identified_skill_gaps ?? report.skill_gaps ?? report.skillGaps ?? report.identifiedSkillGaps ?? report.identified_skill_gaps_with_severity ?? [],
    ),
    preparationPlan: normalizePreparationPlan(
      report.preparation_plan ?? report.preparationPlan ?? report.structured_preparation_plan ?? report.structuredPreparationPlan ?? [],
    ),
    executiveSummary: normalizeText(report.executive_summary || report.summary || report.assessment_summary || ''),
    summary: normalizeText(report.summary || report.assessment_summary || report.executive_summary || ''),
    candidateName: normalizeText(candidateInfo.name || report.candidate_name || report.candidateName || ''),
    jobTitle: normalizeText(
      candidateInfo.target_role ||
      candidateInfo.current_role ||
      report.target_role ||
      report.job_title ||
      report.current_role ||
      report.title ||
      '',
    ),
  };
};

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  try {
    const prompt = `You are a professional interview preparation assistant. Generate a detailed interview report based on the provided information.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no explanations, no additional text.

You must return a single JSON object with exactly these top-level properties:
{
  "matchScore": 0,
  "technicalQuestions": [{ "question": "...", "intention": "...", "answer": "..." }],
  "behavioralQuestions": [{ "question": "...", "intention": "...", "answer": "..." }],
  "skillGaps": [{ "skill": "...", "severity": "Low|Medium|High", "context": "..." }],
  "preparationPlan": [{ "day": 1, "focus": "...", "tasks": ["..."] }]
}

Rules:
- Always use the exact property names shown above.
- Return only valid JSON.
- Do not wrap the JSON in markdown code blocks.
- If a section is not available, use an empty array.
- Ensure every preparation plan item has a numeric day, a focus string, and a tasks array.

Job Description: ${jobDescription}
Resume: ${resume}
Self-Description: ${selfDescription}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [{ text: prompt }],
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(interviewReportSchema, "InterviewReport"),
      },
    });

    let responseText = response.response?.text?.() || response.text;

    if (typeof responseText !== 'string' && response.response?.candidates) {
      const content = response.response.candidates[0]?.content;
      if (content?.parts) {
        responseText = content.parts.map((part) => part.text).join('');
      }
    }

    if (typeof responseText !== 'string') {
      throw new Error('Invalid response format from AI service');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      let cleanedText = responseText.trim();
      const jsonMatch = cleanedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanedText = jsonMatch[1].trim();
      } else {
        const jsonStart = cleanedText.indexOf('{');
        const jsonEnd = cleanedText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
        }
      }

      try {
        parsedResponse = JSON.parse(cleanedText);
      } catch {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }
    }

    const normalizedResponse = normalizeInterviewReportResponse(parsedResponse);

    console.log('🤖 AI Raw Response:', responseText);
    console.log('✅ Normalized Response:', JSON.stringify(normalizedResponse, null, 2));

    return normalizedResponse;
  } catch (error) {
    console.error('Error generating interview report:', error);
    throw error;
  }
}

export default generateInterviewReport;
