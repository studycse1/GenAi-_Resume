import mongoose from 'mongoose';

const technicalQuestionsSchema = new mongoose.Schema(
    {
        questions: {
            type: String,
            required: [true, 'Technical question is required'],
        },
        Intention: {
            type: String,
            required: [true, 'Intention is required'],
        },
        answer: { 
            type: String,
            required: [true, 'Answer is required'], 
        } 
    },
    { _id: false }
);

const behavioralQuestionsSchema = new mongoose.Schema(
     {
        questions: {
            type: String,
            required: [true, 'Behavioral question is required'],
        },
        Intention: {
            type: String,
            required: [true, 'Intention is required'],
        },
        answer: { 
            type: String,
            required: [true, 'Answer is required'], 
        } 
    },
    { _id: false }
);
const skillGapsSchema = new mongoose.Schema(
    {
        skill: {
            type: String,
            required: [true, 'Skill gap is required'],
        },
        severity: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            required: [true, 'Severity is required'],
        },
        context: {
            type: String,
            trim: true,
        }
    },
    { _id: false }
);

const preparationPlanSchema = new mongoose.Schema(
    {
        day:{   
            type: Number,
            required: [true, 'Day is required'],
        },
        focus: {
            type: String,
            required: [true, 'Focus is required'],
        },
        tasks: [{
            type: String,
            required: [true, 'Tasks are required'],
        }]

    },
    { _id: false }
);  
const interviewReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    resumeText: {
      type: String,
      trim: true,
    },
    selfDescription: {
      type: String,
      trim: true,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    technicalQuestions: [
      technicalQuestionsSchema
    ],
    behavioralQuestions: [
        behavioralQuestionsSchema
    ],
    skillGaps: [
        skillGapsSchema
    ],
    preparationPlan: [
        preparationPlanSchema
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const InterviewReport = mongoose.model('InterviewReport', interviewReportSchema);

export default InterviewReport;
