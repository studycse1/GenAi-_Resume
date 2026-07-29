import React, { useState } from 'react';
import '../../styles/InterviewReportDisplay.css';

const repeatedLabels = new Set([
  'technical skill assessment',
  'leadership and soft skills assessment',
]);

const cleanLabel = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  return repeatedLabels.has(trimmed.toLowerCase()) ? '' : trimmed;
};

const getGapDetails = (gap) => {
  if (typeof gap === 'string') {
    return {
      skill: gap,
      severity: '',
      context: '',
    };
  }

  if (!gap || typeof gap !== 'object') {
    return {
      skill: String(gap || ''),
      severity: '',
      context: '',
    };
  }

  return {
    skill: gap.skill || gap.skillGap || gap.skill_name || gap.gap || '',
    severity: gap.severity || '',
    context: gap.context || gap.reason || gap.justification || '',
  };
};

const isFallbackContent = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  return value.includes('Practice a') || value.includes('Strengthen core interview fundamentals') || value.includes('Review core fundamentals');
};

// Extract answers from common payload shapes
const extractAnswers = (item) => {
  if (!item || typeof item !== 'object') return [];
  if (Array.isArray(item.answer)) return item.answer;
  if (Array.isArray(item.answers)) return item.answers;
  if (typeof item.answer === 'string') return [item.answer];
  if (typeof item.answers === 'string') return [item.answers];
  if (Array.isArray(item.solution)) return item.solution;
  if (typeof item.solution === 'string') return [item.solution];
  if (typeof item.guidance === 'string') return [item.guidance];
  if (Array.isArray(item.guidance)) return item.guidance;
  return [];
};

