import generateInterviewReport, { normalizeInterviewReportResponse } from '../services/ai.service.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import InterviewReport from '../models/interviewReport.model.js';
import mongoose from 'mongoose';

const getFirstDefined = (...values) => values.find((value) => value !== undefined && value !== null);

const getFirstMeaningful = (...values) => values.find((value) => {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim() !== '';
  }

  return true;
});

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
};

const unwrapInterviewReport = (response) =>
  response?.interview_report || response?.interviewReport || response;

const resolveInterviewPayload = (response) => {
  const outerReport = unwrapInterviewReport(response) || {};
  return outerReport.interview_report || outerReport.interviewReport || outerReport;
};

const sanitizeIntentionLabel = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const repeated = new Set([
    'technical skill assessment',
    'leadership and soft skills assessment',
  ]);

  return repeated.has(trimmed.toLowerCase()) ? '' : trimmed;
};

const flattenQuestionGroups = (items, fallbackIntention, fallbackAnswer) => {
  return items.flatMap((item) => {
    if (typeof item === 'string') {
      return [{
        questions: item,
        Intention: fallbackIntention,
        answer: fallbackAnswer,
      }];
    }

    const questionList = Array.isArray(item.questions)
      ? item.questions
      : item.question
        ? [item.question]
        : [];
    const intention = getFirstMeaningful(
      sanitizeIntentionLabel(item?.topic),
      sanitizeIntentionLabel(item?.category),
      sanitizeIntentionLabel(item?.scenario),
      sanitizeIntentionLabel(item?.intention),
      sanitizeIntentionLabel(item?.intent),
      fallbackIntention
    );

    return questionList.map((question) => ({
      questions: question,
      Intention: intention,
      answer: typeof item === 'object' && item.answer ? item.answer : fallbackAnswer,
    }));
  });
};

const normalizePreparationPlan = (rawPlan) => {
  if (Array.isArray(rawPlan)) {
    return rawPlan.map((item, index) => ({
      day: Number(item?.day) || index + 1,
      focus: item?.focus || item?.phase || item?.title || `Phase ${index + 1}`,
      tasks: Array.isArray(item?.tasks)
        ? item.tasks
        : Array.isArray(item?.actions)
          ? item.actions
          : item?.tasks
            ? [item.tasks]
            : item?.actions
              ? [item.actions]
              : [],
    }));
  }

  if (!rawPlan || typeof rawPlan !== 'object') {
    return [];
  }

  return Object.entries(rawPlan).map(([key, value], index) => ({
    day: Number(value?.day) || index + 1,
    focus: value?.focus || value?.phase || value?.title || key.replace(/_/g, ' '),
    tasks: Array.isArray(value)
      ? value
      : Array.isArray(value?.actions)
        ? value.actions
        : Array.isArray(value?.tasks)
          ? value.tasks
          : value?.actions
            ? [value.actions]
            : value?.tasks
              ? [value.tasks]
              : [],
  }));
};

const normalizeSeverity = (value) => {
  if (typeof value !== 'string') {
    return 'Medium';
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'low') {
    return 'Low';
  }
  if (normalized === 'high') {
    return 'High';
  }
  return 'Medium';
};

const normalizeSkillGap = (gap) => {
  if (typeof gap === 'string') {
    return {
      skill: gap,
      severity: 'Medium',
      context: '',
    };
  }

  if (!gap || typeof gap !== 'object') {
    return {
      skill: String(gap || ''),
      severity: 'Medium',
      context: '',
    };
  }

  return {
    skill: gap.skill || gap.skillGap || gap.skill_name || gap.gap || gap.description || 'Unknown skill gap',
    severity: normalizeSeverity(gap.severity),
    context: gap.context || gap.detail || gap.reason || gap.justification || '',
  };
};

const mapSavedReportToDisplayShape = (report) => ({
  _id: report._id,
  resume: report.resumeText,
  selfDescription: report.selfDescription,
  jobDescription: report.jobDescription,
  createdAt: report.createdAt,
  interviewReport: {
    match_score: report.matchScore || 0,
    matchScore: report.matchScore || 0,
    technical_questions: (report.technicalQuestions || []).map((q) => ({
      question: q.questions,
      topic: sanitizeIntentionLabel(q.Intention),
      answer: q.answer,
    })),
    behavioral_questions: (report.behavioralQuestions || []).map((q) => ({
      question: q.questions,
      scenario: sanitizeIntentionLabel(q.Intention),
      answer: q.answer,
    })),
    identified_skill_gaps: (report.skillGaps || []).map((gap) => ({
      skill: gap.skill,
      severity: gap.severity,
      context: gap.context || '',
    })),
    skill_gaps: (report.skillGaps || []).map((gap) => ({
      skill: gap.skill,
      severity: gap.severity,
      context: gap.context || '',
    })),
    preparation_plan: (report.preparationPlan || []).map((item) => ({
      day: item.day,
      focus: item.focus,
      tasks: item.tasks,
    })),
    preparationPlan: (report.preparationPlan || []).map((item) => ({
      day: item.day,
      focus: item.focus,
      tasks: item.tasks,
    })),
  },
});

