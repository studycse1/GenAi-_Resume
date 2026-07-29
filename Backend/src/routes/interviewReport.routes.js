import express from 'express';
import multer from 'multer';
import {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getUserInterviewReportsController,
} from '../controllers/interviewReport.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory
  fileFilter: (req, file, cb) => {
    // Accept PDF, DOC, DOCX files
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// POST endpoint with file upload - Protected route (requires login)
router.post('/generate', authMiddleware, upload.single('resume'), generateInterviewReportController);
router.get('/user-reports', authMiddleware, getUserInterviewReportsController);
router.get('/:reportId', authMiddleware, getInterviewReportByIdController);

export default router;