const InterviewReportDisplay = ({ report }) => {
  const [expandedDetails, setExpandedDetails] = useState({});

  if (!report) {
    return (
      <div className="report-display">
        <div className="error-message">
          <h3>No Report Data Available</h3>
          <p>Please generate a new report</p>
        </div>
      </div>
    );
  }

  // The API returns the full report structure
  const data = report.interviewReport || report;
  const technicalQuestions = data.technical_questions || [];
  const behavioralQuestions = data.behavioral_questions || [];
  const hasFallbackContent = technicalQuestions.some((item) => isFallbackContent(item?.question || item?.questions || '')) || behavioralQuestions.some((item) => isFallbackContent(item?.question || item?.questions || '')) || (data.identified_skill_gaps || data.skill_gaps || []).some((gap) => isFallbackContent(gap?.skill || '')) || (data.preparation_plan || data.preparationPlan || []).some((item) => isFallbackContent(item?.focus || ''));

  // Handle both snake_case and camelCase for match score
  const matchScore = data.match_score || data.matchScore || 0;

  const toggleDetail = (key) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderExpandableDetail = (title, content, key) => {
    if (!content) {
      return null;
    }

    const text = String(content).trim();
    const isExpanded = !!expandedDetails[key];
    const shouldShowToggle = text.length > 180;

    return (
      <div className="detail-item">
        <h4>{title}</h4>
        <p className={`detail-text ${isExpanded ? 'expanded' : 'collapsed'}`}>{text}</p>
        {shouldShowToggle && (
          <button
            type="button"
            className="detail-toggle-btn"
            onClick={() => toggleDetail(key)}
          >
            {isExpanded ? 'View less' : 'View more'}
          </button>
        )}
      </div>
    );
  };

  // SVG ring logic
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, matchScore)) / 100) * circumference;

  return (
    <div className="report-display animate-fade-in">
      <div className="report-header">
        <div className="report-header-info">
          <h2>Interview Preparation Report</h2>
          <p className="report-subtitle">Personalized roadmap & key recommendations</p>
          {hasFallbackContent && (
            <div className="fallback-banner">
              <span className="fallback-badge">Fallback content</span>
              <p>Some sections were auto-filled because the AI response was incomplete. Review and refine them before using this report.</p>
            </div>
          )}
        </div>
        <div className="match-score-container">
          <span className="score-label">Match Score</span>
          <div className="match-score-circle">
            <svg className="progress-ring" width="96" height="96">
              <circle
                className="progress-ring-bg"
                strokeWidth="6"
                fill="transparent"
                r={radius}
                cx="48"
                cy="48"
              />
              <circle
                className={`progress-ring-bar ${matchScore >= 70 ? 'high' : matchScore >= 50 ? 'medium' : 'low'}`}
                strokeWidth="6"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx="48"
                cy="48"
              />
            </svg>
            <div className="score-percentage">{matchScore}%</div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      {(data.executive_summary || data.summary) && (
        <section className="report-section summary-section">
          <h3>Executive Summary</h3>
          <p className="summary-text">{data.executive_summary || data.summary}</p>
        </section>
      )}

      {/* Candidate / Job Info */}
      {(report.candidate_name || report.job_title) && (
        <section className="report-section overview-section">
          <h3>Candidate Overview</h3>
          <div className="details-grid">
            {report.candidate_name && (
              <div className="detail-item-minimal">
                <h4>Candidate Name</h4>
                <p>{report.candidate_name}</p>
              </div>
            )}
            {report.job_title && (
              <div className="detail-item-minimal">
                <h4>Job Title</h4>
                <p>{report.job_title}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Technical Questions */}
      {technicalQuestions.length > 0 && (
        <section className="report-section questions-section">
          <h3>Technical Questions</h3>
          <div className="questions-list">
            {technicalQuestions.map((q, index) => {
              const topic = cleanLabel(typeof q === 'object' ? (q.topic || q.category || q.Intention) : null);
              const questions = typeof q === 'string'
                ? [q]
                : Array.isArray(q.questions)
                  ? q.questions
                  : [q.question || q.questions].filter(Boolean);

                const answersArr = extractAnswers(q);

              return (
                <div key={index} className="question-group">
                  {topic && <p className="question-topic group-topic">{topic}</p>}
                  <div className="questions-list nested-questions">
                    {questions.map((questionText, questionIndex) => {
                      const answerText = answersArr[questionIndex] ?? answersArr[0] ?? '';
                      const answerKey = `tech-${index}-${questionIndex}-answer`;
                      return (
                        <div key={questionIndex} className="question-item">
                          <div className="question-number">{questionIndex + 1}</div>
                          <div className="question-content">
                            <p className="question-text">{questionText}</p>
                            {answerText && (
                              <div className="answer-block">
                                <div className="detail-item">
                                  <h4>Suggested Answer</h4>
                                  <p className="detail-text">{String(answerText)}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Behavioral Questions */}
      {behavioralQuestions.length > 0 && (
        <section className="report-section questions-section">
          <h3>Behavioral Questions</h3>
          <div className="questions-list">
            {behavioralQuestions.map((q, index) => {
              const scenario = cleanLabel(typeof q === 'object' ? (q.scenario || q.topic || q.Intention) : null);
              const questions = typeof q === 'string'
                ? [q]
                : Array.isArray(q.questions)
                  ? q.questions
                  : [q.question || q.questions].filter(Boolean);

              const answersArr = extractAnswers(q);

              return (
                <div key={index} className="question-group">
                  {scenario && <p className="question-topic group-topic">{scenario}</p>}
                  <div className="questions-list nested-questions">
                    {questions.map((questionText, questionIndex) => {
                      const answerText = answersArr[questionIndex] ?? answersArr[0] ?? '';
                      const answerKey = `beh-${index}-${questionIndex}-answer`;
                      return (
                        <div key={questionIndex} className="question-item">
                          <div className="question-number">{questionIndex + 1}</div>
                          <div className="question-content">
                            <p className="question-text">{questionText}</p>
                            {answerText && (
                              <div className="answer-block">
                                <div className="detail-item">
                                  <h4>Suggested Answer</h4>
                                  <p className="detail-text">{String(answerText)}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Skill Gaps */}
      {(data.identified_skill_gaps || data.skill_gaps) && (data.identified_skill_gaps?.length > 0 || data.skill_gaps?.length > 0) && (
        <section className="report-section gaps-section">
          <h3>Identified Skill Gaps</h3>
          <div className="skill-gaps-list">
            {(data.identified_skill_gaps || data.skill_gaps).map((gap, index) => {
              const { skill, severity, context } = getGapDetails(gap);
              const severityClass = severity ? severity.toLowerCase().replace(/\s+/g, '-') : 'moderate';
              return (
                <div key={index} className={`skill-gap-item ${severityClass}`}>
                  <div className="gap-header">
                    <span className="gap-icon">⚠️</span>
                    <strong className="gap-skill-title">{skill}</strong>
                    {severity && <span className={`severity-badge ${severityClass}`}>{severity}</span>}
                  </div>
                  {context && <p className="gap-context-text">{context}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Preparation Plan */}
      {(data.preparation_plan || data.preparationPlan) && Object.keys(data.preparation_plan || data.preparationPlan).length > 0 && (
        <section className="report-section plan-section">
          <h3>Preparation Plan</h3>
          {Array.isArray(data.preparation_plan || data.preparationPlan) ? (
            <div className="preparation-timeline">
              {(data.preparation_plan || data.preparationPlan).map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-badge">Day {item.day}</div>
                  <div className="timeline-content">
                    <h4 className="plan-focus-title">{item.focus}</h4>
                    {item.tasks && (
                      <ul className="plan-tasks-list">
                        {item.tasks.map((task, taskIdx) => (
                          <li key={taskIdx}>{task}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="preparation-plan-grid">
              {(data.preparation_plan || data.preparationPlan).short_term_focus && (
                <div className="plan-card">
                  <h4>Short Term Focus</h4>
                  <p>{(data.preparation_plan || data.preparationPlan).short_term_focus}</p>
                </div>
              )}
              {(data.preparation_plan || data.preparationPlan).immediate_focus && (
                <div className="plan-card">
                  <h4>Immediate Focus</h4>
                  {Array.isArray((data.preparation_plan || data.preparationPlan).immediate_focus) ? (
                    <ul>
                      {(data.preparation_plan || data.preparationPlan).immediate_focus.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{(data.preparation_plan || data.preparationPlan).immediate_focus}</p>
                  )}
                </div>
              )}
              {(data.preparation_plan || data.preparationPlan).long_term_strategy && (
                <div className="plan-card">
                  <h4>Long Term Strategy</h4>
                  {Array.isArray((data.preparation_plan || data.preparationPlan).long_term_strategy) ? (
                    <ul>
                      {(data.preparation_plan || data.preparationPlan).long_term_strategy.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{(data.preparation_plan || data.preparationPlan).long_term_strategy}</p>
                  )}
                </div>
              )}
              {(data.preparation_plan || data.preparationPlan).mid_term_focus && (
                <div className="plan-card">
                  <h4>Mid Term Focus</h4>
                  <p>{(data.preparation_plan || data.preparationPlan).mid_term_focus}</p>
                </div>
              )}
              {(data.preparation_plan || data.preparationPlan).long_term_focus && (
                <div className="plan-card">
                  <h4>Long Term Focus</h4>
                  <p>{(data.preparation_plan || data.preparationPlan).long_term_focus}</p>
                </div>
              )}
              {(data.preparation_plan || data.preparationPlan).interview_strategy && (
                <div className="plan-card">
                  <h4>Interview Strategy</h4>
                  <p>{(data.preparation_plan || data.preparationPlan).interview_strategy}</p>
                </div>
              )}
              {(data.preparation_plan || data.preparationPlan).mock_interview_topics && (
                <div className="plan-card">
                  <h4>Mock Interview Topics</h4>
                  {Array.isArray((data.preparation_plan || data.preparationPlan).mock_interview_topics) ? (
                    <ul>
                      {(data.preparation_plan || data.preparationPlan).mock_interview_topics.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{(data.preparation_plan || data.preparationPlan).mock_interview_topics}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Input Details */}
      <section className="report-section input-details">
        <h3>Submitted Information</h3>
        <div className="details-grid">
          {renderExpandableDetail('Resume', report.resume, 'resume')}
          {renderExpandableDetail('Self Description', report.selfDescription, 'selfDescription')}
          {renderExpandableDetail('Job Description', report.jobDescription, 'jobDescription')}
        </div>
      </section>
    </div>
  );
};

export default InterviewReportDisplay;