export const generateInterviewReportController = async (req, res) => {
  try {
    const { selfDescription, jobDescription } = req.body;
    let resume = '';

    // Handle file upload
    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        // Extract text from PDF
        const pdfData = new Uint8Array(req.file.buffer);
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
        for (let i = 0; i < pdf.numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const textContent = await page.getTextContent();
          resume += textContent.items.map(item => item.str).join('');
        }
      } else {
        // For DOC/DOCX, convert buffer to string
        resume = req.file.buffer.toString('utf-8');
      }
    } else if (req.body.resume) {
      // Fallback to text resume if provided in body
      resume = req.body.resume;
    }

    // Validate inputs
    if (!resume || resume.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Resume file or text is required',
      });
    }

    if (!selfDescription || selfDescription.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Self description is required',
      });
    }

    if (!jobDescription || jobDescription.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Job description is required',
      });
    }

    // Call AI service to generate report
    const interviewReportResponse = await generateInterviewReport({
      resume,
      selfDescription,
      jobDescription,
    });

    console.log('AI Response:', JSON.stringify(interviewReportResponse, null, 2));

    const normalizedResponse = normalizeInterviewReportResponse(interviewReportResponse);
    const interviewReport = normalizedResponse;

    const normalizedMatchScore = Number(interviewReport.matchScore) || 0;
    const normalizedTechnicalQuestions = Array.isArray(interviewReport.technicalQuestions) ? interviewReport.technicalQuestions : [];
    const normalizedBehavioralQuestions = Array.isArray(interviewReport.behavioralQuestions) ? interviewReport.behavioralQuestions : [];
    const normalizedSkillGaps = Array.isArray(interviewReport.skillGaps) ? interviewReport.skillGaps : [];
    const normalizedPreparationPlan = Array.isArray(interviewReport.preparationPlan) ? interviewReport.preparationPlan : [];

    console.log('📋 Normalized Match Score:', normalizedMatchScore);
    console.log('📋 Normalized Tech Questions Count:', normalizedTechnicalQuestions.length);
    console.log('📋 Normalized Behavioral Questions Count:', normalizedBehavioralQuestions.length);
    console.log('📋 Normalized Skill Gaps Count:', normalizedSkillGaps.length);
    console.log('📋 Normalized Prep Plan Count:', normalizedPreparationPlan.length);

    const mappedTechnicalQuestions = normalizedTechnicalQuestions.map((item) => ({
      questions: item.question || '',
      Intention: item.intention || '',
      answer: item.answer || '',
    }));

    const mappedBehavioralQuestions = normalizedBehavioralQuestions.map((item) => ({
      questions: item.question || '',
      Intention: item.intention || '',
      answer: item.answer || '',
    }));

    const mappedSkillGaps = normalizedSkillGaps.map((gap) => ({
      skill: gap.skill || '',
      severity: normalizeSeverity(gap.severity || 'Medium'),
      context: gap.context || '',
    }));

    const mappedPreparationPlan = normalizedPreparationPlan.map((item) => ({
      day: Number(item.day) || 1,
      focus: item.focus || 'Preparation focus',
      tasks: Array.isArray(item.tasks) ? item.tasks.filter(Boolean) : [],
    }));

    console.log('Mapped Technical Questions:', mappedTechnicalQuestions);
    console.log('Mapped Behavioral Questions:', mappedBehavioralQuestions);
    console.log('Mapped Skill Gaps:', mappedSkillGaps);
    console.log('Preparation Plan:', mappedPreparationPlan);
    const reportData = new InterviewReport({
      userId: req.userId,
      resumeText: resume,
      selfDescription,
      jobDescription,
      matchScore: normalizedMatchScore,
      technicalQuestions: mappedTechnicalQuestions,
      behavioralQuestions: mappedBehavioralQuestions,
      skillGaps: mappedSkillGaps,
      preparationPlan: mappedPreparationPlan,
    });

    const savedReport = await reportData.save();

    return res.status(200).json({
      success: true,
      message: 'Interview report generated and saved successfully',
      data: {
        reportId: savedReport._id,
        candidate_name: interviewReport.candidateName || '',
        job_title: interviewReport.jobTitle || '',
        resume,
        selfDescription,
        jobDescription,
        interviewReport: {
          match_score: normalizedMatchScore,
          matchScore: normalizedMatchScore,
          executive_summary: interviewReport.executiveSummary || interviewReport.summary || '',
          summary: interviewReport.summary || interviewReport.executiveSummary || '',
          technical_questions: mappedTechnicalQuestions,
          behavioral_questions: mappedBehavioralQuestions,
          identified_skill_gaps: mappedSkillGaps,
          skill_gaps: mappedSkillGaps,
          preparation_plan: mappedPreparationPlan,
          preparationPlan: mappedPreparationPlan,
          technical_questions_with_answers: getFirstDefined(
            interviewReport.technical_questions_with_answers,
            interviewReport.technicalQuestionsWithAnswers,
            []
          ),
          behavioral_questions_with_answers: getFirstDefined(
            interviewReport.behavioral_questions_with_answers,
            interviewReport.behavioralQuestionsWithAnswers,
            []
          ),
        },
      },
    });
  } catch (error) {
    console.error('Error generating interview report:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate interview report',
      error: error,
    });
  }
};

export const getUserInterviewReportsController = async (req, res) => {
  try {
    const reports = await InterviewReport.find({ userId: req.userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'User reports fetched successfully',
      data: reports.map(mapSavedReportToDisplayShape),
    });
  } catch (error) {
    console.error('Error fetching user interview reports:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user reports',
    });
  }
};

export const getInterviewReportByIdController = async (req, res) => {
  try {
    const { reportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report id format',
      });
    }

    const report = await InterviewReport.findOne({ _id: reportId, userId: req.userId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Report fetched successfully',
      data: mapSavedReportToDisplayShape(report),
    });
  } catch (error) {
    console.error('Error fetching interview report:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch report',
    });
  }
};
